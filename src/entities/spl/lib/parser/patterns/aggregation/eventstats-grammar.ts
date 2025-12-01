/**
 * eventstats command
 *
 * Generate summary statistics of all existing fields in your search results and save them as values in new fields. Specify a new field name for the statistics results by using the as argument. If you don't specify a new field name, the default field name is the statistical operator and the field it operated on (for example: stat-operator(field)). Just like the 'stats' command except that aggregation results are added inline to each event, and only the aggregations that are pertinent to that event.  The 'allnum' option has the same meaning as that option in the stats command.  See stats-command for detailed descriptions of syntax.
 */
parser.eventstatsCommand = parser.RULE('eventstatsCommand', () => {
  parser.CONSUME(t.Eventstats);
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'allnum' });
  });
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
});