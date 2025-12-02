/**
 * SPL Analysis Patterns
 *
 * SPLinter-specific patterns that extend the base linter from @/entities/spl.
 * These patterns are context-specific for the analysis view.
 *
 * Note: Base patterns (index check, sort 0, leading wildcards) are handled by
 * the entity-layer linter (lintSpl) and are NOT duplicated here.
 *
 * @module features/splinter/lib/spl/spl-analysis.config
 */

import type { LinterWarning, LinterSeverity } from '@/entities/spl';
import { SPL_COMMANDS, extractCommandName } from '@/entities/spl';

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/** Minimum line length to consider a regex "complex" */
const COMPLEX_REGEX_LINE_THRESHOLD = 150;

/** Minimum OR count to warn about long chains */
const OR_CHAIN_THRESHOLD = 5;

// =============================================================================
// TYPES
// =============================================================================

export interface SplPattern {
  id: string;
  severity: LinterSeverity;
  description: string;
  check: (spl: string, lines: string[]) => Omit<LinterWarning, 'severity'>[];
}

// =============================================================================
// COMMAND-BASED PATTERNS (derived from SPL_COMMANDS metadata)
// =============================================================================

/**
 * Generate command patterns from SPL_COMMANDS metadata.
 * These warn about commands with known performance risks.
 */
function buildCommandPatterns(): SplPattern[] {
  const patterns: SplPattern[] = [];

  for (const [name, info] of Object.entries(SPL_COMMANDS)) {
    if (!info.performanceRisk || info.performanceRisk === 'none') continue;
    if (!info.performanceNote) continue;

    const severity: LinterSeverity =
      info.performanceRisk === 'high'
        ? 'high'
        : info.performanceRisk === 'moderate'
          ? 'medium'
          : 'low';

    patterns.push({
      id: `command-${name}`,
      severity,
      description: `Detect ${name} command`,
      check: (_spl, lines) => {
        const warnings: Omit<LinterWarning, 'severity'>[] = [];
        for (let idx = 0; idx < lines.length; idx++) {
          const line = lines[idx];
          const segments = line.split('|');
          for (const segment of segments) {
            const cmd = extractCommandName(segment);
            if (cmd === name) {
              warnings.push({
                line: idx + 1,
                message: info.performanceNote!,
                suggestion: info.performanceSuggestion,
              });
              break; // Only one warning per line for this command
            }
          }
        }
        return warnings;
      },
    });
  }

  return patterns;
}

// =============================================================================
// STATIC PATTERNS (SPLinter-specific, not in base linter)
// =============================================================================

const STATIC_PATTERNS: SplPattern[] = [
  // --- HIGH SEVERITY ---
  {
    id: 'leading-wildcard-quoted',
    severity: 'high',
    description: 'Leading wildcards in quoted filters',
    check: (_spl, lines) => {
      const warnings: Omit<LinterWarning, 'severity'>[] = [];
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        // field="*value" or field=*value or LIKE '%value'
        // Note: Base linter catches unquoted *value, this catches quoted "*value"
        if (/=\s*"\*\w+/i.test(line) || /\bLIKE\s*["']%/i.test(line)) {
          warnings.push({
            line: idx + 1,
            message: 'Leading wildcards (e.g. "*value") prevent using the lexicon/index.',
            suggestion: 'Avoid leading wildcards if possible.',
          });
        }
      }
      return warnings;
    },
  },
  {
    id: 'not-subsearch',
    severity: 'high',
    description: 'NOT [subsearch] anti-pattern',
    check: (_spl, lines) => {
      const warnings: Omit<LinterWarning, 'severity'>[] = [];
      for (let idx = 0; idx < lines.length; idx++) {
        if (/NOT\s*\[/i.test(lines[idx])) {
          warnings.push({
            line: idx + 1,
            message: 'NOT [subsearch] can be inefficient if the subsearch returns many results.',
            suggestion: 'Ensure the subsearch is small or use a lookup.',
          });
        }
      }
      return warnings;
    },
  },

  // --- MEDIUM SEVERITY ---
  {
    id: 'complex-regex',
    severity: 'medium',
    description: 'Complex regex/rex command',
    check: (_spl, lines) => {
      const warnings: Omit<LinterWarning, 'severity'>[] = [];
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (/\b(rex|regex)\b/i.test(line) && line.length > COMPLEX_REGEX_LINE_THRESHOLD) {
          warnings.push({
            line: idx + 1,
            message: 'Complex or long regex detected.',
            suggestion: 'Ensure regex is efficient and anchored if possible.',
          });
        }
      }
      return warnings;
    },
  },
  {
    id: 'negative-filter',
    severity: 'medium',
    description: 'Negative filters',
    check: (_spl, lines) => {
      const warnings: Omit<LinterWarning, 'severity'>[] = [];
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (/!=\s*/.test(line) || /\bNOT\s+\w/.test(line)) {
          warnings.push({
            line: idx + 1,
            message: 'Negative filters (!= or NOT) scan all events to find what does NOT match.',
            suggestion: 'Use positive filtering if possible.',
          });
        }
      }
      return warnings;
    },
  },
  {
    id: 'or-chains',
    severity: 'medium',
    description: 'Long OR chains',
    check: (_spl, lines) => {
      const warnings: Omit<LinterWarning, 'severity'>[] = [];
      for (let idx = 0; idx < lines.length; idx++) {
        const orCount = (lines[idx].match(/\bOR\b/g) || []).length;
        if (orCount > OR_CHAIN_THRESHOLD) {
          warnings.push({
            line: idx + 1,
            message: 'Long chain of OR conditions.',
            suggestion: 'Consider using a lookup or "IN" operator.',
          });
        }
      }
      return warnings;
    },
  },
];

// =============================================================================
// EXPORT
// =============================================================================

/**
 * All SPL analysis patterns.
 * - Command-based patterns are derived from SPL_COMMANDS metadata
 * - Static patterns are SPLinter-specific checks not in the base linter
 */
export const SPL_ANALYSIS_PATTERNS: SplPattern[] = [
  ...buildCommandPatterns(),
  ...STATIC_PATTERNS,
];

// Legacy export name for backward compatibility
export { SPL_ANALYSIS_PATTERNS as SPL_PATTERNS };
