/**
 * SPL Analysis Patterns
 *
 * SPLinter-specific patterns that extend the base linter from domain/spl.
 * These patterns are too context-specific for the general linter.
 *
 * @module features/splinter/domain/spl/spl-analysis.config
 */

import type { LinterWarning, LinterSeverity } from '@/entities/spl';
import { SPL_COMMANDS } from '@/entities/spl';
import { extractCommandName } from '@/entities/spl';

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
        lines.forEach((line, idx) => {
          // Split by pipe to check all commands on the line
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
        });
        return warnings;
      },
    });
  }

  return patterns;
}

// =============================================================================
// STATIC PATTERNS (SPLinter-specific)
// =============================================================================

const STATIC_PATTERNS: SplPattern[] = [
  // --- HIGH SEVERITY ---
  {
    id: 'base-search-index',
    severity: 'high',
    description: 'Base search should specify an index',
    check: (_spl, lines) => {
      const warnings: Omit<LinterWarning, 'severity'>[] = [];
      // Simple check: if the first command is not a generating command (like inputlookup) 
      // and doesn't contain "index=", warn.
      // This is a heuristic.
      const firstLine = lines.find(l => l.trim().length > 0);
      if (firstLine) {
        const trimmed = firstLine.trim();
        if (!trimmed.startsWith('|') && !trimmed.includes('index=')) {
           warnings.push({
             line: lines.indexOf(firstLine) + 1,
             message: 'Base search does not specify an index. This scans all indexes and is very inefficient.',
             suggestion: 'Add "index=..." to your base search.'
           });
        } else if (!trimmed.startsWith('|') && trimmed.includes('index=*')) {
            warnings.push({
                line: lines.indexOf(firstLine) + 1,
                message: 'Base search uses wildcard index (index=*). This scans all indexes.',
                suggestion: 'Specify a specific index.'
            });
        }
      }
      return warnings;
    }
  },
  // NOTE: join, transaction, append, union, mvexpand patterns are now
  // derived from SPL_COMMANDS metadata via buildCommandPatterns()
  {
    id: 'sort-no-limit',
    severity: 'high',
    description: 'Sort without limit',
    check: (_spl, lines) => {
        const warnings: Omit<LinterWarning, 'severity'>[] = [];
        lines.forEach((line, idx) => {
            // Matches "sort" followed by fields but no number (simple heuristic)
            // Or "sort 0"
            if (/\bsort\s+0\b/.test(line)) {
                 warnings.push({
                    line: idx + 1,
                    message: '"sort 0" removes the limit, which can be dangerous.',
                    suggestion: 'Use a specific limit or default.'
                });
            } else if (/\bsort\b/i.test(line) && !/\bsort\s+\d+/.test(line) && !/\bsort\s+-\s*\d+/.test(line)) {
                 // This is tricky because "sort field" implies default limit (10000).
                 // User said "sort without limit". Default IS a limit.
                 // But maybe they mean explicit "sort 0"?
                 // The user pattern says "sort without limit (e.g. sort 0)".
                 // So I'll stick to sort 0 for now, or maybe very large numbers.
            }
        });
        return warnings;
    }
  },
  {
      id: 'leading-wildcard',
      severity: 'high',
      description: 'Leading wildcards in filters',
      check: (_spl, lines) => {
          const warnings: Omit<LinterWarning, 'severity'>[] = [];
          lines.forEach((line, idx) => {
              // field="*value" or field=*value
              if (/=\s*"\*\w+/i.test(line) || /=\s*\*\w+/i.test(line) || /\bLIKE\s*["']%/i.test(line)) {
                  warnings.push({
                      line: idx + 1,
                      message: 'Leading wildcards (e.g. "*value") prevent using the lexicon/index.',
                      suggestion: 'Avoid leading wildcards if possible.'
                  });
              }
          });
          return warnings;
      }
  },
  {
      id: 'not-subsearch',
      severity: 'high',
      description: 'NOT [subsearch]',
      check: (_spl, lines) => {
          const warnings: Omit<LinterWarning, 'severity'>[] = [];
          lines.forEach((line, idx) => {
              if (/NOT\s*\[/i.test(line)) {
                  warnings.push({
                      line: idx + 1,
                      message: 'NOT [subsearch] can be inefficient if the subsearch returns many results.',
                      suggestion: 'Ensure the subsearch is small or use a lookup.'
                  });
              }
          });
          return warnings;
      }
  },

  // --- MEDIUM SEVERITY ---
  {
      id: 'complex-regex',
      severity: 'medium',
      description: 'Complex regex/rex',
      check: (_spl, lines) => {
          const warnings: Omit<LinterWarning, 'severity'>[] = [];
          lines.forEach((line, idx) => {
              if (/\b(rex|regex)\b/i.test(line)) {
                  // Heuristic: very long regex or unanchored
                  if (line.length > 150) { // Arbitrary length check for "complex"
                       warnings.push({
                          line: idx + 1,
                          message: 'Complex or long regex detected.',
                          suggestion: 'Ensure regex is efficient and anchored if possible.'
                      });
                  }
              }
          });
          return warnings;
      }
  },
  {
      id: 'negative-filter',
      severity: 'medium',
      description: 'Negative filters',
      check: (_spl, lines) => {
          const warnings: Omit<LinterWarning, 'severity'>[] = [];
          lines.forEach((line, idx) => {
              if (/!=\s*/.test(line) || /\bNOT\s+/.test(line)) {
                   // Only warn if it looks like a base search filter? 
                   // User says "Negative filters (field!=x, NOT field=x)"
                   warnings.push({
                      line: idx + 1,
                      message: 'Negative filters (!= or NOT) scan all events to find what does NOT match.',
                      suggestion: 'Use positive filtering if possible.'
                  });
              }
          });
          return warnings;
      }
  },
  {
      id: 'or-chains',
      severity: 'medium',
      description: 'Long OR chains',
      check: (_spl, lines) => {
          const warnings: Omit<LinterWarning, 'severity'>[] = [];
          lines.forEach((line, idx) => {
              const orCount = (line.match(/\bOR\b/g) || []).length;
              if (orCount > 5) {
                  warnings.push({
                      line: idx + 1,
                      message: 'Long chain of OR conditions.',
                      suggestion: 'Consider using a lookup or "IN" operator.'
                  });
              }
          });
          return warnings;
      }
  },
  
  // --- LOW SEVERITY ---
];

// =============================================================================
// EXPORT
// =============================================================================

/**
 * All SPL analysis patterns.
 * Command-based patterns are derived from SPL_COMMANDS metadata.
 * Static patterns are SPLinter-specific checks.
 */
export const SPL_ANALYSIS_PATTERNS: SplPattern[] = [
  ...buildCommandPatterns(),
  ...STATIC_PATTERNS,
];

// Legacy export name for backward compatibility
export { SPL_ANALYSIS_PATTERNS as SPL_PATTERNS };
