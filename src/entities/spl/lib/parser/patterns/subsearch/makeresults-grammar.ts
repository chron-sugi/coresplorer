/**
 * makeresults command
 *
 * Creates a specified number of empty search results. This command will run only on the local machine  by default and will generate one unannotated empty result. It maybe used in conjunction with the eval command to generate an empty result for the eval command to operate on.
 */
parser.makeresultsCommand = parser.RULE('makeresultsCommand', () => {
  parser.CONSUME(t.Makeresults);
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
});