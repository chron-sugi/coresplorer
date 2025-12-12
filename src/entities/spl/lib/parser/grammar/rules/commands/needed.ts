/**
 * Needed Commands (Phase 4)
 *
 * Grammar rules for commands that were marked as 'needed' in the registry:
 * - Summary indexing: sichart, sirare, sistats, sitimechart
 * - Metrics: mstats, mcollect, meventcollect
 * - Other: geostats, kvform, pivot, selfjoin
 *
 * @module entities/spl/lib/parser/grammar/rules/commands/needed
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyNeededCommands(parser: SPLParser): void {
  // ===========================================================================
  // SUMMARY INDEXING COMMANDS
  // These are variants of stats/chart commands that write to summary indexes
  // ===========================================================================

  /**
   * sichart [<chart-options>] <stats-agg-term>... [BY <field-list>]
   * Summary indexing version of chart command
   */
  parser.sichartCommand = parser.RULE('sichartCommand', () => {
    parser.CONSUME(t.Sichart);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Aggregation function
          ALT: () => parser.SUBRULE(parser.aggregation, { LABEL: 'aggregations' }),
        },
      ]);
    });
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * sirare [<rare-options>] <field-list> [BY <field-list>]
   * Summary indexing version of rare command
   */
  parser.sirareCommand = parser.RULE('sirareCommand', () => {
    parser.CONSUME(t.Sirare);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * sistats [<stats-options>] <stats-agg-term>... [BY <field-list>]
   * Summary indexing version of stats command
   */
  parser.sistatsCommand = parser.RULE('sistatsCommand', () => {
    parser.CONSUME(t.Sistats);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Aggregation function
          ALT: () => parser.SUBRULE(parser.aggregation, { LABEL: 'aggregations' }),
        },
      ]);
    });
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * sitimechart [<timechart-options>] <stats-agg-term>... [BY <field-list>]
   * Summary indexing version of timechart command
   */
  parser.sitimechartCommand = parser.RULE('sitimechartCommand', () => {
    parser.CONSUME(t.Sitimechart);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Aggregation function
          ALT: () => parser.SUBRULE(parser.aggregation, { LABEL: 'aggregations' }),
        },
      ]);
    });
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  // ===========================================================================
  // METRICS COMMANDS
  // ===========================================================================

  /**
   * mstats [prestats=<bool>] [append=<bool>] [backfill=<bool>]
   *   <stats-agg-term>... [WHERE <where-clause>] [BY <field-list>]
   * Statistical analysis on metrics data
   */
  parser.mstatsCommand = parser.RULE('mstatsCommand', () => {
    parser.CONSUME(t.Mstats);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Aggregation function
          ALT: () => parser.SUBRULE(parser.aggregation, { LABEL: 'aggregations' }),
        },
      ]);
    });
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * mcollect [index=<string>] [file=<string>] [spool=<bool>] [<field-list>]
   * Writes results to a metrics index
   */
  parser.mcollectCommand = parser.RULE('mcollectCommand', () => {
    parser.CONSUME(t.Mcollect);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
  });

  /**
   * meventcollect [index=<string>] [<options>]
   * Writes results to a metrics index as events
   */
  parser.meventcollectCommand = parser.RULE('meventcollectCommand', () => {
    parser.CONSUME(t.Meventcollect);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  // ===========================================================================
  // OTHER COMMANDS
  // ===========================================================================

  /**
   * geostats [latfield=<field>] [longfield=<field>] [<stats-agg-term>...]
   * Generates statistics for geographic data
   */
  parser.geostatsCommand = parser.RULE('geostatsCommand', () => {
    parser.CONSUME(t.Geostats);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Aggregation function
          ALT: () => parser.SUBRULE(parser.aggregation, { LABEL: 'aggregations' }),
        },
      ]);
    });
    parser.OPTION(() => {
      parser.CONSUME(t.By);
      parser.SUBRULE(parser.fieldList, { LABEL: 'byFields' });
    });
  });

  /**
   * kvform [form=<form-name>] [field=<field>]
   * Extracts key-value pairs using form templates
   */
  parser.kvformCommand = parser.RULE('kvformCommand', () => {
    parser.CONSUME(t.Kvform);
    parser.MANY(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Field, { LABEL: 'optionName' }) },
        { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
      ]);
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * pivot <datamodel> <dataset> <pivot-element>...
   * Creates pivot reports from data models
   */
  parser.pivotCommand = parser.RULE('pivotCommand', () => {
    parser.CONSUME(t.Pivot);
    parser.CONSUME(t.Identifier, { LABEL: 'datamodel' });
    parser.CONSUME2(t.Identifier, { LABEL: 'dataset' });
    parser.MANY(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'elements' }) },
        { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'elements' }) },
      ]);
    });
  });

  /**
   * selfjoin [<join-options>] <field-list>
   * Joins results with itself
   */
  parser.selfjoinCommand = parser.RULE('selfjoinCommand', () => {
    parser.CONSUME(t.Selfjoin);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
  });
}
