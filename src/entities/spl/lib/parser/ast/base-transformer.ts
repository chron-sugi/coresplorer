/**
 * Base Transformer - Shared Utility Methods
 *
 * Contains shared helper methods used across all transformer visitor mixins.
 * These are pure utility functions that don't depend on visitor dispatch logic.
 *
 * @module entities/spl/lib/parser/ast/base-transformer
 */

import type { IToken } from 'chevrotain';
import * as AST from '../../../model/types';

/**
 * Base transformer with shared utility methods.
 *
 * This class provides common helpers for:
 * - Token extraction and manipulation
 * - Source location tracking
 * - Field reference parsing
 * - String value normalization
 *
 * Mixins extend this class to add command-specific visitor methods.
 */
export class BaseTransformer {
  // ===========================================================================
  // FIELD HELPERS
  // ===========================================================================

  /**
   * Parse a fieldOrWildcard context into a typed FieldReference.
   */
  protected visitFieldOrWildcard(ctx: any): AST.FieldReference {
    const children = ctx.children;

    // Handle wildcard tokens (* or prefix*/suffix patterns)
    if (children.Multiply || children.WildcardField) {
      const token = children.Multiply?.[0] ?? children.WildcardField?.[0];
      return {
        type: 'FieldReference',
        fieldName: token.image,
        isWildcard: true,
        location: this.getLocation(ctx),
      };
    }

    // Check for identifier first
    if (children.Identifier) {
      return {
        type: 'FieldReference',
        fieldName: this.getTokenImage(children.Identifier),
        isWildcard: false,
        location: this.getLocation(ctx),
      };
    }

    // Check for keyword tokens that can be used as field names
    const keywordTokens = ['Value', 'Field', 'Output', 'Max', 'Mode', 'Type'];
    for (const tokenName of keywordTokens) {
      if (children[tokenName]?.[0]) {
        const token = children[tokenName][0];
        return {
          type: 'FieldReference',
          fieldName: token.image,
          isWildcard: false,
          location: {
            startLine: token.startLine ?? 1,
            startColumn: token.startColumn ?? 1,
            endLine: token.endLine ?? 1,
            endColumn: token.endColumn ?? 1,
            startOffset: token.startOffset,
            endOffset: token.endOffset ?? token.startOffset + token.image.length,
          },
        };
      }
    }

    // Fallback - return empty field (shouldn't happen if grammar is correct)
    return {
      type: 'FieldReference',
      fieldName: '',
      isWildcard: false,
      location: this.getLocation(ctx),
    };
  }

  /**
   * Parse a fieldList context into an array of FieldReferences.
   */
  protected visitFieldList(ctx: any): AST.FieldReference[] {
    const children = ctx.children;
    const fields: AST.FieldReference[] = [];

    if (children.fieldOrWildcard) {
      for (const fw of children.fieldOrWildcard) {
        fields.push(this.visitFieldOrWildcard(fw));
      }
    }

    return fields;
  }

  // ===========================================================================
  // TOKEN HELPERS
  // ===========================================================================

  /**
   * Extract token image (text content) from a token or token array.
   * Handles both single tokens and arrays, returning empty string for nullish values.
   */
  protected getTokenImage(tokens: IToken | IToken[] | undefined): string {
    if (!tokens) return '';
    const token = Array.isArray(tokens) ? tokens[0] : tokens;
    return token?.image ?? '';
  }

  /**
   * Extract string value from a token, removing surrounding quotes if present.
   * Useful for parsing StringLiteral tokens into their actual string values.
   */
  protected getStringValue(tokens: IToken | IToken[] | undefined): string {
    const image = this.getTokenImage(tokens);
    // Remove surrounding quotes if present
    if ((image.startsWith('"') && image.endsWith('"')) ||
        (image.startsWith("'") && image.endsWith("'"))) {
      return image.slice(1, -1);
    }
    return image;
  }

  /**
   * Extract named capture group names from a regular expression pattern.
   * Supports both Python-style (?P<name>) and standard (?<name>) syntax.
   *
   * @param pattern - Regular expression string
   * @returns Array of captured group names
   */
  protected extractNamedGroups(pattern: string): string[] {
    const regex = /\(\?(?:P)?<([^>]+)>/g;
    const groups: string[] = [];
    let match;

    while ((match = regex.exec(pattern)) !== null) {
      groups.push(match[1]);
    }

    return groups;
  }

  // ===========================================================================
  // LOCATION TRACKING
  // ===========================================================================

  /**
   * Get source location (line/column) information for a CST context node.
   * Finds the first and last tokens to determine the span.
   */
  protected getLocation(ctx: any): AST.SourceLocation {
    const firstToken = this.findFirstToken(ctx);
    const lastToken = this.findLastToken(ctx);

    return {
      startLine: firstToken?.startLine ?? 1,
      startColumn: firstToken?.startColumn ?? 1,
      endLine: lastToken?.endLine ?? 1,
      endColumn: lastToken?.endColumn ?? 1,
      startOffset: firstToken?.startOffset ?? 0,
      endOffset: lastToken?.endOffset ?? 0,
    };
  }

  /**
   * Recursively find the first token in a CST node tree.
   * Performs depth-first search through children arrays.
   */
  protected findFirstToken(ctx: any): IToken | null {
    if (!ctx) return null;

    const children = ctx.children ?? ctx;
    for (const key of Object.keys(children)) {
      const value = children[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (this.isToken(item)) return item;
          const found = this.findFirstToken(item);
          if (found) return found;
        }
      }
    }
    return null;
  }

  /**
   * Recursively find the last token in a CST node tree.
   * Performs depth-first search, tracking the last encountered token.
   */
  protected findLastToken(ctx: any): IToken | null {
    if (!ctx) return null;

    let lastToken: IToken | null = null;
    const children = ctx.children ?? ctx;

    for (const key of Object.keys(children)) {
      const value = children[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (this.isToken(item)) lastToken = item;
          else {
            const found = this.findLastToken(item);
            if (found) lastToken = found;
          }
        }
      }
    }
    return lastToken;
  }

  /**
   * Type guard to check if an object is a Chevrotain IToken.
   * Tokens have an 'image' (text content) and 'startOffset' (position).
   */
  protected isToken(obj: any): obj is IToken {
    return obj && typeof obj.image === 'string' && typeof obj.startOffset === 'number';
  }
}
