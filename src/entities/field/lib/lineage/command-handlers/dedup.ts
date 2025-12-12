/**
 * Dedup Command Handler
 *
 * Handles the dedup command which removes duplicate events
 * based on specified fields.
 *
 * @module entities/field/lib/lineage/command-handlers/dedup
 */

import type { PipelineStage, DedupCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle dedup command
 *
 * Dedup consumes the fields used for deduplication but preserves
 * all fields in the output.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleDedupCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'DedupCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as DedupCommand;
  const consumes: FieldConsumptionItem[] = [];

  // Consume fields used for deduplication (with location for underlining)
  for (const field of command.fields) {
    if (!field.isWildcard) {
      consumes.push({
        fieldName: field.fieldName,
        line: field.location?.startLine,
        column: field.location?.startColumn,
      });
    }
  }

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true, // Dedup preserves all fields
  };
}
