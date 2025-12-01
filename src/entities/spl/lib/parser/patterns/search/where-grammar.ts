/**
 * where command
 *
 * Keeps only the results for which the evaluation was successful and the boolean result was true.
 */
parser.whereCommand = parser.RULE('whereCommand', () => {
  parser.CONSUME(t.Where);
  parser.CONSUME(t.expression);
});