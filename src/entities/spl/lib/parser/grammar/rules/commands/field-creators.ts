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
    // Target field can be Identifier, Type keyword, or ForeachTemplate (<<FIELD>>)
    parser.OR([
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'targetField' }) },
      { ALT: () => parser.CONSUME(t.Type, { LABEL: 'targetField' }) },
      { ALT: () => parser.CONSUME(t.ForeachTemplate, { LABEL: 'targetField' }) },
    ]);
    parser.CONSUME(t.Equals);
    parser.SUBRULE(parser.expression, { LABEL: 'value' });
    // Optional AS alias (e.g., eval foo=bar+1 AS result)
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME2(t.Identifier, { LABEL: 'alias' });
    });
  });

  /**
   * stats/eventstats/streamstats/chart/timechart [options] <agg>(<field>) [AS alias] [BY field-list]
   * Options like span=1h, window=10, reset_on_change=true can appear before aggregations
   * Note: Options are distinguished from aggregations by specific keyword tokens followed by =
   */
  parser.statsCommand = parser.RULE('statsCommand', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.Stats) },
      { ALT: () => parser.CONSUME(t.Eventstats) },
      { ALT: () => parser.CONSUME(t.Streamstats) },
      { ALT: () => parser.CONSUME(t.Chart) },
      { ALT: () => parser.CONSUME(t.Timechart) },
    ]);
    // Options before aggregations (span=, window=, reset_on_change=, etc.)
    parser.MANY(() => {
      parser.OR2([
        {
          // span=<time>
          ALT: () => {
            parser.CONSUME(t.Span, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME(t.TimeModifier, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // window=<int>
          ALT: () => {
            parser.CONSUME(t.Window, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.CONSUME2(t.NumberLiteral, { LABEL: 'optionValue' });
          },
        },
        {
          // Other options like reset_on_change=<bool>
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME3(t.Equals);
            parser.OR4([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME3(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.aggregation));
    // OVER clause for chart command
    parser.OPTION(() => {
      parser.CONSUME(t.Over);
      parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'overField' });
    });
    parser.OPTION2(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  parser.aggregation = parser.RULE('aggregation', () => {
    // Function name can be Identifier or keywords that are also agg function names
    parser.OR([
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'func' }) },
      { ALT: () => parser.CONSUME(t.Max, { LABEL: 'func' }) },
      { ALT: () => parser.CONSUME(t.Mode, { LABEL: 'func' }) },
    ]);
    parser.OPTION(() => {
      parser.CONSUME(t.LParen);
      // Use AT_LEAST_ONE for arguments when present (allow 0 args with OPTION wrapper)
      parser.OPTION2(() => {
        parser.SUBRULE(parser.aggregationArg);
        parser.MANY(() => {
          parser.CONSUME(t.Comma);
          parser.SUBRULE2(parser.aggregationArg);
        });
      });
      parser.CONSUME(t.RParen);
    });
    parser.OPTION3(() => {
      parser.CONSUME(t.As);
      // Alias can be an identifier or quoted string (e.g., AS "User Account")
      parser.OR5([
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'alias' }) },
        { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'alias' }) },
      ]);
    });
    parser.OPTION4(() => parser.CONSUME2(t.Comma));
  });

  parser.aggregationArg = parser.RULE('aggregationArg', () => {
    parser.OR([
      { ALT: () => parser.SUBRULE(parser.fieldOrWildcard) },
      { ALT: () => parser.CONSUME(t.NumberLiteral) },
      { ALT: () => parser.CONSUME(t.StringLiteral) },
      // Note: Keyword tokens like Value, Field, Output, Max, Mode, Type
      // are now handled by fieldOrWildcard rule
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
          // mode=sed (Mode is a keyword token)
          ALT: () => {
            parser.CONSUME(t.Mode, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' });
          },
        },
        {
          // other options like max_match=N
          ALT: () => {
            parser.CONSUME3(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME3(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME4(t.Identifier, { LABEL: 'optionValue' }) },
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
   * inputlookup [append=<bool>] [max=<int>] <name> [where <expression>]
   * Note: 'append' and 'max' are keyword tokens
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
          // max=<int> (max is a keyword)
          ALT: () => {
            parser.CONSUME(t.Max, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' });
          },
        },
        {
          // other options
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME3(t.Equals);
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
    // Optional WHERE clause
    parser.OPTION(() => {
      parser.CONSUME(t.Where);
      parser.SUBRULE(parser.expression, { LABEL: 'whereCondition' });
    });
  });

  /**
   * outputlookup [append=<bool>] [create_empty=<bool>] [override_if_empty=<bool>]
   *              [max=<int>] [key_field=<field>] [createinapp=<bool>] [output_format=<csv|splunk>]
   *              <lookup-name> [OUTPUT <field-list>] [OUTPUTNEW <field-list>]
   */
  parser.outputlookupCommand = parser.RULE('outputlookupCommand', () => {
    parser.CONSUME(t.Outputlookup);
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
          // other options: create_empty, override_if_empty, max, key_field, etc.
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.False, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.CONSUME3(t.Identifier, { LABEL: 'lookupName' });
    parser.OPTION(() => {
      parser.OR4([
        { ALT: () => parser.CONSUME(t.Output) },
        { ALT: () => parser.CONSUME(t.Outputnew) },
      ]);
      parser.SUBRULE(parser.fieldList, { LABEL: 'outputFields' });
    });
  });

  /**
   * iplocation [prefix=<string>] [allfields=<bool>] [lang=<string>] <ip-field>
   *
   * Creates implicit fields: city, country, lat, lon, region (with optional prefix)
   */
  parser.iplocationCommand = parser.RULE('iplocationCommand', () => {
    parser.CONSUME(t.Iplocation);
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
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'ipField' });
  });

  /**
   * sitop [N] [limit=<int>] [countfield=<string>] [percentfield=<string>]
   *       [showcount=<bool>] [showperc=<bool>] [useother=<bool>] [otherstr=<string>]
   *       <field-list> [BY <field-list>]
   *
   * Same syntax as top, but with split-by internal behavior
   */
  parser.sitopCommand = parser.RULE('sitopCommand', () => {
    parser.CONSUME(t.Sitop);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'count' }));
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
    parser.OPTION2(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE2(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * spath [input=<field>] [output=<field>] [path=<path>]
   * Note: 'output' is a keyword token
   */
  parser.spathCommand = parser.RULE('spathCommand', () => {
    parser.CONSUME(t.Spath);
    parser.MANY(() => {
      parser.OR([
        {
          // output=<field> (output is a keyword)
          ALT: () => {
            parser.CONSUME(t.Output, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.CONSUME(t.Identifier, { LABEL: 'optionValue' });
          },
        },
        {
          // other options: input, path
          // path can include {} for array accessor (e.g., items{})
          ALT: () => {
            parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              {
                ALT: () => {
                  parser.CONSUME3(t.Identifier, { LABEL: 'optionValue' });
                  // Optional {} for array accessor in path
                  parser.OPTION(() => {
                    parser.CONSUME(t.LBrace);
                    parser.CONSUME(t.RBrace);
                  });
                },
              },
            ]);
          },
        },
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

  /**
   * top [N] [limit=<int>] [countfield=<string>] [percentfield=<string>]
   *     [showcount=<bool>] [showperc=<bool>] [useother=<bool>] [otherstr=<string>]
   *     <field-list> [BY <field-list>]
   */
  parser.topCommand = parser.RULE('topCommand', () => {
    parser.CONSUME(t.Top);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'count' }));
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
          // other options
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME3(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
    parser.OPTION2(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE2(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * rare [N] [limit=<int>] [countfield=<string>] [percentfield=<string>]
   *      [showcount=<bool>] [showperc=<bool>] <field-list> [BY <field-list>]
   */
  parser.rareCommand = parser.RULE('rareCommand', () => {
    parser.CONSUME(t.Rare);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'count' }));
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
          // other options
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME3(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
      ]);
    });
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
    parser.OPTION2(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE2(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * tstats [prestats=<bool>] [summariesonly=<bool>] <agg>(<field>) [AS alias] [FROM datamodel=<name>] [WHERE <expr>] [BY <field-list>]
   */
  parser.tstatsCommand = parser.RULE('tstatsCommand', () => {
    parser.CONSUME(t.Tstats);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.aggregation));
    parser.OPTION(() => {
      parser.CONSUME(t.From);
      parser.CONSUME(t.Datamodel);
      parser.CONSUME2(t.Equals);
      parser.CONSUME3(t.Identifier, { LABEL: 'datamodel' });
    });
    parser.OPTION2(() => {
      parser.CONSUME(t.Where);
      parser.SUBRULE(parser.expression, { LABEL: 'whereClause' });
    });
    parser.OPTION3(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * strcat [allrequired=<bool>] <field|string>+ <target-field>
   */
  parser.strcatCommand = parser.RULE('strcatCommand', () => {
    parser.CONSUME(t.Strcat);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.AT_LEAST_ONE(() => {
      parser.OR2([
        { ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'sourceFields' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'sourceFields' }) },
      ]);
    });
  });

  /**
   * accum <field> [AS <newfield>]
   */
  parser.accumCommand = parser.RULE('accumCommand', () => {
    parser.CONSUME(t.Accum);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME(t.Identifier, { LABEL: 'alias' });
    });
  });

  /**
   * delta <field> [AS <newfield>] [p=<int>]
   */
  parser.deltaCommand = parser.RULE('deltaCommand', () => {
    parser.CONSUME(t.Delta);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME(t.Identifier, { LABEL: 'alias' });
    });
    parser.OPTION2(() => {
      parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.NumberLiteral, { LABEL: 'period' });
    });
  });

  /**
   * autoregress <field> [AS <newfield>] [p=<int>[-<int>]]
   */
  parser.autoregressCommand = parser.RULE('autoregressCommand', () => {
    parser.CONSUME(t.Autoregress);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME(t.Identifier, { LABEL: 'alias' });
    });
    parser.OPTION2(() => {
      parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.NumberLiteral, { LABEL: 'pStart' });
      parser.OPTION3(() => {
        parser.CONSUME(t.Minus);
        parser.CONSUME2(t.NumberLiteral, { LABEL: 'pEnd' });
      });
    });
  });

  /**
   * rangemap field=<field> <range>=<min>-<max> ... [default=<value>]
   */
  parser.rangemapCommand = parser.RULE('rangemapCommand', () => {
    parser.CONSUME(t.Rangemap);
    parser.CONSUME(t.Field);
    parser.CONSUME(t.Equals);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
    parser.AT_LEAST_ONE(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'rangeName' });
      parser.CONSUME2(t.Equals);
      parser.CONSUME(t.NumberLiteral, { LABEL: 'rangeStart' });
      parser.CONSUME(t.Minus);
      parser.CONSUME2(t.NumberLiteral, { LABEL: 'rangeEnd' });
    });
    parser.OPTION(() => {
      parser.CONSUME(t.Default);
      parser.CONSUME3(t.Equals);
      parser.CONSUME2(t.Identifier, { LABEL: 'defaultValue' });
    });
  });

  /**
   * filldown [<field-list>]
   */
  parser.filldownCommand = parser.RULE('filldownCommand', () => {
    parser.CONSUME(t.Filldown);
    parser.OPTION(() => parser.SUBRULE(parser.fieldList, { LABEL: 'fields' }));
  });

  /**
   * mvcombine [delim=<string>] <field>
   */
  parser.mvcombineCommand = parser.RULE('mvcombineCommand', () => {
    parser.CONSUME(t.Mvcombine);
    parser.OPTION(() => {
      parser.CONSUME(t.Delim);
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'delimiter' });
    });
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
  });

  /**
   * union [maxout=<int>] <dataset|subsearch>+
   */
  parser.unionCommand = parser.RULE('unionCommand', () => {
    parser.CONSUME(t.Union);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.AT_LEAST_ONE(() => {
      parser.OR2([
        { ALT: () => parser.SUBRULE(parser.subsearch) },
        { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'datasetName' }) },
      ]);
      parser.OPTION(() => parser.CONSUME(t.Comma));
    });
  });

  /**
   * extract [pairdelim=<string>] [kvdelim=<string>] [<field>]
   * Field extraction using key-value pairs
   */
  parser.extractCommand = parser.RULE('extractCommand', () => {
    parser.CONSUME(t.Extract);
    parser.MANY({
      GATE: () => parser.LA(2).tokenType === t.Equals,
      DEF: () => {
        parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
        parser.CONSUME(t.Equals);
        parser.OR2([
          { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
        ]);
      },
    } as any);
    parser.OPTION(() => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' }));
  });

  /**
   * setfields <field>=<value> [<field>=<value>]...
   * Sets field values explicitly
   */
  parser.setfieldsCommand = parser.RULE('setfieldsCommand', () => {
    parser.CONSUME(t.Setfields);
    parser.AT_LEAST_ONE(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'fieldName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'fieldValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'fieldValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'fieldValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'fieldValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'fieldValue' }) },
      ]);
    });
  });

  /**
   * tags [outputfield=<field>] [inclname=<bool>] [inclvalue=<bool>] [<field-list>]
   * Adds tags to events based on field values
   */
  parser.tagsCommand = parser.RULE('tagsCommand', () => {
    parser.CONSUME(t.Tags);
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
