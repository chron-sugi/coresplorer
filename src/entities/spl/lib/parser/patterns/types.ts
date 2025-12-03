/**
 * SPL Command Syntax Pattern Types
 *
 * Type definitions for representing SPL command syntax patterns.
 *
 * These patterns serve as the single source of truth for:
 * - Command parameter types and positions
 * - Field identification (where fields appear in syntax)
 * - Semantic effects (creates/consumes/modifies)
 * - Grammar validation
 * - Documentation generation
 *
 * @module entities/spl/lib/parser/patterns/types
 */

// =============================================================================
// PARAMETER TYPES
// =============================================================================

/**
 * Parameter types for SPL command syntax patterns
 */
export type ParamType =
  | 'field'           // <field> - field name
  | 'wc-field'        // <wc-field> - wildcard field (foo*)
  | 'evaled-field'    // <evaled-field> - eval expression
  | 'field-list'      // Multiple comma-separated fields
  | 'int'             // <int> - integer value
  | 'num'             // <num> - numeric value (int or float)
  | 'string'          // <string> - string literal
  | 'stats-func'      // <stats-func> - count, avg, sum, max, min, etc.
  | 'bool'            // true/false boolean
  | 'time-modifier';  // -24h, @d, +1w@w, etc.

// =============================================================================
// BNF QUANTIFIERS
// =============================================================================

/**
 * BNF quantifiers for expressing pattern repetition
 *
 * - `?` - Optional (zero or one)
 * - `+` - One or more
 * - `*` - Zero or more
 * - `1` - Exactly one (default, can be omitted)
 */
export type Quantifier = '?' | '+' | '*' | '1';

// =============================================================================
// FIELD EFFECTS
// =============================================================================

/**
 * Semantic effect a parameter has on fields
 *
 * Used for field lineage tracking:
 * - `creates` - Creates a new field
 * - `consumes` - Reads/uses an existing field
 * - `modifies` - Modifies an existing field in-place
 * - `groups-by` - Groups results by field (e.g., stats BY clause)
 * - `drops` - Removes a field from the pipeline
 */
export type FieldEffect = 'creates' | 'consumes' | 'modifies' | 'groups-by' | 'drops';

// =============================================================================
// PATTERN NODES (Compositional)
// =============================================================================

/**
 * Core syntax pattern types
 *
 * These are compositional - patterns can be nested to represent complex syntax.
 */
export type SyntaxPattern =
  | TypedParam       // <field>, <int>, etc.
  | Literal          // "as", "by", "(", ")"
  | Sequence         // A B C (ordered)
  | Alternation      // A | B (choice)
  | Group;           // (pattern)+ (grouping with quantifier)

/**
 * Typed parameter placeholder
 *
 * Represents a typed slot in the syntax (e.g., `<field>`, `<int>`)
 *
 * Example:
 * `bin <field>` → `{ kind: 'param', type: 'field' }`
 */
export interface TypedParam {
  kind: 'param';
  type: ParamType;
  name?: string;                    // Optional name for documentation/debugging
  quantifier?: Quantifier;          // Default: '1' (exactly one)
  effect?: FieldEffect;             // Semantic effect (for field lineage)
  dependsOn?: string[];             // Parameter names this field depends on (for creates/modifies)
  dependsOnExpression?: string;     // AST property name containing expression to analyze for dependencies
}

/**
 * Literal keyword or symbol
 *
 * Represents a fixed string in the syntax (keywords, operators, delimiters)
 *
 * Example:
 * `rename old as new` → `{ kind: 'literal', value: 'as' }`
 */
export interface Literal {
  kind: 'literal';
  value: string;                    // The literal text ("as", "by", "(", etc.)
  quantifier?: Quantifier;          // Default: '1'
  caseInsensitive?: boolean;        // Default: true for keywords
}

/**
 * Sequence of patterns (ordered)
 *
 * Represents patterns that must appear in order: A B C
 *
 * Example:
 * `bin <field> as <field>` → Sequence of [param, literal("as"), param]
 */
export interface Sequence {
  kind: 'sequence';
  patterns: SyntaxPattern[];        // Ordered list of sub-patterns
  quantifier?: Quantifier;          // Applied to entire sequence
}

/**
 * Alternation (choice between options)
 *
 * Represents choice: A | B
 *
 * Example:
 * `output|outputnew` → Alternation of [literal("output"), literal("outputnew")]
 */
export interface Alternation {
  kind: 'alternation';
  options: SyntaxPattern[];         // List of alternative patterns
  quantifier?: Quantifier;          // Applied to entire alternation
}

/**
 * Grouping with quantifier
 *
 * Represents grouped patterns with repetition: (A B)+
 *
 * Example:
 * `(<wc-field> as <wc-field>)+` → Group with quantifier '+'
 */
export interface Group {
  kind: 'group';
  pattern: SyntaxPattern;           // The grouped pattern
  quantifier?: Quantifier;          // Repetition for the group
}

// =============================================================================
// COMMAND SEMANTICS
// =============================================================================

/**
 * Command-level semantic behaviors
 *
 * Describes field lifecycle behaviors that can't be expressed in simple patterns.
 * Applied after pattern matching to enforce command-level rules.
 */
export interface CommandSemantics {
  /**
   * Drop all fields except the specified ones
   *
   * Used by: stats, chart, timechart
   * The command drops all pipeline fields except those explicitly preserved.
   *
   * Special values:
   * - 'byFields' - Preserve fields from BY clause
   * - 'creates' - Preserve newly created fields
   *
   * Example: stats avg(duration) BY host
   * - Drops all fields except 'host' (byFields) and 'avg(duration)' (creates)
   */
  dropsAllExcept?: ('byFields' | 'creates')[];

  /**
   * Preserve all existing fields
   *
   * Used by: eventstats, streamstats
   * The command adds new fields but preserves all existing fields in the pipeline.
   */
  preservesAll?: boolean;

  /**
   * Static field creations (fields always created by command)
   *
   * Used for commands that create known output fields regardless of input.
   * Example: rangemap always creates 'range' field
   */
  staticCreates?: Array<{
    fieldName: string;
    dependsOn?: string[];
  }>;

  /**
   * Variant-specific semantic rules
   *
   * Some commands have different behaviors based on their variant.
   * Example: stats drops fields, but eventstats preserves them.
   */
  variantRules?: {
    [variant: string]: Partial<CommandSemantics>;
  };
}

// =============================================================================
// COMMAND SYNTAX DEFINITION
// =============================================================================

/**
 * Complete syntax definition for an SPL command
 *
 * This is the primary interface for defining command patterns.
 * Only includes properties actually used by the parser and field-lineage systems.
 *
 * Example:
 * ```typescript
 * const renameCommand: CommandSyntax = {
 *   command: 'rename',
 *   syntax: {
 *     kind: 'group',
 *     quantifier: '+',
 *     pattern: {
 *       kind: 'sequence',
 *       patterns: [
 *         { kind: 'param', type: 'wc-field', effect: 'consumes' },
 *         { kind: 'literal', value: 'as' },
 *         { kind: 'param', type: 'wc-field', effect: 'creates' },
 *       ]
 *     }
 *   }
 * };
 * ```
 */
export interface CommandSyntax {
  /** Command name (e.g., 'bin', 'rename', 'stats') */
  command: string;

  /** Syntax pattern defining command structure */
  syntax: SyntaxPattern;

  /** Command-level semantic behaviors (optional) */
  semantics?: CommandSemantics;

  /**
   * Grammar support status for this command
   *
   * - 'dedicated': Has a dedicated grammar rule that produces a typed AST node
   *   (e.g., StatsCommand) enabling accurate field lineage tracking
   * - 'needed': Would benefit from a dedicated grammar rule but currently uses
   *   genericCommand fallback. Priority for future grammar work.
   * - 'generic': Simple enough that genericCommand is sufficient. No dedicated
   *   grammar rule needed.
   */
  grammarSupport: 'dedicated' | 'needed' | 'generic';

  /** Category (optional - managed externally, kept empty string in patterns) */
  category?: string;

  /** Human-readable description (optional) */
  description?: string;

  /** Usage examples (optional) */
  examples?: string[];

  /** Related command names (optional) */
  related?: string[];

  /** Search tags (optional) */
  tags?: string[];
}

// =============================================================================
// PATTERN REGISTRY
// =============================================================================

/**
 * Registry of all command syntax patterns
 *
 * Maps command names to their syntax definitions
 */
export type PatternRegistry = Record<string, CommandSyntax>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for TypedParam
 */
export function isTypedParam(pattern: SyntaxPattern): pattern is TypedParam {
  return pattern.kind === 'param';
}

/**
 * Type guard for Literal
 */
export function isLiteral(pattern: SyntaxPattern): pattern is Literal {
  return pattern.kind === 'literal';
}

/**
 * Type guard for Sequence
 */
export function isSequence(pattern: SyntaxPattern): pattern is Sequence {
  return pattern.kind === 'sequence';
}

/**
 * Type guard for Alternation
 */
export function isAlternation(pattern: SyntaxPattern): pattern is Alternation {
  return pattern.kind === 'alternation';
}

/**
 * Type guard for Group
 */
export function isGroup(pattern: SyntaxPattern): pattern is Group {
  return pattern.kind === 'group';
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Field with dependency information
 */
export interface FieldWithDependencies {
  /** Field name */
  fieldName: string;

  /** Fields this field depends on */
  dependsOn?: string[];
}

/**
 * Result of interpreting a pattern against an AST
 */
export interface PatternMatchResult {
  /** Fields created by the command (with dependencies) */
  creates: FieldWithDependencies[];

  /** Fields consumed/read by the command */
  consumes: string[];

  /** Fields modified in-place by the command (with dependencies) */
  modifies: FieldWithDependencies[];

  /** Fields used for grouping */
  groupsBy: string[];

  /** Fields removed from the pipeline */
  drops: string[];

  /** Command-level semantic behaviors (if any) */
  semantics?: CommandSemantics;

  /** Whether the pattern matched successfully */
  matched: boolean;

  /** Error message if match failed */
  error?: string;
}
