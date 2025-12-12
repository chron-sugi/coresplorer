/**
 * Tags Command Handler
 *
 * Handles the tags command which adds tags to events based on field values.
 *
 * @module entities/field/lib/lineage/command-handlers/tags
 */

import type { PipelineStage, TagsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle tags command
 *
 * Tags creates a new field containing tags based on field values.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleTagsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'TagsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as TagsCommand;
  const consumes: FieldConsumptionItem[] = [];
  const dependsOn: string[] = [];

  // Consume all source fields
  if (command.fields) {
    for (const field of command.fields) {
      if (!field.isWildcard) {
        consumes.push(field.fieldName);
        dependsOn.push(field.fieldName);
      }
    }
  }

  // Create the output field with dependencies on source fields
  const creates: FieldCreation[] = [{
    fieldName: command.outputField,
    dependsOn,
    expression: `tags outputfield=${command.outputField}`,
    dataType: 'string',
    confidence: 'certain',
  }];

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true, // Tags preserves all existing fields
  };
}
