/**
 * Eval Command Handler
 * 
 * @module features/field-lineage/lib/command-handlers/eval
 */

import type { PipelineStage, EvalCommand, Expression } from '@/entities/spl/lib/parser';
import type { CommandFieldEffect, FieldCreation } from '../../model/field-lineage.types';
import type { FieldTracker } from '../field-tracker';
import { extractFieldRefs } from '@/entities/spl/lib/parser';

export function handleEvalCommand(
  stage: PipelineStage,
  _tracker: FieldTracker
): CommandFieldEffect {
  if (stage.type !== 'EvalCommand') {
    return { creates: [], modifies: [], consumes: [], drops: [] };
  }

  const command = stage as EvalCommand;
  const creates: FieldCreation[] = [];
  const consumes: string[] = [];

  for (const assignment of command.assignments) {
    const targetField = assignment.targetField;
    const dependsOn = assignment.dependsOn?.length
      ? assignment.dependsOn
      : extractFieldRefs(assignment.expression as Expression);

    // Collect all consumed fields
    consumes.push(...dependsOn);

    // Note: could check tracker.fieldExists(targetField) for overwrite detection

    creates.push({
      fieldName: targetField,
      dependsOn,
      expression: expressionToString(assignment.expression),
      dataType: inferDataType(assignment.expression),
      confidence: 'certain',
      line: assignment.location?.startLine,
      column: assignment.location?.startColumn,
    });
  }

  return {
    creates,
    modifies: [],
    consumes: [...new Set(consumes)],
    drops: [],
  };
}

/**
 * Convert expression to string representation.
 */
function expressionToString(expr: any): string {
  switch (expr.type) {
    case 'FunctionCall': {
      const args = expr.arguments.map(expressionToString).join(', ');
      return `${expr.functionName}(${args})`;
    }

    case 'BinaryExpression':
      return `${expressionToString(expr.left)} ${expr.operator} ${expressionToString(expr.right)}`;

    case 'UnaryExpression':
      return `${expr.operator}${expressionToString(expr.operand)}`;

    case 'FieldReference':
      return expr.fieldName;

    case 'StringLiteral':
      return `"${expr.value}"`;

    case 'NumberLiteral':
      return String(expr.value);

    case 'BooleanLiteral':
      return String(expr.value);

    case 'NullLiteral':
      return 'null';

    default:
      return '(expr)';
  }
}

/**
 * Infer data type from expression.
 */
function inferDataType(expr: any): 'string' | 'number' | 'boolean' | 'time' | 'unknown' {
  switch (expr.type) {
    case 'StringLiteral':
      return 'string';

    case 'NumberLiteral':
      return 'number';

    case 'BooleanLiteral':
      return 'boolean';

    case 'FunctionCall':
      return inferFunctionReturnType(expr.functionName);

    case 'BinaryExpression':
      // Comparison operators return boolean
      if (['=', '!=', '<', '>', '<=', '>='].includes(expr.operator)) {
        return 'boolean';
      }
      // Math operators return number
      if (['+', '-', '*', '/', '%'].includes(expr.operator)) {
        return 'number';
      }
      // Dot (concat) returns string
      if (expr.operator === '.') {
        return 'string';
      }
      return 'unknown';

    default:
      return 'unknown';
  }
}

/**
 * Infer return type of common SPL functions.
 */
function inferFunctionReturnType(funcName: string): 'string' | 'number' | 'boolean' | 'time' | 'unknown' {
  const stringFunctions = [
    'lower', 'upper', 'trim', 'ltrim', 'rtrim', 'substr', 'replace',
    'split', 'mvjoin', 'mvindex', 'coalesce', 'if', 'case', 'match',
    'tostring', 'urldecode', 'urlencode', 'md5', 'sha1', 'sha256',
  ];

  const numberFunctions = [
    'abs', 'ceil', 'floor', 'round', 'sqrt', 'pow', 'exp', 'log',
    'len', 'mvcount', 'tonumber', 'random', 'pi', 'sum', 'avg',
    'min', 'max', 'count', 'dc', 'exact', 'perc', 'stdev',
  ];

  const booleanFunctions = [
    'isnotnull', 'isnull', 'isnum', 'isstr', 'isint', 'like',
    'match', 'cidrmatch', 'searchmatch', 'in',
  ];

  const timeFunctions = [
    'now', 'time', 'relative_time', 'strptime', 'strftime',
  ];

  const lowerFunc = funcName.toLowerCase();

  if (stringFunctions.includes(lowerFunc)) return 'string';
  if (numberFunctions.includes(lowerFunc)) return 'number';
  if (booleanFunctions.includes(lowerFunc)) return 'boolean';
  if (timeFunctions.includes(lowerFunc)) return 'time';

  return 'unknown';
}
