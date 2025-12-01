/**
 * regex command
 *
 * Removes results that do not match the specified regular expression. You can specify for the regex to keep results that match the expression, or to keep those that do not match.  Note: if you want to use the "or" ("|") command in a regex argument, the whole regex expression must be surrounded by quotes (ie. regex "expression"). Matches the value of the field against the unanchored regex and only keeps those events that match in the case of '=' or do not match in the case of '!='. If no field is specified, the match is against "_raw".
 */
parser.regexCommand = parser.RULE('regexCommand', () => {
  parser.CONSUME(t.Regex);
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier);
    parser.OR([
      { ALT: () => {
      parser.CONSUME(t.Equals);
      } },
      { ALT: () => {

      } }
    ]);
  });
  parser.CONSUME(t.Identifier);
});