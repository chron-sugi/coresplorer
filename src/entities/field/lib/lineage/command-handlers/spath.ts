/**
 * Spath Command Handler
 *
 * Handles the spath command which extracts fields from JSON/XML data.
 *
 * Spath can work in two modes:
 * 1. Auto-extract: `spath input=_raw` - extracts all keys (unknown at parse time)
 * 2. Path mode: `spath input=_raw path=user.name output=username` - specific extraction
 *
 * @module entities/field/lib/lineage/command-handlers/spath
 */

import type { PipelineStage, SpathCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem, FieldCreation } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle spath command
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleSpathCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'SpathCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as SpathCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Consume the input field (the JSON/XML source)
  if (command.inputField) {
    consumes.push(command.inputField);
  }

  // If output field is specified with a path, we know what field is created
  if (command.outputField && command.path) {
    creates.push({
      fieldName: command.outputField,
      dependsOn: command.inputField ? [command.inputField] : [],
      expression: `spath path=${command.path}`,
      confidence: 'certain',
    });
  } else if (command.path && !command.outputField) {
    // Path specified but no output - field name is derived from path
    // e.g., path=user.name creates field "user.name"
    const fieldName = command.path.split('.').pop() || command.path;
    creates.push({
      fieldName,
      dependsOn: command.inputField ? [command.inputField] : [],
      expression: `spath path=${command.path}`,
      confidence: 'likely', // Not 100% certain about the name derivation
    });
  }
  // Auto-extract mode (no path): creates unknown fields - can't track statically

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true, // Spath preserves all existing fields
  };
}
