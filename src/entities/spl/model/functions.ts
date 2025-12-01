/**
 * SPL Eval Functions
 *
 * Metadata about functions available in eval expressions.
 * Used for type inference, autocomplete, and validation.
 *
 * @module entities/spl/model/functions
 */

// =============================================================================
// TYPES
// =============================================================================

export interface FunctionInfo {
  /** Function name (case-insensitive in SPL) */
  name: string;

  /** Function category */
  category: FunctionCategory;

  /** Brief description */
  description: string;

  /** Return type */
  returnType: DataType;

  /** Parameter signatures */
  parameters: ParameterInfo[];

  /** Minimum required arguments */
  minArgs: number;

  /** Maximum arguments (-1 for unlimited) */
  maxArgs: number;

  /** Example usage */
  example?: string;
}

export interface ParameterInfo {
  name: string;
  type: DataType | DataType[];
  optional?: boolean;
  description?: string;
}

export type FunctionCategory =
  | 'string'        // String manipulation
  | 'math'          // Mathematical operations
  | 'date'          // Date/time operations
  | 'comparison'    // Comparison/conditional
  | 'conversion'    // Type conversion
  | 'multivalue'    // Multivalue field operations
  | 'crypto'        // Cryptographic functions
  | 'statistical'   // Statistical functions
  | 'informational' // Type checking, inspection
  | 'text';         // Text analysis

export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'time'
  | 'any'
  | 'multivalue';

// =============================================================================
// FUNCTION REGISTRY
// =============================================================================

/**
 * Eval function registry for SPL.
 */
export const SPL_FUNCTIONS: Record<string, FunctionInfo> = {
  // STRING FUNCTIONS
  lower: {
    name: 'lower',
    category: 'string',
    description: 'Convert string to lowercase',
    returnType: 'string',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
    example: 'lower(username)',
  },
  upper: {
    name: 'upper',
    category: 'string',
    description: 'Convert string to uppercase',
    returnType: 'string',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
  },
  trim: {
    name: 'trim',
    category: 'string',
    description: 'Remove leading and trailing whitespace',
    returnType: 'string',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'chars', type: 'string', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },
  ltrim: {
    name: 'ltrim',
    category: 'string',
    description: 'Remove leading whitespace',
    returnType: 'string',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'chars', type: 'string', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },
  rtrim: {
    name: 'rtrim',
    category: 'string',
    description: 'Remove trailing whitespace',
    returnType: 'string',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'chars', type: 'string', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },
  substr: {
    name: 'substr',
    category: 'string',
    description: 'Extract substring',
    returnType: 'string',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'start', type: 'number' },
      { name: 'length', type: 'number', optional: true },
    ],
    minArgs: 2,
    maxArgs: 3,
    example: 'substr(message, 1, 10)',
  },
  replace: {
    name: 'replace',
    category: 'string',
    description: 'Replace occurrences of a pattern',
    returnType: 'string',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'pattern', type: 'string' },
      { name: 'replacement', type: 'string' },
    ],
    minArgs: 3,
    maxArgs: 3,
  },
  split: {
    name: 'split',
    category: 'string',
    description: 'Split string into multivalue field',
    returnType: 'multivalue',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'delimiter', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: 2,
  },
  len: {
    name: 'len',
    category: 'string',
    description: 'Return string length',
    returnType: 'number',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
  },

  // MATH FUNCTIONS
  abs: {
    name: 'abs',
    category: 'math',
    description: 'Absolute value',
    returnType: 'number',
    parameters: [{ name: 'num', type: 'number' }],
    minArgs: 1,
    maxArgs: 1,
  },
  ceil: {
    name: 'ceil',
    category: 'math',
    description: 'Round up to nearest integer',
    returnType: 'number',
    parameters: [{ name: 'num', type: 'number' }],
    minArgs: 1,
    maxArgs: 1,
  },
  floor: {
    name: 'floor',
    category: 'math',
    description: 'Round down to nearest integer',
    returnType: 'number',
    parameters: [{ name: 'num', type: 'number' }],
    minArgs: 1,
    maxArgs: 1,
  },
  round: {
    name: 'round',
    category: 'math',
    description: 'Round to specified decimal places',
    returnType: 'number',
    parameters: [
      { name: 'num', type: 'number' },
      { name: 'decimals', type: 'number', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },
  sqrt: {
    name: 'sqrt',
    category: 'math',
    description: 'Square root',
    returnType: 'number',
    parameters: [{ name: 'num', type: 'number' }],
    minArgs: 1,
    maxArgs: 1,
  },
  pow: {
    name: 'pow',
    category: 'math',
    description: 'Raise to power',
    returnType: 'number',
    parameters: [
      { name: 'base', type: 'number' },
      { name: 'exponent', type: 'number' },
    ],
    minArgs: 2,
    maxArgs: 2,
  },
  log: {
    name: 'log',
    category: 'math',
    description: 'Natural logarithm (or specified base)',
    returnType: 'number',
    parameters: [
      { name: 'num', type: 'number' },
      { name: 'base', type: 'number', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },
  exp: {
    name: 'exp',
    category: 'math',
    description: 'Exponential (e^x)',
    returnType: 'number',
    parameters: [{ name: 'num', type: 'number' }],
    minArgs: 1,
    maxArgs: 1,
  },
  random: {
    name: 'random',
    category: 'math',
    description: 'Generate random number',
    returnType: 'number',
    parameters: [],
    minArgs: 0,
    maxArgs: 0,
  },
  pi: {
    name: 'pi',
    category: 'math',
    description: 'Return pi constant',
    returnType: 'number',
    parameters: [],
    minArgs: 0,
    maxArgs: 0,
  },

  // DATE/TIME FUNCTIONS
  now: {
    name: 'now',
    category: 'date',
    description: 'Current Unix timestamp',
    returnType: 'time',
    parameters: [],
    minArgs: 0,
    maxArgs: 0,
  },
  time: {
    name: 'time',
    category: 'date',
    description: 'Current Unix timestamp',
    returnType: 'time',
    parameters: [],
    minArgs: 0,
    maxArgs: 0,
  },
  relative_time: {
    name: 'relative_time',
    category: 'date',
    description: 'Calculate relative time',
    returnType: 'time',
    parameters: [
      { name: 'timestamp', type: 'time' },
      { name: 'modifier', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: 2,
    example: 'relative_time(now(), "-1d@d")',
  },
  strftime: {
    name: 'strftime',
    category: 'date',
    description: 'Format timestamp as string',
    returnType: 'string',
    parameters: [
      { name: 'timestamp', type: 'time' },
      { name: 'format', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: 2,
    example: 'strftime(_time, "%Y-%m-%d")',
  },
  strptime: {
    name: 'strptime',
    category: 'date',
    description: 'Parse string to timestamp',
    returnType: 'time',
    parameters: [
      { name: 'str', type: 'string' },
      { name: 'format', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: 2,
  },

  // COMPARISON/CONDITIONAL FUNCTIONS
  if: {
    name: 'if',
    category: 'comparison',
    description: 'Conditional expression',
    returnType: 'any',
    parameters: [
      { name: 'condition', type: 'boolean' },
      { name: 'true_value', type: 'any' },
      { name: 'false_value', type: 'any' },
    ],
    minArgs: 3,
    maxArgs: 3,
    example: 'if(status >= 400, "error", "ok")',
  },
  case: {
    name: 'case',
    category: 'comparison',
    description: 'Multiple conditional expression',
    returnType: 'any',
    parameters: [
      { name: 'condition1', type: 'boolean' },
      { name: 'value1', type: 'any' },
    ],
    minArgs: 2,
    maxArgs: -1,
    example: 'case(status<300, "success", status<400, "redirect", status<500, "client_error", 1=1, "server_error")',
  },
  coalesce: {
    name: 'coalesce',
    category: 'comparison',
    description: 'Return first non-null value',
    returnType: 'any',
    parameters: [{ name: 'values', type: 'any' }],
    minArgs: 1,
    maxArgs: -1,
  },
  nullif: {
    name: 'nullif',
    category: 'comparison',
    description: 'Return null if values are equal',
    returnType: 'any',
    parameters: [
      { name: 'value1', type: 'any' },
      { name: 'value2', type: 'any' },
    ],
    minArgs: 2,
    maxArgs: 2,
  },
  validate: {
    name: 'validate',
    category: 'comparison',
    description: 'Return error message if condition fails',
    returnType: 'string',
    parameters: [
      { name: 'condition', type: 'boolean' },
      { name: 'error_msg', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: -1,
  },

  // CONVERSION FUNCTIONS
  tonumber: {
    name: 'tonumber',
    category: 'conversion',
    description: 'Convert to number',
    returnType: 'number',
    parameters: [
      { name: 'str', type: ['string', 'number'] },
      { name: 'base', type: 'number', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },
  tostring: {
    name: 'tostring',
    category: 'conversion',
    description: 'Convert to string',
    returnType: 'string',
    parameters: [
      { name: 'value', type: 'any' },
      { name: 'format', type: 'string', optional: true },
    ],
    minArgs: 1,
    maxArgs: 2,
  },

  // INFORMATIONAL FUNCTIONS
  isnull: {
    name: 'isnull',
    category: 'informational',
    description: 'Check if value is null',
    returnType: 'boolean',
    parameters: [{ name: 'value', type: 'any' }],
    minArgs: 1,
    maxArgs: 1,
  },
  isnotnull: {
    name: 'isnotnull',
    category: 'informational',
    description: 'Check if value is not null',
    returnType: 'boolean',
    parameters: [{ name: 'value', type: 'any' }],
    minArgs: 1,
    maxArgs: 1,
  },
  isnum: {
    name: 'isnum',
    category: 'informational',
    description: 'Check if value is numeric',
    returnType: 'boolean',
    parameters: [{ name: 'value', type: 'any' }],
    minArgs: 1,
    maxArgs: 1,
  },
  isstr: {
    name: 'isstr',
    category: 'informational',
    description: 'Check if value is string',
    returnType: 'boolean',
    parameters: [{ name: 'value', type: 'any' }],
    minArgs: 1,
    maxArgs: 1,
  },
  isint: {
    name: 'isint',
    category: 'informational',
    description: 'Check if value is integer',
    returnType: 'boolean',
    parameters: [{ name: 'value', type: 'any' }],
    minArgs: 1,
    maxArgs: 1,
  },
  typeof: {
    name: 'typeof',
    category: 'informational',
    description: 'Return type of value',
    returnType: 'string',
    parameters: [{ name: 'value', type: 'any' }],
    minArgs: 1,
    maxArgs: 1,
  },

  // MULTIVALUE FUNCTIONS
  mvcount: {
    name: 'mvcount',
    category: 'multivalue',
    description: 'Count values in multivalue field',
    returnType: 'number',
    parameters: [{ name: 'mv', type: 'multivalue' }],
    minArgs: 1,
    maxArgs: 1,
  },
  mvindex: {
    name: 'mvindex',
    category: 'multivalue',
    description: 'Get value at index from multivalue field',
    returnType: 'any',
    parameters: [
      { name: 'mv', type: 'multivalue' },
      { name: 'start', type: 'number' },
      { name: 'end', type: 'number', optional: true },
    ],
    minArgs: 2,
    maxArgs: 3,
  },
  mvjoin: {
    name: 'mvjoin',
    category: 'multivalue',
    description: 'Join multivalue field into string',
    returnType: 'string',
    parameters: [
      { name: 'mv', type: 'multivalue' },
      { name: 'delimiter', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: 2,
  },
  mvfind: {
    name: 'mvfind',
    category: 'multivalue',
    description: 'Find index of matching value',
    returnType: 'number',
    parameters: [
      { name: 'mv', type: 'multivalue' },
      { name: 'pattern', type: 'string' },
    ],
    minArgs: 2,
    maxArgs: 2,
  },
  mvdedup: {
    name: 'mvdedup',
    category: 'multivalue',
    description: 'Remove duplicates from multivalue field',
    returnType: 'multivalue',
    parameters: [{ name: 'mv', type: 'multivalue' }],
    minArgs: 1,
    maxArgs: 1,
  },
  mvsort: {
    name: 'mvsort',
    category: 'multivalue',
    description: 'Sort multivalue field',
    returnType: 'multivalue',
    parameters: [{ name: 'mv', type: 'multivalue' }],
    minArgs: 1,
    maxArgs: 1,
  },

  // CRYPTO FUNCTIONS
  md5: {
    name: 'md5',
    category: 'crypto',
    description: 'Calculate MD5 hash',
    returnType: 'string',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
  },
  sha1: {
    name: 'sha1',
    category: 'crypto',
    description: 'Calculate SHA1 hash',
    returnType: 'string',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
  },
  sha256: {
    name: 'sha256',
    category: 'crypto',
    description: 'Calculate SHA256 hash',
    returnType: 'string',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
  },
  sha512: {
    name: 'sha512',
    category: 'crypto',
    description: 'Calculate SHA512 hash',
    returnType: 'string',
    parameters: [{ name: 'str', type: 'string' }],
    minArgs: 1,
    maxArgs: 1,
  },
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get function info by name (case-insensitive).
 */
export function getFunctionInfo(funcName: string): FunctionInfo | null {
  return SPL_FUNCTIONS[funcName.toLowerCase()] ?? null;
}

/**
 * Get return type of a function.
 */
export function getFunctionReturnType(funcName: string): DataType {
  return SPL_FUNCTIONS[funcName.toLowerCase()]?.returnType ?? 'any';
}

/**
 * Get all functions in a category.
 */
export function getFunctionsByCategory(category: FunctionCategory): FunctionInfo[] {
  return Object.values(SPL_FUNCTIONS).filter(f => f.category === category);
}
