/**
 * map command
 *
 * For each input search result, takes the field-values from that result and substitutes their value for the $variable$ in the search argument.  The value of variables surrounded in quotes (e.g. text="$_raw$") will be quote escaped. The search argument can either be a subsearch to run or just the name of a savedsearch. The following metavariables are also supported: 1. $_serial_id$ - 1-based serial number within map of the search being executed.
 */
parser.mapCommand = parser.RULE('mapCommand', () => {
  parser.CONSUME(t.Map);
  parser.OR([
    { ALT: () => {
    parser.CONSUME(t.Identifier);
    } },
    { ALT: () => {
    parser.CONSUME(t.Identifier);
    } }
  ]);
  parser.CONSUME(t.Identifier);
});