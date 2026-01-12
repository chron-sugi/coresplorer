/**
 * Field Filter Command Handlers
 *
 * Handles table, fields commands
 *
 * @module entities/field/lib/lineage/command-handlers/field-filters
 */

import type { PipelineStage, TableCommand, FieldsCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldDrop, FieldConsumptionItem } from '../../../model/lineage.types';
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
  const consumes: FieldConsumptionItem[] = [];
  const keepFields: string[] = [];

  // Check if bare asterisk (*) is present - means keep all fields
  const hasBareAsterisk = command.fields.some(
    field => field.isWildcard && field.fieldName === '*'
  );

  for (const field of command.fields) {
    if (!field.isWildcard) {
      // Include per-field location for accurate underline positioning
      consumes.push({
        fieldName: field.fieldName,
        line: field.location?.startLine,
        column: field.location?.startColumn,
      });
      keepFields.push(field.fieldName);
    }
  }

  // If bare asterisk present, preserve all fields (don't set dropsAllExcept)
  if (hasBareAsterisk) {
    return {
      creates: [],
      modifies: [],
      consumes,
      drops: [],
    };
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
  const consumes: FieldConsumptionItem[] = [];
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

    // Check if bare asterisk (*) is present - means keep all fields
    const hasBareAsterisk = command.fields.some(
      field => field.isWildcard && field.fieldName === '*'
    );

    for (const field of command.fields) {
      if (!field.isWildcard) {
        // Include per-field location for accurate underline positioning
        consumes.push({
          fieldName: field.fieldName,
          line: field.location?.startLine,
          column: field.location?.startColumn,
        });
        keepFields.push(field.fieldName);
      }
    }

    // If bare asterisk present, preserve all fields (don't set dropsAllExcept)
    if (hasBareAsterisk) {
      return {
        creates: [],
        modifies: [],
        consumes,
        drops: [],
      };
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
