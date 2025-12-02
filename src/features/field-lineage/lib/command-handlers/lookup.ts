/**
 * Lookup Command Handler
 * 
 * @module features/field-lineage/lib/command-handlers/lookup
 */

import type { PipelineStage, LookupCommand, InputlookupCommand } from '@/entities/spl/lib/parser';
import type { CommandFieldEffect, FieldCreation } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';

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
  const consumes: string[] = [];

  // Normalize input fields: include both the event field (after AS) and the original token
  const inputFields = command.inputMappings.flatMap((mapping) => {
    const fields = [mapping.lookupField];
    if (mapping.eventField && mapping.eventField !== mapping.lookupField) {
      fields.push(mapping.eventField);
    }
    return fields;
  });

  consumes.push(...new Set(inputFields));

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
            dependsOn: [...new Set(inputFields)],
            expression: `lookup ${command.lookupName} ... OUTPUT ${field}`,
            dataType: 'unknown',
            confidence: 'likely',
          });
        });
      }
    }
  }

  // Output fields are created
  for (const mapping of command.outputMappings) {
    creates.push({
      fieldName: mapping.eventField,
      dependsOn: [...new Set(inputFields)],
      expression: `lookup ${command.lookupName} ... OUTPUT ${mapping.lookupField}`,
      dataType: 'unknown', // We don't know the lookup schema
      confidence: 'likely', // Fields created if lookup matches
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
  // Inputlookup replaces all events with lookup data
  // We don't know the fields without the lookup schema
  return {
    creates: [{
      fieldName: '(lookup_fields)',
      dependsOn: [],
      expression: `inputlookup ${command.lookupName}`,
      dataType: 'unknown',
      confidence: 'unknown',
    }],
    modifies: [],
    consumes: [],
    drops: [],
    // Note: inputlookup typically starts a new pipeline, so it drops existing fields
    // but we handle this in the analyzer since it depends on context
  };
}
