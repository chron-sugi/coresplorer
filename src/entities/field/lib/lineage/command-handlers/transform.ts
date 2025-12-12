/**
 * Transform Command Handlers
 *
 * Handles commands that transform data structure: contingency, xyseries, timewrap.
 *
 * @module entities/field/lib/lineage/command-handlers/transform
 */

import type { PipelineStage, ContingencyCommand, XyseriesCommand, TimewrapCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle contingency command
 *
 * Contingency creates a cross-tabulation table. It drops all existing fields
 * and creates a table with row values as rows and column values as columns.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleContingencyCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'ContingencyCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as ContingencyCommand;
  const consumes: FieldConsumptionItem[] = [];
  const creates: FieldCreation[] = [];

  // Consume the row and column fields
  if (!command.rowField.isWildcard) {
    consumes.push({
      fieldName: command.rowField.fieldName,
      line: command.rowField.location?.startLine,
      column: command.rowField.location?.startColumn,
    });
  }
  if (!command.colField.isWildcard) {
    consumes.push({
      fieldName: command.colField.fieldName,
      line: command.colField.location?.startLine,
      column: command.colField.location?.startColumn,
    });
  }

  // Contingency creates a table with the row field name as first column
  // and dynamically creates columns for each unique value of colField
  // The output columns are unknown until runtime
  const rowFieldName = command.rowField.isWildcard ? '*' : command.rowField.fieldName;
  creates.push({
    fieldName: rowFieldName,
    dependsOn: [rowFieldName],
    expression: `contingency ${rowFieldName} ${command.colField.fieldName}`,
    dataType: 'string',
    confidence: 'certain',
  });

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    dropsAllExcept: creates.map(c => c.fieldName), // Contingency drops all existing fields
  };
}

/**
 * Handle xyseries command
 *
 * Xyseries transforms tabular data by pivoting rows into columns.
 * It creates dynamic columns based on the y-field values.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleXyseriesCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'XyseriesCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as XyseriesCommand;
  const consumes: FieldConsumptionItem[] = [];
  const creates: FieldCreation[] = [];

  // Consume all three input fields
  const fields = [command.xField, command.yField, command.yValueField];
  for (const field of fields) {
    if (!field.isWildcard) {
      consumes.push({
        fieldName: field.fieldName,
        line: field.location?.startLine,
        column: field.location?.startColumn,
      });
    }
  }

  // Creates the x-field as the row identifier
  // Additional columns are created dynamically based on y-field values
  const xFieldName = command.xField.isWildcard ? '*' : command.xField.fieldName;
  creates.push({
    fieldName: xFieldName,
    dependsOn: [xFieldName],
    expression: `xyseries ${xFieldName} ${command.yField.fieldName} ${command.yValueField.fieldName}`,
    dataType: 'string',
    confidence: 'certain',
  });

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    dropsAllExcept: creates.map(c => c.fieldName), // Xyseries drops all existing fields and creates new structure
  };
}

/**
 * Handle timewrap command
 *
 * Timewrap creates a _time_<suffix> field for time period comparison.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleTimewrapCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'TimewrapCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as TimewrapCommand;
  const creates: FieldCreation[] = [];

  // Timewrap creates a _time field with the wrapped time
  creates.push({
    fieldName: '_time',
    dependsOn: ['_time'],
    expression: `timewrap ${command.timeSpan}`,
    dataType: 'time',
    confidence: 'certain',
  });

  return {
    creates,
    modifies: [],
    consumes: ['_time'], // Consumes original _time
    drops: [],
    preservesAll: true, // Timewrap preserves other fields
  };
}
