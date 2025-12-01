/**
 * SPL Lexer Token Definitions
 * 
 * Defines all tokens recognized by the SPL parser.
 * Token order matters - more specific patterns must come before general ones.
 * 
 * @module entities/spl/lib/parser/tokens
 */

import { createToken, Lexer } from 'chevrotain';

// =============================================================================
// IDENTIFIER (defined first, referenced by keywords via longer_alt)
// =============================================================================

export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[a-zA-Z_][a-zA-Z0-9_.]*/,
});

// =============================================================================
// HELPER: Create case-insensitive keyword token
// =============================================================================

const keyword = (name: string, pattern: string) =>
  createToken({
    name,
    pattern: new RegExp(pattern, 'i'),
    longer_alt: Identifier,
  });

// =============================================================================
// COMMANDS - Tier 1: Field Creators/Modifiers
// =============================================================================

export const Eval = keyword('Eval', 'eval');
export const Stats = keyword('Stats', 'stats');
export const Eventstats = keyword('Eventstats', 'eventstats');
export const Streamstats = keyword('Streamstats', 'streamstats');
export const Chart = keyword('Chart', 'chart');
export const Timechart = keyword('Timechart', 'timechart');
export const Rename = keyword('Rename', 'rename');
export const Rex = keyword('Rex', 'rex');
export const Lookup = keyword('Lookup', 'lookup');
export const Inputlookup = keyword('Inputlookup', 'inputlookup');
export const Spath = keyword('Spath', 'spath');
export const Extract = keyword('Extract', 'extract');
export const Kv = keyword('Kv', 'kv');
export const Addtotals = keyword('Addtotals', 'addtotals');
export const Autoregress = keyword('Autoregress', 'autoregress');
export const Accum = keyword('Accum', 'accum');
export const Delta = keyword('Delta', 'delta');
export const Rangemap = keyword('Rangemap', 'rangemap');
export const Strcat = keyword('Strcat', 'strcat');

// =============================================================================
// COMMANDS - Tier 2: Field Filters
// =============================================================================

export const Table = keyword('Table', 'table');
export const Fields = keyword('Fields', 'fields');
export const Dedup = keyword('Dedup', 'dedup');
export const Sort = keyword('Sort', 'sort');
export const Head = keyword('Head', 'head');
export const Tail = keyword('Tail', 'tail');

// =============================================================================
// COMMANDS - Tier 3: Pipeline Splitters
// =============================================================================

export const Append = keyword('Append', 'append');
export const Union = keyword('Union', 'union');
export const Join = keyword('Join', 'join');

// =============================================================================
// COMMANDS - Tier 4: Structural
// =============================================================================

export const Transaction = keyword('Transaction', 'transaction');
export const Bin = keyword('Bin', 'bin');
export const Bucket = keyword('Bucket', 'bucket');
export const Fillnull = keyword('Fillnull', 'fillnull');
export const Filldown = keyword('Filldown', 'filldown');
export const Mvexpand = keyword('Mvexpand', 'mvexpand');
export const Makemv = keyword('Makemv', 'makemv');
export const Mvcombine = keyword('Mvcombine', 'mvcombine');
export const Where = keyword('Where', 'where');
export const Search = keyword('Search', 'search');
export const Tstats = keyword('Tstats', 'tstats');
export const Foreach = keyword('Foreach', 'foreach');
export const Return = keyword('Return', 'return');

// =============================================================================
// KEYWORDS & CLAUSES
// =============================================================================

export const By = keyword('By', 'by');
export const As = keyword('As', 'as');
export const Over = keyword('Over', 'over');
export const Output = keyword('Output', 'output');
export const Outputnew = keyword('Outputnew', 'outputnew');
export const From = keyword('From', 'from');
export const Datamodel = keyword('Datamodel', 'datamodel');
export const Max = keyword('Max', 'max');
export const Field = keyword('Field', 'field');
export const Mode = keyword('Mode', 'mode');
export const Type = keyword('Type', 'type');
export const Left = keyword('Left', 'left');
export const Outer = keyword('Outer', 'outer');
export const Inner = keyword('Inner', 'inner');
export const Span = keyword('Span', 'span');
export const Bins = keyword('Bins', 'bins');
export const Value = keyword('Value', 'value');
export const Default = keyword('Default', 'default');
export const Limit = keyword('Limit', 'limit');
export const Delim = keyword('Delim', 'delim');

// Boolean & Logical
export const True = keyword('True', 'true');
export const False = keyword('False', 'false');
export const Null = keyword('Null', 'null');
export const And = keyword('And', 'and');
export const Or = keyword('Or', 'or');
export const Not = keyword('Not', 'not');

// =============================================================================
// OPERATORS
// =============================================================================

export const Pipe = createToken({ name: 'Pipe', pattern: /\|/ });
export const NotEquals = createToken({ name: 'NotEquals', pattern: /!=/ });
export const LessThanOrEqual = createToken({ name: 'LessThanOrEqual', pattern: /<=/ });
export const GreaterThanOrEqual = createToken({ name: 'GreaterThanOrEqual', pattern: />=/ });
export const Equals = createToken({ name: 'Equals', pattern: /=/ });
export const LessThan = createToken({ name: 'LessThan', pattern: /</ });
export const GreaterThan = createToken({ name: 'GreaterThan', pattern: />/ });
export const Plus = createToken({ name: 'Plus', pattern: /\+/ });
export const Minus = createToken({ name: 'Minus', pattern: /-/ });
export const Multiply = createToken({ name: 'Multiply', pattern: /\*/ });
export const Divide = createToken({ name: 'Divide', pattern: /\// });
export const Modulo = createToken({ name: 'Modulo', pattern: /%/ });
export const Dot = createToken({ name: 'Dot', pattern: /\./ });

// =============================================================================
// DELIMITERS
// =============================================================================

export const LParen = createToken({ name: 'LParen', pattern: /\(/ });
export const RParen = createToken({ name: 'RParen', pattern: /\)/ });
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ });
export const RBracket = createToken({ name: 'RBracket', pattern: /\]/ });
export const Comma = createToken({ name: 'Comma', pattern: /,/ });
export const Colon = createToken({ name: 'Colon', pattern: /:/ });

// =============================================================================
// LITERALS
// =============================================================================

export const TimeModifier = createToken({
  name: 'TimeModifier',
  // Matches: -24h, -24h@h, @d, now, +1d@w, etc.
  // Must have either a time span (e.g., -24h) or a snap modifier (@h) or both
  pattern: /now|[+-]?\d+[smhdwMy](?:@[smhdwMy])?|@[smhdwMy]/,
});

export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
});

export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
});

// =============================================================================
// SPECIAL PATTERNS
// =============================================================================

export const MacroCall = createToken({
  name: 'MacroCall',
  pattern: /`[^`]+`/,
});

export const WildcardField = createToken({
  name: 'WildcardField',
  // Negative lookahead prevents matching in multiplication context (e.g., price*quantity)
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*\*(?![a-zA-Z0-9_])|\*[a-zA-Z0-9_]+/,
});

// =============================================================================
// WHITESPACE (skipped)
// =============================================================================

export const WhiteSpace = createToken({
  name: 'WhiteSpace',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// =============================================================================
// ALL TOKENS (ORDER MATTERS!)
// =============================================================================

export const allTokens = [
  // Whitespace first (skipped)
  WhiteSpace,

  // Multi-char operators before single-char
  NotEquals,
  LessThanOrEqual,
  GreaterThanOrEqual,

  // Single-char operators & delimiters
  Pipe,
  Equals,
  LessThan,
  GreaterThan,
  Plus,
  Minus,
  Multiply,
  Divide,
  Modulo,
  Dot,
  LParen,
  RParen,
  LBracket,
  RBracket,
  Comma,
  Colon,

  // Commands (before Identifier)
  Eval, Stats, Eventstats, Streamstats, Chart, Timechart,
  Rename, Rex, Lookup, Inputlookup, Spath, Extract, Kv,
  Addtotals, Autoregress, Accum, Delta, Rangemap, Strcat,
  Table, Fields, Dedup, Sort, Head, Tail,
  Append, Union, Join,
  Transaction, Bucket, Fillnull, Filldown,
  Mvexpand, Makemv, Mvcombine, Where, Search, Tstats, Foreach, Return,

  // Keywords (before Identifier)
  By, As, Over, Outputnew, Output, From, Datamodel,
  Max, Field, Mode, Type, Left, Outer, Inner,
  Span, Bins, Bin, Value, Default, Limit, Delim,
  True, False, Null, And, Or, Not,

  // Literals (TimeModifier before NumberLiteral to match -24h before -24)
  TimeModifier,
  NumberLiteral,
  StringLiteral,
  MacroCall,
  WildcardField,

  // Identifier last (catch-all for words)
  Identifier,
];

// =============================================================================
// LEXER INSTANCE
// =============================================================================

export const SPLLexer = new Lexer(allTokens, {
  positionTracking: 'full',
  ensureOptimizations: true,
});
