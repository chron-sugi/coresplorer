/**
 * Field Filter Commands
 * 
 * Commands that filter or select fields: search, table, fields, dedup.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands/field-filters
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyFieldFilterCommands(parser: SPLParser): void {
  /**
   * search <search-expression>
   */
  parser.searchCommand = parser.RULE('searchCommand', () => {
    parser.CONSUME(t.Search);
    parser.SUBRULE(parser.searchExpression, { LABEL: 'expression' });
  });

  /**
   * table field1, field2, ...
   */
  parser.tableCommand = parser.RULE('tableCommand', () => {
    parser.CONSUME(t.Table);
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
  });

  /**
   * fields [+|-] field1, field2, ...
   */
  parser.fieldsCommand = parser.RULE('fieldsCommand', () => {
    parser.CONSUME(t.Fields);
    parser.OPTION(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Plus, { LABEL: 'mode' }) },
        { ALT: () => parser.CONSUME(t.Minus, { LABEL: 'mode' }) },
      ]);
    });
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
  });

  /**
   * dedup [N] field1, field2, ...
   */
  parser.dedupCommand = parser.RULE('dedupCommand', () => {
    parser.CONSUME(t.Dedup);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'count' }));
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
  });
}
