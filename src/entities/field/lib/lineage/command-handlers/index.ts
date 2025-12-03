/**
 * Command Handlers
 *
 * Each command type has a handler that knows how it affects fields.
 *
 * @module entities/field/lib/lineage/command-handlers
 */

import type { PipelineStage } from '@/entities/spl';
import type { CommandFieldEffect } from '../../../model/lineage.types';
import type { FieldTracker } from '../field-tracker';

import { handleEvalCommand } from './eval';
import { handleRexCommand } from './rex';
import { handleLookupCommand } from './lookup';
import { handleTableCommand, handleFieldsCommand } from './field-filters';
import { handleTransactionCommand } from './transaction';
import { handleIplocationCommand } from './iplocation';
import { handleExtractCommand } from './extract';
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
 * Get the appropriate handler for a pipeline stage.
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

  // Eval needs rich expression + type inference; prefer custom handler over patterns
  if (commandName === 'eval') {
    return { getFieldEffect: handleEvalCommand };
  }

  // Rex extracts fields dynamically from regex named groups; pattern can't capture this
  if (commandName === 'rex') {
    return { getFieldEffect: handleRexCommand };
  }

  // Lookups need custom mapping for input/output fields and confidence
  if (commandName === 'lookup' || commandName === 'inputlookup') {
    return { getFieldEffect: handleLookupCommand };
  }

  // Table and fields need custom handlers for drop/keep semantics
  if (commandName === 'table') {
    return { getFieldEffect: handleTableCommand };
  }
  if (commandName === 'fields') {
    return { getFieldEffect: handleFieldsCommand };
  }

  // Stats family commands need custom handling for rich metadata
  if (['stats', 'eventstats', 'streamstats', 'chart', 'timechart'].includes(commandName)) {
    return { getFieldEffect: handleStatsCommand };
  }

  // Iplocation creates implicit geo fields; needs custom handler for createdFields
  if (commandName === 'iplocation') {
    return { getFieldEffect: handleIplocationCommand };
  }

  // PATTERN-BASED HANDLER: Check if command has a pattern defined
  // If yes, use the pattern interpreter (new pattern-driven approach)
  if (hasCommandPattern(stage)) {
    return { getFieldEffect: handlePatternBasedCommand };
  }

  // FALLBACK: Use custom handlers for commands without patterns (legacy approach)
  switch (stage.type) {
    case 'EvalCommand':
      return { getFieldEffect: handleEvalCommand };

    case 'RexCommand':
      return { getFieldEffect: handleRexCommand };

    case 'LookupCommand':
    case 'InputlookupCommand':
      return { getFieldEffect: handleLookupCommand };

    case 'TableCommand':
      return { getFieldEffect: handleTableCommand };

    case 'FieldsCommand':
      return { getFieldEffect: handleFieldsCommand };

    case 'TransactionCommand':
      return { getFieldEffect: handleTransactionCommand };

    case 'IplocationCommand':
      return { getFieldEffect: handleIplocationCommand };

    case 'GenericCommand':
      // Check if this is an extract command
      if ('commandName' in stage && stage.commandName?.toLowerCase() === 'extract') {
        return { getFieldEffect: handleExtractCommand };
      }
      // Unknown generic command - use pass-through
      return { getFieldEffect: handlePassThrough };

    case 'SearchExpression':
      return { getFieldEffect: handleSearchExpression };

    default:
      // This should never be reached - all commands should have handlers
      console.error(`[CommandHandler] No handler found for command type: ${stage.type}`);
      return { getFieldEffect: handlePassThrough };
  }
}

// =============================================================================
// SEARCH EXPRESSION HANDLER
// =============================================================================

function handleSearchExpression(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  // Search expressions consume fields in comparisons but don't modify them
  const consumes: string[] = [];

  if (stage.type === 'SearchExpression') {
    consumes.push(...stage.referencedFields);
  }

  return {
    creates: [],
    modifies: [],
    consumes,
    drops: [],
  };
}
