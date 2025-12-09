/**
 * Command Handlers
 *
 * Each command type has a handler that knows how it affects fields.
 *
 * @module entities/field/lib/lineage/command-handlers
 */

import type { PipelineStage } from '@/entities/spl';
import type { CommandFieldEffect, FieldConsumptionItem } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

import { handleEvalCommand } from './eval';
import { handleRexCommand } from './rex';
import { handleLookupCommand } from './lookup';
import { handleTableCommand, handleFieldsCommand } from './field-filters';
import { handleTransactionCommand } from './transaction';
import { handleIplocationCommand } from './iplocation';
import { handleExtractCommand } from './extract';
import { handleReplaceCommand } from './replace';
import {
  handlePatternBasedCommand,
  hasCommandPattern,
} from './pattern-based';
import { handleStatsCommand } from './stats';

// =============================================================================
// HANDLER INTERFACE
// =============================================================================

export interface CommandHandler {
  getFieldEffect(stage: PipelineStage, tracker: FieldTracker): CommandFieldEffect;
}

// =============================================================================
// HANDLER DISPATCH
// =============================================================================

/**
 * Pass-through handler for commands not in the tracked list.
 * Returns empty effects (no field changes).
 */
function handlePassThrough(): CommandFieldEffect {
  return { creates: [], modifies: [], consumes: [], drops: [] };
}

/**
 * Get command name from stage type for filtering.
 */
function getCommandNameFromStage(stage: PipelineStage): string {
  if (stage.type === 'SearchExpression') return 'search';
  return stage.type.replace('Command', '').toLowerCase();
}

/**
 * Handler registry mapping command types to their handler functions.
 * Centralizes all command dispatch logic in one place.
 */
const HANDLER_REGISTRY: Record<string, (stage: PipelineStage, tracker: FieldTracker) => CommandFieldEffect> = {
  // Field creators with rich expression support
  eval: handleEvalCommand,
  EvalCommand: handleEvalCommand,

  // Field extractors
  rex: handleRexCommand,
  RexCommand: handleRexCommand,

  // Lookup commands
  lookup: handleLookupCommand,
  inputlookup: handleLookupCommand,
  LookupCommand: handleLookupCommand,
  InputlookupCommand: handleLookupCommand,

  // Field filters with drop/keep semantics
  table: handleTableCommand,
  TableCommand: handleTableCommand,
  fields: handleFieldsCommand,
  FieldsCommand: handleFieldsCommand,

  // Stats family commands with aggregation metadata
  stats: handleStatsCommand,
  eventstats: handleStatsCommand,
  streamstats: handleStatsCommand,
  chart: handleStatsCommand,
  timechart: handleStatsCommand,
  StatsCommand: handleStatsCommand,

  // Commands that create implicit fields
  iplocation: handleIplocationCommand,
  IplocationCommand: handleIplocationCommand,
  transaction: handleTransactionCommand,
  TransactionCommand: handleTransactionCommand,

  // Field value modification
  replace: handleReplaceCommand,
  ReplaceCommand: handleReplaceCommand,

  // Search expressions
  search: handleSearchExpression,
  SearchExpression: handleSearchExpression,
};

/**
 * Get the appropriate handler for a pipeline stage.
 *
 * Handler resolution order:
 * 1. Check if command is in trackedCommands filter (if provided)
 * 2. Look up handler in registry by command name
 * 3. Look up handler in registry by AST type
 * 4. Check for pattern-based handler
 * 5. Special case: GenericCommand with extract
 * 6. Fall back to pass-through
 *
 * @param stage - The pipeline stage to get a handler for
 * @param trackedCommands - Optional set of commands to track. If provided,
 *   commands not in this set will use the pass-through handler.
 */
export function getCommandHandler(
  stage: PipelineStage,
  trackedCommands?: Set<string>
): CommandHandler {
  const commandName = getCommandNameFromStage(stage);

  // If trackedCommands specified and command not in list, use pass-through
  if (trackedCommands && !trackedCommands.has(commandName)) {
    return { getFieldEffect: handlePassThrough };
  }

  // Try command name lookup first (for string-based matching)
  const handlerByName = HANDLER_REGISTRY[commandName];
  if (handlerByName) {
    return { getFieldEffect: handlerByName };
  }

  // Try AST type lookup (for type-based matching)
  const handlerByType = HANDLER_REGISTRY[stage.type];
  if (handlerByType) {
    return { getFieldEffect: handlerByType };
  }

  // Check for pattern-based handler (new pattern-driven approach)
  if (hasCommandPattern(stage)) {
    return { getFieldEffect: handlePatternBasedCommand };
  }

  // Special case: GenericCommand with extract
  if (stage.type === 'GenericCommand' && 'commandName' in stage && stage.commandName?.toLowerCase() === 'extract') {
    return { getFieldEffect: handleExtractCommand };
  }

  // Fall back to pass-through for unknown commands
  return { getFieldEffect: handlePassThrough };
}

// =============================================================================
// SEARCH EXPRESSION HANDLER
// =============================================================================

function handleSearchExpression(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // Search expressions consume fields in comparisons but don't modify them
  const consumes: FieldConsumptionItem[] = [];

  if (stage.type === 'SearchExpression') {
    for (const term of stage.terms) {
      if (term.type === 'SearchComparison' && !term.field.isWildcard) {
        consumes.push({
          fieldName: term.field.fieldName,
          line: term.field.location?.startLine,
          column: term.field.location?.startColumn,
        });
      }
    }
  }

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
  };
}
