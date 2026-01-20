/**
 * Subsearch Command Handlers
 *
 * Handles commands that contain nested pipelines: append, join, union.
 * These commands merge fields from subsearches with the main pipeline.
 *
 * @module entities/field/lib/lineage/command-handlers/subsearch
 */

import type {
  PipelineStage,
  AppendCommand,
  JoinCommand,
  UnionCommand,
  GenericCommand,
  Pipeline,
} from '@/entities/spl';
import type {
  CommandFieldEffect,
  FieldConsumptionItem,
  FieldCreation,
  ScopeContext,
} from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';
import { analyzeLineage } from '../analyzer';
import { createSubsearchScope, createRootScope } from '../scope-utils';

/**
 * Analyze a subsearch pipeline and return field names created by it.
 * This creates a child scope for the subsearch analysis.
 *
 * Only returns fields that were explicitly created (via eval, stats, etc.),
 * not fields that were merely consumed or are implicit.
 *
 * @param subsearch - The subsearch pipeline to analyze
 * @param parentScope - The parent scope context
 * @param command - The command that creates this subsearch (e.g., "append", "join")
 * @param line - The line number where the subsearch starts
 */
function getSubsearchFields(
  subsearch: Pipeline,
  parentScope: ScopeContext,
  command: string,
  line: number
): string[] {
  try {
    // Create a child scope for the subsearch
    const subsearchScope = createSubsearchScope(parentScope, command, line);

    // Analyze the subsearch with its own scope
    const index = analyzeLineage(subsearch, undefined, subsearchScope);

    // Filter to only fields that were explicitly created (not just consumed or implicit)
    // A field is "created" if its origin event has kind: 'created'
    // Fields with origin kind: 'origin' are implicit (like _time, host) or backfilled
    const createdFields: string[] = [];
    for (const fieldName of index.getAllFields()) {
      const origin = index.getFieldOrigin(fieldName);
      if (origin && origin.kind === 'created') {
        createdFields.push(fieldName);
      }
    }

    return createdFields;
  } catch {
    // If analysis fails, return empty - subsearch fields unknown
    return [];
  }
}

/**
 * Handle append command
 *
 * Append adds rows from subsearch. All fields from both pipelines are available.
 * Fields created in the subsearch are added to the main pipeline.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker
 * @param currentScope - Current scope context (optional, defaults to root)
 * @returns Field effects
 */
export function handleAppendCommand(
  stage: PipelineStage,
  _tracker: FieldTracker,
  currentScope?: ScopeContext
): CommandFieldEffect {
  if (stage.type !== 'AppendCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as AppendCommand;
  const creates: FieldCreation[] = [];
  const scope = currentScope ?? createRootScope();
  const line = stage.location?.startLine ?? 1;

  // Analyze subsearch to get fields it creates (with its own child scope)
  if (command.subsearch) {
    const subsearchFields = getSubsearchFields(command.subsearch, scope, 'append', line);

    // Fields from subsearch are potentially created in the main pipeline
    // Mark with low confidence since they come from a separate context
    for (const fieldName of subsearchFields) {
      creates.push({
        fieldName,
        dependsOn: [],
        expression: `from subsearch`,
        confidence: 'likely', // Can't be certain without running
      });
    }
  }

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true, // Append preserves all main pipeline fields
  };
}

/**
 * Handle join command
 *
 * Join adds columns from subsearch based on matching join fields.
 * - Consumes join fields from main pipeline
 * - Creates fields from subsearch (except join fields which are matched)
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker
 * @param currentScope - Current scope context (optional, defaults to root)
 * @returns Field effects
 */
export function handleJoinCommand(
  stage: PipelineStage,
  _tracker: FieldTracker,
  currentScope?: ScopeContext
): CommandFieldEffect {
  if (stage.type !== 'JoinCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as JoinCommand;
  const creates: FieldCreation[] = [];
  const consumes: FieldConsumptionItem[] = [];
  const scope = currentScope ?? createRootScope();
  const line = stage.location?.startLine ?? 1;

  // Consume join fields (with location for underlining)
  for (const joinField of command.joinFields) {
    if (!joinField.isWildcard) {
      consumes.push({
        fieldName: joinField.fieldName,
        line: joinField.location?.startLine,
        column: joinField.location?.startColumn,
      });
    }
  }

  // Analyze subsearch to get fields it creates (with its own child scope)
  if (command.subsearch) {
    const subsearchFields = getSubsearchFields(command.subsearch, scope, 'join', line);
    const joinFieldNames = new Set(
      command.joinFields.filter(f => !f.isWildcard).map(f => f.fieldName)
    );

    // Fields from subsearch (except join keys) are added as new columns
    for (const fieldName of subsearchFields) {
      if (!joinFieldNames.has(fieldName)) {
        creates.push({
          fieldName,
          dependsOn: [...joinFieldNames], // Depends on join keys
          expression: `from join subsearch`,
          confidence: 'likely',
        });
      }
    }
  }

  return {
    creates,
    modifies: [],
    consumes,
    drops: [],
    preservesAll: true, // Join preserves all main pipeline fields
  };
}

/**
 * Handle union command
 *
 * Union combines results from multiple pipelines/datasets.
 * All fields from all sources become available.
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker
 * @param currentScope - Current scope context (optional, defaults to root)
 * @returns Field effects
 */
export function handleUnionCommand(
  stage: PipelineStage,
  _tracker: FieldTracker,
  currentScope?: ScopeContext
): CommandFieldEffect {
  if (stage.type !== 'UnionCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as UnionCommand;
  const creates: FieldCreation[] = [];
  const scope = currentScope ?? createRootScope();
  const line = stage.location?.startLine ?? 1;

  // Analyze each subsearch (each gets its own child scope)
  if (command.subsearches) {
    const allFields = new Set<string>();

    for (let i = 0; i < command.subsearches.length; i++) {
      const subsearch = command.subsearches[i];
      // Each subsearch in union gets a unique scope ID
      const subsearchFields = getSubsearchFields(subsearch, scope, `union-${i}`, line);
      for (const field of subsearchFields) {
        allFields.add(field);
      }
    }

    // All fields from all subsearches are available
    for (const fieldName of allFields) {
      creates.push({
        fieldName,
        dependsOn: [],
        expression: `from union`,
        confidence: 'likely',
      });
    }
  }

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true, // Union preserves fields from main pipeline
  };
}

/**
 * Handle appendcols command
 *
 * Appendcols adds columns from subsearch results to each main result.
 * - Runs subsearch for each result set
 * - Adds subsearch fields as new columns
 * - With override=true, overwrites existing fields
 *
 * Note: appendcols parses as GenericCommand since it doesn't have a typed AST
 *
 * @param stage - The pipeline stage
 * @param _tracker - Field tracker
 * @param currentScope - Current scope context (optional, defaults to root)
 * @returns Field effects
 */
export function handleAppendcolsCommand(
  stage: PipelineStage,
  _tracker: FieldTracker,
  currentScope?: ScopeContext
): CommandFieldEffect {
  // appendcols is parsed as GenericCommand
  if (stage.type !== 'GenericCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as GenericCommand;
  if (command.commandName?.toLowerCase() !== 'appendcols') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const creates: FieldCreation[] = [];
  const scope = currentScope ?? createRootScope();
  const line = stage.location?.startLine ?? 1;

  // Analyze subsearch to get fields it creates (with its own child scope)
  if (command.subsearches && command.subsearches.length > 0) {
    const subsearchFields = getSubsearchFields(command.subsearches[0], scope, 'appendcols', line);

    // Fields from subsearch are added as new columns
    for (const fieldName of subsearchFields) {
      creates.push({
        fieldName,
        dependsOn: [],
        expression: `from appendcols subsearch`,
        confidence: 'likely', // Can't be certain without running
      });
    }
  }

  return {
    creates,
    modifies: [],
    consumes: [],
    drops: [],
    preservesAll: true, // Appendcols preserves all main pipeline fields
  };
}
