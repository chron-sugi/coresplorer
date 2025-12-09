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
import * as AST from '../../../../model/types';

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
  };
