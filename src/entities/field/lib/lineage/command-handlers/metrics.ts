/**
 * Metrics Command Handlers
 *
 * Handlers for metrics-related commands: mcatalog, mpreview
 *
 * @module entities/field/lib/lineage/command-handlers/metrics
 */

import type { PipelineStage } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle mcatalog command
 *
 * Returns metrics catalog information.
 * Creates fields for metric names and any aggregation outputs.
 *
 * @param _stage - The pipeline stage
 * @param _tracker - Field tracker
 * @returns Field effects
 */
export function handleMcatalogCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // mcatalog creates fields from aggregation functions (values(), count(), etc.)
  // The output depends on the aggregation used, but commonly includes:
  const creates: FieldCreation[] = [
    { fieldName: 'metric_name', dependsOn: [], confidence: 'likely' },
  ];

  // If there's a BY clause, the grouped-by fields are also in output
  // This would require parsing the generic command - mark as likely

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    // mcatalog drops all input fields, outputs only catalog data
    dropsAllExcept: creates.map(c => c.fieldName),
  };
}

/**
 * Handle mpreview command
 *
 * Previews metrics data before indexing.
 * Creates standard metrics fields.
 *
 * @param _stage - The pipeline stage
 * @param _tracker - Field tracker
 * @returns Field effects
 */
export function handleMpreviewCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // mpreview creates standard metrics preview fields
  const creates: FieldCreation[] = [
    { fieldName: '_time', dependsOn: [], confidence: 'certain' },
    { fieldName: '_metric_name', dependsOn: [], confidence: 'certain' },
    { fieldName: '_value', dependsOn: [], confidence: 'certain' },
  ];

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    // mpreview drops all input fields, outputs only preview data
    dropsAllExcept: creates.map(c => c.fieldName),
  };
}

/**
 * Handle findtypes command
 *
 * Finds matching event types for events.
 * Outputs event type information.
 *
 * @param _stage - The pipeline stage
 * @param _tracker - Field tracker
 * @returns Field effects
 */
export function handleFindtypesCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // findtypes outputs event type information
  const creates: FieldCreation[] = [
    { fieldName: 'eventtype', dependsOn: [], confidence: 'certain' },
    { fieldName: 'eventtypecount', dependsOn: [], confidence: 'likely' },
  ];

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    // findtypes drops all input fields per pattern semantics
    dropsAllExcept: creates.map(c => c.fieldName),
  };
}

/**
 * Handle searchtxn command
 *
 * Finds related events in transaction datasets.
 * Preserves input fields and adds transaction info.
 *
 * @param _stage - The pipeline stage
 * @param _tracker - Field tracker
 * @returns Field effects
 */
export function handleSearchtxnCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // searchtxn adds transaction-related fields while preserving input
  const creates: FieldCreation[] = [
    { fieldName: '_time', dependsOn: [], confidence: 'certain' },
    { fieldName: 'duration', dependsOn: [], confidence: 'likely' },
    { fieldName: 'eventcount', dependsOn: [], confidence: 'likely' },
  ];

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    // searchtxn preserves all input fields
    preservesAllFields: true,
  };
}
