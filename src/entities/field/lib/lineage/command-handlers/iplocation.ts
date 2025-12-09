/**
 * Iplocation Command Handler
 *
 * Handles the iplocation command which creates implicit geographic fields.
 *
 * @module entities/field/lib/lineage/command-handlers/iplocation
 */

import type { PipelineStage, IplocationCommand } from '@/entities/spl';
import type { CommandFieldEffect, FieldCreation, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

/**
 * Handle iplocation command
 *
 * Iplocation looks up geographic information for an IP field and creates
 * implicit fields with optional prefix:
 * - city: City name
 * - country: Country name
 * - lat: Latitude
 * - lon: Longitude
 * - region: Region/state name
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker (unused)
 * @returns Field effects
 */
export function handleIplocationCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'IplocationCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as IplocationCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];

  // Consume the IP field with location
  if (!command.ipField.isWildcard) {
    consumes.push({
      fieldName: command.ipField.fieldName,
      line: command.ipField.location?.startLine,
      column: command.ipField.location?.startColumn,
    });
  }

  // Create implicit geo fields with prefix
  const prefix = command.prefix || '';
  const geoFields = [
    { name: 'city', dataType: 'string' as const },
    { name: 'country', dataType: 'string' as const },
    { name: 'lat', dataType: 'number' as const },
    { name: 'lon', dataType: 'number' as const },
    { name: 'region', dataType: 'string' as const },
  ];

  for (const geoField of geoFields) {
    creates.push({
      fieldName: prefix + geoField.name,
      dependsOn: [command.ipField.fieldName],
      expression: `iplocation implicit field from ${command.ipField.fieldName}`,
      dataType: geoField.dataType,
      confidence: 'certain',
    });
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    // Iplocation preserves all existing fields
    preservesAll: true,
  };
}
