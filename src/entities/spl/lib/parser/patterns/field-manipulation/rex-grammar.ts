/**
 * rex command
 *
 * Extract fields from events using regular expressions
 */
parser.rexCommand = parser.RULE('rexCommand', () => {
  parser.CONSUME(t.Rex);
  parser.OPTION(() => {
    parser.CONSUME(t.Equals);
    parser.CONSUME(t.Identifier, { LABEL: 'field' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Equals);
  });
  parser.OR([
    { ALT: () => {
    parser.CONSUME(t.Equals);
    parser.CONSUME(t.StringLiteral, { LABEL: 'pattern' });
    } },
    { ALT: () => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'sed_expression' });
    } },
    { ALT: () => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'regex' });
    } }
  ]);
  parser.OPTION(() => {
    parser.CONSUME(t.Equals);
    parser.CONSUME(t.NumberLiteral, { LABEL: 'max_match' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Equals);
    parser.CONSUME(t.Identifier, { LABEL: 'offset_field' });
  });
});