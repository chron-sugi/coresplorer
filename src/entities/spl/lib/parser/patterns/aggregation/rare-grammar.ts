/**
 * rare command
 *
 * Finds the least frequent tuple of values of all fields in the field list.  If optional by-clause is specified, this command will return rare tuples of values for each distinct tuple of values of the group-by fields.
 */
parser.rareCommand = parser.RULE('rareCommand', () => {
  parser.CONSUME(t.Rare);
  parser.CONSUME(t.Identifier);
});