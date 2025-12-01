/**
 * stats command
 *
 * Calculate aggregate statistics over the dataset, optionally grouped by a list of fields. Aggregate statistics include: \i\ * count, distinct count \i\ * mean, median, mode \i\ * min, max, range, percentiles \i\ * standard deviation, variance \i\ * sum \i\ * earliest and latest occurrence \i\ * first and last (according to input order into stats command) occurrence \p\ Similar to SQL aggregation. If called without a by-clause, one row is produced, which represents the aggregation over the entire incoming result set. If called with a by-clause, one row is produced for each distinct value of the by-clause. The 'partitions' option, if specified, allows stats to partition the input data based on the split-by fields for multithreaded reduce. The 'allnum' option, if true (default = false), computes numerical statistics on each field if and only if all of the values of that field are numerical. The 'delim' option is used to specify how the values in the 'list' or 'values' aggregation are delimited.  (default is a single space) When called with the name "prestats", it will produce intermediate results (internal).
 */
parser.statsCommand = parser.RULE('statsCommand', () => {
  parser.CONSUME(t.Stats);
  parser.CONSUME(t.Identifier);
});