/**
 * streamstats command
 *
 * Calculate streaming/cumulative statistics for events
 */
parser.streamstatsCommand = parser.RULE('streamstatsCommand', () => {
  parser.CONSUME(t.Streamstats);
  parser.MANY(() => {
    parser.OR([
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'time_window' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.NumberLiteral, { LABEL: 'window' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.BooleanLiteral, { LABEL: 'current' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.BooleanLiteral, { LABEL: 'global' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.BooleanLiteral, { LABEL: 'allnum' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.BooleanLiteral, { LABEL: 'reset_on_change' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'reset_before' });
      } },
      { ALT: () => {
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'reset_after' });
      } }
    ]);
  });
  parser.AT_LEAST_ONE(() => {
    parser.CONSUME(t.Identifier, { LABEL: 'aggregation' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.By);
    parser.CONSUME(t.fieldList, { LABEL: 'groupby_fields' });
  });
});