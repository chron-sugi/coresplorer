/**
 * Structural Commands
 * 
 * Commands that modify data structure: where, bin, fillnull, mvexpand, transaction.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands/structural
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyStructuralCommands(parser: SPLParser): void {
  /**
   * where <expression>
   */
  parser.whereCommand = parser.RULE('whereCommand', () => {
    parser.CONSUME(t.Where);
    parser.SUBRULE(parser.expression, { LABEL: 'condition' });
  });

  /**
   * bin/bucket <field> [span=<span>] [as <alias>]
   */
  parser.binCommand = parser.RULE('binCommand', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.Bin) },
      { ALT: () => parser.CONSUME(t.Bucket) },
    ]);
    parser.CONSUME(t.Identifier, { LABEL: 'field' });
    parser.MANY(() => {
      parser.OR2([
        {
          ALT: () => {
            parser.CONSUME(t.Span);
            parser.CONSUME(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME(t.TimeModifier, { LABEL: 'span' }) },
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'span' }) },
            ]);
          },
        },
        {
          ALT: () => {
            parser.CONSUME(t.As);
            parser.CONSUME2(t.Identifier, { LABEL: 'alias' });
          },
        },
      ]);
    });
  });

  /**
   * fillnull [value=<val>] [field-list]
   */
  parser.fillnullCommand = parser.RULE('fillnullCommand', () => {
    parser.CONSUME(t.Fillnull);
    parser.OPTION(() => {
      parser.CONSUME(t.Value);
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'fillValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'fillValue' }) },
      ]);
    });
    parser.OPTION2(() => parser.SUBRULE(parser.fieldList, { LABEL: 'fields' }));
  });

  /**
   * mvexpand <field> [limit=N]
   */
  parser.mvexpandCommand = parser.RULE('mvexpandCommand', () => {
    parser.CONSUME(t.Mvexpand);
    parser.CONSUME(t.Identifier, { LABEL: 'field' });
    parser.OPTION(() => {
      parser.CONSUME(t.Limit);
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.NumberLiteral, { LABEL: 'limitValue' });
    });
  });

  /**
   * transaction [<options>] <fields>
   * Options: maxspan=<span>, maxpause=<span>, keepevicted=true/false
   */
  parser.transactionCommand = parser.RULE('transactionCommand', () => {
    parser.CONSUME(t.Transaction);
    // Options come first (before fields)
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.TimeModifier, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
      ]);
    });
    // Fields come after options
    parser.OPTION(() => parser.SUBRULE(parser.fieldList, { LABEL: 'fields' }));
  });
}
