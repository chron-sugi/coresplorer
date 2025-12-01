/**
 * reverse command
 *
 * Reverses the order of the results.
 */
parser.reverseCommand = parser.RULE('reverseCommand', () => {
  parser.CONSUME(t.Reverse);

});