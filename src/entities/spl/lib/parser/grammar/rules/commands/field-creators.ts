/**
 * Field Creator Commands
 * 
 * Commands that create or modify fields: eval, stats, rename, rex, lookup, etc.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands/field-creators
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyFieldCreatorCommands(parser: SPLParser): void {
  /**
   * eval field1=expr1, field2=expr2
   */
  parser.evalCommand = parser.RULE('evalCommand', () => {
    parser.CONSUME(t.Eval);
    parser.SUBRULE(parser.evalAssignment);
    parser.MANY(() => {
      parser.CONSUME(t.Comma);
      parser.SUBRULE2(parser.evalAssignment);
    });
  });

  parser.evalAssignment = parser.RULE('evalAssignment', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'targetField' });
    parser.CONSUME(t.Equals);
    parser.SUBRULE(parser.expression, { LABEL: 'value' });
  });

  /**
   * stats/eventstats/streamstats/chart/timechart [options] <agg>(<field>) [AS alias] [BY field-list]
   * Options like span=1h, bins=10, etc. can appear before aggregations
   * Note: Options are distinguished from aggregations by the = sign (options have = but no parentheses)
   */
  parser.statsCommand = parser.RULE('statsCommand', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.Stats) },
      { ALT: () => parser.CONSUME(t.Eventstats) },
      { ALT: () => parser.CONSUME(t.Streamstats) },
      { ALT: () => parser.CONSUME(t.Chart) },
      { ALT: () => parser.CONSUME(t.Timechart) },
    ]);
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.aggregation));
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  parser.aggregation = parser.RULE('aggregation', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'func' });
    parser.OPTION(() => {
      parser.CONSUME(t.LParen);
      parser.OPTION2(() => {
        parser.AT_LEAST_ONE_SEP({
          SEP: t.Comma,
          DEF: () => parser.SUBRULE(parser.aggregationArg, { LABEL: 'args' }),
        });
      });
      parser.CONSUME(t.RParen);
    });
    parser.OPTION3(() => {
      parser.CONSUME(t.As);
      parser.CONSUME2(t.Identifier, { LABEL: 'alias' });
    });
    parser.OPTION4(() => parser.CONSUME(t.Comma));
  });

  parser.aggregationArg = parser.RULE('aggregationArg', () => {
    parser.OR([
      { ALT: () => parser.SUBRULE(parser.fieldOrWildcard) },
      { ALT: () => parser.CONSUME(t.NumberLiteral) },
      { ALT: () => parser.CONSUME(t.StringLiteral) },
    ]);
  });

  /**
   * rename old AS new, ...
   */
  parser.renameCommand = parser.RULE('renameCommand', () => {
    parser.CONSUME(t.Rename);
    parser.AT_LEAST_ONE_SEP({
      SEP: t.Comma,
      DEF: () => parser.SUBRULE(parser.renameClause),
    });
  });

  parser.renameClause = parser.RULE('renameClause', () => {
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'oldField' });
    parser.CONSUME(t.As);
    parser.SUBRULE2(parser.fieldOrWildcard, { LABEL: 'newField' });
  });

  /**
   * rex [field=<field>] [max_match=N] "<regex>"
   * Note: 'field' is a keyword token, not Identifier
   */
  parser.rexCommand = parser.RULE('rexCommand', () => {
    parser.CONSUME(t.Rex);
    parser.MANY(() => {
      parser.OR([
        {
          // field=<identifier>
          ALT: () => {
            parser.CONSUME(t.Field, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.CONSUME(t.Identifier, { LABEL: 'optionValue' });
          },
        },
        {
          // other options like max_match=N, mode=sed
          ALT: () => {
            parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.CONSUME2(t.StringLiteral, { LABEL: 'pattern' });
  });

  /**
   * lookup <name> <field> [AS <alias>] [OUTPUT|OUTPUTNEW <fields>]
   */
  parser.lookupCommand = parser.RULE('lookupCommand', () => {
    parser.CONSUME(t.Lookup);
    parser.CONSUME(t.Identifier, { LABEL: 'lookupName' });
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.fieldMapping, { LABEL: 'inputFields' }));
    parser.OPTION(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Output) },
        { ALT: () => parser.CONSUME(t.Outputnew) },
      ]);
      parser.AT_LEAST_ONE2(() => parser.SUBRULE2(parser.fieldMapping, { LABEL: 'outputFields' }));
    });
  });

  parser.fieldMapping = parser.RULE('fieldMapping', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'field' });
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME2(t.Identifier, { LABEL: 'alias' });
    });
    parser.OPTION2(() => parser.CONSUME(t.Comma));
  });

  /**
   * inputlookup [append=true] <name>
   * Note: 'append' is a keyword token
   */
  parser.inputlookupCommand = parser.RULE('inputlookupCommand', () => {
    parser.CONSUME(t.Inputlookup);
    parser.MANY(() => {
      parser.OR([
        {
          // append=true/false (append is a keyword)
          ALT: () => {
            parser.CONSUME(t.Append, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // other options
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.False, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.CONSUME3(t.Identifier, { LABEL: 'lookupName' });
  });

  /**
   * spath [input=<field>] [output=<field>] [path=<path>]
   */
  parser.spathCommand = parser.RULE('spathCommand', () => {
    parser.CONSUME(t.Spath);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * addtotals [row=<bool>] [col=<bool>] [labelfield=<field>] [label=<string>] [fieldname=<field>] [<field-list>]
   */
  parser.addtotalsCommand = parser.RULE('addtotalsCommand', () => {
    parser.CONSUME(t.Addtotals);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.OPTION(() => parser.SUBRULE(parser.fieldList, { LABEL: 'fields' }));
  });
}
