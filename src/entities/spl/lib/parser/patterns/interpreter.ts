/**
 * SPL Pattern Interpreter
 *
 * Interprets syntax patterns against AST nodes to extract field lineage information.
 * Walks pattern and AST simultaneously, extracting fields based on their effects.
 *
 * @module entities/spl/lib/parser/patterns/interpreter
 */

import type {
  SyntaxPattern,
  TypedParam,
  Literal,
  Sequence,
  Alternation,
  Group,
  PatternMatchResult,
  CommandSyntax,
} from './types';
import { extractFieldRefs, type Expression } from '@/entities/spl/lib/parser';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Context for pattern interpretation
 */
interface InterpretContext {
  /** Fields created by the command (fieldName -> dependencies) */
  creates: Map<string, string[]>;

  /** Fields consumed/read by the command */
  consumes: Set<string>;

  /** Fields modified in-place by the command (fieldName -> dependencies) */
  modifies: Map<string, string[]>;

  /** Fields used for grouping */
  groupsBy: Set<string>;

  /** Fields removed from the pipeline */
  drops: Set<string>;

  /** Parameter values extracted during interpretation (paramName -> field values) */
  paramValues: Map<string, string[]>;

  /** Whether pattern matching succeeded so far */
  matched: boolean;

  /** Error message if match failed */
  error?: string;
}

/**
 * Value extracted from AST node based on parameter type
 */
type ExtractedValue = string | string[] | number | boolean | null;

type CommandAstNode = {
  type: string;
  variant?: string;
  [key: string]: unknown;
};

type AnyAstNode = Record<string, unknown>;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Interpret a command syntax pattern against an AST node
 *
 * @param commandSyntax - The command syntax definition
 * @param astNode - The AST node to interpret
 * @returns Pattern match result with extracted fields
 *
 * @example
 * ```typescript
 * const result = interpretPattern(renameCommand, renameAstNode);
 * // result.creates = ['newField']
 * // result.consumes = ['oldField']
 * ```
 */
export function interpretPattern(
  commandSyntax: CommandSyntax,
  astNode: CommandAstNode
): PatternMatchResult {
  const ctx: InterpretContext = {
    creates: new Map(),
    consumes: new Set(),
    modifies: new Map(),
    groupsBy: new Set(),
    drops: new Set(),
    paramValues: new Map(),
    matched: true,
  };

  // Verify AST node type matches command
  const expectedType =
    commandSyntax.command.charAt(0).toUpperCase() +
    commandSyntax.command.slice(1) +
    'Command';
  if (astNode.type !== expectedType) {
    return {
      creates: [],
      consumes: [],
      modifies: [],
      groupsBy: [],
      drops: [],
      semantics: commandSyntax.semantics,
      matched: false,
      error: `AST node type '${astNode.type}' does not match command '${commandSyntax.command}'`,
    };
  }

  // Interpret the pattern
  interpretSyntaxPattern(commandSyntax.syntax, astNode, ctx);

  // Convert Map<string, string[]> to FieldWithDependencies[]
  const creates = Array.from(ctx.creates.entries()).map(([fieldName, dependsOn]) => ({
    fieldName,
    dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
  }));

  const modifies = Array.from(ctx.modifies.entries()).map(([fieldName, dependsOn]) => ({
    fieldName,
    dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
  }));

  // Resolve variant-specific semantics
  const semantics = resolveVariantSemantics(commandSyntax.semantics, astNode);

  return {
    creates,
    consumes: Array.from(ctx.consumes),
    modifies,
    groupsBy: Array.from(ctx.groupsBy),
    drops: Array.from(ctx.drops),
    semantics,
    matched: ctx.matched,
    error: ctx.error,
  };
}

// =============================================================================
// VARIANT SEMANTICS RESOLUTION
// =============================================================================

/**
 * Resolve variant-specific semantics from AST node
 *
 * If the AST node has a 'variant' field and the semantics define variantRules,
 * this function returns the variant-specific rules, replacing the base semantics.
 *
 * Example: StatsCommand has variant='eventstats' → use variantRules['eventstats']
 *
 * @param baseSemantics - The base command semantics
 * @param astNode - The AST node (may have a variant field)
 * @returns Resolved semantics with variant rules applied
 */
function resolveVariantSemantics(
  baseSemantics: CommandSyntax['semantics'],
  astNode: CommandAstNode
): CommandSyntax['semantics'] | undefined {
  if (!baseSemantics) {
    return undefined;
  }

  // Check if AST node has a variant field
  const variant = astNode.variant;
  if (!variant || !baseSemantics.variantRules) {
    // No variant or no variant rules - return base semantics without variantRules
    const cleanSemantics = { ...baseSemantics };
    delete (cleanSemantics as { variantRules?: unknown }).variantRules;
    return cleanSemantics;
  }

  // Get variant-specific rules
  const variantRule = baseSemantics.variantRules[variant];
  if (!variantRule) {
    // No rules for this variant - return base semantics without variantRules
    const cleanSemantics = { ...baseSemantics };
    delete (cleanSemantics as { variantRules?: unknown }).variantRules;
    return cleanSemantics;
  }

  // Return variant-specific rules (completely replace base semantics)
  return variantRule;
}

// =============================================================================
// PATTERN INTERPRETATION
// =============================================================================

/**
 * Recursively interpret a syntax pattern against an AST node
 */
function interpretSyntaxPattern(
  pattern: SyntaxPattern,
  astNode: AnyAstNode,
  ctx: InterpretContext
): void {
  if (!ctx.matched) {
    return; // Stop processing if already failed
  }

  switch (pattern.kind) {
    case 'param':
      interpretParam(pattern, astNode, ctx);
      break;

    case 'literal':
      interpretLiteral(pattern, astNode, ctx);
      break;

    case 'sequence':
      interpretSequence(pattern, astNode, ctx);
      break;

    case 'alternation':
      interpretAlternation(pattern, astNode, ctx);
      break;

    case 'group':
      interpretGroup(pattern, astNode, ctx);
      break;

    default: {
      ctx.matched = false;
      const kind = (pattern as { kind?: unknown }).kind ?? 'unknown';
      ctx.error = `Unknown pattern kind: ${String(kind)}`;
    }
  }
}

/**
 * Interpret a typed parameter
 */
function interpretParam(
  pattern: TypedParam,
  astNode: AnyAstNode,
  ctx: InterpretContext
): void {
  // Extract value based on parameter name and type
  const value = extractParamValue(pattern, astNode);

  if (value === null || value === undefined) {
    // If optional, this is OK
    if (pattern.quantifier === '?') {
      return;
    }

    // Otherwise, it's a match failure
    ctx.matched = false;
    ctx.error = `Required parameter '${pattern.name || pattern.type}' not found in AST node`;
    return;
  }

  // Store parameter value for dependency resolution (if param has a name)
  if (pattern.name && isFieldType(pattern.type)) {
    const fieldNames = normalizeToFieldNames(value);
    ctx.paramValues.set(pattern.name, fieldNames);
  }

  // Apply field effect if this is a field-related parameter
  if (pattern.effect && isFieldType(pattern.type)) {
    applyFieldEffect(value, pattern, astNode, ctx);
  }
}

/**
 * Interpret a literal keyword/symbol
 *
 * Note: Literals are structural and don't directly map to AST nodes.
 * They're implicitly present if the command parsed successfully.
 */
function interpretLiteral(
  _pattern: Literal,
  _astNode: AnyAstNode,
  _ctx: InterpretContext
): void {
  // Literals like "as", "by", "=" are already validated by the parser
  // If we reached this AST node, the literal was matched successfully
  // No action needed
}

/**
 * Interpret a sequence of patterns
 */
function interpretSequence(
  pattern: Sequence,
  astNode: AnyAstNode,
  ctx: InterpretContext
): void {
  // Process each sub-pattern in sequence
  for (const subPattern of pattern.patterns) {
    interpretSyntaxPattern(subPattern, astNode, ctx);
    if (!ctx.matched) {
      break;
    }
  }
}

/**
 * Interpret an alternation (choice between options)
 */
function interpretAlternation(
  pattern: Alternation,
  astNode: AnyAstNode,
  ctx: InterpretContext
): void {
  // Try each option until one matches
  for (const option of pattern.options) {
    const attemptCtx: InterpretContext = {
      creates: new Map(),
      consumes: new Set(),
      modifies: new Map(),
      groupsBy: new Set(),
      drops: new Set(),
      paramValues: new Map(),
      matched: true,
    };

    interpretSyntaxPattern(option, astNode, attemptCtx);

    if (attemptCtx.matched) {
      // Merge successful match into main context
      attemptCtx.creates.forEach((deps, f) => ctx.creates.set(f, deps));
      attemptCtx.consumes.forEach(f => ctx.consumes.add(f));
      attemptCtx.modifies.forEach((deps, f) => ctx.modifies.set(f, deps));
      attemptCtx.groupsBy.forEach(f => ctx.groupsBy.add(f));
      attemptCtx.drops.forEach(f => ctx.drops.add(f));
      attemptCtx.paramValues.forEach((val, key) => ctx.paramValues.set(key, val));
      return;
    }
  }

  // None of the options matched
  ctx.matched = false;
  ctx.error = 'None of the alternation options matched';
}

/**
 * Interpret a grouped pattern with quantifier
 *
 * For groups with + or *, we look for an array in the AST that corresponds to the repeated structure.
 * For rename command with `(<wc-field> as <wc-field>)+`, the AST has `renamings: [...]`
 */
function interpretGroup(
  pattern: Group,
  astNode: AnyAstNode,
  ctx: InterpretContext
): void {
  const quantifier = pattern.quantifier || '1';

  if (quantifier === '?') {
    // Optional: Try to match, but OK if it fails
    const attemptCtx: InterpretContext = {
      creates: new Map(),
      consumes: new Set(),
      modifies: new Map(),
      groupsBy: new Set(),
      drops: new Set(),
      paramValues: new Map(),
      matched: true,
    };

    interpretSyntaxPattern(pattern.pattern, astNode, attemptCtx);

    if (attemptCtx.matched) {
      // Merge successful match
      attemptCtx.creates.forEach((deps, f) => ctx.creates.set(f, deps));
      attemptCtx.consumes.forEach(f => ctx.consumes.add(f));
      attemptCtx.modifies.forEach((deps, f) => ctx.modifies.set(f, deps));
      attemptCtx.groupsBy.forEach(f => ctx.groupsBy.add(f));
      attemptCtx.drops.forEach(f => ctx.drops.add(f));
      attemptCtx.paramValues.forEach((val, key) => ctx.paramValues.set(key, val));
    }
    // Don't set ctx.matched = false if optional group doesn't match
  } else if (quantifier === '+' || quantifier === '*') {
    // One or more / Zero or more: Look for array in AST
    // For rename, this is the 'renamings' array
    const arrayField = findArrayField(pattern.pattern, astNode);

    if (!arrayField) {
      if (quantifier === '*') {
        // Zero or more - OK if not found
        return;
      } else {
        // One or more - must have at least one
        ctx.matched = false;
        ctx.error = 'Expected array field for + quantifier';
        return;
      }
    }

    // Process each element in the array
    for (const element of arrayField) {
      interpretSyntaxPattern(pattern.pattern, element, ctx);
      if (!ctx.matched) {
        break;
      }
    }
  } else {
    // Exactly one
    interpretSyntaxPattern(pattern.pattern, astNode, ctx);
  }
}

/**
 * Find an array field in AST node that corresponds to a repeated pattern
 *
 * For rename's `(<wc-field> as <wc-field>)+`, we look for the 'renamings' array
 */
function findArrayField(_pattern: SyntaxPattern, astNode: AnyAstNode): AnyAstNode[] | null {
  // Common array field names in AST
  const arrayFields = [
    'renamings',
    'assignments',
    'aggregations',
    'fields',
    'byFields',
    'sortFields',
    'inputMappings',
    'outputMappings',
  ];

  for (const fieldName of arrayFields) {
    const value = astNode[fieldName];
    if (Array.isArray(value) && value.length > 0) {
      return value as AnyAstNode[];
    }
  }

  return null;
}

// =============================================================================
// VALUE EXTRACTION
// =============================================================================

/**
 * Extract parameter value from AST node based on parameter type
 */
function extractParamValue(
  pattern: TypedParam,
  astNode: AnyAstNode
): ExtractedValue {
  const name = pattern.name;

  // Try to find value by parameter name or type-specific field
  switch (pattern.type) {
    case 'field':
    case 'wc-field':
    case 'evaled-field':
      return extractFieldValue(name, astNode);

    case 'field-list':
      return extractFieldList(name, astNode);

    case 'int':
    case 'num':
      return extractNumberValue(name, astNode);

    case 'string':
      return extractStringValue(name, astNode);

    case 'bool':
      return extractBooleanValue(name, astNode);

    case 'stats-func':
      return extractStatsFuncValue(name, astNode);

    case 'time-modifier':
      return extractTimeModifier(name, astNode);

    default:
      return null;
  }
}

/**
 * Extract a field name from AST node
 */
function extractFieldValue(
  name: string | undefined,
  astNode: AnyAstNode
): string | null {
  if (!name) {
    return null;
  }

  // Common field name locations in AST
  const fieldValue = astNode[name];

  if (typeof fieldValue === 'string') {
    return fieldValue;
  }

  // Handle FieldReference objects (fieldName) or generic objects (name)
  if (fieldValue && typeof fieldValue === 'object') {
    if ('fieldName' in fieldValue) {
      return (fieldValue as { fieldName: string }).fieldName;
    }
    if ('name' in fieldValue) {
      return (fieldValue as { name: string }).name;
    }
  }

  return null;
}

/**
 * Extract a list of field names from AST node
 */
function extractFieldList(
  name: string | undefined,
  astNode: AnyAstNode
): string[] | null {
  if (!name) {
    // Try common field list names
    const fields = astNode.fields || astNode.byFields || astNode.sortFields;
    return extractFieldsFromArray(fields);
  }

  const value = astNode[name];
  return extractFieldsFromArray(value);
}

/**
 * Extract field names from an array of FieldReference objects
 */
function extractFieldsFromArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const fields: string[] = [];

  for (const item of value) {
    if (typeof item === 'string') {
      fields.push(item);
    } else if (item && typeof item === 'object') {
      // Handle FieldReference (fieldName) or generic objects (name)
      if ('fieldName' in item) {
        fields.push(item.fieldName);
      } else if ('name' in item) {
        fields.push(item.name);
      }
    }
  }

  return fields.length > 0 ? fields : null;
}

/**
 * Extract a number value from AST node
 */
function extractNumberValue(
  name: string | undefined,
  astNode: AnyAstNode
): number | null {
  if (!name) {
    return null;
  }

  const value = astNode[name];

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  return null;
}

/**
 * Extract a string value from AST node
 */
function extractStringValue(
  name: string | undefined,
  astNode: AnyAstNode
): string | null {
  if (!name) {
    return null;
  }

  const value = astNode[name];
  return typeof value === 'string' ? value : null;
}

/**
 * Extract a boolean value from AST node
 */
function extractBooleanValue(
  name: string | undefined,
  astNode: AnyAstNode
): boolean | null {
  if (!name) {
    return null;
  }

  const value = astNode[name];
  return typeof value === 'boolean' ? value : null;
}

/**
 * Extract a stats function name from AST node
 */
function extractStatsFuncValue(
  name: string | undefined,
  astNode: AnyAstNode
): string | null {
  if (!name) {
    return null;
  }

  const value = astNode[name];
  return typeof value === 'string' ? value : null;
}

/**
 * Extract a time modifier from AST node
 */
function extractTimeModifier(
  name: string | undefined,
  astNode: AnyAstNode
): string | null {
  if (!name) {
    return null;
  }

  const value = astNode[name];
  return typeof value === 'string' ? value : null;
}

// =============================================================================
// FIELD EFFECTS
// =============================================================================

/**
 * Apply field effect to extracted value
 */
function applyFieldEffect(
  value: ExtractedValue,
  pattern: TypedParam,
  astNode: AnyAstNode,
  ctx: InterpretContext
): void {
  // Convert value to field names
  const fields = normalizeToFieldNames(value);

  // Resolve dependencies if specified
  const dependencies: string[] = [];

  // 1. Parameter-level dependencies (e.g., newField depends on oldField)
  if (pattern.dependsOn) {
    for (const paramName of pattern.dependsOn) {
      const paramFields = ctx.paramValues.get(paramName);
      if (paramFields) {
        dependencies.push(...paramFields);
      }
    }
  }

  // 2. Expression-level dependencies (e.g., analyze expression AST for field references)
  if (pattern.dependsOnExpression) {
    const expression = astNode[pattern.dependsOnExpression];
    if (expression && typeof expression === 'object') {
      try {
        const expressionFields = extractFieldRefs(expression as Expression);
        dependencies.push(...expressionFields);
      } catch (error) {
        // Expression analysis failed - log but continue
        console.warn(`[PatternInterpreter] Failed to analyze expression in '${pattern.dependsOnExpression}':`, error);
      }
    }
  }

  // Add to appropriate collection based on effect
  switch (pattern.effect) {
    case 'creates':
      fields.forEach(f => ctx.creates.set(f, dependencies));
      break;

    case 'consumes':
      fields.forEach(f => ctx.consumes.add(f));
      break;

    case 'modifies':
      fields.forEach(f => ctx.modifies.set(f, dependencies));
      break;

    case 'groups-by':
      fields.forEach(f => ctx.groupsBy.add(f));
      break;

    case 'drops':
      fields.forEach(f => ctx.drops.add(f));
      break;
  }
}

/**
 * Normalize extracted value to array of field names
 */
function normalizeToFieldNames(value: ExtractedValue): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(v => typeof v === 'string');
  }

  return [];
}

/**
 * Check if a param type represents a field
 */
function isFieldType(type: string): boolean {
  return (
    type === 'field' ||
    type === 'wc-field' ||
    type === 'evaled-field' ||
    type === 'field-list'
  );
}
