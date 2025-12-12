/**
 * Field-Affecting Mixin
 *
 * Visitor methods for commands that were marked as 'generic' but affect fields.
 * Handles input, field creator, and field modifier commands.
 *
 * @module entities/spl/lib/parser/ast/visitors/field-affecting
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import type * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for field-affecting commands.
 *
 * Commands handled:
 * - inputcsv: Load results from CSV file
 * - fieldsummary: Generate field statistics
 * - addcoltotals: Add totals row
 * - bucketdir: Create path hierarchy
 * - geom: Add geographic features
 * - geomfilter: Filter by bounding box
 * - concurrency: Tag concurrent events
 * - typer: Calculate eventtype field
 * - nomv: Convert multivalue to single value
 * - makecontinuous: Fill gaps in numeric sequences
 * - reltime: Convert time to relative format
 */
export const FieldAffectingMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // INPUTCSV COMMAND - Load CSV file
    // ===========================================================================

    protected visitInputcsvCommand(ctx: any): AST.InputcsvCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      let filename: string | null = null;

      // Parse options and filename
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'True') {
            options.set(name, true);
          } else if (valueToken.tokenType?.name === 'False') {
            options.set(name, false);
          } else if (valueToken.tokenType?.name === 'NumberLiteral') {
            options.set(name, parseFloat(this.getTokenImage(valueToken)));
          } else {
            options.set(name, this.getStringValue(valueToken));
          }
        }
      }

      // Get filename (last positional argument)
      if (children.filename) {
        const lastFilename = children.filename[children.filename.length - 1];
        filename = this.getStringValue(lastFilename);
      }

      return {
        type: 'InputcsvCommand',
        filename,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // FIELDSUMMARY COMMAND - Generate field statistics
    // ===========================================================================

    protected visitFieldsummaryCommand(ctx: any): AST.FieldsummaryCommand {
      const children = ctx.children;
      const options = new Map<string, string | number>();
      const fields: AST.FieldReference[] = [];

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'NumberLiteral') {
            options.set(name, parseFloat(this.getTokenImage(valueToken)));
          } else {
            options.set(name, this.getStringValue(valueToken));
          }
        }
      }

      if (children.fields) {
        for (const field of children.fields) {
          fields.push(this.visitFieldOrWildcard(field));
        }
      }

      // fieldsummary creates these fields
      const createdFields = [
        'field',
        'count',
        'distinct_count',
        'is_exact',
        'max',
        'mean',
        'min',
        'numeric_count',
        'stdev',
        'values',
      ];

      return {
        type: 'FieldsummaryCommand',
        fields,
        options,
        createdFields,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // ADDCOLTOTALS COMMAND - Add column totals
    // ===========================================================================

    protected visitAddcoltotalsCommand(ctx: any): AST.AddcoltotalsCommand {
      const children = ctx.children;
      const fields: AST.FieldReference[] = [];
      let labelField: string | null = null;
      let label: string | null = null;

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'labelfield') {
            labelField = this.getStringValue(valueToken);
          } else if (name === 'label') {
            label = this.getStringValue(valueToken);
          }
        }
      }

      if (children.fields) {
        for (const field of children.fields) {
          fields.push(this.visitFieldOrWildcard(field));
        }
      }

      return {
        type: 'AddcoltotalsCommand',
        fields,
        labelField,
        label,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // BUCKETDIR COMMAND - Create path hierarchy
    // ===========================================================================

    protected visitBucketdirCommand(ctx: any): AST.BucketdirCommand {
      const children = ctx.children;
      const options = new Map<string, string | number>();

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'NumberLiteral') {
            options.set(name, parseFloat(this.getTokenImage(valueToken)));
          } else {
            options.set(name, this.getStringValue(valueToken));
          }
        }
      }

      return {
        type: 'BucketdirCommand',
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // GEOM COMMAND - Add geographic features
    // ===========================================================================

    protected visitGeomCommand(ctx: any): AST.GeomCommand {
      const children = ctx.children;
      const options = new Map<string, string | number>();
      let featureCollection: string | null = null;

      // Feature collection name (positional)
      if (children.featureCollection) {
        featureCollection = this.getTokenImage(children.featureCollection[0]);
      }

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'NumberLiteral') {
            options.set(name, parseFloat(this.getTokenImage(valueToken)));
          } else {
            options.set(name, this.getStringValue(valueToken));
          }
        }
      }

      return {
        type: 'GeomCommand',
        featureCollection,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // GEOMFILTER COMMAND - Filter by bounding box
    // ===========================================================================

    protected visitGeomfilterCommand(ctx: any): AST.GeomfilterCommand {
      const children = ctx.children;
      const options = new Map<string, string | number>();

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'NumberLiteral') {
            options.set(name, parseFloat(this.getTokenImage(valueToken)));
          } else {
            options.set(name, this.getStringValue(valueToken));
          }
        }
      }

      return {
        type: 'GeomfilterCommand',
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // CONCURRENCY COMMAND - Tag concurrent events
    // ===========================================================================

    protected visitConcurrencyCommand(ctx: any): AST.ConcurrencyCommand {
      const children = ctx.children;
      const options = new Map<string, string>();

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];
          options.set(name, this.getStringValue(valueToken));
        }
      }

      // concurrency creates these fields
      const createdFields = ['concurrency'];

      return {
        type: 'ConcurrencyCommand',
        options,
        createdFields,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // TYPER COMMAND - Calculate eventtype field
    // ===========================================================================

    protected visitTyperCommand(ctx: any): AST.TyperCommand {
      // typer creates the 'eventtype' field
      const createdFields = ['eventtype'];

      return {
        type: 'TyperCommand',
        createdFields,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // NOMV COMMAND - Convert multivalue to single value
    // ===========================================================================

    protected visitNomvCommand(ctx: any): AST.NomvCommand {
      const children = ctx.children;
      const field = this.visitFieldOrWildcard(children.field[0]);

      return {
        type: 'NomvCommand',
        field,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // MAKECONTINUOUS COMMAND - Fill gaps in numeric sequences
    // ===========================================================================

    protected visitMakecontinuousCommand(ctx: any): AST.MakecontinuousCommand {
      const children = ctx.children;
      const options = new Map<string, string | number>();
      let field: AST.FieldReference | null = null;

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const nameToken = children.optionName[i];
          const name = this.getTokenImage(nameToken).toLowerCase();
          const valueToken = children.optionValue[i];

          if (valueToken.tokenType?.name === 'NumberLiteral') {
            options.set(name, parseFloat(this.getTokenImage(valueToken)));
          } else {
            options.set(name, this.getStringValue(valueToken));
          }
        }
      }

      // Get field if provided (positional)
      if (children.field) {
        field = this.visitFieldOrWildcard(children.field[0]);
      }

      return {
        type: 'MakecontinuousCommand',
        field,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // RELTIME COMMAND - Convert time to relative format
    // ===========================================================================

    protected visitReltimeCommand(ctx: any): AST.ReltimeCommand {
      // reltime creates the 'reltime' field
      const createdFields = ['reltime'];

      return {
        type: 'ReltimeCommand',
        createdFields,
        location: this.getLocation(ctx),
      };
    }
  };
