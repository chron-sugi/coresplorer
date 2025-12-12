/**
 * Pipeline Operations Mixin
 *
 * Visitor methods for commands that split, merge, or manipulate pipeline flow.
 * Handles subsearches, joins, iteration, and data generation.
 *
 * @module entities/spl/lib/parser/ast/visitors/pipeline-ops
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import type * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for pipeline operation commands.
 *
 * Commands handled:
 * - append: Append subsearch results to current results
 * - join: Join current results with subsearch results
 * - foreach: Iterate over fields and execute subsearch for each
 * - map: Apply search template to each event
 * - makeresults: Generate synthetic events
 * - gentimes: Generate time buckets
 * - union: Combine multiple datasets or subsearches
 */
export const PipelineOpsMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // APPEND COMMAND - Append subsearch results
    // ===========================================================================

    protected visitAppendCommand(ctx: any): AST.AppendCommand {
      const children = ctx.children;
      return {
        type: 'AppendCommand',
        subsearch: this.visitSubsearch(children.subsearch[0]),
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // APPENDCOLS COMMAND - Append subsearch fields as new columns
    // ===========================================================================

    protected visitAppendcolsCommand(ctx: any): AST.GenericCommand {
      const children = ctx.children;
      const subsearches: AST.Pipeline[] = [];

      if (children.subsearch) {
        for (const sub of children.subsearch) {
          subsearches.push(this.visitSubsearch(sub));
        }
      }

      return {
        type: 'GenericCommand',
        commandName: 'appendcols',
        subsearches,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // JOIN COMMAND - Join with subsearch
    // ===========================================================================

    protected visitJoinCommand(ctx: any): AST.JoinCommand {
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

    // ===========================================================================
    // FOREACH COMMAND - Iterate over fields
    // ===========================================================================

    protected visitForeachCommand(ctx: any): AST.ForeachCommand {
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

    // ===========================================================================
    // MAP COMMAND - Apply search to each event
    // ===========================================================================

    protected visitMapCommand(ctx: any): AST.MapCommand {
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

    // ===========================================================================
    // MAKERESULTS COMMAND - Generate synthetic events
    // ===========================================================================

    protected visitMakeresultsCommand(ctx: any): AST.MakeresultsCommand {
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

    // ===========================================================================
    // GENTIMES COMMAND - Generate time buckets
    // ===========================================================================

    protected visitGentimesCommand(ctx: any): AST.GentimesCommand {
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

    // ===========================================================================
    // UNION COMMAND - Combine multiple datasets
    // ===========================================================================

    protected visitUnionCommand(ctx: any): AST.UnionCommand {
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
    // MCOLLECT COMMAND - Write to metrics index
    // ===========================================================================

    protected visitMcollectCommand(ctx: any): AST.McollectCommand {
      const children = ctx.children;
      const options = new Map<string, string | boolean>();
      const fields: AST.FieldReference[] = [];

      // Parse options (name=value pairs) and fields
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

      // Parse fields
      if (children.fields) {
        for (const field of children.fields) {
          fields.push(this.visitFieldOrWildcard(field));
        }
      }

      return {
        type: 'McollectCommand',
        fields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // MEVENTCOLLECT COMMAND - Write events to metrics index
    // ===========================================================================

    protected visitMeventcollectCommand(ctx: any): AST.MeventcollectCommand {
      const children = ctx.children;
      const options = new Map<string, string | boolean>();

      // Parse options
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
        type: 'MeventcollectCommand',
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SELFJOIN COMMAND - Join pipeline with itself
    // ===========================================================================

    protected visitSelfjoinCommand(ctx: any): AST.SelfjoinCommand {
      const children = ctx.children;
      const options = new Map<string, string | number | boolean>();
      const fields: AST.FieldReference[] = [];

      // Parse options (name=value pairs) and fields
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

      // Parse fields
      if (children.fields) {
        for (const field of children.fields) {
          fields.push(this.visitFieldOrWildcard(field));
        }
      }

      return {
        type: 'SelfjoinCommand',
        fields,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // PIVOT COMMAND - Create pivot reports from data models
    // ===========================================================================

    protected visitPivotCommand(ctx: any): AST.PivotCommand {
      const children = ctx.children;
      const elements: string[] = [];

      // Parse pivot elements
      if (children.elements) {
        for (const elem of children.elements) {
          elements.push(this.getStringValue(elem));
        }
      }

      return {
        type: 'PivotCommand',
        datamodel: this.getTokenImage(children.datamodel[0]),
        dataset: this.getTokenImage(children.dataset[0]),
        elements,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // SUBSEARCH HELPER
    // ===========================================================================

    protected visitSubsearch(ctx: any): AST.Pipeline {
      const children = ctx.children;
      return (this as any).visitPipeline(children.inner[0]);
    }
  };
