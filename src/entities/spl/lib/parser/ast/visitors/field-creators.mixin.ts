/**
 * Field Creators Mixin
 *
 * Visitor methods for commands that create or modify field values.
 * Handles 15+ commands including eval, stats, rename, rex, lookup, and more.
 *
 * @module entities/spl/lib/parser/ast/visitors/field-creators
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for field-creating commands.
 *
 * Commands handled:
 * - eval: Field assignments with expressions
 * - stats/eventstats/streamstats/chart/timechart: Aggregations
 * - rename: Field renaming
 * - rex: Regex field extraction
 * - lookup/inputlookup/outputlookup: Lookup table operations
 * - iplocation: IP geolocation enrichment
 * - spath: JSON/XML extraction
 * - addtotals: Add totals row/column
 * - tstats: Accelerated stats
 * - strcat: String concatenation
 * - accum: Running accumulation
 * - delta: Calculate deltas
 * - autoregress: Autoregressive fields
 * - convert: Type conversion
 */
export const FieldCreatorsMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // EVAL COMMAND - Field assignments with expressions
    // ===========================================================================

    protected visitEvalCommand(ctx: any): AST.EvalCommand {
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

    protected visitEvalAssignment(ctx: any): AST.EvalAssignment {
      const children = ctx.children;
      const targetField = this.getTokenImage(children.targetField);
      const expression = (this as any).visitExpression(children.value[0]);
      const dependsOn = AST.extractFieldRefs(expression);

      return {
        type: 'EvalAssignment',
        targetField,
        expression,
        dependsOn,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // STATS COMMAND - Aggregations with variants
    // ===========================================================================

    protected visitStatsCommand(ctx: any): AST.StatsCommand {
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

    protected visitAggregation(ctx: any): AST.Aggregation {
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

      // Use getStringValue to strip quotes from string aliases like "User Account"
      const alias = children.alias ? this.getStringValue(children.alias) : null;

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

    // ===========================================================================
    // RENAME COMMAND - Field renaming
    // ===========================================================================

    protected visitRenameCommand(ctx: any): AST.RenameCommand {
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

    protected visitRenameClause(ctx: any): AST.RenameMapping {
      const children = ctx.children;
      return {
        type: 'RenameMapping',
        oldField: this.visitFieldOrWildcard(children.oldField[0]),
        newField: this.visitFieldOrWildcard(children.newField[0]),
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // REX COMMAND - Regex field extraction
    // ===========================================================================

    protected visitRexCommand(ctx: any): AST.RexCommand {
      const children = ctx.children;
      let sourceField: AST.FieldReference = {
        type: 'FieldReference',
        fieldName: '_raw',
        isWildcard: false,
        location: this.getLocation(ctx),
      };
      let mode: 'extract' | 'sed' = 'extract';
      const pattern = this.getStringValue(children.pattern);

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          const value = this.getTokenImage(valueToken);
          if (name === 'field') {
            sourceField = {
              type: 'FieldReference',
              fieldName: value,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: valueToken.startColumn ?? 1,
                endLine: valueToken.endLine ?? 1,
                endColumn: valueToken.endColumn ?? 1,
                startOffset: valueToken.startOffset,
                endOffset: valueToken.endOffset ?? valueToken.startOffset + valueToken.image.length,
              },
            };
          }
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

    // ===========================================================================
    // LOOKUP COMMANDS - Lookup table operations
    // ===========================================================================

    protected visitLookupCommand(ctx: any): AST.LookupCommand {
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

    protected visitFieldMapping(ctx: any): AST.FieldMapping {
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

    protected visitInputlookupCommand(ctx: any): AST.InputlookupCommand {
      const children = ctx.children;
      return {
        type: 'InputlookupCommand',
        lookupName: this.getTokenImage(children.lookupName),
        location: this.getLocation(ctx),
      };
    }

    protected visitOutputlookupCommand(ctx: any): AST.OutputlookupCommand {
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

    // ===========================================================================
    // IPLOCATION COMMAND - IP geolocation enrichment
    // ===========================================================================

    protected visitIplocationCommand(ctx: any): AST.IplocationCommand {
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
      // Note: Splunk uses capitalized names for City, Country, Region but lowercase for lat, lon
      const geoFields = ['City', 'Country', 'Region', 'lat', 'lon'];
      const createdFields = geoFields.map(f => prefix + f);

      // Get IP field
      const ipFieldNode = children.ipField[0];
      const ipField = this.visitFieldOrWildcard(ipFieldNode);

      return {
        type: 'IplocationCommand',
        ipField,
        prefix,
        allFields,
        createdFields,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SPATH COMMAND - JSON/XML extraction
    // ===========================================================================

    protected visitSpathCommand(ctx: any): AST.SpathCommand {
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

    // ===========================================================================
    // ADDTOTALS COMMAND - Add totals row/column
    // ===========================================================================

    protected visitAddtotalsCommand(ctx: any): AST.AddtotalsCommand {
      const children = ctx.children;
      const options = new Map<string, string | boolean>();
      let fieldnameRef: AST.FieldReference | null = null;

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

          // Capture fieldname with location for underline positioning
          if (name === 'fieldname' && typeof value === 'string') {
            fieldnameRef = {
              type: 'FieldReference',
              fieldName: value,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: valueToken.startColumn ?? 1,
                endLine: valueToken.endLine ?? 1,
                endColumn: valueToken.endColumn ?? 1,
                startOffset: valueToken.startOffset ?? 0,
                endOffset: valueToken.endOffset ?? 0,
              },
            };
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
        fieldnameRef,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // TSTATS COMMAND - Accelerated stats over indexed fields
    // ===========================================================================

    protected visitTstatsCommand(ctx: any): AST.TstatsCommand {
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
        whereClause: children.whereClause ? (this as any).visitExpression(children.whereClause[0]) : undefined,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // STRCAT COMMAND - String concatenation
    // ===========================================================================

    protected visitStrcatCommand(ctx: any): AST.StrcatCommand {
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

    // ===========================================================================
    // ACCUM COMMAND - Running accumulation
    // ===========================================================================

    protected visitAccumCommand(ctx: any): AST.AccumCommand {
      const children = ctx.children;
      return {
        type: 'AccumCommand',
        field: this.visitFieldOrWildcard(children.field[0]).fieldName,
        alias: children.alias ? this.getTokenImage(children.alias[0]) : undefined,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // DELTA COMMAND - Calculate deltas
    // ===========================================================================

    protected visitDeltaCommand(ctx: any): AST.DeltaCommand {
      const children = ctx.children;
      return {
        type: 'DeltaCommand',
        field: this.visitFieldOrWildcard(children.field[0]).fieldName,
        alias: children.alias ? this.getTokenImage(children.alias[0]) : undefined,
        period: children.period ? parseInt(this.getTokenImage(children.period[0]), 10) : undefined,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // AUTOREGRESS COMMAND - Autoregressive fields
    // ===========================================================================

    protected visitAutoregressCommand(ctx: any): AST.AutoregressCommand {
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

    // ===========================================================================
    // CONVERT COMMAND - Type conversion
    // ===========================================================================

    protected visitConvertCommand(ctx: any): AST.ConvertCommand {
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

    protected visitConvertFunction(ctx: any): AST.ConvertFunction {
      const children = ctx.children;
      const func = this.getTokenImage(children.func);
      const field = this.getTokenImage(children.field);
      const alias = children.alias ? this.getTokenImage(children.alias) : null;

      return { func, field, alias };
    }

    // ===========================================================================
    // SETFIELDS COMMAND - Set field values explicitly
    // ===========================================================================

    protected visitSetfieldsCommand(ctx: any): AST.SetfieldsCommand {
      const children = ctx.children;
      const assignments: Array<{ field: string; value: string | number | boolean }> = [];

      if (children.fieldName) {
        for (let i = 0; i < children.fieldName.length; i++) {
          const field = this.getTokenImage(children.fieldName[i]);
          const valueToken = children.fieldValue[i];

          let value: string | number | boolean;
          if (valueToken.tokenType?.name === 'True') {
            value = true;
          } else if (valueToken.tokenType?.name === 'False') {
            value = false;
          } else if (valueToken.tokenType?.name === 'NumberLiteral') {
            value = parseFloat(this.getTokenImage(valueToken));
          } else {
            value = this.getStringValue(valueToken);
          }

          assignments.push({ field, value });
        }
      }

      return {
        type: 'SetfieldsCommand',
        assignments,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // TAGS COMMAND - Add tags to events based on field values
    // ===========================================================================

    protected visitTagsCommand(ctx: any): AST.TagsCommand {
      const children = ctx.children;
      let outputField = 'tag';
      let inclName = true;
      let inclValue = true;

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'outputfield') {
            outputField = this.getStringValue(valueToken);
          } else if (name === 'inclname') {
            inclName = valueToken.tokenType?.name === 'True';
          } else if (name === 'inclvalue') {
            inclValue = valueToken.tokenType?.name === 'True';
          }
        }
      }

      const fields = children.fields ? this.visitFieldList(children.fields[0]) : null;

      return {
        type: 'TagsCommand',
        outputField,
        inclName,
        inclValue,
        fields,
        location: this.getLocation(ctx),
      };
    }
  };
