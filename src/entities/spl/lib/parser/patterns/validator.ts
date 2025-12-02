/**
 * Pattern Validation
 *
 * Validates syntax patterns to ensure they are well-formed and semantically correct.
 *
 * @module entities/spl/lib/parser/patterns/validator
 */

import type {
  SyntaxPattern,
  CommandSyntax,
  TypedParam,
  Literal,
  Sequence,
  Alternation,
  Group,
  ParamType,
  Quantifier,
  FieldEffect,
} from './types';

// =============================================================================
// VALIDATION RESULT
// =============================================================================

export interface ValidationResult {
  /** Whether the pattern is valid */
  valid: boolean;

  /** List of validation errors (empty if valid) */
  errors: ValidationError[];

  /** List of validation warnings (non-fatal issues) */
  warnings: ValidationWarning[];
}

export interface ValidationError {
  /** Error message */
  message: string;

  /** Path to the problematic node (for nested patterns) */
  path?: string;

  /** The invalid pattern node */
  node?: SyntaxPattern;
}

export interface ValidationWarning {
  /** Warning message */
  message: string;

  /** Path to the node */
  path?: string;
}

// =============================================================================
// VALID VALUES
// =============================================================================

const VALID_PARAM_TYPES: Set<ParamType> = new Set([
  'field',
  'wc-field',
  'evaled-field',
  'field-list',
  'int',
  'num',
  'string',
  'stats-func',
  'bool',
  'time-modifier',
]);

const VALID_QUANTIFIERS: Set<Quantifier> = new Set(['?', '+', '*', '1']);

const VALID_FIELD_EFFECTS: Set<FieldEffect> = new Set([
  'creates',
  'consumes',
  'modifies',
  'groups-by',
  'drops',
]);

// =============================================================================
// VALIDATORS
// =============================================================================

/**
 * Validate a command syntax definition
 *
 * @param syntax - The command syntax to validate
 * @returns Validation result
 */
export function validateCommandSyntax(syntax: CommandSyntax): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate command name
  if (!syntax.command || syntax.command.trim() === '') {
    errors.push({
      message: 'Command name is required and cannot be empty',
    });
  }

  // Validate syntax pattern
  const patternResult = validatePattern(syntax.syntax, 'syntax');
  errors.push(...patternResult.errors);
  warnings.push(...patternResult.warnings);

  // Validate examples (if provided)
  if (syntax.examples) {
    if (!Array.isArray(syntax.examples)) {
      errors.push({
        message: 'Examples must be an array of strings',
      });
    } else if (syntax.examples.length === 0) {
      warnings.push({
        message: 'Examples array is empty - consider adding usage examples',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a syntax pattern recursively
 *
 * @param pattern - The pattern to validate
 * @param path - Current path in the pattern tree (for error reporting)
 * @returns Validation result
 */
export function validatePattern(
  pattern: SyntaxPattern,
  path: string = 'root'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check pattern has a kind
  if (!pattern || !pattern.kind) {
    errors.push({
      message: 'Pattern must have a "kind" property',
      path,
      node: pattern,
    });
    return { valid: false, errors, warnings };
  }

  // Validate based on kind
  switch (pattern.kind) {
    case 'param':
      validateTypedParam(pattern, path, errors, warnings);
      break;

    case 'literal':
      validateLiteral(pattern, path, errors, warnings);
      break;

    case 'sequence':
      validateSequence(pattern, path, errors, warnings);
      break;

    case 'alternation':
      validateAlternation(pattern, path, errors, warnings);
      break;

    case 'group':
      validateGroup(pattern, path, errors, warnings);
      break;

    default:
      errors.push({
        message: `Unknown pattern kind: ${String((pattern as { kind?: unknown }).kind)}`,
        path,
        node: pattern,
      });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// NODE-SPECIFIC VALIDATORS
// =============================================================================

function validateTypedParam(
  pattern: TypedParam,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate type
  if (!pattern.type) {
    errors.push({
      message: 'TypedParam must have a "type" property',
      path,
      node: pattern,
    });
  } else if (!VALID_PARAM_TYPES.has(pattern.type)) {
    errors.push({
      message: `Invalid parameter type: "${pattern.type}". Must be one of: ${Array.from(VALID_PARAM_TYPES).join(', ')}`,
      path,
      node: pattern,
    });
  }

  // Validate quantifier (if present)
  if (pattern.quantifier && !VALID_QUANTIFIERS.has(pattern.quantifier)) {
    errors.push({
      message: `Invalid quantifier: "${pattern.quantifier}". Must be one of: ?, +, *, 1`,
      path,
      node: pattern,
    });
  }

  // Validate effect (if present)
  if (pattern.effect && !VALID_FIELD_EFFECTS.has(pattern.effect)) {
    errors.push({
      message: `Invalid field effect: "${pattern.effect}". Must be one of: ${Array.from(VALID_FIELD_EFFECTS).join(', ')}`,
      path,
      node: pattern,
    });
  }

  // Warn if field-related type has no effect
  if (
    (pattern.type === 'field' ||
      pattern.type === 'wc-field' ||
      pattern.type === 'evaled-field' ||
      pattern.type === 'field-list') &&
    !pattern.effect
  ) {
    warnings.push({
      message: `Field-related parameter "${pattern.name || 'unnamed'}" has no effect specified. Consider adding creates/consumes/modifies.`,
      path,
    });
  }
}

function validateLiteral(
  pattern: Literal,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate value
  if (!pattern.value || pattern.value.trim() === '') {
    errors.push({
      message: 'Literal must have a non-empty "value" property',
      path,
      node: pattern,
    });
  }

  // Validate quantifier (if present)
  if (pattern.quantifier && !VALID_QUANTIFIERS.has(pattern.quantifier)) {
    errors.push({
      message: `Invalid quantifier: "${pattern.quantifier}". Must be one of: ?, +, *, 1`,
      path,
      node: pattern,
    });
  }

  // Warn if literal has unusual quantifier
  if (pattern.quantifier === '+' || pattern.quantifier === '*') {
    warnings.push({
      message: `Literal "${pattern.value}" has repetition quantifier (${pattern.quantifier}). This is unusual - did you mean to group it?`,
      path,
    });
  }
}

function validateSequence(
  pattern: Sequence,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate patterns array
  if (!pattern.patterns) {
    errors.push({
      message: 'Sequence must have a "patterns" array',
      path,
      node: pattern,
    });
    return;
  }

  if (!Array.isArray(pattern.patterns)) {
    errors.push({
      message: 'Sequence "patterns" must be an array',
      path,
      node: pattern,
    });
    return;
  }

  if (pattern.patterns.length === 0) {
    errors.push({
      message: 'Sequence must have at least one pattern',
      path,
      node: pattern,
    });
    return;
  }

  // Validate quantifier (if present)
  if (pattern.quantifier && !VALID_QUANTIFIERS.has(pattern.quantifier)) {
    errors.push({
      message: `Invalid quantifier: "${pattern.quantifier}". Must be one of: ?, +, *, 1`,
      path,
      node: pattern,
    });
  }

  // Recursively validate child patterns
  pattern.patterns.forEach((child, index) => {
    const childPath = `${path}.patterns[${index}]`;
    const childResult = validatePattern(child, childPath);
    errors.push(...childResult.errors);
    warnings.push(...childResult.warnings);
  });

  // Warn if sequence has only one pattern
  if (pattern.patterns.length === 1) {
    warnings.push({
      message: 'Sequence has only one pattern - consider removing the sequence wrapper',
      path,
    });
  }
}

function validateAlternation(
  pattern: Alternation,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate options array
  if (!pattern.options) {
    errors.push({
      message: 'Alternation must have an "options" array',
      path,
      node: pattern,
    });
    return;
  }

  if (!Array.isArray(pattern.options)) {
    errors.push({
      message: 'Alternation "options" must be an array',
      path,
      node: pattern,
    });
    return;
  }

  if (pattern.options.length < 2) {
    warnings.push({
      message: 'Alternation typically has 2+ options',
      path,
      node: pattern,
    });
  }

  // Validate quantifier (if present)
  if (pattern.quantifier && !VALID_QUANTIFIERS.has(pattern.quantifier)) {
    errors.push({
      message: `Invalid quantifier: "${pattern.quantifier}". Must be one of: ?, +, *, 1`,
      path,
      node: pattern,
    });
  }

  // Recursively validate child patterns
  pattern.options.forEach((child, index) => {
    const childPath = `${path}.options[${index}]`;
    const childResult = validatePattern(child, childPath);
    errors.push(...childResult.errors);
    warnings.push(...childResult.warnings);
  });
}

function validateGroup(
  pattern: Group,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Validate pattern property
  if (!pattern.pattern) {
    errors.push({
      message: 'Group must have a "pattern" property',
      path,
      node: pattern,
    });
    return;
  }

  // Validate quantifier (if present)
  if (pattern.quantifier && !VALID_QUANTIFIERS.has(pattern.quantifier)) {
    errors.push({
      message: `Invalid quantifier: "${pattern.quantifier}". Must be one of: ?, +, *, 1`,
      path,
      node: pattern,
    });
  }

  // Warn if group has no quantifier (groups should usually have quantifiers)
  if (!pattern.quantifier || pattern.quantifier === '1') {
    warnings.push({
      message: 'Group has no quantifier - consider removing the group wrapper or adding a quantifier',
      path,
    });
  }

  // Recursively validate child pattern
  const childPath = `${path}.pattern`;
  const childResult = validatePattern(pattern.pattern, childPath);
  errors.push(...childResult.errors);
  warnings.push(...childResult.warnings);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate all patterns in a registry
 *
 * @param registry - Pattern registry to validate
 * @returns Map of command name to validation result
 */
export function validateRegistry(
  registry: Record<string, CommandSyntax>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [commandName, syntax] of Object.entries(registry)) {
    results[commandName] = validateCommandSyntax(syntax);
  }

  return results;
}

/**
 * Check if all patterns in a registry are valid
 *
 * @param registry - Pattern registry to validate
 * @returns true if all patterns are valid, false otherwise
 */
export function isRegistryValid(registry: Record<string, CommandSyntax>): boolean {
  const results = validateRegistry(registry);
  return Object.values(results).every(result => result.valid);
}

/**
 * Get summary of validation results
 *
 * @param results - Validation results for multiple patterns
 * @returns Summary string
 */
export function getValidationSummary(
  results: Record<string, ValidationResult>
): string {
  const commands = Object.keys(results);
  const validCount = Object.values(results).filter(r => r.valid).length;
  const invalidCount = commands.length - validCount;
  const totalErrors = Object.values(results).reduce(
    (sum, r) => sum + r.errors.length,
    0
  );
  const totalWarnings = Object.values(results).reduce(
    (sum, r) => sum + r.warnings.length,
    0
  );

  return `Validated ${commands.length} commands: ${validCount} valid, ${invalidCount} invalid. ${totalErrors} errors, ${totalWarnings} warnings.`;
}
