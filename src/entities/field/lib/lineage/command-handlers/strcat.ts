/**
 * Strcat Command Handler
 *
 * Handles the strcat command which concatenates fields into a new field.
 *
 * @module entities/field/lib/lineage/command-handlers/strcat
 */

import type { PipelineStage, StrcatCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem, FieldCreation } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle strcat command
 *
 * Strcat creates a new field by concatenating source fields.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleStrcatCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'StrcatCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as StrcatCommand;
  const consumes: FieldConsumptionItem[] = [];

  // Consume all source fields - use sourceFieldRefs for accurate underline positioning
  for (let i = 0; i < command.sourceFields.length; i++) {
    const fieldRef = command.sourceFieldRefs?.[i];
    consumes.push({
      fieldName: command.sourceFields[i],
      line: fieldRef?.location?.startLine ?? command.location?.startLine,
      column: fieldRef?.location?.startColumn ?? command.location?.startColumn,
    });
  }

  // Create the target field with dependencies on source fields
  const creates: FieldCreation[] = [{
    fieldName: command.targetField,
    dependsOn: [...command.sourceFields],
    expression: `strcat(${command.sourceFields.join(', ')})`,
    dataType: 'string',
    confidence: 'certain',
    line: command.targetFieldRef?.location?.startLine,
    column: command.targetFieldRef?.location?.startColumn,
  }];

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true, // Strcat preserves all existing fields
  };
}
