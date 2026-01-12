/**
 * Rename Command Handler
 *
 * Handles the rename command which renames fields in the pipeline.
 * Creates 'renamed' events to track field name changes.
 *
 * @module entities/field/lib/lineage/command-handlers/rename
 */

import type { PipelineStage, RenameCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldDrop } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle rename command
 *
 * Rename tracks field name changes. For each renaming:
 * - Creates the new field (as a rename of the old)
 * - Drops the old field name (shows red "dropped" underline)
 *
 * Note: We don't add old field to "consumes" because rename is semantically
 * a drop+create, not a consumption. The dropped event provides the visual
 * indicator that the field is being replaced.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleRenameCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'RenameCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as RenameCommand;
  const creates: FieldCreation[] = [];
  const drops: FieldDrop[] = [];

  for (const renaming of command.renamings) {
    const oldName = renaming.oldField.fieldName;
    const newName = renaming.newField.fieldName;

    // Skip wildcard renames (can't track those)
    if (renaming.oldField.isWildcard || renaming.newField.isWildcard) {
      continue;
    }

    // Create the new field as a rename of the old
    creates.push({
      fieldName: newName,
      dependsOn: [oldName],
      expression: `${oldName} AS ${newName}`,
      confidence: 'certain',
      line: renaming.newField.location?.startLine,
      column: renaming.newField.location?.startColumn,
      isRename: true, // Mark as rename for special handling
    });

    // Drop the old field name (with location for accurate underline positioning)
    drops.push({
      fieldName: oldName,
      reason: 'explicit',
      line: renaming.oldField.location?.startLine,
      column: renaming.oldField.location?.startColumn,
    });
  }

  return {
    creates,
    modifies: [],
    consumes: [],
    drops,
    preservesAll: true, // Rename preserves all other fields
  };
}
