/**
 * Structural Mixin
 *
 * Visitor methods for commands that modify data structure or organization.
 * Handles discretization, null-filling, multivalue expansion, and transactions.
 *
 * @module entities/spl/lib/parser/ast/visitors/structural
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import type * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for structural transformation commands.
 *
 * Commands handled:
 * - bin: Discretize numeric fields into bins
 * - fillnull: Fill null values with defaults
 * - mvexpand: Expand multivalue fields into separate events
 * - transaction: Group events into transactions
 */
export const StructuralMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // BIN COMMAND - Discretize numeric fields
    // ===========================================================================

    protected visitBinCommand(ctx: any): AST.BinCommand {
      const children = ctx.children;
      // Field is a fieldOrWildcard subrule - keep full FieldReference with location
      const field = children.field ? this.visitFieldOrWildcard(children.field[0]) : null;
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

    // ===========================================================================
    // FILLNULL COMMAND - Fill null values
    // ===========================================================================

    protected visitFillnullCommand(ctx: any): AST.FillnullCommand {
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

    // ===========================================================================
    // MVEXPAND COMMAND - Expand multivalue fields
    // ===========================================================================

    protected visitMvexpandCommand(ctx: any): AST.MvexpandCommand {
      const children = ctx.children;
      // Create FieldReference with location from token
      const fieldToken = children.field?.[0];
      const field: AST.FieldReference | null = fieldToken
        ? {
            type: 'FieldReference',
            fieldName: this.getTokenImage(fieldToken),
            isWildcard: false,
            location: {
              startLine: fieldToken.startLine ?? 1,
              startColumn: fieldToken.startColumn ?? 1,
              endLine: fieldToken.endLine ?? 1,
              endColumn: fieldToken.endColumn ?? 1,
              startOffset: fieldToken.startOffset ?? 0,
              endOffset: fieldToken.endOffset ?? 0,
            },
          }
        : null;
      const limit = children.limitValue ? parseInt(this.getTokenImage(children.limitValue), 10) : null;

      return {
        type: 'MvexpandCommand',
        field,
        limit,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // TRANSACTION COMMAND - Group events into transactions
    // ===========================================================================

    protected visitTransactionCommand(ctx: any): AST.TransactionCommand {
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
  };
