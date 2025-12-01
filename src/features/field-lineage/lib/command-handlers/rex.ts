/**
 * Rex Command Handler
 * 
 * @module features/field-lineage/lib/command-handlers/rex
 */

import type { PipelineStage, RexCommand } from '@/entities/spl/lib/parser';
import type { CommandFieldEffect, FieldCreation } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';

export function handleRexCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'RexCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as RexCommand;
  const creates: FieldCreation[] = [];
  const consumes: string[] = [command.sourceField];

  // Each named capture group creates a field
  for (const fieldName of command.extractedFields) {
    creates.push({
      fieldName,
      dependsOn: [command.sourceField],
      expression: `rex field=${command.sourceField} "${command.pattern}"`,
      dataType: 'string',
      confidence: 'likely', // Fields are created if pattern matches
    });
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
  };
}
