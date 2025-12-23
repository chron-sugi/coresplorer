/**
 * Extraction Mixin
 *
 * Visitor methods for commands that extract data from fields.
 * Handles XML, XPath, and key-value extraction commands.
 *
 * @module entities/spl/lib/parser/ast/visitors/extraction
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import type * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for extraction commands.
 *
 * Commands handled:
 * - xpath: Extract values using XPath expressions
 * - xmlkv: Extract XML key-value pairs
 * - xmlunescape: Unescape XML entities
 * - multikv: Extract key-value pairs from table-formatted events
 * - erex: Example-based field extraction
 * - kv: Key-value pair extraction
 */
export const ExtractionMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // XPATH COMMAND - XPath expression extraction
    // ===========================================================================

    protected visitXpathCommand(ctx: any): AST.XpathCommand {
      const children = ctx.children;
      let field = '_raw';
      let fieldRef: AST.FieldReference | null = null;
      let outfield: string | null = null;
      let defaultValue: string | null = null;
      let xpathExpr: string | null = null;

      // Parse the xpath expression (string literal)
      if (children.xpathExpr) {
        xpathExpr = this.getStringValue(children.xpathExpr[0]);
      }

      // Parse options
      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'field') {
            field = this.getStringValue(valueToken);
            // Capture fieldRef with location for underline positioning
            // Offset by 1 if quoted (token includes quote but getStringValue strips it)
            const tokenImage = this.getTokenImage(valueToken);
            const isQuoted = tokenImage.startsWith('"') || tokenImage.startsWith("'");
            const columnOffset = isQuoted ? 1 : 0;
            fieldRef = {
              type: 'FieldReference',
              fieldName: field,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: (valueToken.startColumn ?? 1) + columnOffset,
                endLine: valueToken.endLine ?? 1,
                endColumn: (valueToken.endColumn ?? 1) - columnOffset,
                startOffset: (valueToken.startOffset ?? 0) + columnOffset,
                endOffset: (valueToken.endOffset ?? 0) - columnOffset,
              },
            };
          } else if (name === 'outfield') {
            outfield = this.getStringValue(valueToken);
          } else if (name === 'default') {
            defaultValue = this.getStringValue(valueToken);
          }
        }
      }

      return {
        type: 'XpathCommand',
        xpathExpr,
        field,
        fieldRef,
        outfield,
        defaultValue,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // XMLKV COMMAND - XML key-value extraction
    // ===========================================================================

    protected visitXmlkvCommand(ctx: any): AST.XmlkvCommand {
      const children = ctx.children;
      let field = '_raw';
      let fieldRef: AST.FieldReference | null = null;
      let maxinputs: number | null = null;
      const options: Record<string, string | number> = {};

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'field') {
            field = this.getStringValue(valueToken);
            // Capture fieldRef with location for underline positioning
            // Offset by 1 if quoted (token includes quote but getStringValue strips it)
            const tokenImage = this.getTokenImage(valueToken);
            const isQuoted = tokenImage.startsWith('"') || tokenImage.startsWith("'");
            const columnOffset = isQuoted ? 1 : 0;
            fieldRef = {
              type: 'FieldReference',
              fieldName: field,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: (valueToken.startColumn ?? 1) + columnOffset,
                endLine: valueToken.endLine ?? 1,
                endColumn: (valueToken.endColumn ?? 1) - columnOffset,
                startOffset: (valueToken.startOffset ?? 0) + columnOffset,
                endOffset: (valueToken.endOffset ?? 0) - columnOffset,
              },
            };
          } else if (name === 'maxinputs') {
            maxinputs = parseInt(this.getTokenImage(valueToken), 10);
          } else if (valueToken.tokenType?.name === 'NumberLiteral') {
            options[name] = parseFloat(this.getTokenImage(valueToken));
          } else {
            options[name] = this.getStringValue(valueToken);
          }
        }
      }

      return {
        type: 'XmlkvCommand',
        field,
        fieldRef,
        maxinputs,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // XMLUNESCAPE COMMAND - XML entity unescaping
    // ===========================================================================

    protected visitXmlunescapeCommand(ctx: any): AST.XmlunescapeCommand {
      const children = ctx.children;
      let field = '_raw';
      let fieldRef: AST.FieldReference | null = null;

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'field') {
            field = this.getStringValue(valueToken);
            // Capture fieldRef with location for underline positioning
            // Offset by 1 if quoted (token includes quote but getStringValue strips it)
            const tokenImage = this.getTokenImage(valueToken);
            const isQuoted = tokenImage.startsWith('"') || tokenImage.startsWith("'");
            const columnOffset = isQuoted ? 1 : 0;
            fieldRef = {
              type: 'FieldReference',
              fieldName: field,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: (valueToken.startColumn ?? 1) + columnOffset,
                endLine: valueToken.endLine ?? 1,
                endColumn: (valueToken.endColumn ?? 1) - columnOffset,
                startOffset: (valueToken.startOffset ?? 0) + columnOffset,
                endOffset: (valueToken.endOffset ?? 0) - columnOffset,
              },
            };
          }
        }
      }

      return {
        type: 'XmlunescapeCommand',
        field,
        fieldRef,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // MULTIKV COMMAND - Table-formatted key-value extraction
    // ===========================================================================

    protected visitMultikvCommand(ctx: any): AST.MultikvCommand {
      const children = ctx.children;
      let conf: string | null = null;
      let filter: string | null = null;
      let fields: string[] | null = null;
      let forceheader: number | null = null;
      let noheader = false;
      let rmorig = false;

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'conf') {
            conf = this.getStringValue(valueToken);
          } else if (name === 'filter') {
            filter = this.getStringValue(valueToken);
          } else if (name === 'fields') {
            // Fields can be comma-separated in a string
            const fieldsStr = this.getStringValue(valueToken);
            fields = fieldsStr.split(',').map((f) => f.trim());
          } else if (name === 'forceheader') {
            forceheader = parseInt(this.getTokenImage(valueToken), 10);
          } else if (name === 'noheader') {
            noheader = valueToken.tokenType?.name === 'True';
          } else if (name === 'rmorig') {
            rmorig = valueToken.tokenType?.name === 'True';
          }
        }
      }

      return {
        type: 'MultikvCommand',
        conf,
        filter,
        fields,
        forceheader,
        noheader,
        rmorig,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // EREX COMMAND - Example-based extraction
    // ===========================================================================

    protected visitErexCommand(ctx: any): AST.ErexCommand {
      const children = ctx.children;
      const targetField = this.visitFieldOrWildcard(children.targetField[0]);
      let fromfield: string | null = null;
      let fromfieldRef: AST.FieldReference | null = null;
      let examples: string | null = null;
      let counterexamples: string | null = null;
      let maxtrainers: number | null = null;

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'fromfield') {
            fromfield = this.getStringValue(valueToken);
            // Capture fromfieldRef with location for underline positioning
            // Offset by 1 if quoted (token includes quote but getStringValue strips it)
            const tokenImage = this.getTokenImage(valueToken);
            const isQuoted = tokenImage.startsWith('"') || tokenImage.startsWith("'");
            const columnOffset = isQuoted ? 1 : 0;
            fromfieldRef = {
              type: 'FieldReference',
              fieldName: fromfield,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: (valueToken.startColumn ?? 1) + columnOffset,
                endLine: valueToken.endLine ?? 1,
                endColumn: (valueToken.endColumn ?? 1) - columnOffset,
                startOffset: (valueToken.startOffset ?? 0) + columnOffset,
                endOffset: (valueToken.endOffset ?? 0) - columnOffset,
              },
            };
          } else if (name === 'examples') {
            examples = this.getStringValue(valueToken);
          } else if (name === 'counterexamples') {
            counterexamples = this.getStringValue(valueToken);
          } else if (name === 'maxtrainers') {
            maxtrainers = parseInt(this.getTokenImage(valueToken), 10);
          }
        }
      }

      return {
        type: 'ErexCommand',
        targetField,
        fromfield,
        fromfieldRef,
        examples,
        counterexamples,
        maxtrainers,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // KV COMMAND - Key-value extraction
    // ===========================================================================

    protected visitKvCommand(ctx: any): AST.KvCommand {
      const children = ctx.children;
      let field = '_raw';
      let fieldRef: AST.FieldReference | null = null;
      let pairdelim: string | null = null;
      let kvdelim: string | null = null;
      const options: Record<string, string | boolean> = {};

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'field') {
            field = this.getStringValue(valueToken);
            // Capture fieldRef with location for underline positioning
            // Offset by 1 if quoted (token includes quote but getStringValue strips it)
            const tokenImage = this.getTokenImage(valueToken);
            const isQuoted = tokenImage.startsWith('"') || tokenImage.startsWith("'");
            const columnOffset = isQuoted ? 1 : 0;
            fieldRef = {
              type: 'FieldReference',
              fieldName: field,
              isWildcard: false,
              location: {
                startLine: valueToken.startLine ?? 1,
                startColumn: (valueToken.startColumn ?? 1) + columnOffset,
                endLine: valueToken.endLine ?? 1,
                endColumn: (valueToken.endColumn ?? 1) - columnOffset,
                startOffset: (valueToken.startOffset ?? 0) + columnOffset,
                endOffset: (valueToken.endOffset ?? 0) - columnOffset,
              },
            };
          } else if (name === 'pairdelim') {
            pairdelim = this.getStringValue(valueToken);
          } else if (name === 'kvdelim') {
            kvdelim = this.getStringValue(valueToken);
          } else if (valueToken.tokenType?.name === 'True') {
            options[name] = true;
          } else if (valueToken.tokenType?.name === 'False') {
            options[name] = false;
          } else {
            options[name] = this.getStringValue(valueToken);
          }
        }
      }

      return {
        type: 'KvCommand',
        field,
        fieldRef,
        pairdelim,
        kvdelim,
        options,
        location: this.getLocation(ctx),
      };
    }

    // ===========================================================================
    // KVFORM COMMAND - Key-value form extraction
    // ===========================================================================

    protected visitKvformCommand(ctx: any): AST.KvformCommand {
      const children = ctx.children;
      let form: string | null = null;
      let sourceField = '_raw';

      if (children.optionName) {
        for (let i = 0; i < children.optionName.length; i++) {
          const name = this.getTokenImage(children.optionName[i]).toLowerCase();
          const valueToken = children.optionValue[i];

          if (name === 'form') {
            form = this.getStringValue(valueToken);
          } else if (name === 'field') {
            sourceField = this.getStringValue(valueToken);
          }
        }
      }

      return {
        type: 'KvformCommand',
        form,
        sourceField,
        location: this.getLocation(ctx),
      };
    }
  };
