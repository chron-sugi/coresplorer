/**
 * head command
 *
 * Returns the first n results, or 10 if no integer is specified. New for 4.0, can provide a boolean eval expression, in which case we return events until that expression evaluates to false.
 */
parser.headCommand = parser.RULE('headCommand', () => {
  parser.CONSUME(t.Head);
  parser.OPTION(() => {
    parser.OR([
      { ALT: () => {
      parser.CONSUME(t.NumberLiteral);
      } },
      { ALT: () => {
      parser.CONSUME(t.LParen);
      parser.CONSUME(t.expression);
      parser.CONSUME(t.RParen);
      } }
    ]);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.NumberLiteral, { LABEL: 'limit' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'null' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'keeplast' });
  });
});