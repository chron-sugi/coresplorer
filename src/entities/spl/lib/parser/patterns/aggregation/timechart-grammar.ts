/**
 * timechart command
 *
 * Creates a chart for a statistical aggregation applied to a field against time. When  the data is split by a field, each distinct value of this split-by field is a series. If used with an eval-expression, the split-by-clause is required. \p\ When a where clause is not provided, you can use limit and agg options to specify series filtering. If limit=0, there is no series filtering. \p\ When specifying multiple data series with a split-by-clause, you can use sep and format options to construct output field names.\p\ When called without any bin-options, timechart defaults to bins=300. This finds the smallest bucket size that results in no more than three hundred distinct buckets.
 */
parser.timechartCommand = parser.RULE('timechartCommand', () => {
  parser.CONSUME(t.Timechart);
  parser.CONSUME(t.Identifier);
});