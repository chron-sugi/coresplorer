/**
 * SPL Parser Type Definitions
 *
 * Type-safe interface for the parser class supporting the mixin pattern.
 * Chevrotain's CstParser has protected methods (RULE, CONSUME, etc.) that
 * our mixin architecture needs to access. This interface exposes those methods
 * while maintaining full type safety.
 *
 * @module entities/spl/lib/parser/grammar/types
 */

import type { CstNode, IToken, IOrAlt, TokenType } from 'chevrotain';

// =============================================================================
// CHEVROTAIN METHOD TYPES
// =============================================================================

/**
 * Options for CONSUME operations
 */
export interface ConsumeOptions {
  LABEL?: string;
  ERR_MSG?: string;
}

/**
 * Options for SUBRULE operations
 */
export interface SubruleOptions {
  LABEL?: string;
  ARGS?: unknown[];
}

/**
 * Options for AT_LEAST_ONE_SEP
 */
export interface AtLeastOneSepOptions<T> {
  SEP: TokenType;
  DEF: () => T;
}

/**
 * Parser method signature returned by RULE()
 */
export type ParserMethod<T = CstNode> = () => T;

// =============================================================================
// GRAMMAR RULE BUILDER INTERFACE
// =============================================================================

/**
 * Methods available for defining grammar rules.
 *
 * These are Chevrotain's protected CstParser methods that we expose
 * through our mixin architecture. The interface provides full type safety
 * and IDE support while allowing external functions to define grammar rules.
 *
 * @example
 * ```typescript
 * export function applyMyCommands(parser: SPLParser): void {
 *   parser.myCommand = parser.RULE('myCommand', () => {
 *     parser.CONSUME(MyToken);
 *     parser.SUBRULE(parser.expression);
 *   });
 * }
 * ```
 */
export interface GrammarRuleBuilder {
  // ---------------------------------------------------------------------------
  // Rule Definition
  // ---------------------------------------------------------------------------

  /**
   * Define a new grammar rule
   * @param name - Unique rule name (used for CST node type)
   * @param impl - Rule implementation function (returns void, builds CST internally)
   */
  RULE(name: string, impl: () => void): ParserMethod<CstNode>;

  // ---------------------------------------------------------------------------
  // Lookahead
  // ---------------------------------------------------------------------------

  /**
   * Lookahead function - peek at token at position idx (1-based)
   * @param idx - Position to look ahead (1 = next token)
   */
  LA(idx: number): IToken;

  // ---------------------------------------------------------------------------
  // Token Consumption
  // ---------------------------------------------------------------------------

  /**
   * Consume a token of the specified type
   * Use CONSUME1, CONSUME2, etc. when consuming the same token type multiple times in one rule
   */
  CONSUME(token: TokenType, options?: ConsumeOptions): IToken;
  CONSUME1(token: TokenType, options?: ConsumeOptions): IToken;
  CONSUME2(token: TokenType, options?: ConsumeOptions): IToken;
  CONSUME3(token: TokenType, options?: ConsumeOptions): IToken;
  CONSUME4(token: TokenType, options?: ConsumeOptions): IToken;
  CONSUME5(token: TokenType, options?: ConsumeOptions): IToken;

  // ---------------------------------------------------------------------------
  // Subrule Invocation
  // ---------------------------------------------------------------------------

  /**
   * Invoke another grammar rule
   * Use SUBRULE1, SUBRULE2, etc. when invoking the same rule multiple times in one rule
   */
  SUBRULE<T>(rule: ParserMethod<T>, options?: SubruleOptions): T;
  SUBRULE1<T>(rule: ParserMethod<T>, options?: SubruleOptions): T;
  SUBRULE2<T>(rule: ParserMethod<T>, options?: SubruleOptions): T;
  SUBRULE3<T>(rule: ParserMethod<T>, options?: SubruleOptions): T;
  SUBRULE4<T>(rule: ParserMethod<T>, options?: SubruleOptions): T;
  SUBRULE5<T>(rule: ParserMethod<T>, options?: SubruleOptions): T;

  // ---------------------------------------------------------------------------
  // Optionality
  // ---------------------------------------------------------------------------

  /**
   * Make a grammar clause optional (zero or one occurrence)
   * Use OPTION1, OPTION2, etc. for multiple optional clauses in one rule
   */
  OPTION<T>(impl: () => T): T | undefined;
  OPTION1<T>(impl: () => T): T | undefined;
  OPTION2<T>(impl: () => T): T | undefined;
  OPTION3<T>(impl: () => T): T | undefined;
  OPTION4<T>(impl: () => T): T | undefined;
  OPTION5<T>(impl: () => T): T | undefined;
  OPTION6<T>(impl: () => T): T | undefined;
  OPTION7<T>(impl: () => T): T | undefined;
  OPTION8<T>(impl: () => T): T | undefined;
  OPTION9<T>(impl: () => T): T | undefined;

  // ---------------------------------------------------------------------------
  // Repetition
  // ---------------------------------------------------------------------------

  /**
   * Zero or more repetitions of a grammar clause
   */
  MANY(impl: () => void): void;
  MANY1(impl: () => void): void;
  MANY2(impl: () => void): void;
  MANY3(impl: () => void): void;

  /**
   * One or more repetitions of a grammar clause
   */
  AT_LEAST_ONE(impl: () => void): void;
  AT_LEAST_ONE1(impl: () => void): void;
  AT_LEAST_ONE2(impl: () => void): void;

  /**
   * One or more repetitions with a separator token
   */
  AT_LEAST_ONE_SEP<T>(options: AtLeastOneSepOptions<T>): void;
  AT_LEAST_ONE_SEP1<T>(options: AtLeastOneSepOptions<T>): void;
  AT_LEAST_ONE_SEP2<T>(options: AtLeastOneSepOptions<T>): void;

  /**
   * Zero or more repetitions with a separator token
   */
  MANY_SEP<T>(options: AtLeastOneSepOptions<T>): void;
  MANY_SEP1<T>(options: AtLeastOneSepOptions<T>): void;
  MANY_SEP2<T>(options: AtLeastOneSepOptions<T>): void;

  // ---------------------------------------------------------------------------
  // Alternation
  // ---------------------------------------------------------------------------

  /**
   * Choice between multiple grammar alternatives.
   * Return type is void because the CST is built via side effects.
   * Use OR1, OR2, etc. for nested alternations in one rule.
   */
  OR(alts: IOrAlt<unknown>[]): void;
  OR1(alts: IOrAlt<unknown>[]): void;
  OR2(alts: IOrAlt<unknown>[]): void;
  OR3(alts: IOrAlt<unknown>[]): void;
  OR4(alts: IOrAlt<unknown>[]): void;
  OR5(alts: IOrAlt<unknown>[]): void;
}

// =============================================================================
// PARSER RULES INTERFACE
// =============================================================================

/**
 * All grammar rule methods defined on the parser.
 *
 * Each mixin file implements a subset of these rules. The complete parser
 * will have all rules defined after initialization.
 */
export interface SPLParserRules {
  // ---------------------------------------------------------------------------
  // Entry & Dispatch
  // ---------------------------------------------------------------------------
  pipeline: ParserMethod;
  command: ParserMethod;

  // ---------------------------------------------------------------------------
  // Helpers (no dependencies)
  // ---------------------------------------------------------------------------
  fieldOrWildcard: ParserMethod;
  fieldList: ParserMethod;
  subsearch: ParserMethod;

  // ---------------------------------------------------------------------------
  // Expressions
  // ---------------------------------------------------------------------------
  expression: ParserMethod;
  orExpression: ParserMethod;
  andExpression: ParserMethod;
  comparisonExpression: ParserMethod;
  additiveExpression: ParserMethod;
  multiplicativeExpression: ParserMethod;
  unaryExpression: ParserMethod;
  primaryExpression: ParserMethod;
  parenExpression: ParserMethod;
  functionCall: ParserMethod;
  keywordFunctionCall: ParserMethod;
  timeFunctionCall: ParserMethod;

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------
  searchExpression: ParserMethod;
  searchTerm: ParserMethod;
  groupedSearch: ParserMethod;
  fieldComparison: ParserMethod;
  searchValue: ParserMethod;
  keywordOrLiteral: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Field Creators
  // ---------------------------------------------------------------------------
  evalCommand: ParserMethod;
  evalAssignment: ParserMethod;
  statsCommand: ParserMethod;
  aggregation: ParserMethod;
  aggregationArg: ParserMethod;
  renameCommand: ParserMethod;
  renameClause: ParserMethod;
  rexCommand: ParserMethod;
  lookupCommand: ParserMethod;
  fieldMapping: ParserMethod;
  inputlookupCommand: ParserMethod;
  spathCommand: ParserMethod;
  extractCommand: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Field Filters
  // ---------------------------------------------------------------------------
  searchCommand: ParserMethod;
  tableCommand: ParserMethod;
  fieldsCommand: ParserMethod;
  dedupCommand: ParserMethod;
  sortCommand: ParserMethod;
  sortField: ParserMethod;
  headCommand: ParserMethod;
  tailCommand: ParserMethod;
  reverseCommand: ParserMethod;
  regexCommand: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Splitters
  // ---------------------------------------------------------------------------
  appendCommand: ParserMethod;
  joinCommand: ParserMethod;
  foreachCommand: ParserMethod;
  mapCommand: ParserMethod;
  makeresultsCommand: ParserMethod;
  gentimesCommand: ParserMethod;
  returnCommand: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Structural
  // ---------------------------------------------------------------------------
  whereCommand: ParserMethod;
  binCommand: ParserMethod;
  fillnullCommand: ParserMethod;
  mvexpandCommand: ParserMethod;
  transactionCommand: ParserMethod;
  makemvCommand: ParserMethod;
  convertCommand: ParserMethod;
  convertFunction: ParserMethod;
  replaceCommand: ParserMethod;
  replaceClause: ParserMethod;
  addinfoCommand: ParserMethod;
  fieldformatCommand: ParserMethod;
  collectCommand: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Aggregation
  // ---------------------------------------------------------------------------
  topCommand: ParserMethod;
  rareCommand: ParserMethod;
  addtotalsCommand: ParserMethod;
  tstatsCommand: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Field Creators (additional)
  // ---------------------------------------------------------------------------
  strcatCommand: ParserMethod;
  accumCommand: ParserMethod;
  deltaCommand: ParserMethod;
  autoregressCommand: ParserMethod;
  rangemapCommand: ParserMethod;
  filldownCommand: ParserMethod;
  mvcombineCommand: ParserMethod;
  unionCommand: ParserMethod;

  // ---------------------------------------------------------------------------
  // Commands - Generic (fallback)
  // ---------------------------------------------------------------------------
  genericCommand: ParserMethod;
  genericArg: ParserMethod;
}

// =============================================================================
// COMPLETE PARSER TYPE
// =============================================================================

/**
 * The complete SPL Parser type.
 *
 * Combines the rule-building methods from Chevrotain's CstParser with
 * all the dynamically-defined grammar rule methods.
 *
 * @example
 * ```typescript
 * export function applyMyRules(parser: SPLParser): void {
 *   // Full type safety and IDE autocomplete for:
 *   // - Chevrotain methods: RULE, CONSUME, SUBRULE, OR, MANY, OPTION, etc.
 *   // - Grammar rules: parser.expression, parser.evalCommand, etc.
 * }
 * ```
 */
export type SPLParser = GrammarRuleBuilder & SPLParserRules;
