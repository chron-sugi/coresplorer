/**
 * Return Command Handler
 *
 * Handles the return command which returns values from subsearches.
 *
 * @module entities/field/lib/lineage/command-handlers/return
 */

import type { PipelineStage, ReturnCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle return command
 *
 * Return creates fields from subsearch results that can be used in the parent search.
 * - Returns specified fields as $field$ tokens
 * - Can return multiple values with count option
 *
 * Syntax: return [<count>] <field-list> | $<field> [AS <alias>]
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleReturnCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'ReturnCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as ReturnCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Return creates $field$ formatted results
  // The fields specified are both consumed and effectively "created" as return values
  for (const field of command.fields) {
    if (!field.isWildcard) {
      // Consume the field being returned
      consumes.push({
        fieldName: field.fieldName,
        line: field.location?.startLine,
        column: field.location?.startColumn,
      });

      // The return creates a $field$ or aliased output
      creates.push({
        fieldName: field.fieldName,
        dependsOn: [field.fieldName],
        expression: `return ${field.fieldName}`,
        confidence: 'certain',
      });
    }
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    // return only keeps specified fields
    dropsAllExcept: creates.map(c => c.fieldName),
  };
}
