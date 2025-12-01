/**
 * Pipeline Rules
 * 
 * Entry point and command dispatch rules.
 * Must be applied last as it references all other rules.
 * 
 * @module entities/spl/lib/parser/grammar/rules/pipeline
 */

import type { SPLParser } from '../types';
import * as t from '../../lexer/tokens';

export function applyPipelineRules(parser: SPLParser): void {
  /**
   * Main entry point: [initial-search] | command | command ...
   */
  parser.pipeline = parser.RULE('pipeline', () => {
    parser.OPTION(() => parser.SUBRULE(parser.searchExpression, { LABEL: 'initialSearch' }));
    parser.MANY(() => {
      parser.CONSUME(t.Pipe);
      parser.SUBRULE(parser.command);
    });
  });

  /**
   * Command dispatch: routes to specific command implementations.
   */
  parser.command = parser.RULE('command', () => {
    parser.OR([
      // Tier 1: Field creators/modifiers
      { ALT: () => parser.SUBRULE(parser.evalCommand) },
      { ALT: () => parser.SUBRULE(parser.statsCommand) },
      { ALT: () => parser.SUBRULE(parser.renameCommand) },
      { ALT: () => parser.SUBRULE(parser.rexCommand) },
      { ALT: () => parser.SUBRULE(parser.lookupCommand) },
      { ALT: () => parser.SUBRULE(parser.inputlookupCommand) },
      { ALT: () => parser.SUBRULE(parser.spathCommand) },
      { ALT: () => parser.SUBRULE(parser.addtotalsCommand) },

      // Tier 2: Field filters
      { ALT: () => parser.SUBRULE(parser.searchCommand) },
      { ALT: () => parser.SUBRULE(parser.tableCommand) },
      { ALT: () => parser.SUBRULE(parser.fieldsCommand) },
      { ALT: () => parser.SUBRULE(parser.dedupCommand) },

      // Tier 3: Pipeline splitters
      { ALT: () => parser.SUBRULE(parser.appendCommand) },
      { ALT: () => parser.SUBRULE(parser.joinCommand) },

      // Tier 4: Structural
      { ALT: () => parser.SUBRULE(parser.whereCommand) },
      { ALT: () => parser.SUBRULE(parser.binCommand) },
      { ALT: () => parser.SUBRULE(parser.fillnullCommand) },
      { ALT: () => parser.SUBRULE(parser.mvexpandCommand) },
      { ALT: () => parser.SUBRULE(parser.transactionCommand) },

      // Fallback
      { ALT: () => parser.SUBRULE(parser.genericCommand) },
    ]);
  });
}
