/**
 * SPL Abstract Syntax Tree Type Definitions
 * 
 * These types represent the semantic structure of SPL searches,
 * optimized for field lineage tracking.
 * 
 * @module entities/spl/model/types
 */

// =============================================================================
// BASE TYPES
// =============================================================================

export interface SourceLocation {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  startOffset: number;
  endOffset: number;
}

export interface ASTNode {
  type: string;
  location: SourceLocation;
}

// =============================================================================
// TOP-LEVEL
// =============================================================================

export interface Pipeline extends ASTNode {
  type: 'Pipeline';
  stages: PipelineStage[];
}

export type PipelineStage = Command | SearchExpression;

// =============================================================================
// COMMANDS (Union type of all command types)
// =============================================================================

export type Command =
  | EvalCommand
  | StatsCommand
  | RenameCommand
  | RexCommand
  | LookupCommand
  | InputlookupCommand
  | SpathCommand
  | AddtotalsCommand
  | TableCommand
  | FieldsCommand
  | DedupCommand
  | AppendCommand
  | JoinCommand
  | WhereCommand
  | BinCommand
  | FillnullCommand
  | MvexpandCommand
  | TransactionCommand
  | GenericCommand;

// =============================================================================
// TIER 1: FIELD CREATORS/MODIFIERS
// =============================================================================

export interface EvalCommand extends ASTNode {
  type: 'EvalCommand';
  assignments: EvalAssignment[];
}

export interface EvalAssignment extends ASTNode {
  type: 'EvalAssignment';
  targetField: string;
  expression: Expression;
  /** Fields referenced in the expression (computed) */
  dependsOn: string[];
}

export interface StatsCommand extends ASTNode {
  type: 'StatsCommand';
  variant: 'stats' | 'eventstats' | 'streamstats' | 'chart' | 'timechart';
  aggregations: Aggregation[];
  byFields: FieldReference[];
  /** For eventstats/streamstats: fields are preserved, not dropped */
  preservesFields: boolean;
}

export interface Aggregation extends ASTNode {
  type: 'Aggregation';
  function: string;
  field: FieldReference | null;
  alias: string | null;
  /** The output field name (alias or derived from function/field) */
  outputField: string;
}

export interface RenameCommand extends ASTNode {
  type: 'RenameCommand';
  renamings: RenameMapping[];
}

export interface RenameMapping extends ASTNode {
  type: 'RenameMapping';
  oldField: FieldReference;
  newField: FieldReference;
}

export interface RexCommand extends ASTNode {
  type: 'RexCommand';
  sourceField: string;
  pattern: string;
  /** Fields extracted from named capture groups */
  extractedFields: string[];
  mode: 'extract' | 'sed';
}

export interface LookupCommand extends ASTNode {
  type: 'LookupCommand';
  lookupName: string;
  inputMappings: FieldMapping[];
  outputMappings: FieldMapping[];
  outputMode: 'OUTPUT' | 'OUTPUTNEW';
}

export interface FieldMapping extends ASTNode {
  type: 'FieldMapping';
  lookupField: string;
  eventField: string;
}

export interface InputlookupCommand extends ASTNode {
  type: 'InputlookupCommand';
  lookupName: string;
  /** Note: All fields come from lookup, unknown without schema */
}

export interface SpathCommand extends ASTNode {
  type: 'SpathCommand';
  inputField: string;
  outputField: string | null;
  path: string | null;
  /** Note: Extracted fields are dynamic, unknown without data */
}

export interface AddtotalsCommand extends ASTNode {
  type: 'AddtotalsCommand';
  /** Options: row, col, labelfield, label, fieldname */
  options: Map<string, string | boolean>;
  /** Fields to total (null means all numeric fields) */
  fields: FieldReference[] | null;
}

// =============================================================================
// TIER 2: FIELD FILTERS
// =============================================================================

export interface TableCommand extends ASTNode {
  type: 'TableCommand';
  fields: FieldReference[];
}

export interface FieldsCommand extends ASTNode {
  type: 'FieldsCommand';
  mode: 'keep' | 'remove';
  fields: FieldReference[];
}

export interface DedupCommand extends ASTNode {
  type: 'DedupCommand';
  fields: FieldReference[];
  count: number | null;
}

// =============================================================================
// TIER 3: PIPELINE SPLITTERS
// =============================================================================

export interface AppendCommand extends ASTNode {
  type: 'AppendCommand';
  subsearch: Pipeline;
}

export interface JoinCommand extends ASTNode {
  type: 'JoinCommand';
  joinType: 'inner' | 'outer' | 'left';
  joinFields: FieldReference[];
  subsearch: Pipeline;
}

// =============================================================================
// TIER 4: STRUCTURAL
// =============================================================================

export interface WhereCommand extends ASTNode {
  type: 'WhereCommand';
  condition: Expression;
  /** Fields referenced in condition (computed) */
  referencedFields: string[];
}

export interface BinCommand extends ASTNode {
  type: 'BinCommand';
  field: string;
  alias: string | null;
  span: string | number | null;
}

export interface FillnullCommand extends ASTNode {
  type: 'FillnullCommand';
  value: string | number | null;
  fields: FieldReference[];
}

export interface MvexpandCommand extends ASTNode {
  type: 'MvexpandCommand';
  field: string;
  limit: number | null;
}

export interface TransactionCommand extends ASTNode {
  type: 'TransactionCommand';
  fields: FieldReference[];
  /** Transaction creates these implicit fields */
  createdFields: ['duration', 'eventcount'];
}

export interface GenericCommand extends ASTNode {
  type: 'GenericCommand';
  commandName: string;
  /** Subsearches found within the command */
  subsearches: Pipeline[];
}

// =============================================================================
// EXPRESSIONS
// =============================================================================

export type Expression =
  | BinaryExpression
  | UnaryExpression
  | FunctionCall
  | FieldReference
  | Literal;

export interface BinaryExpression extends ASTNode {
  type: 'BinaryExpression';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression extends ASTNode {
  type: 'UnaryExpression';
  operator: 'NOT' | '-';
  operand: Expression;
}

export interface FunctionCall extends ASTNode {
  type: 'FunctionCall';
  functionName: string;
  arguments: Expression[];
}

export interface FieldReference extends ASTNode {
  type: 'FieldReference';
  fieldName: string;
  isWildcard: boolean;
}

export type Literal = StringLiteral | NumberLiteral | BooleanLiteral | NullLiteral;

export interface StringLiteral extends ASTNode {
  type: 'StringLiteral';
  value: string;
}

export interface NumberLiteral extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}

export interface BooleanLiteral extends ASTNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface NullLiteral extends ASTNode {
  type: 'NullLiteral';
}

// =============================================================================
// SEARCH EXPRESSIONS
// =============================================================================

export interface SearchExpression extends ASTNode {
  type: 'SearchExpression';
  terms: SearchTerm[];
  /** Fields referenced in comparisons */
  referencedFields: string[];
}

export type SearchTerm =
  | SearchComparison
  | SearchKeyword
  | SearchLogicalOp
  | SearchGroup
  | SearchSubsearch
  | MacroCall;

export interface SearchComparison extends ASTNode {
  type: 'SearchComparison';
  field: string;
  operator: '=' | '!=' | '<' | '>' | '<=' | '>=';
  value: string | number;
}

export interface SearchKeyword extends ASTNode {
  type: 'SearchKeyword';
  keyword: string;
}

export interface SearchLogicalOp extends ASTNode {
  type: 'SearchLogicalOp';
  operator: 'AND' | 'OR' | 'NOT';
}

export interface SearchGroup extends ASTNode {
  type: 'SearchGroup';
  expression: SearchExpression;
}

export interface SearchSubsearch extends ASTNode {
  type: 'SearchSubsearch';
  pipeline: Pipeline;
}

export interface MacroCall extends ASTNode {
  type: 'MacroCall';
  rawText: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Extract all field names from an expression */
export function extractFieldRefs(expr: Expression): string[] {
  switch (expr.type) {
    case 'FieldReference':
      return expr.isWildcard ? [] : [expr.fieldName];
    case 'BinaryExpression':
      return [...extractFieldRefs(expr.left), ...extractFieldRefs(expr.right)];
    case 'UnaryExpression':
      return extractFieldRefs(expr.operand);
    case 'FunctionCall':
      return expr.arguments.flatMap(extractFieldRefs);
    default:
      return [];
  }
}
