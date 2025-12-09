/**
 * Lookup Command Handler
 *
 * @module entities/field/lib/lineage/command-handlers/lookup
 */

import type { PipelineStage, LookupCommand, InputlookupCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
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
  const consumes: FieldConsumptionItem[] = [];

  // Track input field names for deduplication and dependency tracking
  const inputFieldNames: string[] = [];

  // Consume input fields (with location for underlining)
  for (const mapping of command.inputMappings) {
    // The event field is what's consumed from the current event
    const fieldName = mapping.eventField || mapping.lookupField;
    if (!inputFieldNames.includes(fieldName)) {
      inputFieldNames.push(fieldName);
      consumes.push({
        fieldName,
        line: mapping.location?.startLine,
        column: mapping.location?.startColumn,
      });
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
