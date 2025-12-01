/**
 * fieldformat command
 *
 * Expresses how to render a field at output time without changing the underlying value.
 */
parser.fieldformatCommand = parser.RULE('fieldformatCommand', () => {
  parser.CONSUME(t.Fieldformat);

});