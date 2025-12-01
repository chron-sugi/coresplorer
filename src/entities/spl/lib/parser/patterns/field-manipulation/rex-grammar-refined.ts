/**
 * rex Command Grammar (Manual - Refined)
 *
 * Properly handles field=, mode=, pattern=, and other rex parameters
 */

/**
 * rex command
 *
 * Extract fields from events using regular expressions
 */
parser.rexCommand = parser.RULE('rexCommand', () => {
  parser.CONSUME(t.Rex);

  // Optional: field=<fieldname>
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier); // 'field'
    parser.CONSUME(t.Equals);
    parser.CONSUME2(t.Identifier); // field name
  });

  // Optional: mode=sed
  parser.OPTION2(() => {
    parser.CONSUME2(t.Identifier); // 'mode'
    parser.CONSUME2(t.Equals);
    parser.CONSUME3(t.Identifier); // 'sed'
  });

  // Required: regex pattern (as string)
  parser.CONSUME(t.StringLiteral);

  // Optional: max_match=<int>
  parser.OPTION3(() => {
    parser.CONSUME4(t.Identifier); // 'max_match'
    parser.CONSUME3(t.Equals);
    parser.CONSUME(t.NumberLiteral);
  });

  // Optional: offset_field=<fieldname>
  parser.OPTION4(() => {
    parser.CONSUME5(t.Identifier); // 'offset_field'
    parser.CONSUME4(t.Equals);
    parser.CONSUME6(t.Identifier); // field name
  });
});
