/**
 * Tstats Command Handler
 *
 * Handles the tstats command which performs accelerated statistics
 * over tsidx summaries or data models.
 *
 * Similar to stats but works on indexed data for better performance.
 *
 * @module entities/field/lib/lineage/command-handlers/tstats
 */

import type { PipelineStage, TstatsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Infer the data type from an aggregation function name.
 */
function inferAggregationType(func: string): 'number' | 'string' | 'boolean' | undefined {
  const numericFuncs = ['count', 'sum', 'avg', 'min', 'max', 'stdev', 'var', 'median', 'perc'];
  const lowerFunc = func.toLowerCase();

  if (numericFuncs.some(f => lowerFunc.startsWith(f))) {
    return 'number';
  }
  return undefined;
}

/**
 * Handle tstats command
 *
 * Tstats creates aggregation fields and by-fields, similar to stats.
 * It drops all other fields (like stats).
 *
 * Syntax: tstats [prestats=<bool>] [local=<bool>] [append=<bool>]
 *         <stats-func>(<field>) [AS <alias>] [BY <field-list>]
 *         [WHERE <search>]
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleTstatsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'TstatsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as TstatsCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Process aggregations (similar to stats)
  for (const agg of command.aggregations) {
    const outputName = agg.outputField || agg.alias || (agg.field?.fieldName ?? agg.function);

    // Consume the input field if specified
    if (agg.field && !agg.field.isWildcard) {
      consumes.push({
        fieldName: agg.field.fieldName,
        line: agg.field.location?.startLine,
        column: agg.field.location?.startColumn,
      });
    }

    // Create the output field
    creates.push({
      fieldName: outputName,
      dependsOn: agg.field && !agg.field.isWildcard ? [agg.field.fieldName] : [],
      expression: `${agg.function}(${agg.field?.fieldName || ''})`,
      dataType: inferAggregationType(agg.function),
      confidence: 'certain',
      line: agg.location?.startLine,
      column: agg.location?.startColumn,
    });
  }

  // Process by-fields - these become output fields and are consumed
  for (const byField of command.byFields) {
    consumes.push(byField);
    creates.push({
      fieldName: byField,
      dependsOn: [],
      expression: `by ${byField}`,
      confidence: 'certain',
    });
  }

  // tstats drops all fields except aggregations and by-fields
  const survivingFields = creates.map(c => c.fieldName);

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    dropsAllExcept: survivingFields,
  };
}
