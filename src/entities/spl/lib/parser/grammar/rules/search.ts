/**
 * Search Expression Rules
 * 
 * Rules for parsing SPL search expressions (initial search and | search).
 * Decomposed into focused sub-rules for maintainability.
 * 
 * @module entities/spl/lib/parser/grammar/rules/search
 */

import type { SPLParser } from '../types';
import * as t from '../../lexer/tokens';

export function applySearchRules(parser: SPLParser): void {
  /**
   * Search expression: one or more search terms.
   * Matches: index=main error OR warning
   */
  parser.searchExpression = parser.RULE('searchExpression', () => {
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.searchTerm));
  });

  /**
   * Individual search term - dispatches to specific term types.
   * Decomposed to avoid CONSUME indexing conflicts.
   */
  parser.searchTerm = parser.RULE('searchTerm', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.And) },
      { ALT: () => parser.CONSUME(t.Or) },
      { ALT: () => parser.CONSUME(t.Not) },
      { ALT: () => parser.SUBRULE(parser.groupedSearch) },
      { ALT: () => parser.SUBRULE(parser.subsearch) },
      { ALT: () => parser.SUBRULE(parser.fieldComparison) },
      { ALT: () => parser.SUBRULE(parser.keywordOrLiteral) },
    ]);
  });

  /**
   * Parenthesized search expression: (field=value OR other)
   */
  parser.groupedSearch = parser.RULE('groupedSearch', () => {
    parser.CONSUME(t.LParen);
    parser.SUBRULE(parser.searchExpression);
    parser.CONSUME(t.RParen);
  });

  /**
   * Field comparison: field=value, field!=value, field<value, field>value
   */
  parser.fieldComparison = parser.RULE('fieldComparison', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'field' });
    parser.OR([
      { ALT: () => parser.CONSUME(t.Equals, { LABEL: 'op' }) },
      { ALT: () => parser.CONSUME(t.NotEquals, { LABEL: 'op' }) },
      { ALT: () => parser.CONSUME(t.LessThan, { LABEL: 'op' }) },
      { ALT: () => parser.CONSUME(t.GreaterThan, { LABEL: 'op' }) },
    ]);
    parser.SUBRULE(parser.searchValue, { LABEL: 'value' });
  });

  /**
   * Value in a search comparison.
   * Matches: "string", 123, -24h@h, now, identifier, *, prefix*
   */
  parser.searchValue = parser.RULE('searchValue', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral) },
      { ALT: () => parser.CONSUME(t.TimeModifier) },
      { ALT: () => parser.CONSUME(t.NumberLiteral) },
      { ALT: () => parser.CONSUME(t.Identifier) },
      { ALT: () => parser.CONSUME(t.Multiply) },
      { ALT: () => parser.CONSUME(t.WildcardField) },
    ]);
  });

  /**
   * Standalone keyword, string literal, or macro.
   * Matches: error, "error message", `macro_name`
   */
  parser.keywordOrLiteral = parser.RULE('keywordOrLiteral', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'keyword' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'keyword' }) },
      { ALT: () => parser.CONSUME(t.MacroCall, { LABEL: 'macro' }) },
    ]);
  });
}
