/**
 * convert command
 *
 * Converts the values of fields into numerical values. When renaming a field using "as", the original field is left intact. The timeformat option is used by ctime and mktime conversions.  Default = "%m/%d/%Y %H:%M:%S".
 */
parser.convertCommand = parser.RULE('convertCommand', () => {
  parser.CONSUME(t.Convert);
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'timeformat' });
  });
  parser.AT_LEAST_ONE(() => {
    parser.CONSUME(t.Identifier);
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME(t.Identifier);
    });
  });
});