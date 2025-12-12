/**
 * Data Generator Command Handlers
 *
 * Handlers for commands that generate synthetic data or metadata.
 *
 * @module entities/field/lib/lineage/command-handlers/data-generators
 */

import type { PipelineStage, MakeresultsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle makeresults command
 *
 * Makeresults generates synthetic events with predictable fields.
 * - Default: creates `_time`
 * - With annotate=true: creates `_raw`, `_time`, `host`, `source`, `sourcetype`,
 *   `splunk_server`, `splunk_server_group`
 *
 * The AST already computes `createdFields` based on the annotate option.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleMakeresultsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'MakeresultsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as MakeresultsCommand;
  const creates: FieldCreation[] = [];

  // The AST already has createdFields computed
  for (const fieldName of command.createdFields) {
    creates.push({
      fieldName,
      dependsOn: [],
      expression: 'makeresults',
      confidence: 'certain',
    });
  }

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    // makeresults starts fresh - no preservation needed
  };
}

/**
 * Handle metadata command
 *
 * Metadata returns information about hosts, sources, or sourcetypes.
 * Always creates: `totalCount`, `recentTime`, `firstTime`, `lastTime`
 * Plus the type-specific field (host, source, or sourcetype)
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleMetadataCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // Metadata is typically GenericCommand since it's less common
  // Static fields are always created
  const creates: FieldCreation[] = [
    { fieldName: 'totalCount', dependsOn: [], confidence: 'certain' },
    { fieldName: 'recentTime', dependsOn: [], confidence: 'certain' },
    { fieldName: 'firstTime', dependsOn: [], confidence: 'certain' },
    { fieldName: 'lastTime', dependsOn: [], confidence: 'certain' },
  ];

  // The type field (host/source/sourcetype) would need parsing from GenericCommand
  // For now, mark as likely since we can't always determine which
  creates.push({
    fieldName: 'type_value',
    dependsOn: [],
    expression: 'metadata type field',
    confidence: 'likely',
  });

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    // metadata drops all existing fields
    dropsAllExcept: creates.map(c => c.fieldName),
  };
}
