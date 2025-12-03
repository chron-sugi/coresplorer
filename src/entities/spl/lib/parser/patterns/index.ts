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
  // Batch 4: Remaining commands
  abstractCommand,
  addcoltotalsCommand,
  addinfoCommand,
  analyzefieldsCommand,
  anomaliesCommand,
  anomalousvalueCommand,
  anomalydetectionCommand,
  appendcolsCommand,
  appendpipeCommand,
  arulesCommand,
  associateCommand,
  auditCommand,
  bucketdirCommand,
  clusterCommand,
  cofilterCommand,
  collectCommand,
  concurrencyCommand,
  contingencyCommand,
  convertCommand,
  correlateCommand,
  datamodelCommand,
  dbinspectCommand,
  deleteCommand,
  diffCommand,
  erexCommand,
  eventcountCommand,
  fieldformatCommand,
  fieldsummaryCommand,
  findtypesCommand,
  folderizeCommand,
  formatCommand,
  fromCommand,
  outputtextCommand,
  overlapCommand,
  timewrapCommand,
  transposeCommand,
  tscollectCommand,
  typelearnerCommand,
  typerCommand,
  walklexCommand,
  x11Command,
  xmlunescapeCommand,
  xpathCommand,
  // Registry utilities
  COMMAND_PATTERNS,
  getCommandPattern,
  hasPattern,
  getAllCommandNames,
} from './registry';

// Export interpreter
export { interpretPattern } from './interpreter';
