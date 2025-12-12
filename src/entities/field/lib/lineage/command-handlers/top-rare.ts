/**
 * Top/Rare Command Handler
 *
 * Handles the top and rare commands which aggregate field values
 * and create count/percent fields.
 *
 * @module entities/field/lib/lineage/command-handlers/top-rare
 */

import type { PipelineStage, TopCommand, RareCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem, FieldCreation } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle top command
 *
 * Top creates count and percent fields, consumes fields and byFields,
 * and drops all fields except the analyzed fields and their output.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleTopCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'TopCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  return handleTopRareCommand(stage as TopCommand);
}

/**
 * Handle rare command
 *
 * Rare has the same structure as top - creates count and percent fields.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleRareCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'RareCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  return handleTopRareCommand(stage as RareCommand);
}

/**
 * Shared logic for top and rare commands
 */
function handleTopRareCommand(command: TopCommand | RareCommand): CommandFieldEffect {
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];
  const survivingFields: string[] = [];

  // Consume analyzed fields (with location for underlining)
  for (const field of command.fields) {
    if (!field.isWildcard) {
      consumes.push({
        fieldName: field.fieldName,
        line: field.location?.startLine,
        column: field.location?.startColumn,
      });
      survivingFields.push(field.fieldName);
    }
  }

  // Consume BY fields (with location for underlining)
  for (const byField of command.byFields) {
    if (!byField.isWildcard) {
      consumes.push({
        fieldName: byField.fieldName,
        line: byField.location?.startLine,
        column: byField.location?.startColumn,
      });
      survivingFields.push(byField.fieldName);
    }
  }

  // Create count field if shown
  if (command.showCount) {
    creates.push({
      fieldName: command.countField,
      dependsOn: command.fields.filter(f => !f.isWildcard).map(f => f.fieldName),
      expression: `count of ${command.fields.map(f => f.fieldName).join(', ')}`,
      dataType: 'number',
      confidence: 'certain',
    });
    survivingFields.push(command.countField);
  }

  // Create percent field if shown
  if (command.showPercent) {
    creates.push({
      fieldName: command.percentField,
      dependsOn: command.fields.filter(f => !f.isWildcard).map(f => f.fieldName),
      expression: `percent of ${command.fields.map(f => f.fieldName).join(', ')}`,
      dataType: 'number',
      confidence: 'certain',
    });
    survivingFields.push(command.percentField);
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    dropsAllExcept: survivingFields, // Top/rare drops all other fields
  };
}
