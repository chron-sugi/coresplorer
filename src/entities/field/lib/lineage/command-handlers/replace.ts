/**
 * Replace Command Handler
 *
 * Handles the replace command which modifies field values.
 *
 * @module entities/field/lib/lineage/command-handlers/replace
 */

import type { PipelineStage, ReplaceCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle replace command
 *
 * Replace modifies field values in-place. It doesn't create new fields,
 * but it does track which fields are modified.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleReplaceCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'ReplaceCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as ReplaceCommand;
  const consumes: FieldConsumptionItem[] = [];

  // Process each replacement clause
  for (const replacement of command.replacements) {
    // Track fields that are consumed (but not modified - we removed that feature)
    if (replacement.fields) {
      for (const field of replacement.fields) {
        if (!field.isWildcard) {
          consumes.push({
            fieldName: field.fieldName,
            line: field.location?.startLine,
            column: field.location?.startColumn,
          });
        }
      }
    }
  }

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
    // Replace preserves all existing fields
    preservesAll: true,
  };
}
