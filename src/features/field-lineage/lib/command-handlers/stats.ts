/**
 * Stats Command Augmentation Handler
 *
 * Augments pattern-based results with rich metadata for stats family commands.
 * Handles: stats, eventstats, streamstats, chart, timechart
 *
 * @module features/field-lineage/lib/command-handlers/stats
 */

import type { PipelineStage, StatsCommand } from '@/entities/spl/lib/parser';
import type { CommandFieldEffect, FieldCreation } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';
import type { PatternMatchResult } from '@/entities/spl/lib/parser/patterns';
import { registerAugmentationHandler } from './pattern-based';

/**
 * Augment stats pattern results with rich metadata
 *
 * Pattern provides:
 * - Variant-specific semantics (dropsAllExcept vs preservesAll)
 * - BY field extraction
 * - Aggregation field extraction
 *
 * Custom handler adds:
 * - Type inference (aggregation functions → number)
 * - Expression strings for documentation
 * - Per-aggregation line/column locations
 * - Precise field consumption tracking
 *
 * @param patternResult - Pattern match result with semantic rules
 * @param stage - Original StatsCommand AST node
 * @param _tracker - Field tracker (unused)
 * @returns Enriched field effect with metadata
 */
export function augmentStatsPattern(
  patternResult: PatternMatchResult,
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'StatsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as StatsCommand;
  const creates: FieldCreation[] = [];
  const consumes: string[] = [];

  // Aggregations create new fields (with rich metadata)
  for (const agg of command.aggregations) {
    const outputName = agg.outputField || agg.alias || (agg.field?.fieldName ?? agg.function);

    // Consume the input field if specified
    if (agg.field && !agg.field.isWildcard) {
      consumes.push(agg.field.fieldName);
    }

    // Create the output field with rich metadata
    creates.push({
      fieldName: outputName,
      dependsOn: agg.field && !agg.field.isWildcard ? [agg.field.fieldName] : [],
      expression: agg.alias
        ? `${agg.function}(${agg.field?.fieldName || ''}) AS ${agg.alias}`
        : `${agg.function}(${agg.field?.fieldName || ''})`,
      dataType: inferAggregationType(agg.function), // Custom type inference
      confidence: 'certain',
      line: agg.location?.startLine,      // Per-field location
      column: agg.location?.startColumn,  // Per-field location
    });
  }

  // BY fields are consumed and grouped by
  const byFieldNames: string[] = [];
  for (const byField of command.byFields) {
    if (!byField.isWildcard) {
      consumes.push(byField.fieldName);
      byFieldNames.push(byField.fieldName);
    }
  }

  // For timechart, _time is implicitly a by field
  if (command.variant === 'timechart') {
    if (!byFieldNames.includes('_time')) {
      byFieldNames.push('_time');
      consumes.push('_time');
    }
  }

  // Build result using pattern's semantic rules
  const result: CommandFieldEffect = {
    creates,
    modifies: [],
    consumes: [...new Set(consumes)],
    drops: [],
  };

  // Use pattern's variant-specific semantics (from pattern interpreter)
  // Pattern already resolved variant rules (stats/chart/timechart vs eventstats/streamstats)
  if (patternResult.semantics?.dropsAllExcept) {
    // Compute surviving fields based on pattern's semantic rules
    const survivingFields: string[] = [];

    for (const category of patternResult.semantics.dropsAllExcept) {
      if (category === 'byFields') {
        survivingFields.push(...byFieldNames);
      } else if (category === 'creates') {
        survivingFields.push(...creates.map(c => c.fieldName));
      }
    }

    result.dropsAllExcept = survivingFields;
  }

  // Pattern's preservesAll takes precedence (eventstats, streamstats)
  if (patternResult.semantics?.preservesAll) {
    result.preservesAll = true;
    delete result.dropsAllExcept; // Preserve all overrides drops
  }

  return result;
}

/**
 * Infer data type from aggregation function
 *
 * Custom logic for type inference based on Splunk aggregation semantics
 */
function inferAggregationType(funcName: string): 'number' | 'string' | undefined {
  const lowerFunc = funcName.toLowerCase();

  // Functions that always return numbers
  const numericFunctions = [
    'count', 'sum', 'avg', 'mean', 'min', 'max',
    'stdev', 'stdevp', 'var', 'varp',
    'sumsq', 'median', 'mode', 'perc', 'exactperc',
    'upperperc', 'range', 'rate',
  ];

  if (numericFunctions.includes(lowerFunc)) {
    return 'number';
  }

  // Functions that return strings
  const stringFunctions = [
    'values', 'list', 'first', 'last',
  ];

  if (stringFunctions.includes(lowerFunc)) {
    return 'string';
  }

  // Default to number for unknown aggregation functions
  return 'number';
}

// =============================================================================
// REGISTER AUGMENTATION HANDLERS
// =============================================================================

// Register stats augmentation handler for all 5 variants
// This happens at module load time
registerAugmentationHandler('stats', augmentStatsPattern);
registerAugmentationHandler('eventstats', augmentStatsPattern);
registerAugmentationHandler('streamstats', augmentStatsPattern);
registerAugmentationHandler('chart', augmentStatsPattern);
registerAugmentationHandler('timechart', augmentStatsPattern);
