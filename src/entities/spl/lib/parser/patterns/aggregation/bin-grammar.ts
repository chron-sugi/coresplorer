/**
 * bin command
 *
 * Puts continuous numerical field values into discrete sets, or bins. Adjusts the value of 'field', so that all items in the set have the same value for 'field'.  Note: Bin is called by chart and timechart automatically and is only needed for statistical operations that timechart and chart cannot process.
 */
parser.binCommand = parser.RULE('binCommand', () => {
  parser.CONSUME(t.Bin);
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.CONSUME(t.Identifier);
  parser.OPTION(() => {
    parser.CONSUME(t.As);
    parser.CONSUME(t.Identifier);
  });
});