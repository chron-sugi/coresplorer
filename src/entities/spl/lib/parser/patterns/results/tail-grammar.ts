/**
 * tail command
 *
 * Returns the last n results, or 10 if no integer is specified.  The events are returned in reverse order, starting at the end of the result set.
 */
parser.tailCommand = parser.RULE('tailCommand', () => {
  parser.CONSUME(t.Tail);
  parser.OPTION(() => {
    parser.CONSUME(t.NumberLiteral);
  });
});