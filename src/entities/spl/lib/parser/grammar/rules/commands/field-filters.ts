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
   * dedup [N] [keepevents=<bool>] [consecutive=<bool>] field1, field2, ... [sortby [+|-]<field>]
   */
  parser.dedupCommand = parser.RULE('dedupCommand', () => {
    parser.CONSUME(t.Dedup);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'count' }));
    // Options: keepevents=<bool>, consecutive=<bool>
    parser.MANY(() => {
      parser.OR([
        {
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    // Fields - manually parse to avoid consuming "sortby" as field
    // Stop when we see "sortby" followed by +/- or field, or when no more fields
    parser.MANY2({
      GATE: () => {
        const la1 = parser.LA(1);
        // First check if next token could be a field (Identifier, WildcardField, or keyword tokens)
        const isFieldToken =
          la1.tokenType === t.Identifier ||
          la1.tokenType === t.WildcardField ||
          // Keywords that can be field names
          la1.tokenType === t.Value ||
          la1.tokenType === t.Field ||
          la1.tokenType === t.Output ||
          la1.tokenType === t.Type ||
          la1.tokenType === t.Mode ||
          la1.tokenType === t.Max;
        if (!isFieldToken) {
          return false;
        }
        // Stop if this looks like "sortby [+/-] field" pattern
        if (la1.tokenType === t.Identifier && la1.image.toLowerCase() === 'sortby') {
          const la2 = parser.LA(2);
          // sortby followed by +, -, or identifier means it's the sortby clause
          if (la2.tokenType === t.Plus || la2.tokenType === t.Minus || la2.tokenType === t.Identifier) {
            return false;
          }
        }
        return true;
      },
      DEF: () => {
        parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' });
        parser.OPTION2(() => parser.CONSUME(t.Comma));
      },
    } as any);
    // sortby clause
    parser.OPTION3(() => {
      parser.CONSUME2(t.Identifier); // 'sortby' consumed as identifier
      parser.OPTION4(() => {
        parser.OR3([
          { ALT: () => parser.CONSUME(t.Plus, { LABEL: 'sortDir' }) },
          { ALT: () => parser.CONSUME(t.Minus, { LABEL: 'sortDir' }) },
        ]);
      });
      parser.SUBRULE2(parser.fieldOrWildcard, { LABEL: 'sortField' });
    });
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
   * head [N] [limit=<int>] [keeplast=<bool>] [null=<bool>]
   */
  parser.headCommand = parser.RULE('headCommand', () => {
    parser.CONSUME(t.Head);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'limit' }));
    parser.MANY(() => {
      parser.OR([
        {
          // limit=<int> (limit is a keyword token)
          ALT: () => {
            parser.CONSUME(t.Limit, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.CONSUME2(t.NumberLiteral, { LABEL: 'optionValue' });
          },
        },
        {
          // other options like keeplast, null
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME3(t.NumberLiteral, { LABEL: 'optionValue' }) },
            ]);
          },
        },
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
