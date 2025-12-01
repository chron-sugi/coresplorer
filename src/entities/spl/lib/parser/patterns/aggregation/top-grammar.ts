/**
 * top command
 *
 * Finds the most frequent tuple of values of all fields in the field list, along with a count and percentage. If a the optional by-clause is provided, finds the most frequent values for each distinct tuple of values of the group-by fields.
 */
parser.topCommand = parser.RULE('topCommand', () => {
  parser.CONSUME(t.Top);
  parser.CONSUME(t.Identifier);
});