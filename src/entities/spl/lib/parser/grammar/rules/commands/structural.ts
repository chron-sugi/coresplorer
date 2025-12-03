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
   * transaction <fields> [options]
   * Fields and options are interleaved, distinguished by presence of =
   * Options: maxspan=<span>, maxpause=<span>, startswith=<expr>, endswith=<expr>, keepevicted=true/false
   */
  parser.transactionCommand = parser.RULE('transactionCommand', () => {
    parser.CONSUME(t.Transaction);
    // Fields and options can be interleaved, use lookahead to distinguish
    parser.AT_LEAST_ONE(() => {
      parser.OR([
        // Option: identifier=value (lookahead for =)
        {
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.TimeModifier, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        // Field: just an identifier (with optional comma)
        {
          ALT: () => {
            parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' });
            parser.OPTION(() => parser.CONSUME(t.Comma));
          },
        },
      ]);
    });
  });

  /**
   * makemv [delim=<string>] [tokenizer=<string>] [allowempty=<bool>] [setsv=<bool>] <field>
   */
  parser.makemvCommand = parser.RULE('makemvCommand', () => {
    parser.CONSUME(t.Makemv);
    parser.MANY(() => {
      parser.OR([
        {
          // delim=<string>
          ALT: () => {
            parser.CONSUME(t.Delim, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' });
          },
        },
        {
          // other options
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.CONSUME2(t.Identifier, { LABEL: 'field' });
  });

  /**
   * convert [timeformat=<string>] <func>(<field>) [AS <alias>], ...
   * Functions: ctime, mktime, dur2sec, mstime, memk, rmunit, rmcomma, none
   */
  parser.convertCommand = parser.RULE('convertCommand', () => {
    parser.CONSUME(t.Convert);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' });
    });
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.convertFunction, { LABEL: 'functions' }));
  });

  parser.convertFunction = parser.RULE('convertFunction', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'func' });
    parser.CONSUME(t.LParen);
    parser.CONSUME2(t.Identifier, { LABEL: 'field' });
    parser.CONSUME(t.RParen);
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME3(t.Identifier, { LABEL: 'alias' });
    });
    parser.OPTION2(() => parser.CONSUME(t.Comma));
  });

  /**
   * replace <old> WITH <new> [IN <field-list>]
   * Can have multiple replacements: replace "a" WITH "b", "c" WITH "d" IN field
   */
  parser.replaceCommand = parser.RULE('replaceCommand', () => {
    parser.CONSUME(t.Replace);
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.replaceClause, { LABEL: 'replacements' }));
  });

  parser.replaceClause = parser.RULE('replaceClause', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'oldValue' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'oldValue' }) },
    ]);
    parser.CONSUME2(t.Identifier); // WITH keyword (not a token, consumed as identifier)
    parser.OR2([
      { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'newValue' }) },
      { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'newValue' }) },
    ]);
    parser.OPTION(() => {
      parser.CONSUME4(t.Identifier); // IN keyword
      parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
    });
    parser.OPTION2(() => parser.CONSUME(t.Comma));
  });

  /**
   * addinfo
   * Adds metadata fields about the search (info_min_time, info_max_time, info_sid, info_search_time)
   */
  parser.addinfoCommand = parser.RULE('addinfoCommand', () => {
    parser.CONSUME(t.Addinfo);
  });

  /**
   * fieldformat <field>=<expression>
   */
  parser.fieldformatCommand = parser.RULE('fieldformatCommand', () => {
    parser.CONSUME(t.Fieldformat);
    parser.CONSUME(t.Identifier, { LABEL: 'field' });
    parser.CONSUME(t.Equals);
    parser.SUBRULE(parser.expression, { LABEL: 'format' });
  });

  /**
   * collect [index=<string>] [source=<string>] [sourcetype=<string>] [spool=<bool>] [testmode=<bool>] [<field-list>]
   * Writes search results to an index
   */
  parser.collectCommand = parser.RULE('collectCommand', () => {
    parser.CONSUME(t.Collect);
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
