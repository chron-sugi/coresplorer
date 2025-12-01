/**
 * replace command
 *
 * Replaces a single occurrence of the first string with the second  within the specified fields (or all fields if none were specified). Non-wildcard replacements specified later take precedence over those specified earlier. For wildcard replacement, fuller matches take precedence over lesser matches. To assure precedence relationships, one is advised to split the replace into two separate invocations. When using wildcarded replacements, the result must have the same number of wildcards, or none at all. Wildcards (*) can be used to specify many values to replace, or replace values with.
 */
parser.replaceCommand = parser.RULE('replaceCommand', () => {
  parser.CONSUME(t.Replace);
  parser.AT_LEAST_ONE(() => {
    parser.CONSUME(t.Identifier);
    parser.CONSUME(t.Identifier);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.fieldList);
  });
});