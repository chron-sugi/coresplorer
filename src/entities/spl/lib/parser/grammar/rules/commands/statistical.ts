/**
 * Statistical/ML Commands
 *
 * Commands for statistical analysis and machine learning: predict, trendline,
 * anomalies, cluster, kmeans, correlate.
 *
 * @module entities/spl/lib/parser/grammar/rules/commands/statistical
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyStatisticalCommands(parser: SPLParser): void {
  /**
   * predict <field> [algorithm=<alg>] [future_timespan=<int>] [holdback=<int>]
   * [period=<int>] [upper<N>=<field>] [lower<N>=<field>]
   * Predicts future values of a time series field
   */
  parser.predictCommand = parser.RULE('predictCommand', () => {
    parser.CONSUME(t.Predict);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'targetField' });
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * trendline <trendtype><period>(<field>) [AS <newfield>]
   * Computes moving averages: sma, ema, wma
   * Example: trendline sma5(price) AS trend
   */
  parser.trendlineCommand = parser.RULE('trendlineCommand', () => {
    parser.CONSUME(t.Trendline);
    parser.AT_LEAST_ONE(() => {
      // The trend function like sma5(field) - parsed as identifier followed by paren
      parser.CONSUME(t.Identifier, { LABEL: 'trendFunc' });
      parser.CONSUME(t.LParen);
      parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
      parser.CONSUME(t.RParen);
      parser.OPTION(() => {
        parser.CONSUME(t.As);
        parser.SUBRULE2(parser.fieldOrWildcard, { LABEL: 'alias' });
      });
    });
  });

  /**
   * anomalies [<field>] [threshold=<num>] [action=<action>]
   * Detects anomalies in time series data
   * Uses lookahead to distinguish field names from options
   */
  parser.anomaliesCommand = parser.RULE('anomaliesCommand', () => {
    parser.CONSUME(t.Anomalies);
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
          // Field name (not followed by =)
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'targetField' }),
        },
      ]);
    });
  });

  /**
   * cluster [t=<num>] [showcount=<bool>] [countfield=<field>]
   * [labelfield=<field>] [field=<field-list>]
   * Clusters events based on field values
   * Note: 'field' is a keyword token
   */
  parser.clusterCommand = parser.RULE('clusterCommand', () => {
    parser.CONSUME(t.Cluster);
    parser.MANY(() => {
      // Option name can be 'field' keyword or identifier
      parser.OR([
        { ALT: () => parser.CONSUME(t.Field, { LABEL: 'optionName' }) },
        { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
      ]);
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * kmeans [k=<num>] [maxiters=<num>] [<field-list>]
   * Performs k-means clustering on numeric fields
   */
  parser.kmeansCommand = parser.RULE('kmeansCommand', () => {
    parser.CONSUME(t.Kmeans);
    parser.MANY(() => {
      parser.OR([
        {
          // k=<num>, maxiters=<num> etc.
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field names without = assignment
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
  });

  /**
   * correlate [type=<type>] [<field-list>]
   * Computes correlation between fields
   */
  parser.correlateCommand = parser.RULE('correlateCommand', () => {
    parser.CONSUME(t.Correlate);
    parser.MANY(() => {
      parser.OR([
        {
          // type=<type> etc.
          GATE: () => {
            const la1 = parser.LA(1);
            const la2 = parser.LA(2);
            return (la1.tokenType === t.Type || la1.tokenType === t.Identifier) &&
                   la2.tokenType === t.Equals;
          },
          ALT: () => {
            parser.OR2([
              { ALT: () => parser.CONSUME(t.Type, { LABEL: 'optionName' }) },
              { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
            ]);
            parser.CONSUME(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field names
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
  });
}
