/**
 * makemv command
 *
 * Treat specified field as multi-valued, using either a simple string delimiter (can be multicharacter), or a regex tokenizer.  If neither is provided, a default delimiter of " " (single space) is assumed.   The allowempty=<bool> option controls if consecutive delimiters should be treated as one (default = false). The setsv boolean option controls if the original value of the field should be kept for the single valued version.  It is kept if setsv = false, and it is false by default.
 */
parser.makemvCommand = parser.RULE('makemvCommand', () => {
  parser.CONSUME(t.Makemv);
  parser.OPTION(() => {
    parser.OR([
      { ALT: () => {
      parser.CONSUME(t.StringLiteral, { LABEL: 'delim' });
      } },
      { ALT: () => {
      parser.CONSUME(t.StringLiteral, { LABEL: 'tokenizer' });
      } }
    ]);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'allowempty' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'setsv' });
  });
  parser.CONSUME(t.Identifier);
});