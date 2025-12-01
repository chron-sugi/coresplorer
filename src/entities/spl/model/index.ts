/**
 * SPL Model Index
 *
 * @module entities/spl/model
 */

// Commands
export {
  SPL_COMMANDS,
  getCommandInfo,
  getCommandsByCategory,
  getFieldCreatingCommands,
  commandDropsFields,
} from './commands';

export type { CommandInfo, CommandCategory, PerformanceRisk } from './commands';

// Functions
export {
  SPL_FUNCTIONS,
  getFunctionInfo,
  getFunctionReturnType,
  getFunctionsByCategory,
} from './functions';

export type {
  FunctionInfo,
  FunctionCategory,
  ParameterInfo,
  DataType,
} from './functions';

// Patterns
export {
  SPL_PATTERNS,
  FIELD_PATTERNS,
  LINTER_PATTERNS,
  extractCommandName,
  isPipelineContinuation,
} from './patterns';

// AST Types
export * from './types';
