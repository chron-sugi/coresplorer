/**
 * Expression Rules
 * 
 * Arithmetic, logical, and comparison expressions used in eval/where.
 * Implements standard operator precedence.
 * 
 * @module entities/spl/lib/parser/grammar/rules/expressions
 */

import type { SPLParser } from '../types';
import * as t from '../../lexer/tokens';

export function applyExpressionRules(parser: SPLParser): void {
  /**
   * Top-level expression entry point.
   */
  parser.expression = parser.RULE('expression', () => {
    parser.SUBRULE(parser.orExpression);
  });

  /**
   * Logical OR: expr1 OR expr2
   */
  parser.orExpression = parser.RULE('orExpression', () => {
    parser.SUBRULE(parser.andExpression, { LABEL: 'lhs' });
    parser.MANY(() => {
      parser.CONSUME(t.Or);
      parser.SUBRULE2(parser.andExpression, { LABEL: 'rhs' });
    });
  });

  /**
   * Logical AND: expr1 AND expr2
   */
  parser.andExpression = parser.RULE('andExpression', () => {
    parser.SUBRULE(parser.comparisonExpression, { LABEL: 'lhs' });
    parser.MANY(() => {
      parser.CONSUME(t.And);
      parser.SUBRULE2(parser.comparisonExpression, { LABEL: 'rhs' });
    });
  });

  /**
   * Comparison operators: =, !=, <, <=, >, >=
   */
  parser.comparisonExpression = parser.RULE('comparisonExpression', () => {
    parser.SUBRULE(parser.additiveExpression, { LABEL: 'lhs' });
    parser.OPTION(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Equals, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.NotEquals, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.LessThan, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.LessThanOrEqual, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.GreaterThan, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.GreaterThanOrEqual, { LABEL: 'op' }) },
      ]);
      parser.SUBRULE2(parser.additiveExpression, { LABEL: 'rhs' });
    });
  });

  /**
   * Addition/subtraction: expr1 + expr2, expr1 - expr2
   * Also handles string concatenation with .
   */
  parser.additiveExpression = parser.RULE('additiveExpression', () => {
    parser.SUBRULE(parser.multiplicativeExpression, { LABEL: 'lhs' });
    parser.MANY(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Plus, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.Minus, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.Dot, { LABEL: 'op' }) },
      ]);
      parser.SUBRULE2(parser.multiplicativeExpression, { LABEL: 'rhs' });
    });
  });

  /**
   * Multiplication/division: expr1 * expr2, expr1 / expr2, expr1 % expr2
   */
  parser.multiplicativeExpression = parser.RULE('multiplicativeExpression', () => {
    parser.SUBRULE(parser.unaryExpression, { LABEL: 'lhs' });
    parser.MANY(() => {
      parser.OR([
        { ALT: () => parser.CONSUME(t.Multiply, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.Divide, { LABEL: 'op' }) },
        { ALT: () => parser.CONSUME(t.Modulo, { LABEL: 'op' }) },
      ]);
      parser.SUBRULE2(parser.unaryExpression, { LABEL: 'rhs' });
    });
  });

  /**
   * Unary operators: NOT expr, -expr
   */
  parser.unaryExpression = parser.RULE('unaryExpression', () => {
    parser.OR([
      {
        ALT: () => {
          parser.CONSUME(t.Not);
          parser.SUBRULE(parser.unaryExpression, { LABEL: 'operand' });
        },
      },
      {
        ALT: () => {
          parser.CONSUME(t.Minus);
          parser.SUBRULE2(parser.unaryExpression, { LABEL: 'operand' });
        },
      },
      { ALT: () => parser.SUBRULE(parser.primaryExpression) },
    ]);
  });

  /**
   * Primary expressions: literals, field refs, function calls, parenthesized
   *
   * Uses GATE predicates to distinguish function calls from bare literals/refs.
   * Handles both identifier-based function calls (e.g., count()) and
   * keyword-based function calls (e.g., true(), false(), null()).
   */
  parser.primaryExpression = parser.RULE('primaryExpression', () => {
    parser.OR([
      {
        // Function call: identifier immediately followed by (
        GATE: () => {
          const la1 = parser.LA(1);
          const la2 = parser.LA(2);
          return la1.tokenType === t.Identifier && la2.tokenType === t.LParen;
        },
        ALT: () => parser.SUBRULE(parser.functionCall),
      },
      {
        // Keyword function call: true(), false(), null() followed by (
        // In SPL, true()/false()/null() are valid function calls
        GATE: () => {
          const la1 = parser.LA(1);
          const la2 = parser.LA(2);
          const isKeywordFunc = la1.tokenType === t.True ||
                               la1.tokenType === t.False ||
                               la1.tokenType === t.Null;
          return isKeywordFunc && la2.tokenType === t.LParen;
        },
        ALT: () => parser.SUBRULE(parser.keywordFunctionCall),
      },
      {
        // Time function call: now() - TimeModifier token followed by (
        GATE: () => {
          const la1 = parser.LA(1);
          const la2 = parser.LA(2);
          return la1.tokenType === t.TimeModifier && la2.tokenType === t.LParen;
        },
        ALT: () => parser.SUBRULE(parser.timeFunctionCall),
      },
      { ALT: () => parser.SUBRULE(parser.parenExpression) },
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'value' }) },
      { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'value' }) },
      { ALT: () => parser.CONSUME(t.True, { LABEL: 'value' }) },
      { ALT: () => parser.CONSUME(t.False, { LABEL: 'value' }) },
      { ALT: () => parser.CONSUME(t.Null, { LABEL: 'value' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'fieldRef' }) },
      // Allow 'field' keyword to be used as a field reference in expressions
      { ALT: () => parser.CONSUME(t.Field, { LABEL: 'fieldRef' }) },
    ]);
  });

  /**
   * Parenthesized expression: (expr)
   */
  parser.parenExpression = parser.RULE('parenExpression', () => {
    parser.CONSUME(t.LParen);
    parser.SUBRULE(parser.expression);
    parser.CONSUME(t.RParen);
  });

  /**
   * Function call: func(arg1, arg2, ...)
   */
  parser.functionCall = parser.RULE('functionCall', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'funcName' });
    parser.CONSUME(t.LParen);
    parser.OPTION(() => {
      parser.SUBRULE(parser.expression, { LABEL: 'args' });
      parser.MANY(() => {
        parser.CONSUME(t.Comma);
        parser.SUBRULE2(parser.expression, { LABEL: 'args' });
      });
    });
    parser.CONSUME(t.RParen);
  });

  /**
   * Keyword function call: true(), false(), null()
   * In SPL, these keywords can also be used as function calls.
   */
  parser.keywordFunctionCall = parser.RULE('keywordFunctionCall', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.True, { LABEL: 'funcName' }) },
      { ALT: () => parser.CONSUME(t.False, { LABEL: 'funcName' }) },
      { ALT: () => parser.CONSUME(t.Null, { LABEL: 'funcName' }) },
    ]);
    parser.CONSUME(t.LParen);
    parser.OPTION(() => {
      parser.SUBRULE(parser.expression, { LABEL: 'args' });
      parser.MANY(() => {
        parser.CONSUME(t.Comma);
        parser.SUBRULE2(parser.expression, { LABEL: 'args' });
      });
    });
    parser.CONSUME(t.RParen);
  });

  /**
   * Time function call: now(), relative_time()
   * These are tokenized as TimeModifier but can be used as functions.
   */
  parser.timeFunctionCall = parser.RULE('timeFunctionCall', () => {
    parser.CONSUME(t.TimeModifier, { LABEL: 'funcName' });
    parser.CONSUME(t.LParen);
    parser.OPTION(() => {
      parser.SUBRULE(parser.expression, { LABEL: 'args' });
      parser.MANY(() => {
        parser.CONSUME(t.Comma);
        parser.SUBRULE2(parser.expression, { LABEL: 'args' });
      });
    });
    parser.CONSUME(t.RParen);
  });
}
