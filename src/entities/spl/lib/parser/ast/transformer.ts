/**
 * CST to AST Transformer
 *
 * Transforms Chevrotain's verbose Concrete Syntax Tree (CST) into a
 * clean Abstract Syntax Tree (AST) suitable for field lineage analysis.
 *
 * Command visitor methods (visitEvalCommand, visitStatsCommand, etc.) are
 * called dynamically via visitCommand() using reflection. TypeScript cannot
 * detect these usages statically, so we use an index signature.
 *
 * @module entities/spl/lib/parser/ast/transformer
 */

import type { CstNode, IToken } from 'chevrotain';
import * as AST from '../../../model/types';

// =============================================================================
// MAIN TRANSFORMER
// =============================================================================

export function transformCST(cst: CstNode): AST.Pipeline {
  return new CSTTransformer().transform(cst);
}

/**
 * CST to AST Transformer class.
 *
 * Uses an explicit visitor registry to dispatch command parsing.
 * This approach satisfies TypeScript's static analysis while avoiding
 * a repetitive if-else chain.
 */
class CSTTransformer {
  /**
   * Registry mapping CST command keys to their visitor methods.
   * Each entry maps a child key (e.g., 'evalCommand') to the method
   * that handles it. This explicit mapping:
   * 1. Satisfies TypeScript's unused-locals check
   * 2. Provides type safety and IDE navigation
   * 3. Makes command dispatch declarative and maintainable
   */
  private readonly commandVisitors: Record<string, (ctx: any) => AST.Command> = {
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
    tableCommand: (ctx) => this.visitTableCommand(ctx),
    fieldsCommand: (ctx) => this.visitFieldsCommand(ctx),
    dedupCommand: (ctx) => this.visitDedupCommand(ctx),
    appendCommand: (ctx) => this.visitAppendCommand(ctx),
    joinCommand: (ctx) => this.visitJoinCommand(ctx),
    whereCommand: (ctx) => this.visitWhereCommand(ctx),
    binCommand: (ctx) => this.visitBinCommand(ctx),
    fillnullCommand: (ctx) => this.visitFillnullCommand(ctx),
    mvexpandCommand: (ctx) => this.visitMvexpandCommand(ctx),
    transactionCommand: (ctx) => this.visitTransactionCommand(ctx),
    sortCommand: (ctx) => this.visitSortCommand(ctx),
    headCommand: (ctx) => this.visitHeadCommand(ctx),
    tailCommand: (ctx) => this.visitTailCommand(ctx),
    reverseCommand: (ctx) => this.visitReverseCommand(ctx),
    regexCommand: (ctx) => this.visitRegexCommand(ctx),
    topCommand: (ctx) => this.visitTopCommand(ctx),
    sitopCommand: (ctx) => this.visitSitopCommand(ctx),
    rareCommand: (ctx) => this.visitRareCommand(ctx),
    makemvCommand: (ctx) => this.visitMakemvCommand(ctx),
    convertCommand: (ctx) => this.visitConvertCommand(ctx),
    replaceCommand: (ctx) => this.visitReplaceCommand(ctx),
    addinfoCommand: (ctx) => this.visitAddinfoCommand(ctx),
    fieldformatCommand: (ctx) => this.visitFieldformatCommand(ctx),
    collectCommand: (ctx) => this.visitCollectCommand(ctx),
    foreachCommand: (ctx) => this.visitForeachCommand(ctx),
    mapCommand: (ctx) => this.visitMapCommand(ctx),
    makeresultsCommand: (ctx) => this.visitMakeresultsCommand(ctx),
    gentimesCommand: (ctx) => this.visitGentimesCommand(ctx),
    returnCommand: (ctx) => this.visitReturnCommand(ctx),
    // Additional field creators
    tstatsCommand: (ctx) => this.visitTstatsCommand(ctx),
    strcatCommand: (ctx) => this.visitStrcatCommand(ctx),
    accumCommand: (ctx) => this.visitAccumCommand(ctx),
    deltaCommand: (ctx) => this.visitDeltaCommand(ctx),
    autoregressCommand: (ctx) => this.visitAutoregressCommand(ctx),
    rangemapCommand: (ctx) => this.visitRangemapCommand(ctx),
    filldownCommand: (ctx) => this.visitFilldownCommand(ctx),
    mvcombineCommand: (ctx) => this.visitMvcombineCommand(ctx),
    unionCommand: (ctx) => this.visitUnionCommand(ctx),
  };

  transform(cst: CstNode): AST.Pipeline {
    return this.visitPipeline(cst);
  }

  // ===========================================================================
  // PIPELINE & COMMANDS
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
   *
   * @param ctx - The command CST node
   * @returns The transformed AST command node
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

  // ===========================================================================
  // TIER 1: FIELD CREATORS/MODIFIERS
  // ===========================================================================

  private visitEvalCommand(ctx: any): AST.EvalCommand {
    const children = ctx.children;
    const assignments: AST.EvalAssignment[] = [];

    if (children.evalAssignment) {
      for (const assign of children.evalAssignment) {
        assignments.push(this.visitEvalAssignment(assign));
      }
    }

    return {
      type: 'EvalCommand',
      assignments,
      location: this.getLocation(ctx),
    };
  }

  private visitEvalAssignment(ctx: any): AST.EvalAssignment {
    const children = ctx.children;
    const targetField = this.getTokenImage(children.targetField);
    const expression = this.visitExpression(children.value[0]);
    const dependsOn = AST.extractFieldRefs(expression);

    return {
      type: 'EvalAssignment',
      targetField,
      expression,
      dependsOn,
      location: this.getLocation(ctx),
    };
  }

  private visitStatsCommand(ctx: any): AST.StatsCommand {
    const children = ctx.children;

    // Determine variant
    let variant: AST.StatsCommand['variant'] = 'stats';
    if (children.Eventstats) variant = 'eventstats';
    else if (children.Streamstats) variant = 'streamstats';
    else if (children.Chart) variant = 'chart';
    else if (children.Timechart) variant = 'timechart';

    const aggregations: AST.Aggregation[] = [];
    if (children.aggregation) {
      for (const agg of children.aggregation) {
        aggregations.push(this.visitAggregation(agg));
      }
    }

    const byFields: AST.FieldReference[] = [];
    if (children.byFields) {
      byFields.push(...this.visitFieldList(children.byFields[0]));
    }

    return {
      type: 'StatsCommand',
      variant,
      aggregations,
      byFields,
      preservesFields: variant === 'eventstats' || variant === 'streamstats',
      location: this.getLocation(ctx),
    };
  }

  private visitAggregation(ctx: any): AST.Aggregation {
    const children = ctx.children;
    const func = this.getTokenImage(children.func);

    // Extract field from args (aggregationArg rule can contain fieldOrWildcard)
    let field: AST.FieldReference | null = null;

    // Try 'aggregationArg' (rule name - Chevrotain uses rule name as key)
    if (children.aggregationArg) {
      for (const arg of children.aggregationArg) {
        const argChildren = arg.children;
        // Check for fieldOrWildcard first (standard field reference)
        if (argChildren?.fieldOrWildcard) {
          field = this.visitFieldOrWildcard(argChildren.fieldOrWildcard[0]);
          break;
        }
        // Check for keyword tokens that can be field names (Value, Field, etc.)
        const keywordFieldKeys = ['Value', 'Field', 'Output', 'Max', 'Mode', 'Type'];
        for (const key of keywordFieldKeys) {
          if (argChildren?.[key]?.[0]) {
            const token = argChildren[key][0];
            field = {
              type: 'FieldReference',
              fieldName: token.image,
              isWildcard: false,
              location: {
                startLine: token.startLine ?? 1,
                startColumn: token.startColumn ?? 1,
                endLine: token.endLine ?? 1,
                endColumn: token.endColumn ?? 1,
                startOffset: token.startOffset,
                endOffset: token.endOffset ?? token.startOffset + token.image.length,
              },
            };
            break;
          }
        }
        if (field) break;
      }
    }

    const alias = children.alias ? this.getTokenImage(children.alias) : null;

    // Compute output field name
    let outputField = alias;
    if (!outputField) {
      if (field && !field.isWildcard) {
        outputField = `${func}(${field.fieldName})`;
      } else {
        outputField = func;
      }
    }

    return {
      type: 'Aggregation',
      function: func,
      field,
      alias,
      outputField,
      location: this.getLocation(ctx),
    };
  }

  private visitRenameCommand(ctx: any): AST.RenameCommand {
    const children = ctx.children;
    const renamings: AST.RenameMapping[] = [];

    if (children.renameClause) {
      for (const clause of children.renameClause) {
        renamings.push(this.visitRenameClause(clause));
      }
    }

    return {
      type: 'RenameCommand',
      renamings,
      location: this.getLocation(ctx),
    };
  }

  private visitRenameClause(ctx: any): AST.RenameMapping {
    const children = ctx.children;
    return {
      type: 'RenameMapping',
      oldField: this.visitFieldOrWildcard(children.oldField[0]),
      newField: this.visitFieldOrWildcard(children.newField[0]),
      location: this.getLocation(ctx),
    };
  }

  private visitRexCommand(ctx: any): AST.RexCommand {
    const children = ctx.children;
    let sourceField = '_raw'; // default
    let mode: 'extract' | 'sed' = 'extract';
    const pattern = this.getStringValue(children.pattern);

    // Parse options
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const value = this.getTokenImage(children.optionValue[i]);
        if (name === 'field') sourceField = value;
        if (name === 'mode' && value.toLowerCase() === 'sed') mode = 'sed';
      }
    }

    // Extract named capture groups from pattern
    const extractedFields = this.extractNamedGroups(pattern);

    return {
      type: 'RexCommand',
      sourceField,
      pattern,
      extractedFields,
      mode,
      location: this.getLocation(ctx),
    };
  }

  private visitLookupCommand(ctx: any): AST.LookupCommand {
    const children = ctx.children;
    const lookupName = this.getTokenImage(children.lookupName);

    const inputMappings: AST.FieldMapping[] = [];
    const outputMappings: AST.FieldMapping[] = [];

    if (children.inputFields) {
      for (const mapping of children.inputFields) {
        inputMappings.push(this.visitFieldMapping(mapping));
      }
    }

    if (children.outputFields) {
      for (const mapping of children.outputFields) {
        outputMappings.push(this.visitFieldMapping(mapping));
      }
    }

    const outputMode = children.Outputnew ? 'OUTPUTNEW' : 'OUTPUT';

    return {
      type: 'LookupCommand',
      lookupName,
      inputMappings,
      outputMappings,
      outputMode,
      location: this.getLocation(ctx),
    };
  }

  private visitFieldMapping(ctx: any): AST.FieldMapping {
    const children = ctx.children;
    const lookupField = this.getTokenImage(children.field);
    const eventField = children.alias ? this.getTokenImage(children.alias) : lookupField;

    return {
      type: 'FieldMapping',
      lookupField,
      eventField,
      location: this.getLocation(ctx),
    };
  }

  private visitInputlookupCommand(ctx: any): AST.InputlookupCommand {
    const children = ctx.children;
    return {
      type: 'InputlookupCommand',
      lookupName: this.getTokenImage(children.lookupName),
      location: this.getLocation(ctx),
    };
  }

  private visitOutputlookupCommand(ctx: any): AST.OutputlookupCommand {
    const children = ctx.children;
    const options = new Map<string, string | boolean | number>();
    let append = false;

    // Parse options
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'append') {
          append = valueToken.tokenType?.name === 'True';
          options.set('append', append);
        } else {
          // Determine value type (boolean, number, or string)
          let value: string | boolean | number;
          if (valueToken.tokenType?.name === 'True') {
            value = true;
          } else if (valueToken.tokenType?.name === 'False') {
            value = false;
          } else if (valueToken.tokenType?.name === 'NumberLiteral') {
            value = parseFloat(this.getTokenImage(valueToken));
          } else {
            value = this.getStringValue(valueToken);
          }
          options.set(name, value);
        }
      }
    }

    // Parse output fields
    const outputFields = children.outputFields
      ? this.visitFieldList(children.outputFields[0])
      : [];

    return {
      type: 'OutputlookupCommand',
      lookupName: this.getTokenImage(children.lookupName),
      outputFields,
      append,
      options,
      location: this.getLocation(ctx),
    };
  }

  private visitIplocationCommand(ctx: any): AST.IplocationCommand {
    const children = ctx.children;
    let prefix = '';
    let allFields = true;

    // Parse options
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'prefix') {
          prefix = this.getStringValue(valueToken);
        } else if (name === 'allfields') {
          allFields = valueToken.tokenType?.name === 'True';
        }
      }
    }

    // Compute created fields based on prefix
    const geoFields = ['city', 'country', 'lat', 'lon', 'region'];
    const createdFields = geoFields.map(f => prefix + f);

    // Get IP field
    const ipFieldNode = children.ipField[0];
    const ipField = this.visitFieldOrWildcard(ipFieldNode).fieldName;

    return {
      type: 'IplocationCommand',
      ipField,
      prefix,
      allFields,
      createdFields,
      location: this.getLocation(ctx),
    };
  }

  private visitSpathCommand(ctx: any): AST.SpathCommand {
    const children = ctx.children;
    let inputField = '_raw';
    let outputField: string | null = null;
    let path: string | null = null;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const value = this.getStringValue(children.optionValue[i]);
        if (name === 'input') inputField = value;
        if (name === 'output') outputField = value;
        if (name === 'path') path = value;
      }
    }

    return {
      type: 'SpathCommand',
      inputField,
      outputField,
      path,
      location: this.getLocation(ctx),
    };
  }

  private visitAddtotalsCommand(ctx: any): AST.AddtotalsCommand {
    const children = ctx.children;
    const options = new Map<string, string | boolean>();

    // Parse options: row, col, labelfield, label, fieldname
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        // Determine value type (boolean or string)
        let value: string | boolean;
        if (valueToken.tokenType?.name === 'True') {
          value = true;
        } else if (valueToken.tokenType?.name === 'False') {
          value = false;
        } else {
          value = this.getStringValue(valueToken);
        }

        options.set(name, value);
      }
    }

    // Parse field list (fields to total)
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : null;

    return {
      type: 'AddtotalsCommand',
      options,
      fields,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // TIER 2: FIELD FILTERS
  // ===========================================================================

  private visitTableCommand(ctx: any): AST.TableCommand {
    const children = ctx.children;
    return {
      type: 'TableCommand',
      fields: this.visitFieldList(children.fields[0]),
      location: this.getLocation(ctx),
    };
  }

  private visitFieldsCommand(ctx: any): AST.FieldsCommand {
    const children = ctx.children;
    const mode = children.mode?.[0]?.image === '-' ? 'remove' : 'keep';

    return {
      type: 'FieldsCommand',
      mode,
      fields: this.visitFieldList(children.fields[0]),
      location: this.getLocation(ctx),
    };
  }

  private visitDedupCommand(ctx: any): AST.DedupCommand {
    const children = ctx.children;
    const count = children.count ? parseInt(this.getTokenImage(children.count), 10) : null;
    // Fields are now individual fieldOrWildcard nodes, not a fieldList
    const fields = children.fields
      ? children.fields.map((f: any) => this.visitFieldOrWildcard(f))
      : [];

    return {
      type: 'DedupCommand',
      fields,
      count,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // TIER 3: PIPELINE SPLITTERS
  // ===========================================================================

  private visitAppendCommand(ctx: any): AST.AppendCommand {
    const children = ctx.children;
    return {
      type: 'AppendCommand',
      subsearch: this.visitSubsearch(children.subsearch[0]),
      location: this.getLocation(ctx),
    };
  }

  private visitJoinCommand(ctx: any): AST.JoinCommand {
    const children = ctx.children;
    let joinType: AST.JoinCommand['joinType'] = 'inner';

    if (children.Inner) joinType = 'inner';
    else if (children.Outer) joinType = 'outer';
    else if (children.Left) joinType = 'left';

    const joinFields = children.joinFields 
      ? this.visitFieldList(children.joinFields[0])
      : [];

    return {
      type: 'JoinCommand',
      joinType,
      joinFields,
      subsearch: this.visitSubsearch(children.subsearch[0]),
      location: this.getLocation(ctx),
    };
  }

  private visitSubsearch(ctx: any): AST.Pipeline {
    const children = ctx.children;
    return this.visitPipeline(children.inner[0]);
  }

  // ===========================================================================
  // TIER 4: STRUCTURAL
  // ===========================================================================

  private visitWhereCommand(ctx: any): AST.WhereCommand {
    const children = ctx.children;
    const condition = this.visitExpression(children.condition[0]);
    const referencedFields = AST.extractFieldRefs(condition);

    return {
      type: 'WhereCommand',
      condition,
      referencedFields,
      location: this.getLocation(ctx),
    };
  }

  private visitBinCommand(ctx: any): AST.BinCommand {
    const children = ctx.children;
    const field = this.getTokenImage(children.field);
    const alias = children.alias ? this.getTokenImage(children.alias) : null;
    const span = children.span ? this.getTokenImage(children.span) : null;

    return {
      type: 'BinCommand',
      field,
      alias,
      span,
      location: this.getLocation(ctx),
    };
  }

  private visitFillnullCommand(ctx: any): AST.FillnullCommand {
    const children = ctx.children;
    const value = children.fillValue ? this.getTokenImage(children.fillValue) : null;
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : [];

    return {
      type: 'FillnullCommand',
      value,
      fields,
      location: this.getLocation(ctx),
    };
  }

  private visitMvexpandCommand(ctx: any): AST.MvexpandCommand {
    const children = ctx.children;
    const field = this.getTokenImage(children.field);
    const limit = children.limitValue ? parseInt(this.getTokenImage(children.limitValue), 10) : null;

    return {
      type: 'MvexpandCommand',
      field,
      limit,
      location: this.getLocation(ctx),
    };
  }

  private visitTransactionCommand(ctx: any): AST.TransactionCommand {
    const children = ctx.children;
    // Grammar collects individual fieldOrWildcard nodes with label 'fields'
    const fields: AST.FieldReference[] = [];
    if (children.fields) {
      for (const field of children.fields) {
        fields.push(this.visitFieldOrWildcard(field));
      }
    }

    return {
      type: 'TransactionCommand',
      fields,
      createdFields: ['duration', 'eventcount'],
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // TIER 2A: ADDITIONAL FIELD FILTERS
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

  private visitRegexCommand(ctx: any): AST.RegexCommand {
    const children = ctx.children;
    const field = children.field ? this.getTokenImage(children.field) : null;
    const pattern = this.getStringValue(children.pattern);
    const negate = children.operator?.[0]?.image === '!=';

    return {
      type: 'RegexCommand',
      field,
      pattern,
      negate,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // TIER 1A: AGGREGATION COMMANDS
  // ===========================================================================

  private visitTopCommand(ctx: any): AST.TopCommand {
    const children = ctx.children;
    const limit = children.count ? parseInt(this.getTokenImage(children.count), 10) : null;
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : [];
    const byFields = children.byFields ? this.visitFieldList(children.byFields[0]) : [];

    // Parse options for countfield, percentfield, showcount, showperc
    let countField = 'count';
    let percentField = 'percent';
    let showCount = true;
    let showPercent = true;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'countfield') {
          countField = this.getStringValue(valueToken);
        } else if (name === 'percentfield') {
          percentField = this.getStringValue(valueToken);
        } else if (name === 'showcount') {
          showCount = valueToken.tokenType?.name === 'True';
        } else if (name === 'showperc') {
          showPercent = valueToken.tokenType?.name === 'True';
        }
      }
    }

    return {
      type: 'TopCommand',
      limit,
      fields,
      byFields,
      countField,
      percentField,
      showCount,
      showPercent,
      location: this.getLocation(ctx),
    };
  }

  private visitSitopCommand(ctx: any): AST.SitopCommand {
    const children = ctx.children;
    const limit = children.count ? parseInt(this.getTokenImage(children.count), 10) : null;
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : [];
    const byFields = children.byFields ? this.visitFieldList(children.byFields[0]) : [];

    // Parse options for countfield, percentfield, showcount, showperc (same as top)
    let countField = 'count';
    let percentField = 'percent';
    let showCount = true;
    let showPercent = true;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'countfield') {
          countField = this.getStringValue(valueToken);
        } else if (name === 'percentfield') {
          percentField = this.getStringValue(valueToken);
        } else if (name === 'showcount') {
          showCount = valueToken.tokenType?.name === 'True';
        } else if (name === 'showperc') {
          showPercent = valueToken.tokenType?.name === 'True';
        }
      }
    }

    return {
      type: 'SitopCommand',
      limit,
      fields,
      byFields,
      countField,
      percentField,
      showCount,
      showPercent,
      location: this.getLocation(ctx),
    };
  }

  private visitRareCommand(ctx: any): AST.RareCommand {
    const children = ctx.children;
    const limit = children.count ? parseInt(this.getTokenImage(children.count), 10) : null;
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : [];
    const byFields = children.byFields ? this.visitFieldList(children.byFields[0]) : [];

    // Parse options (same as top)
    let countField = 'count';
    let percentField = 'percent';
    let showCount = true;
    let showPercent = true;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'countfield') {
          countField = this.getStringValue(valueToken);
        } else if (name === 'percentfield') {
          percentField = this.getStringValue(valueToken);
        } else if (name === 'showcount') {
          showCount = valueToken.tokenType?.name === 'True';
        } else if (name === 'showperc') {
          showPercent = valueToken.tokenType?.name === 'True';
        }
      }
    }

    return {
      type: 'RareCommand',
      limit,
      fields,
      byFields,
      countField,
      percentField,
      showCount,
      showPercent,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // TIER 1B: ADDITIONAL FIELD OPERATIONS
  // ===========================================================================

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

  private visitConvertCommand(ctx: any): AST.ConvertCommand {
    const children = ctx.children;
    const functions: AST.ConvertFunction[] = [];
    let timeformat: string | null = null;

    // Parse options (timeformat)
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        if (name === 'timeformat') {
          timeformat = this.getStringValue(children.optionValue[i]);
        }
      }
    }

    // Parse convert functions
    if (children.functions) {
      for (const funcCtx of children.functions) {
        functions.push(this.visitConvertFunction(funcCtx));
      }
    }

    return {
      type: 'ConvertCommand',
      functions,
      timeformat,
      location: this.getLocation(ctx),
    };
  }

  private visitConvertFunction(ctx: any): AST.ConvertFunction {
    const children = ctx.children;
    const func = this.getTokenImage(children.func);
    const field = this.getTokenImage(children.field);
    const alias = children.alias ? this.getTokenImage(children.alias) : null;

    return { func, field, alias };
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

  // ===========================================================================
  // TIER 3A: ADDITIONAL PIPELINE SPLITTERS
  // ===========================================================================

  private visitForeachCommand(ctx: any): AST.ForeachCommand {
    const children = ctx.children;
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : [];
    const options = new Map<string, string>();

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const value = this.getStringValue(children.optionValue[i]);
        options.set(name, value);
      }
    }

    const body = children.body ? this.visitSubsearch(children.body[0]) : null;

    return {
      type: 'ForeachCommand',
      fields,
      options,
      body,
      location: this.getLocation(ctx),
    };
  }

  private visitMapCommand(ctx: any): AST.MapCommand {
    const children = ctx.children;
    let search: string | null = null;
    let maxsearches: number | null = null;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'search') {
          search = this.getStringValue(valueToken);
        } else if (name === 'maxsearches') {
          maxsearches = parseInt(this.getTokenImage(valueToken), 10);
        }
      }
    }

    return {
      type: 'MapCommand',
      search,
      maxsearches,
      location: this.getLocation(ctx),
    };
  }

  private visitMakeresultsCommand(ctx: any): AST.MakeresultsCommand {
    const children = ctx.children;
    let count = 1;
    let annotate = false;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const valueToken = children.optionValue[i];

        if (name === 'count') {
          count = parseInt(this.getTokenImage(valueToken), 10);
        } else if (name === 'annotate') {
          annotate = valueToken.tokenType?.name === 'True';
        }
      }
    }

    // Determine created fields based on annotate option
    const createdFields = annotate
      ? ['_raw', '_time', 'host', 'source', 'sourcetype', 'splunk_server', 'splunk_server_group']
      : ['_time'];

    return {
      type: 'MakeresultsCommand',
      count,
      annotate,
      createdFields,
      location: this.getLocation(ctx),
    };
  }

  private visitGentimesCommand(ctx: any): AST.GentimesCommand {
    const children = ctx.children;
    let start: string | null = null;
    let end: string | null = null;
    let increment: string | null = null;

    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]).toLowerCase();
        const value = this.getTokenImage(children.optionValue[i]);

        if (name === 'start') {
          start = value;
        } else if (name === 'end') {
          end = value;
        } else if (name === 'increment') {
          increment = value;
        }
      }
    }

    return {
      type: 'GentimesCommand',
      start,
      end,
      increment,
      createdFields: ['starttime', 'endtime'],
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

  // ===========================================================================
  // ADDITIONAL FIELD CREATORS
  // ===========================================================================

  private visitTstatsCommand(ctx: any): AST.TstatsCommand {
    const children = ctx.children;
    const aggregations: AST.Aggregation[] = [];
    const byFields: string[] = [];
    const options: Record<string, string | number | boolean> = {};

    if (children.aggregation) {
      for (const agg of children.aggregation) {
        aggregations.push(this.visitAggregation(agg));
      }
    }

    if (children.byFields) {
      const fieldRefs = this.visitFieldList(children.byFields[0]);
      byFields.push(...fieldRefs.map((f) => f.fieldName));
    }

    // Parse options
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]);
        const valueToken = children.optionValue?.[i];
        if (valueToken) {
          if (valueToken.tokenType?.name === 'True') {
            options[name] = true;
          } else if (valueToken.tokenType?.name === 'False') {
            options[name] = false;
          } else {
            const val = this.getTokenImage(valueToken);
            options[name] = isNaN(Number(val)) ? val : Number(val);
          }
        }
      }
    }

    return {
      type: 'TstatsCommand',
      aggregations,
      byFields,
      datamodel: children.datamodel ? this.getTokenImage(children.datamodel[0]) : undefined,
      whereClause: children.whereClause ? this.visitExpression(children.whereClause[0]) : undefined,
      options,
      location: this.getLocation(ctx),
    };
  }

  private visitStrcatCommand(ctx: any): AST.StrcatCommand {
    const children = ctx.children;
    const sourceFields: string[] = [];
    const options: Record<string, boolean> = {};

    if (children.sourceFields) {
      for (const sf of children.sourceFields) {
        if (sf.children) {
          sourceFields.push(this.visitFieldOrWildcard(sf).fieldName);
        } else {
          sourceFields.push(this.getTokenImage(sf));
        }
      }
    }

    // Last field is the target
    const targetField = sourceFields.pop() || '';

    // Parse options
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]);
        const value = children.optionValue?.[i];
        if (value) {
          options[name] = this.getTokenImage(value).toLowerCase() === 'true';
        }
      }
    }

    return {
      type: 'StrcatCommand',
      sourceFields,
      targetField,
      options,
      location: this.getLocation(ctx),
    };
  }

  private visitAccumCommand(ctx: any): AST.AccumCommand {
    const children = ctx.children;
    return {
      type: 'AccumCommand',
      field: this.visitFieldOrWildcard(children.field[0]).fieldName,
      alias: children.alias ? this.getTokenImage(children.alias[0]) : undefined,
      location: this.getLocation(ctx),
    };
  }

  private visitDeltaCommand(ctx: any): AST.DeltaCommand {
    const children = ctx.children;
    return {
      type: 'DeltaCommand',
      field: this.visitFieldOrWildcard(children.field[0]).fieldName,
      alias: children.alias ? this.getTokenImage(children.alias[0]) : undefined,
      period: children.period ? parseInt(this.getTokenImage(children.period[0]), 10) : undefined,
      location: this.getLocation(ctx),
    };
  }

  private visitAutoregressCommand(ctx: any): AST.AutoregressCommand {
    const children = ctx.children;
    return {
      type: 'AutoregressCommand',
      field: this.visitFieldOrWildcard(children.field[0]).fieldName,
      alias: children.alias ? this.getTokenImage(children.alias[0]) : undefined,
      pStart: children.pStart ? parseInt(this.getTokenImage(children.pStart[0]), 10) : undefined,
      pEnd: children.pEnd ? parseInt(this.getTokenImage(children.pEnd[0]), 10) : undefined,
      location: this.getLocation(ctx),
    };
  }

  private visitRangemapCommand(ctx: any): AST.RangemapCommand {
    const children = ctx.children;
    const ranges: Array<{ name: string; start: number; end: number }> = [];

    if (children.rangeName) {
      for (let i = 0; i < children.rangeName.length; i++) {
        ranges.push({
          name: this.getTokenImage(children.rangeName[i]),
          start: parseFloat(this.getTokenImage(children.rangeStart[i])),
          end: parseFloat(this.getTokenImage(children.rangeEnd[i])),
        });
      }
    }

    return {
      type: 'RangemapCommand',
      field: this.visitFieldOrWildcard(children.field[0]).fieldName,
      ranges,
      defaultValue: children.defaultValue ? this.getTokenImage(children.defaultValue[0]) : undefined,
      location: this.getLocation(ctx),
    };
  }

  private visitFilldownCommand(ctx: any): AST.FilldownCommand {
    const children = ctx.children;
    const fieldRefs = children.fields ? this.visitFieldList(children.fields[0]) : [];
    return {
      type: 'FilldownCommand',
      fields: fieldRefs.map((f) => f.fieldName),
      location: this.getLocation(ctx),
    };
  }

  private visitMvcombineCommand(ctx: any): AST.MvcombineCommand {
    const children = ctx.children;
    return {
      type: 'MvcombineCommand',
      field: this.visitFieldOrWildcard(children.field[0]).fieldName,
      delimiter: children.delimiter ? this.getTokenImage(children.delimiter[0]).slice(1, -1) : undefined,
      location: this.getLocation(ctx),
    };
  }

  private visitUnionCommand(ctx: any): AST.UnionCommand {
    const children = ctx.children;
    const datasets: string[] = [];
    const subsearches: AST.Pipeline[] = [];
    const options: Record<string, string | number> = {};

    if (children.datasetName) {
      for (const ds of children.datasetName) {
        datasets.push(this.getTokenImage(ds));
      }
    }

    if (children.subsearch) {
      for (const sub of children.subsearch) {
        subsearches.push(this.visitSubsearch(sub));
      }
    }

    // Parse options
    if (children.optionName) {
      for (let i = 0; i < children.optionName.length; i++) {
        const name = this.getTokenImage(children.optionName[i]);
        const value = children.optionValue?.[i];
        if (value) {
          const val = this.getTokenImage(value);
          options[name] = isNaN(Number(val)) ? val : Number(val);
        }
      }
    }

    return {
      type: 'UnionCommand',
      datasets,
      subsearches,
      options,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // GENERIC FALLBACK
  // ===========================================================================

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
  // EXPRESSIONS
  // ===========================================================================

  private visitExpression(ctx: any): AST.Expression {
    return this.visitOrExpression(ctx.children);
  }

  private visitOrExpression(children: any): AST.Expression {
    // Unwrap orExpression node if present (coming from expression rule)
    if (children.orExpression) {
      children = children.orExpression[0].children;
    }

    // If no lhs, we're at a lower level - delegate down
    if (!children.lhs) {
      return this.visitAndExpression(children);
    }

    let left = this.visitAndExpression(children.lhs[0].children);

    if (children.rhs) {
      for (const rhs of children.rhs) {
        const right = this.visitAndExpression(rhs.children);
        left = {
          type: 'BinaryExpression',
          operator: 'OR',
          left,
          right,
          location: this.getLocation(rhs),
        };
      }
    }

    return left;
  }

  private visitAndExpression(children: any): AST.Expression {
    if (!children.andExpression && !children.lhs) {
      return this.visitComparisonExpression(children);
    }

    let left = this.visitComparisonExpression(children.lhs?.[0]?.children ?? children);

    if (children.rhs) {
      for (const rhs of children.rhs) {
        const right = this.visitComparisonExpression(rhs.children);
        left = {
          type: 'BinaryExpression',
          operator: 'AND',
          left,
          right,
          location: this.getLocation(rhs),
        };
      }
    }

    return left;
  }

  private visitComparisonExpression(children: any): AST.Expression {
    if (!children.comparisonExpression && !children.lhs) {
      return this.visitAdditiveExpression(children);
    }

    const left = this.visitAdditiveExpression(children.lhs?.[0]?.children ?? children);

    if (children.op && children.rhs) {
      const operator = this.getTokenImage(children.op);
      const right = this.visitAdditiveExpression(children.rhs[0].children);
      return {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        location: this.getLocation(children),
      };
    }

    return left;
  }

  private visitAdditiveExpression(children: any): AST.Expression {
    if (!children.additiveExpression && !children.lhs) {
      return this.visitMultiplicativeExpression(children);
    }

    let left = this.visitMultiplicativeExpression(children.lhs?.[0]?.children ?? children);

    if (children.op && children.rhs) {
      for (let i = 0; i < children.rhs.length; i++) {
        const operator = this.getTokenImage(children.op[i]);
        const right = this.visitMultiplicativeExpression(children.rhs[i].children);
        left = {
          type: 'BinaryExpression',
          operator,
          left,
          right,
          location: this.getLocation(children.rhs[i]),
        };
      }
    }

    return left;
  }

  private visitMultiplicativeExpression(children: any): AST.Expression {
    if (!children.multiplicativeExpression && !children.lhs) {
      return this.visitUnaryExpression(children);
    }

    let left = this.visitUnaryExpression(children.lhs?.[0]?.children ?? children);

    if (children.op && children.rhs) {
      for (let i = 0; i < children.rhs.length; i++) {
        const operator = this.getTokenImage(children.op[i]);
        const right = this.visitUnaryExpression(children.rhs[i].children);
        left = {
          type: 'BinaryExpression',
          operator,
          left,
          right,
          location: this.getLocation(children.rhs[i]),
        };
      }
    }

    return left;
  }

  private visitUnaryExpression(children: any): AST.Expression {
    if (children.Not) {
      return {
        type: 'UnaryExpression',
        operator: 'NOT',
        operand: this.visitUnaryExpression(children.operand[0].children),
        location: this.getLocation(children),
      };
    }

    if (children.Minus && children.operand) {
      return {
        type: 'UnaryExpression',
        operator: '-',
        operand: this.visitUnaryExpression(children.operand[0].children),
        location: this.getLocation(children),
      };
    }

    return this.visitPrimaryExpression(children);
  }

  private visitPrimaryExpression(children: any): AST.Expression {
    if (children.primaryExpression) {
      return this.visitPrimaryExpression(children.primaryExpression[0].children);
    }

    if (children.functionCall) {
      return this.visitFunctionCall(children.functionCall[0]);
    }

    if (children.keywordFunctionCall) {
      return this.visitKeywordFunctionCall(children.keywordFunctionCall[0]);
    }

    if (children.timeFunctionCall) {
      return this.visitTimeFunctionCall(children.timeFunctionCall[0]);
    }

    if (children.parenExpression) {
      return this.visitExpression(children.parenExpression[0].children.expression[0]);
    }

    if (children.fieldRef) {
      return {
        type: 'FieldReference',
        fieldName: this.getTokenImage(children.fieldRef),
        isWildcard: false,
        location: this.getLocation(children),
      };
    }

    if (children.value) {
      const token = children.value[0];
      const image = token.image;

      if (token.tokenType.name === 'StringLiteral') {
        return {
          type: 'StringLiteral',
          value: image.slice(1, -1), // Remove quotes
          location: this.getLocation(children),
        };
      }

      if (token.tokenType.name === 'NumberLiteral') {
        return {
          type: 'NumberLiteral',
          value: parseFloat(image),
          location: this.getLocation(children),
        };
      }

      if (token.tokenType.name === 'True') {
        return { type: 'BooleanLiteral', value: true, location: this.getLocation(children) };
      }

      if (token.tokenType.name === 'False') {
        return { type: 'BooleanLiteral', value: false, location: this.getLocation(children) };
      }

      if (token.tokenType.name === 'Null') {
        return { type: 'NullLiteral', location: this.getLocation(children) };
      }
    }

    // Fallback to field reference
    return {
      type: 'FieldReference',
      fieldName: 'unknown',
      isWildcard: false,
      location: this.getLocation(children),
    };
  }

  private visitFunctionCall(ctx: any): AST.FunctionCall {
    const children = ctx.children;
    const functionName = this.getTokenImage(children.funcName);
    const args: AST.Expression[] = [];

    if (children.args) {
      for (const arg of children.args) {
        args.push(this.visitExpression(arg));
      }
    }

    return {
      type: 'FunctionCall',
      functionName,
      arguments: args,
      location: this.getLocation(ctx),
    };
  }

  /**
   * Handle keyword function calls: true(), false(), null()
   * These are keywords that can also be used as function calls in SPL.
   */
  private visitKeywordFunctionCall(ctx: any): AST.FunctionCall {
    const children = ctx.children;
    // funcName is a True, False, or Null token
    const funcToken = children.funcName[0];
    const functionName = funcToken.image.toLowerCase(); // "true", "false", or "null"
    const args: AST.Expression[] = [];

    if (children.args) {
      for (const arg of children.args) {
        args.push(this.visitExpression(arg));
      }
    }

    return {
      type: 'FunctionCall',
      functionName,
      arguments: args,
      location: this.getLocation(ctx),
    };
  }

  /**
   * Handle time function calls: now(), relative_time()
   * These are tokenized as TimeModifier but can be used as function calls.
   */
  private visitTimeFunctionCall(ctx: any): AST.FunctionCall {
    const children = ctx.children;
    const funcToken = children.funcName[0];
    const functionName = funcToken.image.toLowerCase(); // "now" or other time modifier
    const args: AST.Expression[] = [];

    if (children.args) {
      for (const arg of children.args) {
        args.push(this.visitExpression(arg));
      }
    }

    return {
      type: 'FunctionCall',
      functionName,
      arguments: args,
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // SEARCH EXPRESSIONS
  // ===========================================================================

  private visitSearchExpression(ctx: any): AST.SearchExpression {
    const children = ctx.children;
    const terms: AST.SearchTerm[] = [];
    const referencedFields: string[] = [];

    if (children.searchTerm) {
      for (const term of children.searchTerm) {
        const parsed = this.visitSearchTerm(term);
        terms.push(parsed);

        if (parsed.type === 'SearchComparison') {
          referencedFields.push(parsed.field);
        }
      }
    }

    return {
      type: 'SearchExpression',
      terms,
      referencedFields,
      location: this.getLocation(ctx),
    };
  }

  private visitSearchTerm(ctx: any): AST.SearchTerm {
    const children = ctx.children;

    if (children.And) {
      return { type: 'SearchLogicalOp', operator: 'AND', location: this.getLocation(ctx) };
    }

    if (children.Or) {
      return { type: 'SearchLogicalOp', operator: 'OR', location: this.getLocation(ctx) };
    }

    if (children.Not) {
      return { type: 'SearchLogicalOp', operator: 'NOT', location: this.getLocation(ctx) };
    }

    if (children.subsearch) {
      return {
        type: 'SearchSubsearch',
        pipeline: this.visitSubsearch(children.subsearch[0]),
        location: this.getLocation(ctx),
      };
    }

    if (children.macro) {
      return {
        type: 'MacroCall',
        rawText: this.getTokenImage(children.macro),
        location: this.getLocation(ctx),
      };
    }

    if (children.field && children.value) {
      const field = this.getTokenImage(children.field);
      const valueToken = children.value[0];
      let value: string | number = valueToken.image as string;

      if (valueToken.tokenType.name === 'NumberLiteral') {
        // Narrow and parse numeric token value safely
        const v = valueToken.image;
        const parsed = typeof v === 'string' ? parseFloat(v) : Number(v);
        value = parsed;
      } else if (valueToken.tokenType.name === 'StringLiteral') {
        const v = valueToken.image;
        const s = typeof v === 'string' ? v : String(v);
        value = s.slice(1, -1);
      }

      let operator: AST.SearchComparison['operator'] = '=';
      if (children.NotEquals) operator = '!=';
      else if (children.LessThan) operator = '<';
      else if (children.GreaterThan) operator = '>';

      return {
        type: 'SearchComparison',
        field,
        operator,
        value,
        location: this.getLocation(ctx),
      };
    }

    if (children.keyword) {
      return {
        type: 'SearchKeyword',
        keyword: this.getTokenImage(children.keyword),
        location: this.getLocation(ctx),
      };
    }

    // Fallback
    return {
      type: 'SearchKeyword',
      keyword: '',
      location: this.getLocation(ctx),
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private visitFieldOrWildcard(ctx: any): AST.FieldReference {
    const children = ctx.children;

    // Handle wildcard tokens (* or prefix*/suffix patterns)
    if (children.Multiply || children.WildcardField) {
      const token = children.Multiply?.[0] ?? children.WildcardField?.[0];
      return {
        type: 'FieldReference',
        fieldName: token.image,
        isWildcard: true,
        location: this.getLocation(ctx),
      };
    }

    // Check for identifier first
    if (children.Identifier) {
      return {
        type: 'FieldReference',
        fieldName: this.getTokenImage(children.Identifier),
        isWildcard: false,
        location: this.getLocation(ctx),
      };
    }

    // Check for keyword tokens that can be used as field names
    const keywordTokens = ['Value', 'Field', 'Output', 'Max', 'Mode', 'Type'];
    for (const tokenName of keywordTokens) {
      if (children[tokenName]?.[0]) {
        const token = children[tokenName][0];
        return {
          type: 'FieldReference',
          fieldName: token.image,
          isWildcard: false,
          location: {
            startLine: token.startLine ?? 1,
            startColumn: token.startColumn ?? 1,
            endLine: token.endLine ?? 1,
            endColumn: token.endColumn ?? 1,
            startOffset: token.startOffset,
            endOffset: token.endOffset ?? token.startOffset + token.image.length,
          },
        };
      }
    }

    // Fallback - return empty field (shouldn't happen if grammar is correct)
    return {
      type: 'FieldReference',
      fieldName: '',
      isWildcard: false,
      location: this.getLocation(ctx),
    };
  }

  private visitFieldList(ctx: any): AST.FieldReference[] {
    const children = ctx.children;
    const fields: AST.FieldReference[] = [];

    if (children.fieldOrWildcard) {
      for (const fw of children.fieldOrWildcard) {
        fields.push(this.visitFieldOrWildcard(fw));
      }
    }

    return fields;
  }

  private getTokenImage(tokens: IToken | IToken[] | undefined): string {
    if (!tokens) return '';
    const token = Array.isArray(tokens) ? tokens[0] : tokens;
    return token?.image ?? '';
  }

  private getStringValue(tokens: IToken | IToken[] | undefined): string {
    const image = this.getTokenImage(tokens);
    // Remove surrounding quotes if present
    if ((image.startsWith('"') && image.endsWith('"')) ||
        (image.startsWith("'") && image.endsWith("'"))) {
      return image.slice(1, -1);
    }
    return image;
  }

  private extractNamedGroups(pattern: string): string[] {
    const regex = /\(\?(?:P)?<([^>]+)>/g;
    const groups: string[] = [];
    let match;

    while ((match = regex.exec(pattern)) !== null) {
      groups.push(match[1]);
    }

    return groups;
  }

  private getLocation(ctx: any): AST.SourceLocation {
    const firstToken = this.findFirstToken(ctx);
    const lastToken = this.findLastToken(ctx);

    return {
      startLine: firstToken?.startLine ?? 1,
      startColumn: firstToken?.startColumn ?? 1,
      endLine: lastToken?.endLine ?? 1,
      endColumn: lastToken?.endColumn ?? 1,
      startOffset: firstToken?.startOffset ?? 0,
      endOffset: lastToken?.endOffset ?? 0,
    };
  }

  private findFirstToken(ctx: any): IToken | null {
    if (!ctx) return null;

    const children = ctx.children ?? ctx;
    for (const key of Object.keys(children)) {
      const value = children[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (this.isToken(item)) return item;
          const found = this.findFirstToken(item);
          if (found) return found;
        }
      }
    }
    return null;
  }

  private findLastToken(ctx: any): IToken | null {
    if (!ctx) return null;

    let lastToken: IToken | null = null;
    const children = ctx.children ?? ctx;

    for (const key of Object.keys(children)) {
      const value = children[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (this.isToken(item)) lastToken = item;
          else {
            const found = this.findLastToken(item);
            if (found) lastToken = found;
          }
        }
      }
    }
    return lastToken;
  }

  private isToken(obj: any): obj is IToken {
    return obj && typeof obj.image === 'string' && typeof obj.startOffset === 'number';
  }
}
