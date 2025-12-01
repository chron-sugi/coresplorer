/**
 * append command
 *
 * Append the results of a subsearch as additional results at the end of the current results.
 */
parser.appendCommand = parser.RULE('appendCommand', () => {
  parser.CONSUME(t.Append);
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.CONSUME(t.Identifier);
});