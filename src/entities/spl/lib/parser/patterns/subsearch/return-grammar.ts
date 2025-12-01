/**
 * return command
 *
 * Useful for passing values up from a subsearch.  Replaces the incoming events with one event, with one attribute: "search". Automatically limits the incoming results with "head" and "fields", to improve performance.  Allows convenient outputting of attr=value (e.g., "return source"), alias_attr=value (e.g. "return ip=srcip"), and value (e.g., "return $srcip").  Defaults to using just the first row of results handed to it.  Multiple rows can be specified with COUNT (e.g. "return 2 ip"), and each row is ORd (e.g., output might be "(ip=10.1.11.2) OR (ip=10.2.12.3)").  Multiple values can be specified and are placed within OR clauses.  So "return 2 user ip" might output "(user=bob ip=10.1.11.2) OR (user=fred ip=10.2.12.3)".  Using "return" at the end of a subsearch removes the need, in the vast majority of cases, for "head", "fields", "rename", "format", and "dedup".
 */
parser.returnCommand = parser.RULE('returnCommand', () => {
  parser.CONSUME(t.Return);

});