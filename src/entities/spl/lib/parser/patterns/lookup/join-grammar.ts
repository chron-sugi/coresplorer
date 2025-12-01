/**
 * join command
 *
 * You can perform an inner or left join. Use either 'outer' or  'left' to specify a left outer join. One or more of the fields must be common to each result set. If no fields are specified, all of the fields that are common to both result sets are used. Limitations on the join subsearch are specified in the limits.conf.spec file. Note: Another command, such as append or lookup, in combination with either stats or transaction might be a better alternative to the join command for flexibility and performance. \p\ The arguments 'left' and 'right' allow for specifying aliases in order to preserve the lineage of the fields in both result sets. The 'where' argument specifies the aliased fields to join on, where the fields are no longer required to be common to both result sets. \p\
 */
parser.joinCommand = parser.RULE('joinCommand', () => {
  parser.CONSUME(t.Join);
  parser.MANY(() => {
    parser.CONSUME(t.Identifier);
  });
  parser.CONSUME(t.Identifier);
  parser.CONSUME(t.Identifier);
});