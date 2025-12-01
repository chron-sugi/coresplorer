/**
 * sort command
 *
 * Sorts by the given list of fields. If more than one field is specified,  the first denotes the primary sort order, the second denotes the secondary, etc. If the fieldname is immediately (no space) preceded by "+", the sort is ascending (default). If the fieldname is immediately (no space) preceded by "-", the sort is descending. If white space follows "+/-", the sort order is applied to all following fields without a different explicit sort order. Also a trailing "d" or "desc" causes the results to be reversed. Results missing a given field are treated as having the smallest or largest possible value of that field if the order es descending or ascending respectively. If the field takes on numeric values, the collating sequence is numeric. If the field takes on IP address values, the collating sequence is for IPs. Otherwise, the collating sequence is lexicographic ordering. If the first term is a number, then at most that many results are returned (in order). If no number is specified, the default limit of 10000 is used.  If number is 0, all results will be returned.
 */
parser.sortCommand = parser.RULE('sortCommand', () => {
  parser.CONSUME(t.Sort);
  parser.OPTION(() => {
    parser.CONSUME(t.NumberLiteral);
  });
  parser.CONSUME(t.Identifier);
  parser.OPTION(() => {
    parser.OR([
      { ALT: () => {

      } },
      { ALT: () => {

      } }
    ]);
  });
});