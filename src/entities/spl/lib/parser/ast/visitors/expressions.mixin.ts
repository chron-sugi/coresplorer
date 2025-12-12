/**
 * Expressions Mixin
 *
 * Visitor methods for parsing SPL expressions and search terms.
 * Handles operator precedence, function calls, literals, and field references.
 *
 * @module entities/spl/lib/parser/ast/visitors/expressions
 */

import type { Constructor } from './mixin-types';
import type { BaseTransformer } from '../base-transformer';
import type * as AST from '../../../../model/types';

/**
 * Mixin providing visitor methods for expression parsing.
 *
 * Handles:
 * - Logical expressions (OR, AND, NOT)
 * - Comparison expressions (=, !=, <, >, <=, >=)
 * - Arithmetic expressions (+, -, *, /, %)
 * - Unary expressions (NOT, -)
 * - Function calls (regular, keyword, time functions)
 * - Literals (string, number, boolean, null)
 * - Field references
 * - Search expressions and terms
 */
export const ExpressionsMixin = <TBase extends Constructor<BaseTransformer>>(
  Base: TBase
) =>
  class extends Base {
    // ===========================================================================
    // EXPRESSION HIERARCHY - Top to bottom by precedence
    // ===========================================================================

    protected visitExpression(ctx: any): AST.Expression {
      return this.visitOrExpression(ctx.children);
    }

    protected visitOrExpression(children: any): AST.Expression {
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

    protected visitAndExpression(children: any): AST.Expression {
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

    protected visitComparisonExpression(children: any): AST.Expression {
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

    protected visitAdditiveExpression(children: any): AST.Expression {
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

    protected visitMultiplicativeExpression(children: any): AST.Expression {
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

    protected visitUnaryExpression(children: any): AST.Expression {
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

    protected visitPrimaryExpression(children: any): AST.Expression {
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

    // ===========================================================================
    // FUNCTION CALLS
    // ===========================================================================

    protected visitFunctionCall(ctx: any): AST.FunctionCall {
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
    protected visitKeywordFunctionCall(ctx: any): AST.FunctionCall {
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
    protected visitTimeFunctionCall(ctx: any): AST.FunctionCall {
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

    protected visitSearchExpression(ctx: any): AST.SearchExpression {
      const children = ctx.children;
      const terms: AST.SearchTerm[] = [];
      const referencedFields: string[] = [];

      if (children.searchTerm) {
        for (const term of children.searchTerm) {
          const parsed = this.visitSearchTerm(term);
          terms.push(parsed);

          if (parsed.type === 'SearchComparison' && !parsed.field.isWildcard) {
            referencedFields.push(parsed.field.fieldName);
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

    protected visitSearchTerm(ctx: any): AST.SearchTerm {
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
          pipeline: (this as any).visitSubsearch(children.subsearch[0]),
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
        const field = this.visitFieldOrWildcard(children.field[0]);
        const value = this.getStringValue(children.value);
        const operator = children.operator ? this.getTokenImage(children.operator) : '=';

        return {
          type: 'SearchComparison',
          field,
          operator,
          value,
          location: this.getLocation(ctx),
        };
      }

      // Wildcard search term
      if (children.wildcard) {
        return {
          type: 'SearchWildcard',
          pattern: this.getStringValue(children.wildcard),
          location: this.getLocation(ctx),
        };
      }

      // Fallback to text search
      return {
        type: 'SearchText',
        text: this.getTokenImage(children),
        location: this.getLocation(ctx),
      };
    }
  };
