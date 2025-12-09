/**
 * Rex Command Handler
 *
 * @module entities/field/lib/lineage/command-handlers/rex
 */

import type { PipelineStage, RexCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
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
  const consumes: FieldConsumptionItem[] = [];

  // Consume source field with location
  if (!command.sourceField.isWildcard) {
    consumes.push({
      fieldName: command.sourceField.fieldName,
      line: command.sourceField.location?.startLine,
      column: command.sourceField.location?.startColumn,
    });
  }

  // Each named capture group creates a field
  for (const fieldName of command.extractedFields) {
    creates.push({
      fieldName,
      dependsOn: [command.sourceField.fieldName],
      expression: `rex field=${command.sourceField.fieldName} "${command.pattern}"`,
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
