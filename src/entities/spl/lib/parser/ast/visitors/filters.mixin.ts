/**
 * Filters Mixin
 *
 * Visitor methods for commands that filter, select, or drop fields and events.
 * Handles field selection, deduplication, and pattern-based filtering.
 *
 * @module entities/spl/lib/parser/ast/visitors/filters
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for filtering commands.
 *
 * Commands handled:
 * - table: Select specific fields for display
 * - fields: Keep or remove fields from events
 * - dedup: Remove duplicate events
 * - regex: Filter events by regex pattern
 * - where: Filter events by expression condition
 */
export const FiltersMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // TABLE COMMAND - Select specific fields for display
    // ===========================================================================

    protected visitTableCommand(ctx: any): AST.TableCommand {
      const children = ctx.children;
      return {
        type: 'TableCommand',
        fields: this.visitFieldList(children.fields[0]),
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // FIELDS COMMAND - Keep or remove fields from events
    // ===========================================================================

    protected visitFieldsCommand(ctx: any): AST.FieldsCommand {
      const children = ctx.children;
      const mode = children.mode?.[0]?.image === '-' ? 'remove' : 'keep';

      return {
        type: 'FieldsCommand',
        mode,
        fields: this.visitFieldList(children.fields[0]),
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // DEDUP COMMAND - Remove duplicate events
    // ===========================================================================

    protected visitDedupCommand(ctx: any): AST.DedupCommand {
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
    // REGEX COMMAND - Filter events by regex pattern
    // ===========================================================================

    protected visitRegexCommand(ctx: any): AST.RegexCommand {
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
    // WHERE COMMAND - Filter events by expression condition
    // ===========================================================================

    protected visitWhereCommand(ctx: any): AST.WhereCommand {
      const children = ctx.children;
      const condition = (this as any).visitExpression(children.condition[0]);
      const referencedFields = AST.extractFieldRefs(condition);

      return {
        type: 'WhereCommand',
        condition,
        referencedFields,
        location: this.getLocation(ctx),
      };
    }
  };
