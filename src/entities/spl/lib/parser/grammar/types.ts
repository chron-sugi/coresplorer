/**
 * SPL Parser Type Definitions
 * 
 * Type augmentation for the parser class to support mixin pattern.
 * 
 * @module entities/spl/lib/parser/grammar/types
 */

import type { CstParser, ParserMethod } from 'chevrotain';

/**
 * Parser with all rule methods declared.
 * Each mixin will implement a subset of these rules.
 */
export interface SPLParserRules {
  // Entry & Dispatch
  pipeline: ParserMethod<[], unknown>;
  command: ParserMethod<[], unknown>;

  // Helpers (must be defined first - no dependencies)
  fieldOrWildcard: ParserMethod<[], unknown>;
  fieldList: ParserMethod<[], unknown>;
  subsearch: ParserMethod<[], unknown>;

  // Expressions (depends on helpers)
  expression: ParserMethod<[], unknown>;
  orExpression: ParserMethod<[], unknown>;
  andExpression: ParserMethod<[], unknown>;
  comparisonExpression: ParserMethod<[], unknown>;
  additiveExpression: ParserMethod<[], unknown>;
  multiplicativeExpression: ParserMethod<[], unknown>;
  unaryExpression: ParserMethod<[], unknown>;
  primaryExpression: ParserMethod<[], unknown>;
  parenExpression: ParserMethod<[], unknown>;
  functionCall: ParserMethod<[], unknown>;

  // Search (depends on helpers, subsearch)
  searchExpression: ParserMethod<[], unknown>;
  searchTerm: ParserMethod<[], unknown>;
  groupedSearch: ParserMethod<[], unknown>;
  fieldComparison: ParserMethod<[], unknown>;
  searchValue: ParserMethod<[], unknown>;
  keywordOrLiteral: ParserMethod<[], unknown>;

  // Commands - Field Creators
  evalCommand: ParserMethod<[], unknown>;
  evalAssignment: ParserMethod<[], unknown>;
  statsCommand: ParserMethod<[], unknown>;
  aggregation: ParserMethod<[], unknown>;
  aggregationArg: ParserMethod<[], unknown>;
  renameCommand: ParserMethod<[], unknown>;
  renameClause: ParserMethod<[], unknown>;
  rexCommand: ParserMethod<[], unknown>;
  lookupCommand: ParserMethod<[], unknown>;
  fieldMapping: ParserMethod<[], unknown>;
  inputlookupCommand: ParserMethod<[], unknown>;
  spathCommand: ParserMethod<[], unknown>;

  // Commands - Field Filters
  searchCommand: ParserMethod<[], unknown>;
  tableCommand: ParserMethod<[], unknown>;
  fieldsCommand: ParserMethod<[], unknown>;
  dedupCommand: ParserMethod<[], unknown>;

  // Commands - Splitters
  appendCommand: ParserMethod<[], unknown>;
  joinCommand: ParserMethod<[], unknown>;

  // Commands - Structural
  whereCommand: ParserMethod<[], unknown>;
  binCommand: ParserMethod<[], unknown>;
  fillnullCommand: ParserMethod<[], unknown>;
  mvexpandCommand: ParserMethod<[], unknown>;
  transactionCommand: ParserMethod<[], unknown>;

  // Commands - Generic
  genericCommand: ParserMethod<[], unknown>;
  genericArg: ParserMethod<[], unknown>;
}

/**
 * The full SPL Parser type combining CstParser with all rule methods.
 */
export type SPLParser = CstParser & SPLParserRules;
