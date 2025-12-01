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

  // Input fields are consumed
  for (const mapping of command.inputMappings) {
    consumes.push(mapping.eventField);
  }

  // Output fields are created
  for (const mapping of command.outputMappings) {
    creates.push({
      fieldName: mapping.eventField,
      dependsOn: command.inputMappings.map(m => m.eventField),
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
