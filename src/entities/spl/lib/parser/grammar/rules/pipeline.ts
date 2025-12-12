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
      { ALT: () => parser.SUBRULE(parser.outputlookupCommand) },
      { ALT: () => parser.SUBRULE(parser.iplocationCommand) },
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
      { ALT: () => parser.SUBRULE(parser.sitopCommand) },
      { ALT: () => parser.SUBRULE(parser.rareCommand) },
      { ALT: () => parser.SUBRULE(parser.tstatsCommand) },
      { ALT: () => parser.SUBRULE(parser.geostatsCommand) },

      // Tier 1B: Summary indexing commands
      { ALT: () => parser.SUBRULE(parser.sichartCommand) },
      { ALT: () => parser.SUBRULE(parser.sirareCommand) },
      { ALT: () => parser.SUBRULE(parser.sistatsCommand) },
      { ALT: () => parser.SUBRULE(parser.sitimechartCommand) },

      // Tier 1C: Metrics commands
      { ALT: () => parser.SUBRULE(parser.mstatsCommand) },
      { ALT: () => parser.SUBRULE(parser.mcollectCommand) },
      { ALT: () => parser.SUBRULE(parser.meventcollectCommand) },

      // Tier 1B: Additional field creators
      { ALT: () => parser.SUBRULE(parser.strcatCommand) },
      { ALT: () => parser.SUBRULE(parser.accumCommand) },
      { ALT: () => parser.SUBRULE(parser.deltaCommand) },
      { ALT: () => parser.SUBRULE(parser.autoregressCommand) },
      { ALT: () => parser.SUBRULE(parser.rangemapCommand) },
      { ALT: () => parser.SUBRULE(parser.filldownCommand) },
      { ALT: () => parser.SUBRULE(parser.mvcombineCommand) },
      { ALT: () => parser.SUBRULE(parser.unionCommand) },
      { ALT: () => parser.SUBRULE(parser.setfieldsCommand) },
      { ALT: () => parser.SUBRULE(parser.tagsCommand) },

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
      { ALT: () => parser.SUBRULE(parser.appendcolsCommand) },
      { ALT: () => parser.SUBRULE(parser.appendpipeCommand) },
      { ALT: () => parser.SUBRULE(parser.joinCommand) },
      { ALT: () => parser.SUBRULE(parser.selfjoinCommand) },
      { ALT: () => parser.SUBRULE(parser.foreachCommand) },
      { ALT: () => parser.SUBRULE(parser.mapCommand) },
      { ALT: () => parser.SUBRULE(parser.makeresultsCommand) },
      { ALT: () => parser.SUBRULE(parser.gentimesCommand) },
      { ALT: () => parser.SUBRULE(parser.returnCommand) },
      { ALT: () => parser.SUBRULE(parser.multisearchCommand) },
      { ALT: () => parser.SUBRULE(parser.setCommand) },
      { ALT: () => parser.SUBRULE(parser.formatCommand) },
      { ALT: () => parser.SUBRULE(parser.transposeCommand) },
      { ALT: () => parser.SUBRULE(parser.untableCommand) },

      // Tier 4: Structural
      { ALT: () => parser.SUBRULE(parser.whereCommand) },
      { ALT: () => parser.SUBRULE(parser.binCommand) },
      { ALT: () => parser.SUBRULE(parser.fillnullCommand) },
      { ALT: () => parser.SUBRULE(parser.mvexpandCommand) },
      { ALT: () => parser.SUBRULE(parser.transactionCommand) },

      // Tier 5: Extraction
      { ALT: () => parser.SUBRULE(parser.xpathCommand) },
      { ALT: () => parser.SUBRULE(parser.xmlkvCommand) },
      { ALT: () => parser.SUBRULE(parser.xmlunescapeCommand) },
      { ALT: () => parser.SUBRULE(parser.multikvCommand) },
      { ALT: () => parser.SUBRULE(parser.erexCommand) },
      { ALT: () => parser.SUBRULE(parser.kvCommand) },
      { ALT: () => parser.SUBRULE(parser.kvformCommand) },

      // Tier 6: Statistical/ML
      { ALT: () => parser.SUBRULE(parser.predictCommand) },
      { ALT: () => parser.SUBRULE(parser.trendlineCommand) },
      { ALT: () => parser.SUBRULE(parser.anomaliesCommand) },
      { ALT: () => parser.SUBRULE(parser.clusterCommand) },
      { ALT: () => parser.SUBRULE(parser.kmeansCommand) },
      { ALT: () => parser.SUBRULE(parser.correlateCommand) },
      { ALT: () => parser.SUBRULE(parser.contingencyCommand) },
      { ALT: () => parser.SUBRULE(parser.xyseriesCommand) },
      { ALT: () => parser.SUBRULE(parser.timewrapCommand) },
      { ALT: () => parser.SUBRULE(parser.pivotCommand) },

      // Tier 7: System/Utility
      { ALT: () => parser.SUBRULE(parser.restCommand) },
      { ALT: () => parser.SUBRULE(parser.metadataCommand) },
      { ALT: () => parser.SUBRULE(parser.datamodelCommand) },
      { ALT: () => parser.SUBRULE(parser.loadjobCommand) },
      { ALT: () => parser.SUBRULE(parser.savedsearchCommand) },
      { ALT: () => parser.SUBRULE(parser.outputcsvCommand) },
      { ALT: () => parser.SUBRULE(parser.sendemailCommand) },

      // Tier 8: Field-Affecting (formerly generic)
      { ALT: () => parser.SUBRULE(parser.inputcsvCommand) },
      { ALT: () => parser.SUBRULE(parser.fieldsummaryCommand) },
      { ALT: () => parser.SUBRULE(parser.addcoltotalsCommand) },
      { ALT: () => parser.SUBRULE(parser.bucketdirCommand) },
      { ALT: () => parser.SUBRULE(parser.geomfilterCommand) },
      { ALT: () => parser.SUBRULE(parser.geomCommand) },
      { ALT: () => parser.SUBRULE(parser.concurrencyCommand) },
      { ALT: () => parser.SUBRULE(parser.typerCommand) },
      { ALT: () => parser.SUBRULE(parser.nomvCommand) },
      { ALT: () => parser.SUBRULE(parser.makecontinuousCommand) },
      { ALT: () => parser.SUBRULE(parser.reltimeCommand) },

      // Fallback
      { ALT: () => parser.SUBRULE(parser.genericCommand) },
    ]);
  });
}
