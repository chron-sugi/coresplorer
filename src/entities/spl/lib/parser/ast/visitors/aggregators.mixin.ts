/**
 * Aggregators Mixin
 *
 * Visitor methods for commands that aggregate, rank, and categorize data.
 * Handles commands that compute statistics and transform field values.
 *
 * @module entities/spl/lib/parser/ast/visitors/aggregators
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import type * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for aggregation and ranking commands.
 *
 * Commands handled:
 * - top: Most common values
 * - sitop: Streaming top (incrementalversion)
 * - rare: Least common values
 * - rangemap: Map numeric ranges to categories
 * - filldown: Fill missing values downward
 * - mvcombine: Combine multivalue fields
 */
export const AggregatorsMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // TOP COMMAND - Most common values
    // ===========================================================================

    protected visitTopCommand(ctx: any): AST.TopCommand {
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

    // ===========================================================================
    // SITOP COMMAND - Streaming top (incremental version)
    // ===========================================================================

    protected visitSitopCommand(ctx: any): AST.SitopCommand {
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

    // ===========================================================================
    // RARE COMMAND - Least common values
    // ===========================================================================

    protected visitRareCommand(ctx: any): AST.RareCommand {
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
    // RANGEMAP COMMAND - Map numeric ranges to categories
    // ===========================================================================

    protected visitRangemapCommand(ctx: any): AST.RangemapCommand {
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

    // ===========================================================================
    // FILLDOWN COMMAND - Fill missing values downward
    // ===========================================================================

    protected visitFilldownCommand(ctx: any): AST.FilldownCommand {
      const children = ctx.children;
      const fieldRefs = children.fields ? this.visitFieldList(children.fields[0]) : [];
      return {
        type: 'FilldownCommand',
        fields: fieldRefs.map((f) => f.fieldName),
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // MVCOMBINE COMMAND - Combine multivalue fields
    // ===========================================================================

    protected visitMvcombineCommand(ctx: any): AST.MvcombineCommand {
      const children = ctx.children;
      return {
        type: 'MvcombineCommand',
        field: this.visitFieldOrWildcard(children.field[0]).fieldName,
        delimiter: children.delimiter ? this.getTokenImage(children.delimiter[0]).slice(1, -1) : undefined,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // CONTINGENCY COMMAND - Cross-tabulation of two fields
    // ===========================================================================

    protected visitContingencyCommand(ctx: any): AST.ContingencyCommand {
      const children = ctx.children;
      const options: Record<string, string | number | boolean> = {};

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'True') {
            options[name] = true;
          } else if (valueToken.tokenType?.name === 'False') {
            options[name] = false;
          } else if (valueToken.tokenType?.name === 'NumberLiteral') {
            options[name] = parseFloat(this.getTokenImage(valueToken));
          } else {
            options[name] = this.getStringValue(valueToken);
          }
        }
      }

      return {
        type: 'ContingencyCommand',
        rowField: this.visitFieldOrWildcard(children.rowField[0]),
        colField: this.visitFieldOrWildcard(children.colField[0]),
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // XYSERIES COMMAND - Pivot tabular data into columns
    // ===========================================================================

    protected visitXyseriesCommand(ctx: any): AST.XyseriesCommand {
      const children = ctx.children;
      const options: Record<string, string | boolean> = {};

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'True') {
            options[name] = true;
          } else if (valueToken.tokenType?.name === 'False') {
            options[name] = false;
          } else {
            options[name] = this.getStringValue(valueToken);
          }
        }
      }

      return {
        type: 'XyseriesCommand',
        xField: this.visitFieldOrWildcard(children.xField[0]),
        yField: this.visitFieldOrWildcard(children.yField[0]),
        yValueField: this.visitFieldOrWildcard(children.yValueField[0]),
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // TIMEWRAP COMMAND - Overlay time periods
    // ===========================================================================

    protected visitTimewrapCommand(ctx: any): AST.TimewrapCommand {
      const children = ctx.children;
      const options: Record<string, string> = {};

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          options[name] = this.getStringValue(valueToken);
        }
      }

      return {
        type: 'TimewrapCommand',
        timeSpan: this.getTokenImage(children.timeSpan[0]),
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SICHART COMMAND - Summary indexing chart
    // ===========================================================================

    protected visitSichartCommand(ctx: any): AST.SichartCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      const aggregations: AST.Aggregation[] = [];
      const byFields: AST.FieldReference[] = [];

      // Parse options (name=value pairs)
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          options.set(name, this.parseOptionValue(valueToken));
        }
      }

      // Parse aggregations
      if (children.aggregations) {
        for (const agg of children.aggregations) {
          aggregations.push((this as any).visitAggregation(agg));
        }
      }

      // Parse BY fields
      if (children.byFields) {
        byFields.push(...this.visitFieldList(children.byFields[0]));
      }

      return {
        type: 'SichartCommand',
        aggregations,
        byFields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SIRARE COMMAND - Summary indexing rare
    // ===========================================================================

    protected visitSirareCommand(ctx: any): AST.SirareCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      const fields: AST.FieldReference[] = [];
      const byFields: AST.FieldReference[] = [];

      // Default option values (same as rare)
      let countField = 'count';
      let percentField = 'percent';
      let showCount = true;
      let showPercent = true;

      // Parse options (name=value pairs) and fields (no = sign)
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
          } else {
            options.set(name, this.parseOptionValue(valueToken));
          }
        }
      }

      // Parse fields
      if (children.fields) {
        for (const field of children.fields) {
          fields.push(this.visitFieldOrWildcard(field));
        }
      }

      // Parse BY fields
      if (children.byFields) {
        byFields.push(...this.visitFieldList(children.byFields[0]));
      }

      return {
        type: 'SirareCommand',
        fields,
        byFields,
        options,
        countField,
        percentField,
        showCount,
        showPercent,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SISTATS COMMAND - Summary indexing stats
    // ===========================================================================

    protected visitSistatsCommand(ctx: any): AST.SistatsCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      const aggregations: AST.Aggregation[] = [];
      const byFields: AST.FieldReference[] = [];

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          options.set(name, this.parseOptionValue(valueToken));
        }
      }

      // Parse aggregations
      if (children.aggregations) {
        for (const agg of children.aggregations) {
          aggregations.push((this as any).visitAggregation(agg));
        }
      }

      // Parse BY fields
      if (children.byFields) {
        byFields.push(...this.visitFieldList(children.byFields[0]));
      }

      return {
        type: 'SistatsCommand',
        aggregations,
        byFields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SITIMECHART COMMAND - Summary indexing timechart
    // ===========================================================================

    protected visitSitimechartCommand(ctx: any): AST.SitimechartCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      const aggregations: AST.Aggregation[] = [];
      const byFields: AST.FieldReference[] = [];

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          options.set(name, this.parseOptionValue(valueToken));
        }
      }

      // Parse aggregations
      if (children.aggregations) {
        for (const agg of children.aggregations) {
          aggregations.push((this as any).visitAggregation(agg));
        }
      }

      // Parse BY fields
      if (children.byFields) {
        byFields.push(...this.visitFieldList(children.byFields[0]));
      }

      return {
        type: 'SitimechartCommand',
        aggregations,
        byFields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // GEOSTATS COMMAND - Geographic statistics
    // ===========================================================================

    protected visitGeostatsCommand(ctx: any): AST.GeostatsCommand {
      const children = ctx.children;
      const options = new Map<string, string | number>();
      const aggregations: AST.Aggregation[] = [];
      const byFields: AST.FieldReference[] = [];

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          const value = this.parseOptionValue(valueToken);
          if (typeof value === 'string' || typeof value === 'number') {
            options.set(name, value);
          }
        }
      }

      // Parse aggregations
      if (children.aggregations) {
        for (const agg of children.aggregations) {
          aggregations.push((this as any).visitAggregation(agg));
        }
      }

      // Parse BY fields
      if (children.byFields) {
        byFields.push(...this.visitFieldList(children.byFields[0]));
      }

      return {
        type: 'GeostatsCommand',
        aggregations,
        byFields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // MSTATS COMMAND - Metrics statistics
    // ===========================================================================

    protected visitMstatsCommand(ctx: any): AST.MstatsCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      const aggregations: AST.Aggregation[] = [];
      const byFields: AST.FieldReference[] = [];

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          options.set(name, this.parseOptionValue(valueToken));
        }
      }

      // Parse aggregations
      if (children.aggregations) {
        for (const agg of children.aggregations) {
          aggregations.push((this as any).visitAggregation(agg));
        }
      }

      // Parse BY fields
      if (children.byFields) {
        byFields.push(...this.visitFieldList(children.byFields[0]));
      }

      return {
        type: 'MstatsCommand',
        aggregations,
        byFields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // HELPER: Parse option value from token
    // ===========================================================================

    private parseOptionValue(valueToken: any): string | number | boolean {
      if (valueToken.tokenType?.name === 'True') {
        return true;
      } else if (valueToken.tokenType?.name === 'False') {
        return false;
      } else if (valueToken.tokenType?.name === 'NumberLiteral') {
        return parseFloat(this.getTokenImage(valueToken));
      } else {
        return this.getStringValue(valueToken);
      }
    }
  };
