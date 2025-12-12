/**
 * Where Command Handler
 *
 * Handles the where command which filters events based on expressions.
 *
 * @module entities/field/lib/lineage/command-handlers/where
 */

import type { PipelineStage, WhereCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle where command
 *
 * Where filters events but doesn't modify fields. It consumes fields
 * referenced in the condition expression.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleWhereCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'WhereCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as WhereCommand;
  const consumes: FieldConsumptionItem[] = [];

  // Consume all fields referenced in the condition
  for (const fieldName of command.referencedFields) {
    consumes.push({
      fieldName,
      line: command.location?.startLine,
      column: command.location?.startColumn,
    });
  }

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
    // Where preserves all fields
    preservesAll: true,
  };
}
