/**
 * Extraction Command Handlers
 *
 * Field lineage handlers for commands that extract data from fields:
 * xpath, xmlkv, xmlunescape, multikv, erex, kv
 *
 * These commands typically consume a source field (like _raw) and
 * dynamically create new fields based on the extracted data.
 *
 * @module entities/field/lib/lineage/command-handlers/extraction
 */

import type { PipelineStage } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem, FieldCreation, FieldModification } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

// =============================================================================
// XPATH COMMAND
// =============================================================================

/**
 * Handle xpath command - extracts values from XML using XPath expressions.
 *
 * Field effects:
 * - Consumes: The source field (default: _raw)
 * - Creates: The output field (default: derived from XPath expression)
 *
 * Example: | xpath field=xml_data outfield=value "/root/element/text()"
 */
export function handleXpathCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const consumes: FieldConsumptionItem[] = [];
  const creates: FieldCreation[] = [];

  if (stage.type !== 'XpathCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Consumes the source field - use fieldRef location for accurate underline
  consumes.push({
    fieldName: stage.field,
    line: stage.fieldRef?.location?.startLine ?? stage.location?.startLine,
    column: stage.fieldRef?.location?.startColumn ?? stage.location?.startColumn,
  });

  // Creates the output field if specified
  if (stage.outfield) {
    creates.push({
      fieldName: stage.outfield,
      dependsOn: [stage.field],
      expression: 'xpath',
      confidence: 'certain',
    });
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
  };
}

// =============================================================================
// XMLKV COMMAND
// =============================================================================

/**
 * Handle xmlkv command - extracts key-value pairs from XML.
 *
 * Field effects:
 * - Consumes: The source field (default: _raw)
 * - Creates: Dynamic fields based on XML structure (unknown at parse time)
 *
 * Example: | xmlkv field=xml_data
 */
export function handleXmlkvCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const consumes: FieldConsumptionItem[] = [];

  if (stage.type !== 'XmlkvCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Consumes the source field - use fieldRef location for accurate underline
  consumes.push({
    fieldName: stage.field,
    line: stage.fieldRef?.location?.startLine ?? stage.location?.startLine,
    column: stage.fieldRef?.location?.startColumn ?? stage.location?.startColumn,
  });

  // Note: Creates dynamic fields that can't be determined at parse time

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
  };
}

// =============================================================================
// XMLUNESCAPE COMMAND
// =============================================================================

/**
 * Handle xmlunescape command - unescapes XML entities in a field.
 *
 * Field effects:
 * - Modifies: The target field (default: _raw)
 *
 * Example: | xmlunescape field=xml_data
 */
export function handleXmlunescapeCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'XmlunescapeCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Use fieldRef location for accurate underline positioning
  const modifies: FieldModification[] = [{
    fieldName: stage.field,
    dependsOn: [stage.field],
    line: stage.fieldRef?.location?.startLine,
    column: stage.fieldRef?.location?.startColumn,
  }];

  return {
    creates: [],
    modifies,
    consumes: [],
    drops: [],
  };
}

// =============================================================================
// MULTIKV COMMAND
// =============================================================================

/**
 * Handle multikv command - extracts key-value pairs from table-formatted events.
 *
 * Field effects:
 * - Consumes: _raw (the event data)
 * - Creates: Dynamic fields based on the table structure
 *
 * Example: | multikv conf=my_config forceheader=1
 */
export function handleMultikvCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const consumes: FieldConsumptionItem[] = [];

  if (stage.type !== 'MultikvCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Always consumes _raw as the source
  consumes.push({
    fieldName: '_raw',
    line: stage.location?.startLine,
    column: stage.location?.startColumn,
  });

  // Note: Creates dynamic fields based on table structure (unknown at parse time)

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
  };
}

// =============================================================================
// EREX COMMAND
// =============================================================================

/**
 * Handle erex command - extracts fields using example-based learning.
 *
 * Field effects:
 * - Consumes: The source field (fromfield option, default: _raw)
 * - Creates: The target field specified in the command
 *
 * Example: | erex ip_address fromfield=log_message examples="192.168.1.1,10.0.0.1"
 */
export function handleErexCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const consumes: FieldConsumptionItem[] = [];
  const creates: FieldCreation[] = [];

  if (stage.type !== 'ErexCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Consumes the source field - use fromfieldRef location for accurate underline
  const sourceField = stage.fromfield || '_raw';
  consumes.push({
    fieldName: sourceField,
    line: stage.fromfieldRef?.location?.startLine ?? stage.location?.startLine,
    column: stage.fromfieldRef?.location?.startColumn ?? stage.location?.startColumn,
  });

  // Creates the target field
  if (!stage.targetField.isWildcard) {
    creates.push({
      fieldName: stage.targetField.fieldName,
      dependsOn: [sourceField],
      expression: 'erex',
      confidence: 'certain',
    });
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
  };
}

// =============================================================================
// KV COMMAND
// =============================================================================

/**
 * Handle kv command - extracts key-value pairs from a field.
 *
 * Field effects:
 * - Consumes: The source field (default: _raw)
 * - Creates: Dynamic fields based on key-value pairs (unknown at parse time)
 *
 * Example: | kv field=log_line pairdelim=" " kvdelim="="
 */
export function handleKvCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  const consumes: FieldConsumptionItem[] = [];

  if (stage.type !== 'KvCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  // Consumes the source field - use fieldRef location for accurate underline
  consumes.push({
    fieldName: stage.field,
    line: stage.fieldRef?.location?.startLine ?? stage.location?.startLine,
    column: stage.fieldRef?.location?.startColumn ?? stage.location?.startColumn,
  });

  // Note: Creates dynamic fields that can't be determined at parse time

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
  };
}
