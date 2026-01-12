/**
 * Field Lineage Analyzer
 *
 * Main orchestrator for analyzing field lineage in an SPL AST.
 *
 * @module entities/field/lib/lineage/analyzer
 */

import type { Pipeline, PipelineStage } from '@/entities/spl';
import type {
  LineageIndex,
  FieldLineage,
  FieldEvent,
  FieldState,
  PipelineStageState,
  LineageWarning,
  LineageConfig,
  FieldConsumptionItem,
} from '../../model/lineage.types';

/**
 * Extract field name from a FieldConsumptionItem (either string or FieldConsumption object)
 */
function getConsumedFieldName(item: FieldConsumptionItem): string {
  return typeof item === 'string' ? item : item.fieldName;
}

/**
 * Get per-field location from a FieldConsumptionItem if available
 */
function getConsumedFieldLocation(item: FieldConsumptionItem): { line?: number; column?: number } {
  if (typeof item === 'string') {
    return {};
  }
  return { line: item.line, column: item.column };
}
import { FieldTracker } from './field-tracker';
import { getCommandHandler } from './command-handlers';
import { ALWAYS_PRESENT_FIELDS } from '../../model/implicit';

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
  'tstats', 'strcat', 'accum', 'delta', 'autoregress',
  'rangemap', 'top', 'rare', 'iplocation',
  // Tier 2: Field Filters
  'table', 'fields', 'dedup',
  // Tier 3: Field Modifiers
  'fillnull', 'bin', 'bucket', 'mvexpand', 'filldown', 'mvcombine',
  'addtotals', 'extract', 'inputlookup', 'transaction', 'replace', 'makemv',
  // Tier 4: Subsearch Commands
  'append', 'appendcols', 'join', 'union', 'return',
  // Tier 5: Data Generators
  'makeresults', 'metadata',
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
    for (const fieldName of ALWAYS_PRESENT_FIELDS) {
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
          confidence: 'certain' as const,
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
          confidence: 'certain' as const,
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
            confidence: 'certain' as const,
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

    // Apply effects to tracker
    // 1. Handle drops first (especially for stats which drops everything)
    if (effect.dropsAllExcept) {
      const keepFields = new Set(effect.dropsAllExcept);
      for (const field of this.tracker.getAllFields()) {
        // Only drop if field exists AND it's not in the keep list
        if (!keepFields.has(field) && this.tracker.fieldExists(field)) {
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
        // Only drop if field currently exists
        if (this.tracker.fieldExists(drop.fieldName)) {
          // Use per-field drop location if available, else stage location
          this.tracker.dropField(drop.fieldName, {
            kind: 'dropped',
            line: drop.line ?? line,
            column: drop.column ?? column,
            command,
            details: `Dropped (${drop.reason})`,
          });
        }
      }
    }

    // 2. Record consumed fields (use per-field location if available, else stage location)
    for (const item of effect.consumes) {
      if (!item) continue;
      const fieldName = getConsumedFieldName(item);
      const loc = getConsumedFieldLocation(item);
      this.tracker.consumeField(fieldName, {
        kind: 'consumed',
        line: loc.line ?? line,
        column: loc.column ?? column,
        command,
      });
    }

    // 3. Handle modifications (feature removed - kept for compatibility)
    // Modifications are no longer tracked as they don't provide enough value in the UI
    // and can conflict with other event types on the same line

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
    const fieldsAvailable = new Map(this.tracker.getFieldStates());
    this.stages.push({
      stageIndex: index,
      line,
      command,
      fieldsAvailable,
      fieldsCreated: effect.creates.map(c => c.fieldName),
      fieldsModified: [], // Feature removed
      fieldsConsumed: effect.consumes.map(getConsumedFieldName),
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
    for (const item of effect.consumes) {
      const fieldName = getConsumedFieldName(item);
      if (!this.tracker.fieldExists(fieldName)) {
        this.warnings.push({
          level: 'warning',
          message: `Field "${fieldName}" referenced but may not exist`,
          line,
          field: fieldName,
          suggestion: `Verify that "${fieldName}" is created before this line`,
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
