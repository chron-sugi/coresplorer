/**
 * table command
 *
 * Returns a table formed by only the fields specified in the arguments. Columns are  displayed in the same order that fields are specified. Column headers are the field names. Rows are the field values. Each row represents an event.
 */
parser.tableCommand = parser.RULE('tableCommand', () => {
  parser.CONSUME(t.Table);
  parser.CONSUME(t.Identifier);
});