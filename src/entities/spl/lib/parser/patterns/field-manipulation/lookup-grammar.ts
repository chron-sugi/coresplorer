/**
 * lookup command
 *
 * Manually invokes field value lookups from an existing lookup table or external  script. Lookup tables must be located in the lookups directory of $SPLUNK_HOME/etc/system/lookups or $SPLUNK_HOME/etc/apps/<app-name>/lookups. External scripts must be located in $SPLUNK_HOME/etc/searchscripts or $SPLUNK_HOME/etc/apps/<app_name>/bin.\p\ Specify a lookup field to match to a field in the events and, optionally, destination fields to add to the events. If you do not specify destination fields, adds all fields in the lookup table to events that have the match field. You can also overwrite fields in the events with fields in the lookup table, if they have the same field name.
 */
parser.lookupCommand = parser.RULE('lookupCommand', () => {
  parser.CONSUME(t.Lookup);
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'local' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.BooleanLiteral, { LABEL: 'update' });
  });
  parser.OPTION(() => {
    parser.CONSUME(t.StringLiteral, { LABEL: 'event_time_field' });
  });
  parser.CONSUME(t.Identifier);
  parser.AT_LEAST_ONE(() => {
    parser.CONSUME(t.Identifier);
    parser.OPTION(() => {
      parser.CONSUME(t.As);
      parser.CONSUME(t.Identifier);
    });
  });
  parser.OPTION(() => {
    parser.OR([
      { ALT: () => {

      } },
      { ALT: () => {
      parser.AT_LEAST_ONE(() => {
        parser.CONSUME(t.Identifier);
        parser.OPTION(() => {
          parser.CONSUME(t.As);
          parser.CONSUME(t.Identifier);
        });
      });
      } }
    ]);
  });
});