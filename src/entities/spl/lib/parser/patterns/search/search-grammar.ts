/**
 * search command
 *
 * If the first search command, retrieve events from the indexes, using keywords, quoted phrases, wildcards, and key/value expressions; if not the first, filter results.
 */
parser.searchCommand = parser.RULE('searchCommand', () => {
  parser.CONSUME(t.Search);
  parser.CONSUME(t.expression);
});