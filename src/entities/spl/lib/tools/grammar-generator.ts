/**
 * Grammar Rule Generator
 *
 * Generates Chevrotain parser rules from CommandSyntax patterns
 *
 * @module entities/spl/lib/tools/grammar-generator
 */

import type { CommandSyntax, SyntaxPattern } from '../parser/patterns/types';

// =============================================================================
// GRAMMAR RULE GENERATOR
// =============================================================================

/**
 * Generate Chevrotain rule code from CommandSyntax pattern
 *
 * @param pattern - CommandSyntax pattern
 * @returns TypeScript code for Chevrotain rule
 */
export function generateGrammarRule(pattern: CommandSyntax): string {
  const ruleName = `${pattern.command}Command`;
  const commandToken = capitalize(pattern.command);

  // Generate the rule body
  const ruleBody = generateRuleBody(pattern.syntax, pattern.command);

  return `/**
 * ${pattern.command} command
 *
 * ${pattern.description}
 *
 * Examples:
${pattern.examples?.map(ex => ` * - \`${ex}\``).join('\n') || ' * (no examples)'}
 */
parser.${ruleName} = parser.RULE('${ruleName}', () => {
  parser.CONSUME(t.${commandToken});
${ruleBody}
});`;
}

/**
 * Generate rule body from SyntaxPattern
 */
function generateRuleBody(pattern: SyntaxPattern, commandName: string, indent: number = 1): string {
  const indentStr = '  '.repeat(indent);

  switch (pattern.kind) {
    case 'param':
      return generateParamRule(pattern, indent);

    case 'literal':
      return generateLiteralRule(pattern, indent);

    case 'sequence':
      return pattern.patterns
        .map(p => generateRuleBody(p, commandName, indent))
        .filter(Boolean)
        .join('\n');

    case 'group':
      return generateGroupRule(pattern, commandName, indent);

    case 'alternation':
      return generateAlternationRule(pattern, commandName, indent);

    default:
      return `${indentStr}// TODO: Unsupported pattern kind: ${String((pattern as { kind?: unknown }).kind)}`;
  }
}

/**
 * Generate code for a parameter
 */
function generateParamRule(param: Extract<CommandSyntax['syntax'], { kind: 'param' }>, indent: number): string {
  const indentStr = '  '.repeat(indent);
  const token = mapParamTypeToToken(param.type);
  const label = param.name ? `, { LABEL: '${param.name}' }` : '';

  return `${indentStr}parser.CONSUME(t.${token}${label});`;
}

/**
 * Generate code for a literal
 */
function generateLiteralRule(literal: Extract<SyntaxPattern, { kind: 'literal' }>, indent: number): string {
  const indentStr = '  '.repeat(indent);
  const token = mapLiteralToToken(literal.value);

  // Skip command name literal (already consumed at start of rule)
  if (!token) return '';

  return `${indentStr}parser.CONSUME(t.${token});`;
}

/**
 * Generate code for a group (with quantifier)
 */
function generateGroupRule(group: Extract<SyntaxPattern, { kind: 'group' }>, commandName: string, indent: number): string {
  const indentStr = '  '.repeat(indent);
  const innerBody = generateRuleBody(group.pattern, commandName, indent + 1);

  switch (group.quantifier) {
    case '?':
      return `${indentStr}parser.OPTION(() => {\n${innerBody}\n${indentStr}});`;

    case '+':
      return `${indentStr}parser.AT_LEAST_ONE(() => {\n${innerBody}\n${indentStr}});`;

    case '*':
      return `${indentStr}parser.MANY(() => {\n${innerBody}\n${indentStr}});`;

    default:
      return innerBody;
  }
}

/**
 * Generate code for alternation (choice)
 */
function generateAlternationRule(alternation: Extract<SyntaxPattern, { kind: 'alternation' }>, commandName: string, indent: number): string {
  const indentStr = '  '.repeat(indent);

  const alts = alternation.options.map((option: SyntaxPattern) => {
    const altBody = generateRuleBody(option, commandName, indent + 1);
    return `${indentStr}  { ALT: () => {\n${altBody}\n${indentStr}  } }`;
  }).join(',\n');

  return `${indentStr}parser.OR([\n${alts}\n${indentStr}]);`;
}

/**
 * Map parameter type to token name
 */
function mapParamTypeToToken(type: string): string {
  const tokenMap: Record<string, string> = {
    'field': 'Identifier',
    'wc-field': 'Identifier',
    'evaled-field': 'expression',  // Use expression subrule
    'field-list': 'fieldList',      // Use fieldList subrule
    'int': 'NumberLiteral',
    'num': 'NumberLiteral',
    'string': 'StringLiteral',
    'bool': 'BooleanLiteral',
    'stats-func': 'Identifier',
    'time-modifier': 'StringLiteral',
  };

  return tokenMap[type] || 'Identifier';
}

/**
 * Map literal value to token name
 */
function mapLiteralToToken(value: string): string | null {
  // Common keywords mapped to tokens
  const keywordMap: Record<string, string> = {
    'as': 'As',
    'by': 'By',
    'AS': 'As',
    'BY': 'By',
    '=': 'Equals',
    ',': 'Comma',
    '(': 'LParen',
    ')': 'RParen',
    '|': 'Pipe',
  };

  return keywordMap[value] || null;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================================
// BATCH GENERATION
// =============================================================================

/**
 * Generate grammar rules for multiple commands
 *
 * @param patterns - Array of CommandSyntax patterns
 * @returns TypeScript code for all rules
 */
export function generateGrammarRules(patterns: CommandSyntax[]): string {
  const imports = `/**
 * Generated Grammar Rules
 *
 * Auto-generated from CommandSyntax patterns
 */

import type { SPLParser } from '../types';
import * as t from '../../lexer/tokens';

export function applyGeneratedCommands(parser: SPLParser): void {`;

  const rules = patterns.map(p => generateGrammarRule(p)).join('\n\n');

  const closing = `}`;

  return `${imports}\n${rules}\n${closing}\n`;
}

/**
 * Generate token definitions for commands
 *
 * @param patterns - Array of CommandSyntax patterns
 * @returns TypeScript code for token definitions
 */
export function generateCommandTokens(patterns: CommandSyntax[]): string {
  const tokenDefs = patterns.map(p => {
    const tokenName = capitalize(p.command);
    return `export const ${tokenName} = createToken({
  name: '${tokenName}',
  pattern: /${p.command}/i,
  categories: [CommandKeyword],
});`;
  }).join('\n\n');

  return `import { createToken } from 'chevrotain';
import { CommandKeyword } from './base-tokens';

${tokenDefs}

export const generatedCommandTokens = [
${patterns.map(p => `  ${capitalize(p.command)},`).join('\n')}
];
`;
}
