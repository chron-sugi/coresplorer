/**
 * SPL Lib Index
 *
 * @module entities/spl/lib
 */
export {
  lintSpl,
  getCommandsWithPerformanceRisk,
  LinterWarningSchema,
  LinterSeveritySchema,
} from './linter';

export type { LinterWarning, LinterSeverity, LintOptions } from './linter';

export { SPL_COMMANDS, type PerformanceRisk } from '../model/commands';
