/**
 * CST to AST Transformer
 *
 * Transforms Chevrotain's Concrete Syntax Tree (CST) into a clean Abstract Syntax
 * Tree (AST) suitable for field lineage analysis.
 *
 * Architecture:
 * - BaseTransformer: Shared utility methods for all visitors
 * - Visitor Mixins: Command-specific parsing grouped by functionality
 * - CSTTransformer: Composes all mixins and provides command dispatch
 *
 * @module entities/spl/lib/parser/ast/transformer
 */

import type { CstNode } from 'chevrotain';
import * as AST from '../../../model/types';
import { BaseTransformer } from './base-transformer';
import {
  FieldCreatorsMixin,
  AggregatorsMixin,
  FiltersMixin,
  PipelineOpsMixin,
  StructuralMixin,
  ExpressionsMixin,
} from './visitors';

// =============================================================================
// MAIN TRANSFORMER
// =============================================================================

export function transformCST(cst: CstNode): AST.Pipeline {
  return new CSTTransformer().transform(cst);
}

/**
 * CST to AST Transformer with composable visitor mixins.
 *
 * Composes all visitor mixins to provide complete SPL parsing functionality.
 * The mixin chain adds command-specific visitor methods grouped by functionality:
 * - ExpressionsMixin: Expression and search term parsing
 * - StructuralMixin: bin, fillnull, mvexpand, transaction
 * - PipelineOpsMixin: append, join, foreach, map, makeresults, gentimes, union
 * - FiltersMixin: table, fields, dedup, regex, where
 * - AggregatorsMixin: top, rare, rangemap, filldown, mvcombine
 * - FieldCreatorsMixin: eval, stats, rename, rex, lookup, iplocation, etc.
 * - BaseTransformer: Shared utility methods
 */
class CSTTransformer extends ExpressionsMixin(
  StructuralMixin(
    PipelineOpsMixin(
      FiltersMixin(
        AggregatorsMixin(
          FieldCreatorsMixin(BaseTransformer)
        )
      )
    )
  )
) {
  /**
   * Registry mapping CST command keys to visitor methods.
   *
   * This explicit mapping provides:
   * 1. Type safety and IDE navigation
   * 2. Clear documentation of supported commands
   * 3. Efficient dispatch without large if-else chains
   */
  private readonly commandVisitors: Record<string, (ctx: any) => AST.Command> = {
    // Field creators (from FieldCreatorsMixin)
    evalCommand: (ctx) => this.visitEvalCommand(ctx),
    statsCommand: (ctx) => this.visitStatsCommand(ctx),
    renameCommand: (ctx) => this.visitRenameCommand(ctx),
    rexCommand: (ctx) => this.visitRexCommand(ctx),
    lookupCommand: (ctx) => this.visitLookupCommand(ctx),
    inputlookupCommand: (ctx) => this.visitInputlookupCommand(ctx),
    outputlookupCommand: (ctx) => this.visitOutputlookupCommand(ctx),
    iplocationCommand: (ctx) => this.visitIplocationCommand(ctx),
    spathCommand: (ctx) => this.visitSpathCommand(ctx),
    addtotalsCommand: (ctx) => this.visitAddtotalsCommand(ctx),
    tstatsCommand: (ctx) => this.visitTstatsCommand(ctx),
    strcatCommand: (ctx) => this.visitStrcatCommand(ctx),
    accumCommand: (ctx) => this.visitAccumCommand(ctx),
    deltaCommand: (ctx) => this.visitDeltaCommand(ctx),
    autoregressCommand: (ctx) => this.visitAutoregressCommand(ctx),
    convertCommand: (ctx) => this.visitConvertCommand(ctx),

    // Aggregators (from AggregatorsMixin)
    topCommand: (ctx) => this.visitTopCommand(ctx),
    sitopCommand: (ctx) => this.visitSitopCommand(ctx),
    rareCommand: (ctx) => this.visitRareCommand(ctx),
    rangemapCommand: (ctx) => this.visitRangemapCommand(ctx),
    filldownCommand: (ctx) => this.visitFilldownCommand(ctx),
    mvcombineCommand: (ctx) => this.visitMvcombineCommand(ctx),

    // Filters (from FiltersMixin)
    tableCommand: (ctx) => this.visitTableCommand(ctx),
    fieldsCommand: (ctx) => this.visitFieldsCommand(ctx),
    dedupCommand: (ctx) => this.visitDedupCommand(ctx),
    regexCommand: (ctx) => this.visitRegexCommand(ctx),
    whereCommand: (ctx) => this.visitWhereCommand(ctx),

    // Pipeline ops (from PipelineOpsMixin)
    appendCommand: (ctx) => this.visitAppendCommand(ctx),
    joinCommand: (ctx) => this.visitJoinCommand(ctx),
    foreachCommand: (ctx) => this.visitForeachCommand(ctx),
    mapCommand: (ctx) => this.visitMapCommand(ctx),
    makeresultsCommand: (ctx) => this.visitMakeresultsCommand(ctx),
    gentimesCommand: (ctx) => this.visitGentimesCommand(ctx),
    unionCommand: (ctx) => this.visitUnionCommand(ctx),

    // Structural (from StructuralMixin)
    binCommand: (ctx) => this.visitBinCommand(ctx),
    fillnullCommand: (ctx) => this.visitFillnullCommand(ctx),
    mvexpandCommand: (ctx) => this.visitMvexpandCommand(ctx),
    transactionCommand: (ctx) => this.visitTransactionCommand(ctx),

    // Miscellaneous commands (defined below)
    sortCommand: (ctx) => this.visitSortCommand(ctx),
    headCommand: (ctx) => this.visitHeadCommand(ctx),
    tailCommand: (ctx) => this.visitTailCommand(ctx),
    reverseCommand: (ctx) => this.visitReverseCommand(ctx),
    makemvCommand: (ctx) => this.visitMakemvCommand(ctx),
    replaceCommand: (ctx) => this.visitReplaceCommand(ctx),
    addinfoCommand: (ctx) => this.visitAddinfoCommand(ctx),
    fieldformatCommand: (ctx) => this.visitFieldformatCommand(ctx),
    collectCommand: (ctx) => this.visitCollectCommand(ctx),
    returnCommand: (ctx) => this.visitReturnCommand(ctx),
  };

  transform(cst: CstNode): AST.Pipeline {
    return this.visitPipeline(cst);
  }

  // ===========================================================================
  // PIPELINE & COMMAND DISPATCH
  // ===========================================================================

  private visitPipeline(ctx: any): AST.Pipeline {
    const stages: AST.PipelineStage[] = [];
    const children = ctx.children;

    // Initial search expression (before first pipe)
    if (children?.initialSearch) {
      stages.push(this.visitSearchExpression(children.initialSearch[0]));
    }

    // Commands after pipes
    if (children?.command) {
      for (const cmd of children.command) {
        stages.push(this.visitCommand(cmd));
      }
    }

    return {
      type: 'Pipeline',
      stages,
      location: this.getLocation(ctx),
    };
  }

  /**
   * Dispatch to the appropriate command visitor using the registry.
   *
   * Looks up the command type in the visitor registry and calls the
   * corresponding handler. Falls back to genericCommand for unknown types.
   */
  private visitCommand(ctx: any): AST.Command {
    const children = ctx.children;

    // Find a registered command visitor
    for (const [key, visitor] of Object.entries(this.commandVisitors)) {
      if (children[key]?.[0]) {
        return visitor(children[key][0]);
      }
    }

    // Fallback to generic command handler
    return this.visitGenericCommand(children.genericCommand?.[0] ?? ctx);
  }

  private visitGenericCommand(ctx: any): AST.GenericCommand {
    const children = ctx.children;
    const commandName = this.getTokenImage(children.commandName);
    const subsearches: AST.Pipeline[] = [];

    if (children.subsearch) {
      for (const sub of children.subsearch) {
        subsearches.push(this.visitSubsearch(sub));
      }
    }

    return {
      type: 'GenericCommand',
      commandName,
      subsearches,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // MISCELLANEOUS COMMANDS
  // Commands that don't fit cleanly into the mixin categories
  // ===========================================================================

  private visitSortCommand(ctx: any): AST.SortCommand {
    const children = ctx.children;
    const fields: AST.SortField[] = [];

    if (children.fields) {
      for (const f of children.fields) {
        fields.push(this.visitSortField(f));
      }
    }

    const limit = children.limit ? parseInt(this.getTokenImage(children.limit), 10) : null;

    return {
      type: 'SortCommand',
      fields,
      limit,
      location: this.getLocation(ctx),
    };
  }

  private visitSortField(ctx: any): AST.SortField {
    const children = ctx.children;
    const field = this.visitFieldOrWildcard(children.field[0]);
    let direction: 'asc' | 'desc' = 'asc';

    if (children.direction) {
      const dirToken = children.direction[0];
      direction = dirToken.image === '-' ? 'desc' : 'asc';
    }

    return { field, direction };
  }

  private visitHeadCommand(ctx: any): AST.HeadCommand {
    const children = ctx.children;
    const limit = children.limit ? parseInt(this.getTokenImage(children.limit), 10) : 10;
    const options = new Map<string, boolean>();

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];
        const value = valueToken.tokenType?.name === 'True';
        options.set(name, value);
      }
    }

    return {
      type: 'HeadCommand',
      limit,
      options,
      location: this.getLocation(ctx),
    };
  }

  private visitTailCommand(ctx: any): AST.TailCommand {
    const children = ctx.children;
    const limit = children.limit ? parseInt(this.getTokenImage(children.limit), 10) : 10;

    return {
      type: 'TailCommand',
      limit,
      location: this.getLocation(ctx),
    };
  }

  private visitReverseCommand(ctx: any): AST.ReverseCommand {
    return {
      type: 'ReverseCommand',
      location: this.getLocation(ctx),
    };
  }

  private visitMakemvCommand(ctx: any): AST.MakemvCommand {
    const children = ctx.children;
    const field = this.getTokenImage(children.field);
    const options = new Map<string, string | boolean>();

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (valueToken.tokenType?.name === 'True') {
          options.set(name, true);
        } else if (valueToken.tokenType?.name === 'False') {
          options.set(name, false);
        } else {
          options.set(name, this.getStringValue(valueToken));
        }
      }
    }

    return {
      type: 'MakemvCommand',
      field,
      options,
      location: this.getLocation(ctx),
    };
  }

  private visitReplaceCommand(ctx: any): AST.ReplaceCommand {
    const children = ctx.children;
    const replacements: AST.ReplaceClause[] = [];

    if (children.replacements) {
      for (const replCtx of children.replacements) {
        replacements.push(this.visitReplaceClause(replCtx));
      }
    }

    return {
      type: 'ReplaceCommand',
      replacements,
      location: this.getLocation(ctx),
    };
  }

  private visitReplaceClause(ctx: any): AST.ReplaceClause {
    const children = ctx.children;
    const oldValue = this.getStringValue(children.oldValue);
    const newValue = this.getStringValue(children.newValue);
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : null;

    return { oldValue, newValue, fields };
  }

  private visitAddinfoCommand(ctx: any): AST.AddinfoCommand {
    return {
      type: 'AddinfoCommand',
      createdFields: ['info_min_time', 'info_max_time', 'info_sid', 'info_search_time'],
      location: this.getLocation(ctx),
    };
  }

  private visitFieldformatCommand(ctx: any): AST.FieldformatCommand {
    const children = ctx.children;
    const field = this.getTokenImage(children.field);
    const expression = this.visitExpression(children.format[0]);

    return {
      type: 'FieldformatCommand',
      field,
      expression,
      location: this.getLocation(ctx),
    };
  }

  private visitCollectCommand(ctx: any): AST.CollectCommand {
    const children = ctx.children;
    const options = new Map<string, string | boolean>();

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (valueToken.tokenType?.name === 'True') {
          options.set(name, true);
        } else if (valueToken.tokenType?.name === 'False') {
          options.set(name, false);
        } else {
          options.set(name, this.getStringValue(valueToken));
        }
      }
    }

    const fields = children.fields ? this.visitFieldList(children.fields[0]) : null;

    return {
      type: 'CollectCommand',
      options,
      fields,
      location: this.getLocation(ctx),
    };
  }

  private visitReturnCommand(ctx: any): AST.ReturnCommand {
    const children = ctx.children;
    const count = children.count ? parseInt(this.getTokenImage(children.count), 10) : null;
    const fields: AST.FieldReference[] = [];

    if (children.fields) {
      for (const f of children.fields) {
        fields.push(this.visitFieldOrWildcard(f));
      }
    }

    return {
      type: 'ReturnCommand',
      count,
      fields,
      location: this.getLocation(ctx),
    };
  }
}
