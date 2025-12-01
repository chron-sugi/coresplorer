/**
 * addinfo command
 *
 * Adds global information about the search to each event.  The addinfo command is primarily an internal component of summary indexing. \i\ Currently the following fields are added: \i\ "info_min_time"    - the earliest time bound for the search \i\ "info_max_time"    - the latest time bound for the search \i\ "info_search_id"   - query id of the search that generated the event \i\ "info_search_time" - time when the search was executed.
 */
parser.addinfoCommand = parser.RULE('addinfoCommand', () => {
  parser.CONSUME(t.Addinfo);

});