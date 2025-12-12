/**
 * Field-Affecting Command Handlers
 *
 * Handlers for commands that were marked as 'generic' but affect fields.
 *
 * @module entities/field/lib/lineage/command-handlers/field-affecting
 */

import type { PipelineStage } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldModification } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * inputcsv - Loads results from CSV file
 * Creates fields based on CSV columns (unknown without schema)
 */
export function handleInputcsvCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // inputcsv is a generating command - fields come from CSV
  // Without schema info, we can't know what fields are created
  return {
    creates: [],
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: false, // Replaces pipeline with CSV data
  };
}

/**
 * fieldsummary - Generates field summary statistics
 * Creates specific summary fields, drops all other fields
 */
export function handleFieldsummaryCommand(
  _stage: PipelineStage,
  tracker: FieldTracker
): CommandFieldEffect {
  const summaryFieldNames = [
    'field',
    'count',
    'distinct_count',
    'is_exact',
    'max',
    'mean',
    'min',
    'numeric_count',
    'stdev',
    'values',
  ];

  const creates: FieldCreation[] = summaryFieldNames.map(fieldName => ({
    fieldName,
    dependsOn: [],
    confidence: 'certain' as const,
  }));

  // Get consumed fields (all current fields are summarized)
  const consumes = tracker.getExistingFields();

  return {
    creates,
    modifies: [],
    consumes,
    drops: [], // All fields are replaced, not dropped
    preservesAll: false,
    dropsAllExcept: summaryFieldNames,
  };
}

/**
 * addcoltotals - Computes totals for numeric fields
 * Adds a totals row, preserves all fields
 */
export function handleAddcoltotalsCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // addcoltotals adds a row, doesn't change field structure
  return {
    creates: [],
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * bucketdir - Creates path hierarchy buckets
 * Creates bucket_N fields based on path depth
 */
export function handleBucketdirCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // bucketdir creates bucket_N fields based on path depth
  // The exact number depends on maxcount option (default varies)
  const fieldNames: string[] = [];

  // Check if we have options in the AST
  if (stage.type === 'BucketdirCommand' && 'options' in stage) {
    const maxcount = stage.options.get('maxcount');
    const count = typeof maxcount === 'number' ? maxcount : 10;
    for (let i = 1; i <= count; i++) {
      fieldNames.push(`bucket_${i}`);
    }
  } else {
    // Default: create a few bucket fields
    for (let i = 1; i <= 5; i++) {
      fieldNames.push(`bucket_${i}`);
    }
  }

  const creates: FieldCreation[] = fieldNames.map(fieldName => ({
    fieldName,
    dependsOn: [],
    confidence: 'certain' as const,
  }));

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * geom - Adds geographic features for choropleth maps
 * Creates 'geom' field
 */
export function handleGeomCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const creates: FieldCreation[] = [{
    fieldName: 'geom',
    dependsOn: [],
    confidence: 'certain',
  }];

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * concurrency - Tags events with concurrent session count
 * Creates 'concurrency' field
 */
export function handleConcurrencyCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // Check for custom output field
  let fieldName = 'concurrency';
  if (stage.type === 'ConcurrencyCommand' && 'options' in stage) {
    const outputField = stage.options.get('output');
    if (typeof outputField === 'string') {
      fieldName = outputField;
    }
  }

  const creates: FieldCreation[] = [{
    fieldName,
    dependsOn: [],
    confidence: 'certain',
  }];

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * typer - Calculates eventtype field for events
 * Creates 'eventtype' field
 */
export function handleTyperCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const creates: FieldCreation[] = [{
    fieldName: 'eventtype',
    dependsOn: [],
    confidence: 'certain',
  }];

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * nomv - Converts multivalue field to single value
 * Modifies the specified field
 */
export function handleNomvCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const modifies: FieldModification[] = [];

  if (stage.type === 'NomvCommand' && 'field' in stage) {
    const field = stage.field;
    if (field && 'fieldName' in field) {
      modifies.push({
        fieldName: field.fieldName,
        dependsOn: [field.fieldName],
      });
    }
  }

  return {
    creates: [],
    modifies,
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * makecontinuous - Fills gaps in numeric field values
 * Modifies the specified field
 */
export function handleMakecontinuousCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const modifies: FieldModification[] = [];

  if (stage.type === 'MakecontinuousCommand' && 'field' in stage) {
    const field = stage.field;
    if (field && 'fieldName' in field) {
      modifies.push({
        fieldName: field.fieldName,
        dependsOn: [field.fieldName],
      });
    }
  }

  return {
    creates: [],
    modifies,
    consumes: [],
    drops: [],
    preservesAll: true,
  };
}

/**
 * reltime - Converts _time to relative time format
 * Creates 'reltime' field
 */
export function handleReltimeCommand(
  _stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const creates: FieldCreation[] = [{
    fieldName: 'reltime',
    dependsOn: ['_time'],
    confidence: 'certain',
  }];

  return {
    creates,
    modifies: [],
    consumes: ['_time'],
    drops: [],
    preservesAll: true,
  };
}
