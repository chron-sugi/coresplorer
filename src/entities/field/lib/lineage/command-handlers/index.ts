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
import { handleRenameCommand } from './rename';
import { handleStrcatCommand } from './strcat';
import { handleTopCommand, handleRareCommand } from './top-rare';
import { handleDedupCommand } from './dedup';
import { handleWhereCommand } from './where';
import { handleBinCommand } from './bin';
import { handleSpathCommand } from './spath';
import {
  handleAppendCommand,
  handleJoinCommand,
  handleUnionCommand,
  handleAppendcolsCommand,
} from './subsearch';
import {
  handlePatternBasedCommand,
  hasCommandPattern,
} from './pattern-based';
import { handleStatsCommand } from './stats';
import { handleMakeresultsCommand, handleMetadataCommand } from './data-generators';
import { handleAddtotalsCommand } from './addtotals';
import { handleDeltaCommand, handleAccumCommand, handleAutoregressCommand } from './streaming';
import { handleReturnCommand } from './return';
import { handleTstatsCommand } from './tstats';
import { handleSetfieldsCommand } from './setfields';
import { handleTagsCommand } from './tags';
import { handleContingencyCommand, handleXyseriesCommand, handleTimewrapCommand } from './transform';
import {
  handleXpathCommand,
  handleXmlkvCommand,
  handleXmlunescapeCommand,
  handleMultikvCommand,
  handleErexCommand,
  handleKvCommand,
} from './extraction';
import { handleConvertCommand, handleMakemvCommand } from './field-operations';
import {
  handleInputcsvCommand,
  handleFieldsummaryCommand,
  handleAddcoltotalsCommand,
  handleBucketdirCommand,
  handleGeomCommand,
  handleConcurrencyCommand,
  handleTyperCommand,
  handleNomvCommand,
  handleMakecontinuousCommand,
  handleReltimeCommand,
} from './field-affecting';

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
 * Pass-through handler that preserves all existing fields.
 * Used for output commands that don't modify the pipeline.
 */
function handlePassThroughPreserving(): CommandFieldEffect {
  return { creates: [], modifies: [], consumes: [], drops: [], preservesAll: true };
}

/**
 * Get command name from stage type for filtering.
 */
function getCommandNameFromStage(stage: PipelineStage): string {
  if (stage.type === 'SearchExpression') return 'search';
  // For GenericCommand, use the actual command name
  if (stage.type === 'GenericCommand' && 'commandName' in stage && stage.commandName) {
    return stage.commandName.toLowerCase();
  }
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

  // Field renaming
  rename: handleRenameCommand,
  RenameCommand: handleRenameCommand,

  // String concatenation
  strcat: handleStrcatCommand,
  StrcatCommand: handleStrcatCommand,

  // Aggregation commands that create count/percent
  top: handleTopCommand,
  TopCommand: handleTopCommand,
  rare: handleRareCommand,
  RareCommand: handleRareCommand,

  // Deduplication
  dedup: handleDedupCommand,
  DedupCommand: handleDedupCommand,

  // Binning
  bin: handleBinCommand,
  bucket: handleBinCommand, // alias for bin
  BinCommand: handleBinCommand,

  // Filtering
  where: handleWhereCommand,
  WhereCommand: handleWhereCommand,

  // JSON/XML extraction
  spath: handleSpathCommand,
  SpathCommand: handleSpathCommand,

  // Subsearch commands (nested pipelines)
  append: handleAppendCommand,
  AppendCommand: handleAppendCommand,
  join: handleJoinCommand,
  JoinCommand: handleJoinCommand,
  union: handleUnionCommand,
  UnionCommand: handleUnionCommand,

  // Search expressions
  search: handleSearchExpression,
  SearchExpression: handleSearchExpression,

  // Data generators
  makeresults: handleMakeresultsCommand,
  MakeresultsCommand: handleMakeresultsCommand,
  metadata: handleMetadataCommand,

  // Totals
  addtotals: handleAddtotalsCommand,
  AddtotalsCommand: handleAddtotalsCommand,

  // Streaming/cumulative
  delta: handleDeltaCommand,
  DeltaCommand: handleDeltaCommand,
  accum: handleAccumCommand,
  AccumCommand: handleAccumCommand,
  autoregress: handleAutoregressCommand,
  AutoregressCommand: handleAutoregressCommand,

  // Subsearch return
  return: handleReturnCommand,
  ReturnCommand: handleReturnCommand,

  // Tstats (accelerated stats)
  tstats: handleTstatsCommand,
  TstatsCommand: handleTstatsCommand,

  // Appendcols (handled via GenericCommand check in getCommandHandler)
  appendcols: handleAppendcolsCommand,

  // Setfields - explicit field value assignment
  setfields: handleSetfieldsCommand,
  SetfieldsCommand: handleSetfieldsCommand,

  // Tags - add tags based on field values
  tags: handleTagsCommand,
  TagsCommand: handleTagsCommand,

  // Transform commands - structure transformation
  contingency: handleContingencyCommand,
  ContingencyCommand: handleContingencyCommand,
  xyseries: handleXyseriesCommand,
  XyseriesCommand: handleXyseriesCommand,
  timewrap: handleTimewrapCommand,
  TimewrapCommand: handleTimewrapCommand,

  // Extraction commands - data extraction from fields
  xpath: handleXpathCommand,
  XpathCommand: handleXpathCommand,
  xmlkv: handleXmlkvCommand,
  XmlkvCommand: handleXmlkvCommand,
  xmlunescape: handleXmlunescapeCommand,
  XmlunescapeCommand: handleXmlunescapeCommand,
  multikv: handleMultikvCommand,
  MultikvCommand: handleMultikvCommand,
  erex: handleErexCommand,
  ErexCommand: handleErexCommand,
  kv: handleKvCommand,
  KvCommand: handleKvCommand,

  // Field operations - value conversion and multivalue handling
  convert: handleConvertCommand,
  ConvertCommand: handleConvertCommand,
  makemv: handleMakemvCommand,
  MakemvCommand: handleMakemvCommand,

  // Summary indexing commands (stats-like semantics)
  sichart: handleStatsCommand,
  SichartCommand: handleStatsCommand,
  sirare: handleRareCommand,
  SirareCommand: handleRareCommand,
  sistats: handleStatsCommand,
  SistatsCommand: handleStatsCommand,
  sitimechart: handleStatsCommand,
  SitimechartCommand: handleStatsCommand,

  // Metrics commands
  mstats: handleStatsCommand,
  MstatsCommand: handleStatsCommand,
  mcollect: handlePassThroughPreserving,
  McollectCommand: handlePassThroughPreserving,
  meventcollect: handlePassThroughPreserving,
  MeventcollectCommand: handlePassThroughPreserving,

  // Other needed commands
  geostats: handleStatsCommand,
  GeostatsCommand: handleStatsCommand,
  kvform: handleKvCommand,  // Similar to kv
  KvformCommand: handleKvCommand,
  pivot: handleStatsCommand,  // Creates output fields, stats-like
  PivotCommand: handleStatsCommand,
  selfjoin: handlePassThroughPreserving,  // Join-like, preserves fields
  SelfjoinCommand: handlePassThroughPreserving,

  // Field-affecting commands (formerly grammarSupport: 'generic')
  inputcsv: handleInputcsvCommand,
  InputcsvCommand: handleInputcsvCommand,
  fieldsummary: handleFieldsummaryCommand,
  FieldsummaryCommand: handleFieldsummaryCommand,
  addcoltotals: handleAddcoltotalsCommand,
  AddcoltotalsCommand: handleAddcoltotalsCommand,
  bucketdir: handleBucketdirCommand,
  BucketdirCommand: handleBucketdirCommand,
  geom: handleGeomCommand,
  GeomCommand: handleGeomCommand,
  geomfilter: handlePassThroughPreserving,  // Filter only
  GeomfilterCommand: handlePassThroughPreserving,
  concurrency: handleConcurrencyCommand,
  ConcurrencyCommand: handleConcurrencyCommand,
  typer: handleTyperCommand,
  TyperCommand: handleTyperCommand,
  nomv: handleNomvCommand,
  NomvCommand: handleNomvCommand,
  makecontinuous: handleMakecontinuousCommand,
  MakecontinuousCommand: handleMakecontinuousCommand,
  reltime: handleReltimeCommand,
  ReltimeCommand: handleReltimeCommand,
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
