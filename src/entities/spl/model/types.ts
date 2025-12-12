/**
 * SPL Abstract Syntax Tree Type Definitions
 *
 * These types represent the semantic structure of SPL searches,
 * optimized for field lineage tracking.
 *
 * @module entities/spl/model/types
 */

import type { FieldConsumption } from '@/entities/field/model/lineage.types';

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
  // Phase 1 additions
  | SetfieldsCommand
  | TagsCommand
  | ContingencyCommand
  | XyseriesCommand
  | TimewrapCommand
  // Phase 2: Extraction commands
  | XpathCommand
  | XmlkvCommand
  | XmlunescapeCommand
  | MultikvCommand
  | ErexCommand
  | KvCommand
  // Phase 4: Needed commands
  | SichartCommand
  | SirareCommand
  | SistatsCommand
  | SitimechartCommand
  | MstatsCommand
  | McollectCommand
  | MeventcollectCommand
  | GeostatsCommand
  | KvformCommand
  | PivotCommand
  | SelfjoinCommand
  // Phase 5: Field-affecting commands
  | InputcsvCommand
  | FieldsummaryCommand
  | AddcoltotalsCommand
  | BucketdirCommand
  | GeomCommand
  | GeomfilterCommand
  | ConcurrencyCommand
  | TyperCommand
  | NomvCommand
  | MakecontinuousCommand
  | ReltimeCommand
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
  sourceField: FieldReference;
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
  ipField: FieldReference;
  /** Prefix for created fields (default: none) */
  prefix: string;
  /** Whether to include all geo fields */
  allFields: boolean;
  /** Created geo fields (City, Country, Region, lat, lon with prefix) */
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

export interface SetfieldsCommand extends ASTNode {
  type: 'SetfieldsCommand';
  /** Field assignments with their values */
  assignments: Array<{ field: string; value: string | number | boolean }>;
}

export interface TagsCommand extends ASTNode {
  type: 'TagsCommand';
  /** Output field name for tags (default: tag) */
  outputField: string;
  /** Include field name in tag output */
  inclName: boolean;
  /** Include field value in tag output */
  inclValue: boolean;
  /** Fields to tag (null means all) */
  fields: FieldReference[] | null;
}

export interface ContingencyCommand extends ASTNode {
  type: 'ContingencyCommand';
  /** Row field for contingency table */
  rowField: FieldReference;
  /** Column field for contingency table */
  colField: FieldReference;
  /** Options like mincount, maxrows, maxcols, usetotal */
  options: Record<string, string | number | boolean>;
}

export interface XyseriesCommand extends ASTNode {
  type: 'XyseriesCommand';
  /** X-axis field */
  xField: FieldReference;
  /** Y-axis field (values become columns) */
  yField: FieldReference;
  /** Y-value field (values populate cells) */
  yValueField: FieldReference;
  /** Options like grouped, sep, format */
  options: Record<string, string | boolean>;
}

export interface TimewrapCommand extends ASTNode {
  type: 'TimewrapCommand';
  /** Time span for wrapping (e.g., 1d, 7d) */
  timeSpan: string;
  /** Options like series, align */
  options: Record<string, string>;
}

// =============================================================================
// PHASE 2: EXTRACTION COMMANDS
// =============================================================================

export interface XpathCommand extends ASTNode {
  type: 'XpathCommand';
  /** XPath expression to extract values */
  xpathExpr: string | null;
  /** Source field (default: _raw) */
  field: string;
  /** Output field name */
  outfield: string | null;
  /** Default value if no match */
  defaultValue: string | null;
}

export interface XmlkvCommand extends ASTNode {
  type: 'XmlkvCommand';
  /** Source field (default: _raw) */
  field: string;
  /** Maximum inputs to process */
  maxinputs: number | null;
  /** Other options */
  options: Record<string, string | number>;
}

export interface XmlunescapeCommand extends ASTNode {
  type: 'XmlunescapeCommand';
  /** Field to unescape (default: _raw) */
  field: string;
}

export interface MultikvCommand extends ASTNode {
  type: 'MultikvCommand';
  /** Configuration file reference */
  conf: string | null;
  /** Filter for fields */
  filter: string | null;
  /** Specific fields to extract */
  fields: string[] | null;
  /** Force header at line N */
  forceheader: number | null;
  /** Whether to use header row */
  noheader: boolean;
  /** Remove original event */
  rmorig: boolean;
}

export interface ErexCommand extends ASTNode {
  type: 'ErexCommand';
  /** Target field to create */
  targetField: FieldReference;
  /** Source field for extraction */
  fromfield: string | null;
  /** Example values for learning */
  examples: string | null;
  /** Counter-example values */
  counterexamples: string | null;
  /** Maximum trainers to use */
  maxtrainers: number | null;
}

export interface KvCommand extends ASTNode {
  type: 'KvCommand';
  /** Source field (default: _raw) */
  field: string;
  /** Pair delimiter */
  pairdelim: string | null;
  /** Key-value delimiter */
  kvdelim: string | null;
  /** Other options */
  options: Record<string, string | boolean>;
}

// =============================================================================
// PHASE 4: NEEDED COMMANDS
// =============================================================================

// -----------------------------------------------------------------------------
// Summary Indexing Commands
// -----------------------------------------------------------------------------

export interface SichartCommand extends ASTNode {
  type: 'SichartCommand';
  /** Aggregation functions with fields and aliases */
  aggregations: Aggregation[];
  /** BY clause fields */
  byFields: FieldReference[];
  /** Command options */
  options: Map<string, string | number | boolean>;
}

export interface SirareCommand extends ASTNode {
  type: 'SirareCommand';
  /** Fields to analyze for rare values */
  fields: FieldReference[];
  /** BY clause fields */
  byFields: FieldReference[];
  /** Command options */
  options: Map<string, string | number | boolean>;
  /** Name of count output field */
  countField: string;
  /** Name of percent output field */
  percentField: string;
  /** Whether to show count */
  showCount: boolean;
  /** Whether to show percent */
  showPercent: boolean;
}

export interface SistatsCommand extends ASTNode {
  type: 'SistatsCommand';
  /** Aggregation functions with fields and aliases */
  aggregations: Aggregation[];
  /** BY clause fields */
  byFields: FieldReference[];
  /** Command options */
  options: Map<string, string | number | boolean>;
}

export interface SitimechartCommand extends ASTNode {
  type: 'SitimechartCommand';
  /** Aggregation functions with fields and aliases */
  aggregations: Aggregation[];
  /** BY clause fields */
  byFields: FieldReference[];
  /** Command options */
  options: Map<string, string | number | boolean>;
}

// -----------------------------------------------------------------------------
// Metrics Commands
// -----------------------------------------------------------------------------

export interface MstatsCommand extends ASTNode {
  type: 'MstatsCommand';
  /** Aggregation functions with fields and aliases */
  aggregations: Aggregation[];
  /** BY clause fields */
  byFields: FieldReference[];
  /** Command options (prestats, append, backfill, etc.) */
  options: Map<string, string | number | boolean>;
}

export interface McollectCommand extends ASTNode {
  type: 'McollectCommand';
  /** Fields to write to metrics index */
  fields: FieldReference[];
  /** Command options (index, file, spool, etc.) */
  options: Map<string, string | boolean>;
}

export interface MeventcollectCommand extends ASTNode {
  type: 'MeventcollectCommand';
  /** Command options (index, file, spool, etc.) */
  options: Map<string, string | boolean>;
}

// -----------------------------------------------------------------------------
// Other Needed Commands
// -----------------------------------------------------------------------------

export interface GeostatsCommand extends ASTNode {
  type: 'GeostatsCommand';
  /** Aggregation functions with fields and aliases */
  aggregations: Aggregation[];
  /** BY clause fields */
  byFields: FieldReference[];
  /** Command options (latfield, longfield, globallimit, etc.) */
  options: Map<string, string | number>;
}

export interface KvformCommand extends ASTNode {
  type: 'KvformCommand';
  /** Form template name */
  form: string | null;
  /** Source field (default: _raw) */
  sourceField: string;
}

export interface PivotCommand extends ASTNode {
  type: 'PivotCommand';
  /** Data model name */
  datamodel: string;
  /** Dataset name within data model */
  dataset: string;
  /** Pivot elements (row/column/cell definitions) */
  elements: string[];
}

export interface SelfjoinCommand extends ASTNode {
  type: 'SelfjoinCommand';
  /** Fields to join on */
  fields: FieldReference[];
  /** Command options (max, overwrite, keepsingle) */
  options: Map<string, string | number | boolean>;
}

// -----------------------------------------------------------------------------
// Phase 5: Field-Affecting Commands
// -----------------------------------------------------------------------------

export interface InputcsvCommand extends ASTNode {
  type: 'InputcsvCommand';
  /** CSV filename to read */
  filename: string | null;
  /** Command options (append, start, max, events) */
  options: Map<string, string | number | boolean>;
}

export interface FieldsummaryCommand extends ASTNode {
  type: 'FieldsummaryCommand';
  /** Fields to summarize (empty = all) */
  fields: FieldReference[];
  /** Command options (maxvals) */
  options: Map<string, string | number>;
  /** Static fields created by fieldsummary */
  createdFields: string[];
}

export interface AddcoltotalsCommand extends ASTNode {
  type: 'AddcoltotalsCommand';
  /** Fields to compute totals for */
  fields: FieldReference[];
  /** Label field name */
  labelField: string | null;
  /** Label text for totals row */
  label: string | null;
}

export interface BucketdirCommand extends ASTNode {
  type: 'BucketdirCommand';
  /** Command options (pathfield, sizefield, sep, maxcount) */
  options: Map<string, string | number>;
}

export interface GeomCommand extends ASTNode {
  type: 'GeomCommand';
  /** Feature collection name */
  featureCollection: string | null;
  /** Command options (featureIdField, gen) */
  options: Map<string, string | number>;
}

export interface GeomfilterCommand extends ASTNode {
  type: 'GeomfilterCommand';
  /** Command options (min_x, min_y, max_x, max_y) */
  options: Map<string, string | number>;
}

export interface ConcurrencyCommand extends ASTNode {
  type: 'ConcurrencyCommand';
  /** Command options (duration, start) */
  options: Map<string, string>;
  /** Static fields created by concurrency */
  createdFields: string[];
}

export interface TyperCommand extends ASTNode {
  type: 'TyperCommand';
  /** Static fields created by typer */
  createdFields: string[];
}

export interface NomvCommand extends ASTNode {
  type: 'NomvCommand';
  /** Field to convert from multivalue to single value */
  field: FieldReference;
}

export interface MakecontinuousCommand extends ASTNode {
  type: 'MakecontinuousCommand';
  /** Field to make continuous */
  field: FieldReference | null;
  /** Command options (span, start, end) */
  options: Map<string, string | number>;
}

export interface ReltimeCommand extends ASTNode {
  type: 'ReltimeCommand';
  /** Static fields created by reltime */
  createdFields: string[];
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
  | MacroCall
  | SearchWildcard
  | SearchText;

export interface SearchComparison extends ASTNode {
  type: 'SearchComparison';
  field: FieldReference;
  operator: string;
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

export interface SearchWildcard extends ASTNode {
  type: 'SearchWildcard';
  pattern: string;
}

export interface SearchText extends ASTNode {
  type: 'SearchText';
  text: string;
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

/** Extract all field references from an expression with location data */
export function extractFieldRefsWithLocation(expr: Expression): FieldConsumption[] {
  const result: FieldConsumption[] = [];

  function visit(node: Expression) {
    switch (node.type) {
      case 'FieldReference':
        if (!node.isWildcard) {
          result.push({
            fieldName: node.fieldName,
            line: node.location?.startLine,
            column: node.location?.startColumn,
          });
        }
        break;
      case 'BinaryExpression':
        visit(node.left);
        visit(node.right);
        break;
      case 'UnaryExpression':
        visit(node.operand);
        break;
      case 'FunctionCall':
        node.arguments.forEach(visit);
        break;
    }
  }

  visit(expr);
  return result;
}
