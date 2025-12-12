/**
 * Setfields Command Handler
 *
 * Handles the setfields command which sets explicit field values.
 *
 * @module entities/field/lib/lineage/command-handlers/setfields
 */

import type { PipelineStage, SetfieldsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle setfields command
 *
 * Setfields creates/modifies fields with explicit values.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleSetfieldsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'SetfieldsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as SetfieldsCommand;
  const creates: FieldCreation[] = [];

  // Each assignment creates a field
  for (const assignment of command.assignments) {
    creates.push({
      fieldName: assignment.field,
      dependsOn: [],
      expression: `setfields ${assignment.field}=${JSON.stringify(assignment.value)}`,
      dataType: typeof assignment.value === 'number' ? 'number'
        : typeof assignment.value === 'boolean' ? 'boolean'
        : 'string',
      confidence: 'certain',
    });
  }

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true, // Setfields preserves all existing fields
  };
}
