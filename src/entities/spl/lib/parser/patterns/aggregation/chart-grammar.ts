/**
 * chart command
 *
 * Creates a table of statistics suitable for charting.  Whereas timechart generates a  chart with _time as the x-axis, chart lets you select an arbitrary field as the x-axis with the "by" or "over" keyword. If necessary, the x-axis field is converted to discrete numerical quantities.\p\ When chart includes a split-by-clause, the columns in the output table represents a distinct value of the split-by-field. (With stats, each row represents a single unique combination of values of the group-by-field. The table displays ten columns by default, but you can specify a where clause to adjust the number of columns.\p\ When a where clause is not provided, you can use limit and agg options to specify series filtering. If limit=0, there is no series filtering. \p\ When specifying multiple data series with a split-by-clause, you can use sep and format options to construct output field names.
 */
parser.chartCommand = parser.RULE('chartCommand', () => {
  parser.CONSUME(t.Chart);
  parser.CONSUME(t.Identifier);
});