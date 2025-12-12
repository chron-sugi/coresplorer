/**
 * Stats Command Handler
 *
 * Handles stats family commands: stats, eventstats, streamstats, chart, timechart.
 * Uses a hybrid approach:
 * 1. Interprets the command pattern to get semantic rules (drops/preserves)
 * 2. Applies custom logic for rich metadata (types, expressions, locations)
 *
 * @module entities/field/lib/lineage/command-handlers/stats
 */

import type { PipelineStage, StatsCommand, PatternMatchResult } from '@/entities/spl';
import { getCommandPattern, interpretPattern } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle stats family commands
 *
 * @param stage - The pipeline stage to handle
 * @param _tracker - Field tracker (unused)
 * @returns Field effects with rich metadata
 */
export function handleStatsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // 1. Interpret Pattern
  const commandName = stage.type.replace('Command', '').toLowerCase();
  const pattern = getCommandPattern(commandName);
  
  let patternResult: PatternMatchResult;
  
  if (pattern) {
    patternResult = interpretPattern(pattern, stage as any);
  } else {
    // Fallback if no pattern (shouldn't happen for stats)
    patternResult = {
      creates: [],
      consumes: [],
      modifies: [],
      groupsBy: [],
      drops: [],
      matched: false
    };
  }

  // 2. Apply Custom Logic
  if (stage.type !== 'StatsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as StatsCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Aggregations create new fields (with rich metadata)
  for (const agg of command.aggregations) {
    const outputName = agg.outputField || agg.alias || (agg.field?.fieldName ?? agg.function);

    // Consume the input field if specified (with location for underlining)
    if (agg.field && !agg.field.isWildcard) {
      consumes.push({
        fieldName: agg.field.fieldName,
        line: agg.field.location?.startLine,
        column: agg.field.location?.startColumn,
      });
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

  // BY fields are consumed and grouped by (with location for underlining)
  const byFieldNames: string[] = [];
  for (const byField of command.byFields) {
    if (!byField.isWildcard) {
      consumes.push({
        fieldName: byField.fieldName,
        line: byField.location?.startLine,
        column: byField.location?.startColumn,
      });
      byFieldNames.push(byField.fieldName);
    }
  }

  // For timechart, _time is implicitly a by field (no location - implicit)
  if (command.variant === 'timechart') {
    if (!byFieldNames.includes('_time')) {
      byFieldNames.push('_time');
      consumes.push('_time'); // No location for implicit field
    }
  }

  // Deduplicate consumes by field name (keep first occurrence with location)
  const seenFields = new Set<string>();
  const uniqueConsumes: FieldConsumptionItem[] = [];
  for (const item of consumes) {
    const fieldName = typeof item === 'string' ? item : item.fieldName;
    if (!seenFields.has(fieldName)) {
      seenFields.add(fieldName);
      uniqueConsumes.push(item);
    }
  }

  // Build result using pattern's semantic rules
  const result: CommandFieldEffect = {
    creates,
    modifies: [],
    consumes: uniqueConsumes,
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
