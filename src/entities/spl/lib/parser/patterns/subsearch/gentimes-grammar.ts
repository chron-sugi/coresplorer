/**
 * gentimes command
 *
 * Generates time range results. This command is useful in conjunction with the 'map' command.
 */
parser.gentimesCommand = parser.RULE('gentimesCommand', () => {
  parser.CONSUME(t.Gentimes);
  parser.CONSUME(t.Identifier, { LABEL: 'start' });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier, { LABEL: 'end' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier, { LABEL: 'increment' });
  });
});