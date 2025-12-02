/**
 * Field Lineage Analyzer
 * 
 * Main orchestrator for analyzing field lineage in an SPL AST.
 * 
 * @module features/field-lineage/lib/analyzer
 */

import type { Pipeline, PipelineStage } from '@/entities/spl/lib/parser';
import type {
  LineageIndex,
  FieldLineage,
  FieldEvent,
  FieldState,
  PipelineStageState,
  LineageWarning,
  LineageConfig,
} from '../model/field-lineage.types';
import { FieldTracker } from './field-tracker';
import { getCommandHandler } from './command-handlers';
import { ALWAYS_PRESENT_FIELDS } from '@/entities/field';

// =============================================================================
// DEFAULT TRACKED COMMANDS
// =============================================================================

/**
 * Default set of commands to track for field lineage.
 * Commands not in this list will be treated as pass-through (no field effects).
 *
 * Organized by tier:
 * - Tier 1: Field Creators - Commands that create or compute new fields
 * - Tier 2: Field Filters - Commands that select which fields to keep
 * - Tier 3: Field Modifiers - Commands that modify field values
 */
export const DEFAULT_TRACKED_COMMANDS = [
  // Tier 1: Field Creators
  'eval', 'stats', 'eventstats', 'streamstats',
  'rename', 'rex', 'spath', 'lookup', 'chart', 'timechart',
  // Tier 2: Field Filters
  'table', 'fields', 'dedup',
  // Tier 3: Field Modifiers
  'fillnull', 'bin', 'bucket', 'mvexpand',
  'addtotals', 'extract', 'inputlookup', 'transaction',
];

// =============================================================================
// MAIN EXPORT
// =============================================================================

/**
 * Analyze an SPL AST to build a complete field lineage index.
 *
 * @param ast - Parsed SPL pipeline
 * @param config - Optional configuration for lineage analysis
 * @returns LineageIndex for querying field information
 */
export function analyzeLineage(ast: Pipeline, config?: LineageConfig): LineageIndex {
  const analyzer = new LineageAnalyzer(ast, config);
  return analyzer.analyze();
}

// =============================================================================
// ANALYZER CLASS
// =============================================================================

class LineageAnalyzer {
  private ast: Pipeline;
  private config: LineageConfig;
  private trackedCommands: Set<string>;
  private tracker: FieldTracker;
  private stages: PipelineStageState[] = [];
  private warnings: LineageWarning[] = [];

  constructor(ast: Pipeline, config?: LineageConfig) {
    this.ast = ast;
    this.config = config ?? {};
    this.trackedCommands = new Set(
      this.config.trackedCommands ?? DEFAULT_TRACKED_COMMANDS
    );
    const sourceLines = (this.config.source ?? '').split('\n');
    this.tracker = new FieldTracker(sourceLines);
  }

  analyze(): LineageIndex {
    console.warn('[Lineage] analyzeLineage start', { stages: (this.ast as any)?.stages?.length });
    // Initialize with implicit fields
    this.initializeImplicitFields();

    // Process each pipeline stage
    for (let i = 0; i < this.ast.stages.length; i++) {
      const stage = this.ast.stages[i];
      this.processStage(stage, i);
    }

    return this.buildIndex();
  }

  private initializeImplicitFields(): void {
    for (const field of ALWAYS_PRESENT_FIELDS) {
      const fieldName = typeof field === 'string' ? field : field.name;
      this.tracker.addField(fieldName, {
        kind: 'origin',
        line: 1,
        column: 1,
        command: 'implicit',
        details: 'Implicit Splunk field',
      });
    }
  }

  private processStage(stage: PipelineStage, index: number): void {
    const line = stage.location.startLine || 1;
    const column = stage.location.startColumn || 1;
    const command = this.getCommandName(stage);

    // Debug: log stage type and basic shape for diagnostics
    console.warn('[Lineage] processStage', {
      idx: index,
      type: stage.type,
      line,
      column,
      keys: Object.keys(stage as any),
    });

    // Get command handler (pass trackedCommands for filtering)
    const handler = getCommandHandler(stage, this.trackedCommands);

    // Calculate field effects
    let effect = handler.getFieldEffect(stage, this.tracker);

    // Only apply fallbacks if the command is tracked (not filtered out)
    const isTracked = this.trackedCommands.has(command);

    // Fallbacks: ensure creates/consumes are populated for core commands
    if (isTracked && stage.type === 'EvalCommand' && effect.creates.length === 0) {
      const evalStage: any = stage;
      const creates = [];
      const consumes: string[] = [];
      for (const assignment of evalStage.assignments ?? []) {
        const deps = assignment.dependsOn ?? [];
        consumes.push(...deps);
        creates.push({
          fieldName: assignment.targetField,
          dependsOn: deps,
          expression: undefined,
          confidence: 'certain',
        });
      }
      console.warn('[Lineage] fallback eval creates', creates);
      effect = {
        ...effect,
        creates,
        consumes: [...new Set([...effect.consumes, ...consumes])],
      };
    }

    if (isTracked && stage.type === 'StatsCommand' && effect.creates.length === 0) {
      const statsStage: any = stage;
      const creates = [];
      const consumes: string[] = [];
      const byFields: string[] = [];
      for (const agg of statsStage.aggregations ?? []) {
        const outputName = agg.outputField || agg.alias || (agg.field?.fieldName ?? agg.function);
        if (agg.field && !agg.field.isWildcard) {
          consumes.push(agg.field.fieldName);
        }
        creates.push({
          fieldName: outputName,
          dependsOn: agg.field && !agg.field.isWildcard ? [agg.field.fieldName] : [],
          expression: undefined,
          confidence: 'certain',
        });
      }
      for (const by of statsStage.byFields ?? []) {
        if (!by.isWildcard) {
          consumes.push(by.fieldName);
          byFields.push(by.fieldName);
        }
      }
      const dropsAllExcept = statsStage.preservesFields
        ? undefined
        : [...byFields, ...creates.map((c: any) => c.fieldName)];
      effect = {
        ...effect,
        creates,
        consumes: [...new Set([...effect.consumes, ...consumes])],
        dropsAllExcept,
      };
    }

    if (isTracked && stage.type === 'RenameCommand' && effect.creates.length === 0) {
      const ren: any = stage;
      const creates = [];
      const consumes: string[] = [];
      const drops = [];
      for (const mapping of ren.renamings ?? []) {
        if (mapping.oldField?.fieldName && mapping.newField?.fieldName) {
          consumes.push(mapping.oldField.fieldName);
          creates.push({
            fieldName: mapping.newField.fieldName,
            dependsOn: [mapping.oldField.fieldName],
            confidence: 'certain',
          });
          drops.push({ fieldName: mapping.oldField.fieldName, reason: 'explicit' as const });
        }
      }
      effect = {
        ...effect,
        creates,
        consumes: [...new Set([...effect.consumes, ...consumes])],
        drops: [...effect.drops, ...drops],
      };
    }

    console.warn('[Lineage] effect', command, effect);

    // Apply effects to tracker
    // 1. Handle drops first (especially for stats which drops everything)
    if (effect.dropsAllExcept) {
      const keepFields = new Set(effect.dropsAllExcept);
      for (const field of this.tracker.getAllFields()) {
        if (!keepFields.has(field)) {
          this.tracker.dropField(field, {
            kind: 'dropped',
            line,
            column,
            command,
            details: 'Dropped by aggregation',
          });
        }
      }
    } else {
      for (const drop of effect.drops) {
        this.tracker.dropField(drop.fieldName, {
          kind: 'dropped',
          line,
          column,
          command,
          details: `Dropped (${drop.reason})`,
        });
      }
    }

    // 2. Record consumed fields
    for (const field of effect.consumes) {
      if (!field) continue;
      this.tracker.consumeField(field, {
        kind: 'consumed',
        line,
        column,
        command,
      });
    }

    // 3. Handle modifications
    for (const mod of effect.modifies) {
      if (!mod.fieldName) continue;
      this.tracker.modifyField(mod.fieldName, {
        kind: 'modified',
        line,
        column,
        command,
        expression: mod.expression,
        dependsOn: mod.dependsOn,
      });
    }

    // 4. Handle creations (use per-field location if available, else stage location)
    for (const creation of effect.creates) {
      if (!creation.fieldName) continue;
      this.tracker.addField(creation.fieldName, {
        kind: 'created',
        line: creation.line ?? line,
        column: creation.column ?? column,
        command,
        expression: creation.expression,
        dependsOn: creation.dependsOn,
      }, {
        dataType: creation.dataType,
        isMultivalue: creation.isMultivalue,
        confidence: creation.confidence,
      });
    }

    // 5. Check for warnings
    this.checkForWarnings(stage, effect, line);

    // Record stage state
    this.stages.push({
      stageIndex: index,
      line,
      command,
      fieldsAvailable: new Map(this.tracker.getFieldStates()),
      fieldsCreated: effect.creates.map(c => c.fieldName),
      fieldsModified: effect.modifies.map(m => m.fieldName),
      fieldsConsumed: effect.consumes,
      fieldsDropped: effect.drops.map(d => d.fieldName),
    });
  }

  private getCommandName(stage: PipelineStage): string {
    if (stage.type === 'SearchExpression') return 'search';
    return stage.type.replace('Command', '').toLowerCase();
  }

  private checkForWarnings(
    _stage: PipelineStage,
    effect: any,
    line: number
  ): void {
    // Check for fields consumed that don't exist
    for (const field of effect.consumes) {
      if (!this.tracker.fieldExists(field)) {
        this.warnings.push({
          level: 'warning',
          message: `Field "${field}" referenced but may not exist`,
          line,
          field,
          suggestion: `Verify that "${field}" is created before this line`,
        });
      }
    }

    // Check for field overwrites
    for (const creation of effect.creates) {
      if (this.tracker.fieldExists(creation.fieldName)) {
        // This is a modification, not creation - but we record it
        this.warnings.push({
          level: 'info',
          message: `Field "${creation.fieldName}" is being overwritten`,
          line,
          field: creation.fieldName,
        });
      }
    }
  }

  private buildIndex(): LineageIndex {
    return {
      getFieldLineage: (fieldName: string): FieldLineage | null => {
        return this.tracker.getFieldLineage(fieldName);
      },

      getFieldAtLine: (fieldName: string, line: number): FieldState | null => {
        // Find the stage at or before this line
        const stage = this.findStageAtLine(line);
        if (!stage) return null;
        return stage.fieldsAvailable.get(fieldName) || null;
      },

      fieldExistsAt: (fieldName: string, line: number): boolean => {
        const stage = this.findStageAtLine(line);
        if (!stage) return false;
        const state = stage.fieldsAvailable.get(fieldName) || null;
        return state?.exists ?? false;
      },

      getFieldsAtLine: (line: number): string[] => {
        const stage = this.findStageAtLine(line);
        if (!stage) return [];
        return Array.from(stage.fieldsAvailable.keys())
          .filter(f => stage.fieldsAvailable.get(f)?.exists);
      },

      getFieldOrigin: (fieldName: string): FieldEvent | null => {
        const lineage = this.tracker.getFieldLineage(fieldName);
        return lineage?.origin || null;
      },

      getFieldEvents: (fieldName: string): FieldEvent[] => {
        const lineage = this.tracker.getFieldLineage(fieldName);
        return lineage?.events || [];
      },

      getDependents: (fieldName: string): string[] => {
        const lineage = this.tracker.getFieldLineage(fieldName);
        return lineage?.dependedOnBy || [];
      },

      getDependencies: (fieldName: string): string[] => {
        const lineage = this.tracker.getFieldLineage(fieldName);
        return lineage?.dependsOn || [];
      },

      getStages: (): PipelineStageState[] => {
        return [...this.stages];
      },

      getStageAtLine: (line: number): PipelineStageState | null => {
        return this.findStageAtLine(line);
      },

      getAllFields: (): string[] => {
        return this.tracker.getAllFields();
      },

      getWarnings: (): LineageWarning[] => {
        return [...this.warnings];
      },
    };
  }

  private findStageAtLine(line: number): PipelineStageState | null {
    // Find the stage at or just before the given line
    let result: PipelineStageState | null = null;
    for (const stage of this.stages) {
      if (stage.line <= line) {
        result = stage;
      } else {
        break;
      }
    }
    return result;
  }
}
