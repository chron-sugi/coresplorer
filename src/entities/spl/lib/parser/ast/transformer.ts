/**
 * CST to AST Transformer
 *
 * Transforms Chevrotain's verbose Concrete Syntax Tree (CST) into a
 * clean Abstract Syntax Tree (AST) suitable for field lineage analysis.
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

class CSTTransformer {
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

  private visitCommand(ctx: any): AST.Command {
    const children = ctx.children;

    if (children.evalCommand) return this.visitEvalCommand(children.evalCommand[0]);
    if (children.statsCommand) return this.visitStatsCommand(children.statsCommand[0]);
    if (children.renameCommand) return this.visitRenameCommand(children.renameCommand[0]);
    if (children.rexCommand) return this.visitRexCommand(children.rexCommand[0]);
    if (children.lookupCommand) return this.visitLookupCommand(children.lookupCommand[0]);
    if (children.inputlookupCommand) return this.visitInputlookupCommand(children.inputlookupCommand[0]);
    if (children.spathCommand) return this.visitSpathCommand(children.spathCommand[0]);
    if (children.addtotalsCommand) return this.visitAddtotalsCommand(children.addtotalsCommand[0]);
    if (children.tableCommand) return this.visitTableCommand(children.tableCommand[0]);
    if (children.fieldsCommand) return this.visitFieldsCommand(children.fieldsCommand[0]);
    if (children.dedupCommand) return this.visitDedupCommand(children.dedupCommand[0]);
    if (children.appendCommand) return this.visitAppendCommand(children.appendCommand[0]);
    if (children.joinCommand) return this.visitJoinCommand(children.joinCommand[0]);
    if (children.whereCommand) return this.visitWhereCommand(children.whereCommand[0]);
    if (children.binCommand) return this.visitBinCommand(children.binCommand[0]);
    if (children.fillnullCommand) return this.visitFillnullCommand(children.fillnullCommand[0]);
    if (children.mvexpandCommand) return this.visitMvexpandCommand(children.mvexpandCommand[0]);
    if (children.transactionCommand) return this.visitTransactionCommand(children.transactionCommand[0]);
    if (children.genericCommand) return this.visitGenericCommand(children.genericCommand[0]);

    // Fallback
    return this.visitGenericCommand(ctx);
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
    const field = children.field ? this.visitFieldOrWildcard(children.field[0]) : null;
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

    return {
      type: 'DedupCommand',
      fields: this.visitFieldList(children.fields[0]),
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
    const fields = children.fields ? this.visitFieldList(children.fields[0]) : [];

    return {
      type: 'TransactionCommand',
      fields,
      createdFields: ['duration', 'eventcount'],
      location: this.getLocation(ctx),
    };
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

    if (children.Wildcard || children.WildcardField) {
      const token = children.Wildcard?.[0] ?? children.WildcardField?.[0];
      return {
        type: 'FieldReference',
        fieldName: token.image,
        isWildcard: true,
        location: this.getLocation(ctx),
      };
    }

    return {
      type: 'FieldReference',
      fieldName: this.getTokenImage(children.Identifier),
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
