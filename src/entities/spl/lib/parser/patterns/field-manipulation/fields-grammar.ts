/**
 * fields command
 *
 * Keeps or removes fields based on the field list criteria.  If "+" is specified, only the fields that match one of the fields in the list are kept. If "-" is specified, only the fields that match one of the fields in the list are removed.
 */
parser.fieldsCommand = parser.RULE('fieldsCommand', () => {
  parser.CONSUME(t.Fields);
  parser.OPTION(() => {
    parser.OR([
      { ALT: () => {

      } },
      { ALT: () => {

      } }
    ]);
  });
  parser.CONSUME(t.Identifier);
});