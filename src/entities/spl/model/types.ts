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
  | OutputlookupCommand
  | IplocationCommand
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
  // New field filter commands
  | SortCommand
  | HeadCommand
  | TailCommand
  | ReverseCommand
  | RegexCommand
  // New aggregation commands
  | TopCommand
  | SitopCommand
  | RareCommand
  // New field operation commands
  | MakemvCommand
  | ConvertCommand
  | ReplaceCommand
  | AddinfoCommand
  | FieldformatCommand
  | CollectCommand
  // New subsearch/generator commands
  | ForeachCommand
  | MapCommand
  | MakeresultsCommand
  | GentimesCommand
  | ReturnCommand
  // Additional field creators
  | TstatsCommand
  | StrcatCommand
  | AccumCommand
  | DeltaCommand
  | AutoregressCommand
  | RangemapCommand
  | FilldownCommand
  | MvcombineCommand
  | UnionCommand
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

export interface OutputlookupCommand extends ASTNode {
  type: 'OutputlookupCommand';
  lookupName: string;
  /** Output fields to write to lookup */
  outputFields: FieldReference[];
  /** Whether to append to existing lookup */
  append: boolean;
  /** Options map */
  options: Map<string, string | boolean | number>;
}

export interface IplocationCommand extends ASTNode {
  type: 'IplocationCommand';
  /** IP field to lookup */
  ipField: string;
  /** Prefix for created fields (default: none) */
  prefix: string;
  /** Whether to include all geo fields */
  allFields: boolean;
  /** Created geo fields (city, country, lat, lon, region with prefix) */
  createdFields: string[];
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

// =============================================================================
// TIER 2A: ADDITIONAL FIELD FILTERS
// =============================================================================

export interface SortCommand extends ASTNode {
  type: 'SortCommand';
  fields: SortField[];
  limit: number | null;
}

export interface SortField {
  field: FieldReference;
  direction: 'asc' | 'desc';
}

export interface HeadCommand extends ASTNode {
  type: 'HeadCommand';
  limit: number;
  options: Map<string, boolean>;
}

export interface TailCommand extends ASTNode {
  type: 'TailCommand';
  limit: number;
}

export interface ReverseCommand extends ASTNode {
  type: 'ReverseCommand';
}

export interface RegexCommand extends ASTNode {
  type: 'RegexCommand';
  field: string | null;
  pattern: string;
  negate: boolean;
}

// =============================================================================
// TIER 1A: AGGREGATION COMMANDS
// =============================================================================

export interface TopCommand extends ASTNode {
  type: 'TopCommand';
  limit: number | null;
  fields: FieldReference[];
  byFields: FieldReference[];
  countField: string;
  percentField: string;
  showCount: boolean;
  showPercent: boolean;
}

export interface SitopCommand extends ASTNode {
  type: 'SitopCommand';
  limit: number | null;
  fields: FieldReference[];
  byFields: FieldReference[];
  countField: string;
  percentField: string;
  showCount: boolean;
  showPercent: boolean;
}

export interface RareCommand extends ASTNode {
  type: 'RareCommand';
  limit: number | null;
  fields: FieldReference[];
  byFields: FieldReference[];
  countField: string;
  percentField: string;
  showCount: boolean;
  showPercent: boolean;
}

// =============================================================================
// TIER 1B: ADDITIONAL FIELD OPERATIONS
// =============================================================================

export interface MakemvCommand extends ASTNode {
  type: 'MakemvCommand';
  field: string;
  options: Map<string, string | boolean>;
}

export interface ConvertCommand extends ASTNode {
  type: 'ConvertCommand';
  functions: ConvertFunction[];
  timeformat: string | null;
}

export interface ConvertFunction {
  func: string;
  field: string;
  alias: string | null;
}

export interface ReplaceCommand extends ASTNode {
  type: 'ReplaceCommand';
  replacements: ReplaceClause[];
}

export interface ReplaceClause {
  oldValue: string;
  newValue: string;
  fields: FieldReference[] | null;
}

export interface AddinfoCommand extends ASTNode {
  type: 'AddinfoCommand';
  /** Addinfo creates these implicit fields */
  createdFields: ['info_min_time', 'info_max_time', 'info_sid', 'info_search_time'];
}

export interface FieldformatCommand extends ASTNode {
  type: 'FieldformatCommand';
  field: string;
  expression: Expression;
}

export interface CollectCommand extends ASTNode {
  type: 'CollectCommand';
  options: Map<string, string | boolean>;
  fields: FieldReference[] | null;
}

// =============================================================================
// TIER 3A: ADDITIONAL PIPELINE SPLITTERS
// =============================================================================

export interface ForeachCommand extends ASTNode {
  type: 'ForeachCommand';
  fields: FieldReference[];
  options: Map<string, string>;
  body: Pipeline | null;
}

export interface MapCommand extends ASTNode {
  type: 'MapCommand';
  search: string | null;
  maxsearches: number | null;
}

export interface MakeresultsCommand extends ASTNode {
  type: 'MakeresultsCommand';
  count: number;
  annotate: boolean;
  /** Fields created depend on annotate option */
  createdFields: string[];
}

export interface GentimesCommand extends ASTNode {
  type: 'GentimesCommand';
  start: string | null;
  end: string | null;
  increment: string | null;
  /** Gentimes creates these implicit fields */
  createdFields: ['starttime', 'endtime'];
}

export interface ReturnCommand extends ASTNode {
  type: 'ReturnCommand';
  count: number | null;
  fields: FieldReference[];
}

// =============================================================================
// ADDITIONAL FIELD CREATORS
// =============================================================================

export interface TstatsCommand extends ASTNode {
  type: 'TstatsCommand';
  aggregations: Aggregation[];
  byFields: string[];
  datamodel?: string;
  whereClause?: Expression;
  options: Record<string, string | number | boolean>;
}

export interface StrcatCommand extends ASTNode {
  type: 'StrcatCommand';
  sourceFields: string[];
  targetField: string;
  options: Record<string, boolean>;
}

export interface AccumCommand extends ASTNode {
  type: 'AccumCommand';
  field: string;
  alias?: string;
}

export interface DeltaCommand extends ASTNode {
  type: 'DeltaCommand';
  field: string;
  alias?: string;
  period?: number;
}

export interface AutoregressCommand extends ASTNode {
  type: 'AutoregressCommand';
  field: string;
  alias?: string;
  pStart?: number;
  pEnd?: number;
}

export interface RangemapCommand extends ASTNode {
  type: 'RangemapCommand';
  field: string;
  ranges: Array<{ name: string; start: number; end: number }>;
  defaultValue?: string;
}

export interface FilldownCommand extends ASTNode {
  type: 'FilldownCommand';
  fields: string[];
}

export interface MvcombineCommand extends ASTNode {
  type: 'MvcombineCommand';
  field: string;
  delimiter?: string;
}

export interface UnionCommand extends ASTNode {
  type: 'UnionCommand';
  datasets: string[];
  subsearches: Pipeline[];
  options: Record<string, string | number>;
}

// =============================================================================
// GENERIC FALLBACK
// =============================================================================

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
