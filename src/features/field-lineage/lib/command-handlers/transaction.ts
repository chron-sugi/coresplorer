/**
 * Transaction Command Handler
 *
 * Handles the transaction command which groups events and creates implicit fields.
 *
 * @module features/field-lineage/lib/command-handlers/transaction
 */

import type { PipelineStage, TransactionCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle transaction command
 *
 * Transaction groups events based on specified fields and creates implicit fields:
 * - duration: Time span of the transaction
 * - eventcount: Number of events in the transaction
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleTransactionCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'TransactionCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as TransactionCommand;
  const creates: FieldCreation[] = [];
  const consumes: string[] = [];

  // Consume the grouping fields
  for (const field of command.fields) {
    if (!field.isWildcard) {
      consumes.push(field.fieldName);
    }
  }

  // Create implicit fields
  creates.push(
    {
      fieldName: 'duration',
      dependsOn: [],
      expression: 'transaction implicit field',
      dataType: 'number',
      confidence: 'certain',
    },
    {
      fieldName: 'eventcount',
      dependsOn: [],
      expression: 'transaction implicit field',
      dataType: 'number',
      confidence: 'certain',
    }
  );

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    // Transaction preserves all existing fields
    preservesAll: true,
  };
}
