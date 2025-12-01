/**
 * streamstats Command Grammar (Manual - Refined)
 *
 * Properly handles window parameters and statistical aggregations
 */

/**
 * streamstats command
 *
 * Calculate streaming/cumulative statistics for events
 */
parser.streamstatsCommand = parser.RULE('streamstatsCommand', () => {
  parser.CONSUME(t.Streamstats);

  // Optional parameters (window, time_window, current, etc.)
  // These can appear multiple times and in any order
  parser.MANY(() => {
    parser.OR([
      // window=<int>
      { ALT: () => {
        parser.CONSUME(t.Identifier); // 'window'
        parser.CONSUME(t.Equals);
        parser.CONSUME(t.NumberLiteral);
      }},

      // time_window=<duration>
      { ALT: () => {
        parser.CONSUME2(t.Identifier); // 'time_window'
        parser.CONSUME2(t.Equals);
        parser.CONSUME(t.StringLiteral);
      }},

      // current=<bool>
      { ALT: () => {
        parser.CONSUME3(t.Identifier); // 'current'
        parser.CONSUME3(t.Equals);
        parser.CONSUME(t.BooleanLiteral);
      }},

      // global=<bool>
      { ALT: () => {
        parser.CONSUME4(t.Identifier); // 'global'
        parser.CONSUME4(t.Equals);
        parser.CONSUME2(t.BooleanLiteral);
      }},

      // allnum=<bool>
      { ALT: () => {
        parser.CONSUME5(t.Identifier); // 'allnum'
        parser.CONSUME5(t.Equals);
        parser.CONSUME3(t.BooleanLiteral);
      }},

      // reset_on_change=<bool>
      { ALT: () => {
        parser.CONSUME6(t.Identifier); // 'reset_on_change'
        parser.CONSUME6(t.Equals);
        parser.CONSUME4(t.BooleanLiteral);
      }},

      // reset_before="(<expr>)"
      { ALT: () => {
        parser.CONSUME7(t.Identifier); // 'reset_before'
        parser.CONSUME7(t.Equals);
        parser.CONSUME2(t.StringLiteral);
      }},

      // reset_after="(<expr>)"
      { ALT: () => {
        parser.CONSUME8(t.Identifier); // 'reset_after'
        parser.CONSUME8(t.Equals);
        parser.CONSUME3(t.StringLiteral);
      }},
    ]);
  });

  // Required: Statistical aggregations
  // Can have multiple: count, sum(field) as alias, avg(field), etc.
  parser.AT_LEAST_ONE(() => {
    // This is simplified - in reality would call statsAggregation subrule
    parser.SUBRULE(parser.statsAggregation);
  });

  // Optional: BY clause
  parser.OPTION(() => {
    parser.CONSUME(t.By);
    parser.SUBRULE(parser.fieldList);
  });
});
