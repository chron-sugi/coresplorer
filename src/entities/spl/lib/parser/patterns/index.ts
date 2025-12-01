/**
 * SPL Command Syntax Patterns
 *
 * Pattern system for representing SPL command syntax declaratively.
 * Patterns use BNF notation and serve as the single source of truth
 * for command syntax, field positions, and semantic effects.
 *
 * @module entities/spl/lib/parser/patterns
 */

// Export types
export type {
  ParamType,
  Quantifier,
  FieldEffect,
  SyntaxPattern,
  TypedParam,
  Literal,
  Sequence,
  Alternation,
  Group,
  CommandSyntax,
  PatternRegistry,
  PatternMatchResult,
} from './types';

// Export type guards
export {
  isTypedParam,
  isLiteral,
  isSequence,
  isAlternation,
  isGroup,
} from './types';

// Export registry
export {
  // Core commands
  binCommand,
  renameCommand,
  fillnullCommand,
  dedupCommand,
  sortCommand,
  evalCommand,
  statsCommand,
  spathCommand,
  mvexpandCommand,
  addtotalsCommand,
  outputlookupCommand,
  // New commands
  rexCommand,
  lookupCommand,
  inputlookupCommand,
  tableCommand,
  fieldsCommand,
  headCommand,
  tailCommand,
  whereCommand,
  searchCommand,
  extractCommand,
  kvCommand,
  makemvCommand,
  mvcombineCommand,
  filldownCommand,
  accumCommand,
  autoregressCommand,
  deltaCommand,
  rangemapCommand,
  strcatCommand,
  joinCommand,
  appendCommand,
  unionCommand,
  transactionCommand,
  tstatsCommand,
  foreachCommand,
  returnCommand,
  // Registry utilities
  COMMAND_PATTERNS,
  getCommandPattern,
  hasPattern,
  getAllCommandNames,
} from './registry';

// Export validation
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './validator';

export {
  validateCommandSyntax,
  validatePattern,
  validateRegistry,
  isRegistryValid,
  getValidationSummary,
} from './validator';

// Export interpreter
export { interpretPattern } from './interpreter';
