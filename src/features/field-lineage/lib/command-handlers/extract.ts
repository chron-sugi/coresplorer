/**
 * Extract Command Handler
 *
 * Handles the extract command which uses transforms.conf to extract fields.
 *
 * NOTE: Extract complexity - This command references transforms.conf definitions
 * which are not available at static analysis time. We cannot determine which
 * fields are created without runtime access to the transforms.conf file.
 *
 * @module features/field-lineage/lib/command-handlers/extract
 */

import type { PipelineStage, GenericCommand } from '@/entities/spl/lib/parser';
import type { CommandFieldEffect } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle extract command
 *
 * Extract uses transforms.conf to define field extractions. Since we don't have
 * runtime access to transforms.conf, we can't statically determine which fields
 * are created.
 *
 * Preserves all existing fields (extract adds fields, doesn't remove them).
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects (empty creates, preserves all)
 */
export function handleExtractCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'GenericCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as GenericCommand;

  // Verify this is actually an extract command
  if (command.commandName.toLowerCase() !== 'extract') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Extract preserves all existing fields and adds new ones
  // But we can't statically determine which fields are added (requires transforms.conf)
  return {
    creates: [], // Unknown fields created (requires transforms.conf)
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}
