/**
 * transaction command
 *
 * Groups events into transactions based on various constraints, such as the beginning  and ending strings or time between events. Transactions are made up of the raw text (the _raw field) of each member, the time and date fields of the earliest member, as well as the union of all other fields of each member.\p\ Produces two fields to the raw events, duration and eventcount. The duration value is the difference between the timestamps for the first and last events in the transaction. The eventcount value is the number of events in the transaction.
 */
parser.transactionCommand = parser.RULE('transactionCommand', () => {
  parser.CONSUME(t.Transaction);
  parser.OPTION(() => {
    parser.CONSUME(t.fieldList);
  });
  parser.OPTION(() => {
    parser.CONSUME(t.Identifier, { LABEL: 'name' });
  });
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
});