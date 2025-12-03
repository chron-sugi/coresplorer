/**
 * Helper Rules
 * 
 * Shared utility rules used across commands and expressions.
 * These have no dependencies and must be defined first.
 * 
 * @module entities/spl/lib/parser/grammar/rules/helpers
 */

import type { SPLParser } from '../types';
import * as t from '../../lexer/tokens';

export function applyHelperRules(parser: SPLParser): void {
  /**
   * Field reference that may include wildcards.
   * Matches: *, field*, *field, fieldname
   * Also accepts keywords that can be used as field names.
   */
  parser.fieldOrWildcard = parser.RULE('fieldOrWildcard', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.Multiply) },
      { ALT: () => parser.CONSUME(t.WildcardField) },
      { ALT: () => parser.CONSUME(t.Identifier) },
      // Keywords that can also be field names
      { ALT: () => parser.CONSUME(t.Value) },
      { ALT: () => parser.CONSUME(t.Field) },
      { ALT: () => parser.CONSUME(t.Output) },
      { ALT: () => parser.CONSUME(t.Max) },
      { ALT: () => parser.CONSUME(t.Mode) },
      { ALT: () => parser.CONSUME(t.Type) },
    ]);
  });

  /**
   * Comma-separated list of fields (trailing comma optional).
   * Matches: field1, field2, field3
   */
  parser.fieldList = parser.RULE('fieldList', () => {
    parser.AT_LEAST_ONE(() => {
      parser.SUBRULE(parser.fieldOrWildcard);
      parser.OPTION(() => parser.CONSUME(t.Comma));
    });
  });
}
