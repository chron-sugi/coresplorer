/**
 * SPL Parser
 *
 * Public API for parsing Splunk SPL search strings into an AST.
 *
 * @example
 * ```typescript
 * import { parseSPL } from '@/entities/spl';
 *
 * const result = parseSPL('index=main | stats count BY host');
 * if (result.success) {
 *   console.log(result.ast);
 * }
 * ```
 *
 * @module entities/spl/lib/parser
 */

import type { IToken, ILexingError, IRecognitionException } from 'chevrotain';
import { SPLLexer } from './lexer/tokens';
import { splParser } from './grammar/index';
import { transformCST } from './ast/transformer';
import type * as AST from '../../model/types';

// =============================================================================
// TYPES
// =============================================================================

export interface ParseResult {
  /** Whether parsing completed without errors */
  success: boolean;
  /** The Abstract Syntax Tree (null if parsing failed completely) */
  ast: AST.Pipeline | null;
  /** All tokens from lexical analysis */
  tokens: IToken[];
  /** Lexer errors (invalid tokens) */
  lexErrors: ILexingError[];
  /** Parser errors (grammar violations) */
  parseErrors: IRecognitionException[];
}

export interface TokenInfo {
  type: string;
  image: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

// =============================================================================
// MAIN API
// =============================================================================

/**
 * Parse an SPL search string into an Abstract Syntax Tree.
 * 
 * @param spl - The SPL search string to parse
 * @returns ParseResult containing the AST and any errors
 * 
 * @example
 * ```typescript
 * const result = parseSPL('index=main | eval user=lower(username) | stats count BY user');
 * 
 * if (result.success) {
 *   // result.ast is the full AST
 *   for (const stage of result.ast.stages) {
 *     console.log(stage.type); // 'SearchExpression', 'EvalCommand', 'StatsCommand'
 *   }
 * } else {
 *   console.error('Parse errors:', result.parseErrors);
 * }
 * ```
 */
export function parseSPL(spl: string): ParseResult {
  // Step 1: Lexical analysis
  const lexResult = SPLLexer.tokenize(spl);

  // Step 2: Parsing (build CST)
  splParser.input = lexResult.tokens;
  const cst = splParser.pipeline();

  // Step 3: Transform CST to AST
  let ast: AST.Pipeline | null = null;
  const success = lexResult.errors.length === 0 && splParser.errors.length === 0;

  try {
    ast = transformCST(cst);
  } catch {
    // CST transformation failed - return partial result
  }

  return {
    success,
    ast,
    tokens: lexResult.tokens,
    lexErrors: lexResult.errors,
    parseErrors: splParser.errors,
  };
}

/**
 * Tokenize an SPL string without full parsing.
 * Useful for syntax highlighting and quick validation.
 * 
 * @param spl - The SPL search string to tokenize
 * @returns Array of tokens with position information
 */
export function tokenizeSPL(spl: string): TokenInfo[] {
  const lexResult = SPLLexer.tokenize(spl);

  return lexResult.tokens.map(token => ({
    type: token.tokenType.name,
    image: token.image,
    startLine: token.startLine ?? 1,
    startColumn: token.startColumn ?? 1,
    endLine: token.endLine ?? 1,
    endColumn: token.endColumn ?? 1,
    startOffset: token.startOffset,
    endOffset: token.endOffset ?? token.startOffset + token.image.length,
  }));
}

/**
 * Get the raw tokens from Chevrotain for advanced use cases.
 */
export function getRawTokens(spl: string): IToken[] {
  return SPLLexer.tokenize(spl).tokens;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export AST types
export * from '../../model/types';

// Re-export parser class for advanced usage
export { SPLParser } from './grammar/index';
