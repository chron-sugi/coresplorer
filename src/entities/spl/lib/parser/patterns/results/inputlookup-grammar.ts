/**
 * inputlookup command
 *
 * Reads in lookup table as specified by a filename (must end with .csv or .csv.gz) or a table name (as specified by a stanza name in transforms.conf). If 'append' is set to true (false by default), the data from the lookup file is appended to the current set of results rather than replacing it.
 */
parser.inputlookupCommand = parser.RULE('inputlookupCommand', () => {
  parser.CONSUME(t.Inputlookup);
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'append' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.NumberLiteral, { LABEL: 'start' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.NumberLiteral, { LABEL: 'max' });
  });
  parser.OR([
    { ALT: () => {
    parser.CONSUME(t.Identifier);
    } },
    { ALT: () => {
    parser.CONSUME(t.Identifier);
    } }
  ]);
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
  });
});