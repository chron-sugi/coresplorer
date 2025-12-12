/**
 * Field Operations Command Handlers
 *
 * Field lineage handlers for commands that perform field-level operations:
 * convert, makemv
 *
 * These commands modify field values or structure without creating new fields.
 *
 * @module entities/field/lib/lineage/command-handlers/field-operations
 */

import type { PipelineStage } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem, FieldCreation, FieldModification } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

// =============================================================================
// CONVERT COMMAND
// =============================================================================

/**
 * Handle convert command - converts field values to different formats.
 *
 * The convert command applies conversion functions to fields:
 * - ctime: Converts epoch time to human-readable format
 * - dur2sec: Converts duration to seconds
 * - memk: Converts memory units to KB
 * - mktime: Converts string time to epoch
 * - mstime: Converts ms time to human-readable
 * - num: Converts to number
 * - rmcomma: Removes commas from numbers
 * - rmunit: Removes units from values
 *
 * Field effects:
 * - Modifies: The target field (or creates alias if specified)
 * - Consumes: The source field being converted
 *
 * Example: | convert ctime(timestamp) dur2sec(duration) num(count)
 */
export function handleConvertCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const consumes: FieldConsumptionItem[] = [];
  const creates: FieldCreation[] = [];
  const modifies: FieldModification[] = [];

  if (stage.type !== 'ConvertCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  for (const func of stage.functions) {
    // Consumes the source field
    consumes.push({
      fieldName: func.field,
      line: stage.location?.startLine,
      column: stage.location?.startColumn,
    });

    if (func.alias) {
      // If alias is specified, creates a new field
      creates.push({
        fieldName: func.alias,
        dependsOn: [func.field],
        expression: `convert:${func.func}`,
        confidence: 'certain',
      });
    } else {
      // Otherwise modifies the field in place
      modifies.push({
        fieldName: func.field,
        dependsOn: [func.field],
      });
    }
  }

  return {
    creates,
    modifies,
    consumes,
    drops: [],
  };
}

// =============================================================================
// MAKEMV COMMAND
// =============================================================================

/**
 * Handle makemv command - converts a single-value field to multivalue.
 *
 * Field effects:
 * - Modifies: The target field (converts to multivalue format)
 *
 * Example: | makemv delim="," field=hosts
 */
export function handleMakemvCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'MakemvCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const modifies: FieldModification[] = [{
    fieldName: stage.field,
    dependsOn: [stage.field],
  }];

  return {
    creates: [],
    modifies,
    consumes: [],
    drops: [],
  };
}
