/**
 * SPL Parser Grammar
 *
 * Modular grammar using mixin pattern for maintainability.
 * Rules are applied in dependency order during construction.
 *
 * @module entities/spl/lib/parser/grammar
 */

import { CstParser } from 'chevrotain';
import { allTokens } from '../lexer/tokens';
import type { SPLParserRules } from './types';
import {
  applyHelperRules,
  applyExpressionRules,
  applySearchRules,
  applyCommandRules,
  applyPipelineRules,
} from './rules';

/**
 * SPL Parser class with modular rule definitions.
 * 
 * Rules are applied via mixins in dependency order:
 * 1. Helpers (no dependencies)
 * 2. Expressions (uses helpers)
 * 3. Search (uses helpers, subsearch)
 * 4. Commands (uses helpers, expressions, search)
 * 5. Pipeline (uses all above)
 */
export class SPLParser extends CstParser implements SPLParserRules {
  // Declare all rule properties (initialized by mixins)
  public pipeline!: SPLParserRules['pipeline'];
  public command!: SPLParserRules['command'];
  public fieldOrWildcard!: SPLParserRules['fieldOrWildcard'];
  public fieldList!: SPLParserRules['fieldList'];
  public subsearch!: SPLParserRules['subsearch'];
  public expression!: SPLParserRules['expression'];
  public orExpression!: SPLParserRules['orExpression'];
  public andExpression!: SPLParserRules['andExpression'];
  public comparisonExpression!: SPLParserRules['comparisonExpression'];
  public additiveExpression!: SPLParserRules['additiveExpression'];
  public multiplicativeExpression!: SPLParserRules['multiplicativeExpression'];
  public unaryExpression!: SPLParserRules['unaryExpression'];
  public primaryExpression!: SPLParserRules['primaryExpression'];
  public parenExpression!: SPLParserRules['parenExpression'];
  public functionCall!: SPLParserRules['functionCall'];
  public keywordFunctionCall!: SPLParserRules['keywordFunctionCall'];
  public timeFunctionCall!: SPLParserRules['timeFunctionCall'];
  public searchExpression!: SPLParserRules['searchExpression'];
  public searchTerm!: SPLParserRules['searchTerm'];
  public groupedSearch!: SPLParserRules['groupedSearch'];
  public fieldComparison!: SPLParserRules['fieldComparison'];
  public searchValue!: SPLParserRules['searchValue'];
  public keywordOrLiteral!: SPLParserRules['keywordOrLiteral'];
  public evalCommand!: SPLParserRules['evalCommand'];
  public evalAssignment!: SPLParserRules['evalAssignment'];
  public statsCommand!: SPLParserRules['statsCommand'];
  public aggregation!: SPLParserRules['aggregation'];
  public aggregationArg!: SPLParserRules['aggregationArg'];
  public renameCommand!: SPLParserRules['renameCommand'];
  public renameClause!: SPLParserRules['renameClause'];
  public rexCommand!: SPLParserRules['rexCommand'];
  public lookupCommand!: SPLParserRules['lookupCommand'];
  public fieldMapping!: SPLParserRules['fieldMapping'];
  public inputlookupCommand!: SPLParserRules['inputlookupCommand'];
  public spathCommand!: SPLParserRules['spathCommand'];
  public searchCommand!: SPLParserRules['searchCommand'];
  public tableCommand!: SPLParserRules['tableCommand'];
  public fieldsCommand!: SPLParserRules['fieldsCommand'];
  public dedupCommand!: SPLParserRules['dedupCommand'];
  public sortCommand!: SPLParserRules['sortCommand'];
  public sortField!: SPLParserRules['sortField'];
  public headCommand!: SPLParserRules['headCommand'];
  public tailCommand!: SPLParserRules['tailCommand'];
  public reverseCommand!: SPLParserRules['reverseCommand'];
  public regexCommand!: SPLParserRules['regexCommand'];
  public appendCommand!: SPLParserRules['appendCommand'];
  public joinCommand!: SPLParserRules['joinCommand'];
  public foreachCommand!: SPLParserRules['foreachCommand'];
  public mapCommand!: SPLParserRules['mapCommand'];
  public makeresultsCommand!: SPLParserRules['makeresultsCommand'];
  public gentimesCommand!: SPLParserRules['gentimesCommand'];
  public returnCommand!: SPLParserRules['returnCommand'];
  public whereCommand!: SPLParserRules['whereCommand'];
  public binCommand!: SPLParserRules['binCommand'];
  public fillnullCommand!: SPLParserRules['fillnullCommand'];
  public mvexpandCommand!: SPLParserRules['mvexpandCommand'];
  public transactionCommand!: SPLParserRules['transactionCommand'];
  public makemvCommand!: SPLParserRules['makemvCommand'];
  public convertCommand!: SPLParserRules['convertCommand'];
  public convertFunction!: SPLParserRules['convertFunction'];
  public replaceCommand!: SPLParserRules['replaceCommand'];
  public replaceClause!: SPLParserRules['replaceClause'];
  public addinfoCommand!: SPLParserRules['addinfoCommand'];
  public fieldformatCommand!: SPLParserRules['fieldformatCommand'];
  public collectCommand!: SPLParserRules['collectCommand'];
  public topCommand!: SPLParserRules['topCommand'];
  public rareCommand!: SPLParserRules['rareCommand'];
  public addtotalsCommand!: SPLParserRules['addtotalsCommand'];
  public genericCommand!: SPLParserRules['genericCommand'];
  public genericArg!: SPLParserRules['genericArg'];

  constructor() {
    super(allTokens, {
      recoveryEnabled: true,
      maxLookahead: 3,
    });

    // Apply rules in dependency order
    applyHelperRules(this);
    applyExpressionRules(this);
    applySearchRules(this);
    applyCommandRules(this);
    applyPipelineRules(this);

    // Must be called after all rules are defined
    this.performSelfAnalysis();
  }
}

// Singleton parser instance
export const splParser = new SPLParser();

// Re-export types
export type { SPLParser as SPLParserType, SPLParserRules } from './types';
