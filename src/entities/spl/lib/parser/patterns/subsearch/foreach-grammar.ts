/**
 * foreach command
 *
 * Run a templated streaming subsearch for each field in a wildcarded field list.  For each field that is matched, the templated subsearch will have the following patterns replaced:  \i\ option         default          replacement \i\ fieldstr       <<FIELD>>        whole field name \i\ matchstr       <<MATCHSTR>>     part of field name that matches wildcard(s) in the specifier \i\ matchseg1      <<MATCHSEG1>>    part of field name that matches first wildcard \i\ matchseg2      <<MATCHSEG2>>    part of field name that matches second wildcard \i\ matchseg3      <<MATCHSEG3>>    part of field name that matches third wildcard
 */
parser.foreachCommand = parser.RULE('foreachCommand', () => {
  parser.CONSUME(t.Foreach);
  parser.AT_LEAST_ONE(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'fieldstr' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'matchstr' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'matchseg1' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'matchseg2' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'matchseg3' });
  });
  parser.CONSUME(t.Identifier);
});