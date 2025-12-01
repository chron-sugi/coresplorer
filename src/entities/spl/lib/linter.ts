/**
 * SPL Linter
 *
 * Unified linting utilities for SPL code.
 * Uses command metadata for performance warnings and pattern-based detection.
 *
 * @module entities/spl/lib/linter
 */

import { z } from 'zod';
import { SPL_COMMANDS, type PerformanceRisk } from '../model/commands';
import { LINTER_PATTERNS, extractCommandName, isPipelineContinuation } from '../model/patterns';

// =============================================================================
// TYPES & SCHEMAS
// =============================================================================

export const LinterSeveritySchema = z.enum(['low', 'medium', 'high']);
export type LinterSeverity = z.infer<typeof LinterSeveritySchema>;

export const LinterWarningSchema = z.object({
  line: z.number().min(1),
  message: z.string(),
  severity: LinterSeveritySchema,
  suggestion: z.string().optional(),
});

export type LinterWarning = z.infer<typeof LinterWarningSchema>;

// =============================================================================
// SEVERITY MAPPING
// =============================================================================

const PERFORMANCE_RISK_TO_SEVERITY: Record<PerformanceRisk, LinterSeverity> = {
  none: 'low',
  low: 'low',
  moderate: 'medium',
  high: 'high',
};

// =============================================================================
// STATIC RULES (non-command-based)
// =============================================================================

interface StaticRule {
  id: string;
  pattern: RegExp;
  /** Only apply if this condition is true (optional) */
  condition?: (line: string) => boolean;
  message: string;
  severity: LinterSeverity;
  suggestion?: string;
}

const STATIC_RULES: StaticRule[] = [
  {
    id: 'realtime-earliest',
    pattern: LINTER_PATTERNS.REALTIME_EARLIEST,
    message: 'Real-time searches place high load on indexers.',
    severity: 'high',
    suggestion: 'Use a scheduled search or short time window.',
  },
  {
    id: 'realtime-latest',
    pattern: LINTER_PATTERNS.REALTIME_LATEST,
    message: 'Real-time searches place high load on indexers.',
    severity: 'high',
    suggestion: 'Use a scheduled search or short time window.',
  },
  {
    id: 'leading-wildcard',
    pattern: LINTER_PATTERNS.LEADING_WILDCARD,
    condition: (line) => !isPipelineContinuation(line),
    message: 'Leading wildcards are inefficient.',
    severity: 'medium',
  },
  {
    id: 'sort-no-limit',
    pattern: LINTER_PATTERNS.SORT_NO_LIMIT,
    message: '"sort 0" removes the limit, which can be dangerous.',
    severity: 'high',
    suggestion: 'Use a specific limit or default.',
  },
  {
    id: 'broad-time-range',
    pattern: LINTER_PATTERNS.BROAD_TIME_RANGE,
    message: 'Potentially broad time range detected (30+ days).',
    severity: 'medium',
    suggestion: 'Ensure this time range is necessary.',
  },
  {
    id: 'year-time-range',
    pattern: LINTER_PATTERNS.YEAR_TIME_RANGE,
    message: 'Year-based time range detected.',
    severity: 'medium',
    suggestion: 'Ensure this time range is necessary.',
  },
];

// =============================================================================
// COMMAND-BASED LINTING
// =============================================================================

/**
 * Check if a command has performance warnings based on its metadata.
 */
function getCommandPerformanceWarning(
  commandName: string,
  lineNumber: number
): LinterWarning | null {
  const command = SPL_COMMANDS[commandName.toLowerCase()];
  if (!command?.performanceRisk || command.performanceRisk === 'none') {
    return null;
  }

  if (!command.performanceNote) {
    return null;
  }

  return {
    line: lineNumber,
    message: command.performanceNote,
    severity: PERFORMANCE_RISK_TO_SEVERITY[command.performanceRisk],
    suggestion: command.performanceSuggestion,
  };
}

// =============================================================================
// BASE SEARCH ANALYSIS
// =============================================================================

/**
 * Check if base search specifies an index (first non-empty, non-pipe line).
 */
function checkBaseSearch(lines: string[]): LinterWarning[] {
  const warnings: LinterWarning[] = [];

  const firstLine = lines.find((l) => l.trim().length > 0);
  if (!firstLine) return warnings;

  const trimmed = firstLine.trim();
  const lineIndex = lines.indexOf(firstLine);

  // Skip if starts with pipe (generating command)
  if (isPipelineContinuation(trimmed)) return warnings;

  if (!LINTER_PATTERNS.INDEX_SPEC.test(trimmed)) {
    warnings.push({
      line: lineIndex + 1,
      message:
        'Base search does not specify an index. This scans all indexes and is very inefficient.',
      severity: 'high',
      suggestion: 'Add "index=..." to your base search.',
    });
  } else if (LINTER_PATTERNS.WILDCARD_INDEX.test(trimmed)) {
    warnings.push({
      line: lineIndex + 1,
      message: 'Base search uses wildcard index (index=*). This scans all indexes.',
      severity: 'high',
      suggestion: 'Specify a specific index.',
    });
  }

  return warnings;
}

// =============================================================================
// MAIN LINTING FUNCTION
// =============================================================================

export interface LintOptions {
  /** Check base search for index specification */
  checkBaseSearch?: boolean;
  /** Include command-based performance warnings */
  checkCommands?: boolean;
  /** Include static pattern rules */
  checkPatterns?: boolean;
}

const DEFAULT_OPTIONS: LintOptions = {
  checkBaseSearch: true,
  checkCommands: true,
  checkPatterns: true,
};

/**
 * Lint SPL code and return warnings.
 *
 * @param code - The SPL code to lint
 * @param options - Linting options
 * @returns Array of linter warnings
 */
export function lintSpl(code: string, options: LintOptions = {}): LinterWarning[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines = code.split('\n');
  const warnings: LinterWarning[] = [];

  // Base search check (only first line)
  if (opts.checkBaseSearch) {
    warnings.push(...checkBaseSearch(lines));
  }

  // Per-line analysis
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmed = line.trim();

    if (!trimmed) return;

    // Command-based performance warnings
    // Split by pipe to check all commands on the line
    if (opts.checkCommands) {
      const segments = trimmed.split('|');
      for (const segment of segments) {
        const commandName = extractCommandName(segment);
        if (commandName) {
          const warning = getCommandPerformanceWarning(commandName, lineNum);
          if (warning) {
            warnings.push(warning);
          }
        }
      }
    }

    // Static pattern rules (deduplicate by rule ID per line)
    if (opts.checkPatterns) {
      const firedRuleIds = new Set<string>();
      for (const rule of STATIC_RULES) {
        // Skip if this rule already fired on this line
        if (firedRuleIds.has(rule.id)) {
          continue;
        }

        if (rule.pattern.test(trimmed)) {
          // Check optional condition
          if (rule.condition && !rule.condition(trimmed)) {
            continue;
          }

          firedRuleIds.add(rule.id);
          warnings.push({
            line: lineNum,
            message: rule.message,
            severity: rule.severity,
            suggestion: rule.suggestion,
          });
        }
      }
    }
  });

  return warnings;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get all commands with performance risks.
 */
export function getCommandsWithPerformanceRisk(): Array<{
  name: string;
  risk: PerformanceRisk;
  note: string;
}> {
  return Object.values(SPL_COMMANDS)
    .filter((cmd) => cmd.performanceRisk && cmd.performanceRisk !== 'none')
    .map((cmd) => ({
      name: cmd.name,
      risk: cmd.performanceRisk!,
      note: cmd.performanceNote ?? '',
    }));
}
