/**
 * Field Filter Command Handlers
 * 
 * Handles table, fields commands
 * 
 * @module features/field-lineage/lib/command-handlers/field-filters
 */

import type { PipelineStage, TableCommand, FieldsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldDrop } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle table command - keeps only specified fields
 */
export function handleTableCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'TableCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as TableCommand;
  const consumes: string[] = [];
  const keepFields: string[] = [];

  for (const field of command.fields) {
    if (!field.isWildcard) {
      consumes.push(field.fieldName);
      keepFields.push(field.fieldName);
    }
  }

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
    dropsAllExcept: keepFields,
  };
}

/**
 * Handle fields command - keeps (+) or removes (-) fields
 */
export function handleFieldsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'FieldsCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as FieldsCommand;
  const consumes: string[] = [];
  const drops: FieldDrop[] = [];

  if (command.mode === 'remove') {
    // fields - field1, field2 -> removes these fields
    for (const field of command.fields) {
      if (!field.isWildcard) {
        drops.push({
          fieldName: field.fieldName,
          reason: 'explicit',
        });
      }
    }

    return {
      creates: [],
      modifies: [],
      consumes: [],
      drops,
    };
  } else {
    // fields + field1, field2 -> keeps only these fields
    const keepFields: string[] = [];

    for (const field of command.fields) {
      if (!field.isWildcard) {
        consumes.push(field.fieldName);
        keepFields.push(field.fieldName);
      }
    }

    return {
      creates: [],
      modifies: [],
      consumes,
      drops: [],
      dropsAllExcept: keepFields,
    };
  }
}
