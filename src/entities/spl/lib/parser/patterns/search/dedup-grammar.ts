/**
 * dedup command
 *
 * Keep the first N (where N > 0) results for each combination of values for the specified field(s)  The first argument, if a number, is interpreted as N.  If this number is absent, N is assumed to be 1. The optional sortby clause is equivalent to performing a sort command before the dedup command except that it is executed more efficiently.  The keepevents flag will keep all events, but for events with duplicate values, remove those fields values instead of the entire event. \p\ Normally, events with a null value in any of the fields are dropped.  The keepempty flag will retain all events with a null value in any of the fields.
 */
parser.dedupCommand = parser.RULE('dedupCommand', () => {
  parser.CONSUME(t.Dedup);
  parser.OPTION(() => {
    parser.CONSUME(t.NumberLiteral);
  });
  parser.CONSUME(t.fieldList);
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
});