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
   * Main entry point: [search] [initial-search] | command | command ...
   *
   * The initial search can be:
   * - Explicit: `search index=main` (starts with 'search' keyword)
   * - Implicit: `index=main` (just the search expression)
   * - Empty: `| stats count` (starts directly with pipe)
   */
  parser.pipeline = parser.RULE('pipeline', () => {
    parser.OPTION(() => {
      parser.OR([
        // Explicit "search" keyword at start of pipeline (e.g., subsearch)
        {
          ALT: () => {
            parser.CONSUME(t.Search);
            parser.OPTION2(() => parser.SUBRULE(parser.searchExpression, { LABEL: 'initialSearch' }));
          },
        },
        // Implicit search (just the expression)
        { ALT: () => parser.SUBRULE2(parser.searchExpression, { LABEL: 'initialSearch' }) },
      ]);
    });
    parser.MANY(() => {
      parser.CONSUME2(t.Pipe);
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
      { ALT: () => parser.SUBRULE(parser.extractCommand) },
      { ALT: () => parser.SUBRULE(parser.addtotalsCommand) },
      { ALT: () => parser.SUBRULE(parser.convertCommand) },
      { ALT: () => parser.SUBRULE(parser.makemvCommand) },
      { ALT: () => parser.SUBRULE(parser.replaceCommand) },
      { ALT: () => parser.SUBRULE(parser.addinfoCommand) },
      { ALT: () => parser.SUBRULE(parser.fieldformatCommand) },
      { ALT: () => parser.SUBRULE(parser.collectCommand) },

      // Tier 1A: Aggregation commands
      { ALT: () => parser.SUBRULE(parser.topCommand) },
      { ALT: () => parser.SUBRULE(parser.rareCommand) },
      { ALT: () => parser.SUBRULE(parser.tstatsCommand) },

      // Tier 1B: Additional field creators
      { ALT: () => parser.SUBRULE(parser.strcatCommand) },
      { ALT: () => parser.SUBRULE(parser.accumCommand) },
      { ALT: () => parser.SUBRULE(parser.deltaCommand) },
      { ALT: () => parser.SUBRULE(parser.autoregressCommand) },
      { ALT: () => parser.SUBRULE(parser.rangemapCommand) },
      { ALT: () => parser.SUBRULE(parser.filldownCommand) },
      { ALT: () => parser.SUBRULE(parser.mvcombineCommand) },
      { ALT: () => parser.SUBRULE(parser.unionCommand) },

      // Tier 2: Field filters
      { ALT: () => parser.SUBRULE(parser.searchCommand) },
      { ALT: () => parser.SUBRULE(parser.tableCommand) },
      { ALT: () => parser.SUBRULE(parser.fieldsCommand) },
      { ALT: () => parser.SUBRULE(parser.dedupCommand) },
      { ALT: () => parser.SUBRULE(parser.sortCommand) },
      { ALT: () => parser.SUBRULE(parser.headCommand) },
      { ALT: () => parser.SUBRULE(parser.tailCommand) },
      { ALT: () => parser.SUBRULE(parser.reverseCommand) },
      { ALT: () => parser.SUBRULE(parser.regexCommand) },

      // Tier 3: Pipeline splitters
      { ALT: () => parser.SUBRULE(parser.appendCommand) },
      { ALT: () => parser.SUBRULE(parser.joinCommand) },
      { ALT: () => parser.SUBRULE(parser.foreachCommand) },
      { ALT: () => parser.SUBRULE(parser.mapCommand) },
      { ALT: () => parser.SUBRULE(parser.makeresultsCommand) },
      { ALT: () => parser.SUBRULE(parser.gentimesCommand) },
      { ALT: () => parser.SUBRULE(parser.returnCommand) },

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
