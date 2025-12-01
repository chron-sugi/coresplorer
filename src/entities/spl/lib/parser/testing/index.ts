/**
 * SPL Parser Test Utilities
 * 
 * Helpers for testing lexer, parser, and transformer.
 * 
 * @module entities/spl/lib/parser/testing
 */

import { SPLLexer } from '../lexer/tokens';
import { splParser } from '../grammar';
import type { IToken } from 'chevrotain';

/**
 * Lex SPL text and return tokens (excluding whitespace).
 */
export function lex(input: string): IToken[] {
  const result = SPLLexer.tokenize(input);
  if (result.errors.length > 0) {
    throw new Error(`Lexer errors: ${result.errors.map(e => e.message).join(', ')}`);
  }
  return result.tokens;
}

/**
 * Lex and return token names only (for easy assertions).
 */
export function lexNames(input: string): string[] {
  return lex(input).map(t => t.tokenType.name);
}

/**
 * Parse SPL text and return CST.
 * Throws if there are parse errors.
 */
export function parse(input: string) {
  const lexResult = SPLLexer.tokenize(input);
  if (lexResult.errors.length > 0) {
    throw new Error(`Lexer errors: ${lexResult.errors.map(e => e.message).join(', ')}`);
  }
  
  splParser.input = lexResult.tokens;
  const cst = splParser.pipeline();
  
  if (splParser.errors.length > 0) {
    throw new Error(`Parser errors: ${splParser.errors.map(e => e.message).join(', ')}`);
  }
  
  return cst;
}

/**
 * Parse SPL and return result with success flag (doesn't throw).
 */
export function tryParse(input: string) {
  const lexResult = SPLLexer.tokenize(input);
  
  if (lexResult.errors.length > 0) {
    return {
      success: false as const,
      lexErrors: lexResult.errors,
      parseErrors: [],
      cst: null,
    };
  }
  
  splParser.input = lexResult.tokens;
  const cst = splParser.pipeline();
  
  return {
    success: splParser.errors.length === 0,
    lexErrors: [],
    parseErrors: splParser.errors,
    cst,
  };
}

/**
 * Check if a CST node has a specific child rule.
 */
export function hasChild(cst: unknown, childName: string): boolean {
  if (!cst || typeof cst !== 'object') return false;
  const node = cst as Record<string, unknown>;
  if (!node.children || typeof node.children !== 'object') return false;
  return childName in (node.children as Record<string, unknown>);
}

/**
 * Get child nodes from CST by name.
 */
export function getChildren(cst: unknown, childName: string): unknown[] {
  if (!cst || typeof cst !== 'object') return [];
  const node = cst as Record<string, unknown>;
  if (!node.children || typeof node.children !== 'object') return [];
  const children = node.children as Record<string, unknown[]>;
  return children[childName] ?? [];
}

/**
 * Get first child node from CST by name.
 */
export function getChild(cst: unknown, childName: string): unknown {
  return getChildren(cst, childName)[0];
}
