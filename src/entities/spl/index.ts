/**
 * SPL Entity
 *
 * Domain entity for SPL (Splunk Processing Language) metadata.
 * Provides command definitions, function metadata, patterns, and linting.
 *
 * @module entities/spl
 */

// Model exports
export {
  // Commands
  SPL_COMMANDS,
  getCommandInfo,
  getCommandsByCategory,
  getFieldCreatingCommands,
  commandDropsFields,
  // Functions
  SPL_FUNCTIONS,
  getFunctionInfo,
  getFunctionReturnType,
  getFunctionsByCategory,
  // Patterns
  SPL_PATTERNS,
  FIELD_PATTERNS,
  LINTER_PATTERNS,
  extractCommandName,
  isPipelineContinuation,
} from './model';

export type {
  CommandInfo,
  CommandCategory,
  PerformanceRisk,
  FunctionInfo,
  FunctionCategory,
  ParameterInfo,
  DataType,
  // AST Types - Core
  Pipeline,
  PipelineStage,
  Command,
  Expression,
  SourceLocation,
  FieldReference,
  SearchExpression,
  // AST Types - Commands
  EvalCommand,
  StatsCommand,
  RenameCommand,
  RexCommand,
  LookupCommand,
  InputlookupCommand,
  OutputlookupCommand,
  IplocationCommand,
  TableCommand,
  FieldsCommand,
  BinCommand,
  FillnullCommand,
  DedupCommand,
  TransactionCommand,
  GenericCommand,
  // AST Types - Aggregation commands
  TopCommand,
  SitopCommand,
  RareCommand,
  // Additional field creator commands
  TstatsCommand,
  StrcatCommand,
  AccumCommand,
  DeltaCommand,
  AutoregressCommand,
  RangemapCommand,
  FilldownCommand,
  MvcombineCommand,
  UnionCommand,
} from './model';

// AST utility functions
export { extractFieldRefs } from './model';

// Parser exports
export {
  parseSPL,
  tokenizeSPL,
  getRawTokens,
  SPLParser,
} from './lib/parser';

export type {
  ParseResult,
  TokenInfo,
} from './lib/parser';

// Pattern exports
export {
  getCommandPattern,
  hasPattern,
  getAllCommandNames,
  interpretPattern,
  COMMAND_PATTERNS,
} from './lib/parser/patterns';

export type {
  CommandSyntax,
  PatternMatchResult,
  ParamType,
  FieldEffect,
  SyntaxPattern,
} from './lib/parser/patterns';

// Lib exports
export {
  lintSpl,
  getCommandsWithPerformanceRisk,
  LinterWarningSchema,
  LinterSeveritySchema,
} from './lib';

export type { LinterWarning, LinterSeverity, LintOptions } from './lib';

// Store exports
export {
  useEditorStore,
  selectSplText,
  selectParseResult,
  selectAST,
  selectIsParsing,
  selectParseError,
  selectCursor,
} from './store';

// Hook exports
export { useSPLParser } from './hooks';
