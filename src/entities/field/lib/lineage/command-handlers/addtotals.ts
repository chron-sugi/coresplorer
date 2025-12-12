/**
 * Addtotals Command Handler
 *
 * Handles the addtotals command which adds row/column totals.
 *
 * @module entities/field/lib/lineage/command-handlers/addtotals
 */

import type { PipelineStage, AddtotalsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle addtotals command
 *
 * Addtotals creates a totals field (default: "Total") that sums numeric fields.
 * Options:
 * - fieldname: Custom name for the totals field (default: "Total")
 * - labelfield: Field to put the label in
 * - label: Label value
 * - row: Add row totals (default: true)
 * - col: Add column totals (default: false)
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleAddtotalsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'AddtotalsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as AddtotalsCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Get the fieldname option (default: "Total")
  const fieldname = command.options?.get('fieldname') as string || 'Total';

  // Create the totals field
  creates.push({
    fieldName: fieldname,
    dependsOn: command.fields?.map(f => f.fieldName) || [],
    expression: 'addtotals',
    confidence: 'certain',
    dataType: 'number',
  });

  // Consume fields being totaled (if specified)
  if (command.fields) {
    for (const field of command.fields) {
      if (!field.isWildcard) {
        consumes.push({
          fieldName: field.fieldName,
          line: field.location?.startLine,
          column: field.location?.startColumn,
        });
      }
    }
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true, // addtotals preserves all existing fields
  };
}
