/**
 * collect command
 *
 * Adds the results of the search into the specified index. Behind the scenes, the events are written  to a file whose name format is: "<random-num>_events.stash", unless overridden, in a directory which is watched for new events by Splunk. If the events contain a _raw field then the raw field is saved, if they don't a _raw field is constructed by concatenating all the fields into a comma-separated list of key="value" pairs.
 */
parser.collectCommand = parser.RULE('collectCommand', () => {
  parser.CONSUME(t.Collect);
  parser.CONSUME(t.Identifier);
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
});