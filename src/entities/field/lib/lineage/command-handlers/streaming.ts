/**
 * Streaming Command Handlers
 *
 * Handlers for commands that compute streaming/cumulative values across events.
 *
 * @module entities/field/lib/lineage/command-handlers/streaming
 */

import type { PipelineStage, DeltaCommand, AccumCommand, AutoregressCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle delta command
 *
 * Delta computes the difference between the current and previous event's value.
 * Creates an output field with the delta value.
 *
 * Syntax: delta <field> [AS <alias>] [p=<period>]
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleDeltaCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'DeltaCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as DeltaCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Output field name: alias if specified, otherwise "delta(<field>)"
  const outputField = command.alias || `delta(${command.field})`;

  creates.push({
    fieldName: outputField,
    dependsOn: [command.field],
    expression: `delta(${command.field})`,
    confidence: 'certain',
    dataType: 'number',
  });

  // Consume the input field
  consumes.push(command.field);

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true,
  };
}

/**
 * Handle accum command
 *
 * Accum computes a running total over events.
 * Creates an output field with the cumulative sum.
 *
 * Syntax: accum <field> [AS <alias>]
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleAccumCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'AccumCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as AccumCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Output field: alias if specified, otherwise overwrites the input field
  const outputField = command.alias || command.field;

  creates.push({
    fieldName: outputField,
    dependsOn: [command.field],
    expression: `accum(${command.field})`,
    confidence: 'certain',
    dataType: 'number',
  });

  // Consume the input field
  consumes.push(command.field);

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true,
  };
}

/**
 * Handle autoregress command
 *
 * Autoregress copies previous event values into the current event.
 * Creates fields like field_p1, field_p2, etc.
 *
 * Syntax: autoregress <field> [AS <alias>] [p=<start>-<end>]
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleAutoregressCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'AutoregressCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as AutoregressCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  const pStart = command.pStart ?? 1;
  const pEnd = command.pEnd ?? 1;
  const baseField = command.alias || command.field;

  // Create fields for each period
  for (let p = pStart; p <= pEnd; p++) {
    creates.push({
      fieldName: `${baseField}_p${p}`,
      dependsOn: [command.field],
      expression: `autoregress(${command.field}, p=${p})`,
      confidence: 'certain',
    });
  }

  // Consume the input field
  consumes.push(command.field);

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true,
  };
}
