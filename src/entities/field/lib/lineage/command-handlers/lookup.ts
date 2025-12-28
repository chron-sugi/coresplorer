/**
 * Lookup Command Handler
 *
 * @module entities/field/lib/lineage/command-handlers/lookup
 */

import type { PipelineStage, LookupCommand, InputlookupCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';
import { getCachedSchema } from '@/entities/lookup';

export function handleLookupCommand(
  stage: PipelineStage,
  tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type === 'InputlookupCommand') {
    return handleInputlookup(stage as InputlookupCommand, tracker);
  }

  if (stage.type !== 'LookupCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as LookupCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Track input field names for dependency tracking
  const inputFieldNames: string[] = [];

  // Consume input fields (with location for underlining)
  // Include both lookupField and eventField when they differ (AS mapping)
  for (const mapping of command.inputMappings) {
    // Always add the lookup field (column name in lookup table)
    if (!inputFieldNames.includes(mapping.lookupField)) {
      inputFieldNames.push(mapping.lookupField);
      consumes.push({
        fieldName: mapping.lookupField,
        line: mapping.location?.startLine,
        column: mapping.location?.startColumn,
      });
    }
    // Also add event field if different (the AS mapping source)
    if (mapping.eventField && mapping.eventField !== mapping.lookupField) {
      if (!inputFieldNames.includes(mapping.eventField)) {
        inputFieldNames.push(mapping.eventField);
        consumes.push({
          fieldName: mapping.eventField,
          line: mapping.location?.startLine,
          column: mapping.location?.startColumn,
        });
      }
    }
  }

  if (command.outputMappings.length === 0) {
    const line = tracker.getSourceLine(command.location.startLine ?? 1);
    if (line) {
      const outputMatch = line.match(/output(?:new)?(.+)/i);
      if (outputMatch?.[1]) {
        const outputPart = outputMatch[1].split('|')[0];
        const outputs = outputPart.split(',').map((f) => f.trim()).filter(Boolean);
        outputs.forEach((field) => {
          creates.push({
            fieldName: field,
            dependsOn: inputFieldNames,
            expression: `lookup ${command.lookupName} ... OUTPUT ${field}`,
            dataType: 'unknown',
            confidence: 'likely',
          });
        });
      }
    }
  }

  // Output fields are created - use the field's location for accurate underlining
  for (const mapping of command.outputMappings) {
    creates.push({
      fieldName: mapping.eventField,
      dependsOn: inputFieldNames,
      expression: `lookup ${command.lookupName} ... OUTPUT ${mapping.lookupField}`,
      dataType: 'unknown', // We don't know the lookup schema
      confidence: 'likely', // Fields created if lookup matches
      line: mapping.location?.startLine,
      column: mapping.location?.startColumn,
    });
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
  };
}

function handleInputlookup(
  command: InputlookupCommand,
  _tracker: FieldTracker
): CommandFieldEffect {
  const creates: FieldCreation[] = [];

  // Try to get schema from cache (schemas preloaded at app startup)
  const schema = getCachedSchema(command.lookupName);

  if (schema && schema.fields.length > 0) {
    // Schema found - create actual fields from lookup columns
    for (const field of schema.fields) {
      creates.push({
        fieldName: field.name,
        dependsOn: [],
        expression: `inputlookup ${command.lookupName}`,
        dataType: field.type || 'unknown',
        confidence: 'certain', // Schema-based fields are certain
      });
    }

    return {
      creates,
      modifies: [],
      consumes: [],
      drops: [],
      dropsAllExcept: schema.fields.map((f) => f.name),
    };
  } else {
    // No schema found - fall back to placeholder
    // This maintains backward compatibility for lookups without schemas
    return {
      creates: [
        {
          fieldName: '(lookup_fields)',
          dependsOn: [],
          expression: `inputlookup ${command.lookupName}`,
          dataType: 'unknown',
          confidence: 'unknown',
        },
      ],
      modifies: [],
      consumes: [],
      drops: [],
    };
  }
}
