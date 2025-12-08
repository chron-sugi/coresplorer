/**
 * Replace Command Handler
 *
 * Handles the replace command which modifies field values.
 *
 * @module entities/field/lib/lineage/command-handlers/replace
 */

import type { PipelineStage, ReplaceCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldModification } from '../../../model/lineage.types';
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
  const modifies: FieldModification[] = [];
  const consumes: string[] = [];

  // Process each replacement clause
  for (const replacement of command.replacements) {
    // Track fields that are modified
    if (replacement.fields) {
      for (const field of replacement.fields) {
        if (!field.isWildcard) {
          modifies.push({
            fieldName: field.fieldName,
            dependsOn: [field.fieldName], // Depends on itself (in-place modification)
          });
          consumes.push(field.fieldName);
        }
      }
    }
  }

  return {
    creates: [],
    modifies,
    consumes,
    drops: [],
    // Replace preserves all existing fields
    preservesAll: true,
  };
}
