/**
 * Pipeline Splitter Commands
 * 
 * Commands that split or merge pipelines: append, join.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands/splitters
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applySplitterCommands(parser: SPLParser): void {
  /**
   * Subsearch enclosed in brackets.
   * Matches: [search index=main | stats count]
   */
  parser.subsearch = parser.RULE('subsearch', () => {
    parser.CONSUME(t.LBracket);
    parser.SUBRULE(parser.pipeline, { LABEL: 'inner' });
    parser.CONSUME(t.RBracket);
  });

  /**
   * append [subsearch]
   */
  parser.appendCommand = parser.RULE('appendCommand', () => {
    parser.CONSUME(t.Append);
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * join [type=<type>] <field> [subsearch]
   */
  parser.joinCommand = parser.RULE('joinCommand', () => {
    parser.CONSUME(t.Join);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.Inner) },
        { ALT: () => parser.CONSUME(t.Outer) },
        { ALT: () => parser.CONSUME(t.Left) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.OPTION(() => parser.SUBRULE(parser.fieldList, { LABEL: 'joinFields' }));
    parser.SUBRULE(parser.subsearch);
  });
}
