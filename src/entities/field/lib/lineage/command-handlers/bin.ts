/**
 * Bin Command Handler
 *
 * Handles the bin command which groups numeric values into discrete bins.
 * Can create a new field via alias or modify the field in place.
 *
 * @module entities/field/lib/lineage/command-handlers/bin
 */

import type { PipelineStage, BinCommand } from '@/entities/spl';
import type {
  CommandFieldEffect,
  FieldCreation,
  FieldConsumptionItem,
  FieldModification,
} from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle bin command
 *
 * Bin consumes the input field and either:
 * - Creates a new field if alias is specified
 * - Modifies the field in place if no alias
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleBinCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'BinCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as BinCommand;
  const creates: FieldCreation[] = [];
  const modifies: FieldModification[] = [];
  const consumes: FieldConsumptionItem[] = [];

  const fieldName = command.field?.fieldName ?? '';
  if (!fieldName) {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Always consume the input field - use field's location for accurate underline
  consumes.push({
    fieldName,
    line: command.field?.location?.startLine,
    column: command.field?.location?.startColumn,
  });

  if (command.alias) {
    // Create a new field with the alias name
    creates.push({
      fieldName: command.alias,
      dependsOn: [fieldName],
      confidence: 'certain',
    });
  } else {
    // Modify the field in place
    modifies.push({
      fieldName,
      dependsOn: [fieldName],
    });
  }

  return {
    creates,
    modifies,
    consumes,
    drops: [],
    preservesAll: true, // Bin preserves all other fields
  };
}
