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

  /**
   * sort [N] [+|-]field1, [+|-]field2, ...
   * Sort direction can be specified per-field with +/- prefix or globally with d/desc suffix
   */
  parser.sortCommand = parser.RULE('sortCommand', () => {
    parser.CONSUME(t.Sort);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'limit' }));
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.sortField, { LABEL: 'fields' }));
  });

  parser.sortField = parser.RULE('sortField', () => {
    parser.OPTION(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Plus, { LABEL: 'direction' }) },
        { ALT: () => parser.CONSUME(t.Minus, { LABEL: 'direction' }) },
      ]);
    });
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
    parser.OPTION2(() => parser.CONSUME(t.Comma));
  });

  /**
   * head [N] [keeplast=<bool>] [null=<bool>]
   */
  parser.headCommand = parser.RULE('headCommand', () => {
    parser.CONSUME(t.Head);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'limit' }));
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * tail [N]
   */
  parser.tailCommand = parser.RULE('tailCommand', () => {
    parser.CONSUME(t.Tail);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'limit' }));
  });

  /**
   * reverse
   */
  parser.reverseCommand = parser.RULE('reverseCommand', () => {
    parser.CONSUME(t.Reverse);
  });

  /**
   * regex [<field>=|!=]<regex>
   * Filters results based on whether a field matches a regular expression
   */
  parser.regexCommand = parser.RULE('regexCommand', () => {
    parser.CONSUME(t.Regex);
    parser.OPTION(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'field' });
      parser.OR([
        { ALT: () => parser.CONSUME(t.Equals, { LABEL: 'operator' }) },
        { ALT: () => parser.CONSUME(t.NotEquals, { LABEL: 'operator' }) },
      ]);
    });
    parser.CONSUME(t.StringLiteral, { LABEL: 'pattern' });
  });
}
