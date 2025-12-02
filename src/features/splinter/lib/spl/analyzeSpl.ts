import { SPL_REGEX, ANALYSIS_CONFIG } from '../../model/constants/splinter.constants';
import type { SplAnalysis, LinterWarning } from '../../model/splinter.schemas';
import { SPL_ANALYSIS_PATTERNS } from './spl-analysis.config';
import { parseSPL, lintSpl, type ParseResult } from '@/entities/spl';
import { extractFromAst } from './extractFromAst';

/**
 * SPL Analysis
 *
 * Extracts statistics such as line count, command count, unique commands,
 * fields, and maps of commands/fields to line numbers.
 *
 * @module features/splinter/lib/spl/analyzeSpl
 */

export { type SplAnalysis };

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Normalize an identifier (field/command name) to lowercase for consistent matching.
 */
function normalizeId(name: string): string {
  return name.toLowerCase();
}

/**
 * Build an index of which tokens appear on each line.
 * Used for efficient O(1) lookups instead of O(n) scans.
 */
function buildLineTokenIndex(lines: string[]): Map<number, Set<string>> {
  const index = new Map<number, Set<string>>();
  for (let i = 0; i < lines.length; i++) {
    const tokens = new Set(
      Array.from(lines[i].matchAll(/[a-z_][a-z0-9_]*/gi))
        .map((m) => normalizeId(m[0]))
    );
    index.set(i + 1, tokens);
  }
  return index;
}

/**
 * Run all linting checks and collect warnings.
 * Combines base linter (from entity layer) with SPLinter-specific patterns.
 */
function runPatternChecks(code: string, lines: string[]): LinterWarning[] {
  // Get base linter warnings (index check, sort 0, leading wildcards, etc.)
  const baseWarnings = lintSpl(code);

  // Get SPLinter-specific pattern warnings
  const patternWarnings: LinterWarning[] = [];
  for (const pattern of SPL_ANALYSIS_PATTERNS) {
    const matches = pattern.check(code, lines);
    for (const w of matches) {
      patternWarnings.push({ ...w, severity: pattern.severity });
    }
  }

  // Merge and deduplicate by line+message
  const seen = new Set<string>();
  const allWarnings: LinterWarning[] = [];

  for (const w of [...baseWarnings, ...patternWarnings]) {
    const key = `${w.line}:${w.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      allWarnings.push(w);
    }
  }

  return allWarnings;
}

/**
 * Merge source map entries into target map, deduplicating and sorting line numbers.
 */
function mergeMaps(target: Map<string, number[]>, source: Map<string, number[]>): void {
  for (const [key, sourceLines] of source) {
    const existing = target.get(key) ?? [];
    const merged = Array.from(new Set([...existing, ...sourceLines])).sort((a, b) => a - b);
    target.set(key, merged);
  }
}

// =============================================================================
// MAIN API
// =============================================================================

/**
 * Analyze SPL code using the parsed AST when available.
 * Falls back to simple regex extraction if parsing fails.
 */
export function analyzeSpl(code: string, parseResult?: ParseResult | null): SplAnalysis {
  const buildFallbackAnalysis = () => {
    const fallbackCommandMap = new Map<string, number[]>();
    const fallbackFieldMap = new Map<string, number[]>();
    let fallbackCount = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Skip lines that are not pipeline delimiters or base search starters.
      // This avoids treating multiline eval/case rows as commands.
      const isBaseSearch = /^(search|index|inputlookup|lookup|metadata|tstats|mstats|makeresults)\b/i.test(trimmed);
      if (!trimmed.includes('|') && !isBaseSearch) {
        return;
      }
      
      const segments = trimmed.split('|');
      segments.forEach((segment) => {
        const segmentTrimmed = segment.trim();
        if (!segmentTrimmed) return;
        const commandMatch = segmentTrimmed.match(SPL_REGEX.COMMAND_EXTRACT);
        if (commandMatch) {
          const command = normalizeId(commandMatch[1]);
          fallbackCount += 1;
          if (command === 'search') {
            return;
          }
          if (!fallbackCommandMap.has(command)) {
            fallbackCommandMap.set(command, []);
          }
          fallbackCommandMap.get(command)!.push(index + 1);
        }
      });

      const fieldMatches = line.matchAll(SPL_REGEX.FIELD_ASSIGNMENT);
      for (const match of fieldMatches) {
        const field = normalizeId(match[1]);
        if (!fallbackFieldMap.has(field)) {
          fallbackFieldMap.set(field, []);
        }
        fallbackFieldMap.get(field)!.push(index + 1);
      }
    });

    return { fallbackCommandMap, fallbackFieldMap, fallbackCount };
  };

  // Split into lines and filter out empty ones for the line count.
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  // Use provided parse result or parse on the fly
  const pr: ParseResult | null = parseResult ?? parseSPL(code);

  let commandToLines = new Map<string, number[]>();
  let fieldToLines = new Map<string, number[]>();
  let commandCount = 0;

  const { fallbackCommandMap, fallbackFieldMap, fallbackCount } = buildFallbackAnalysis();

  if (pr?.ast) {
    const extracted = extractFromAst(pr.ast);
    commandToLines = extracted.commandToLines;
    fieldToLines = extracted.fieldToLines;
    commandCount = extracted.commandCount;

    mergeMaps(commandToLines, fallbackCommandMap);
    mergeMaps(fieldToLines, fallbackFieldMap);
    commandCount = Math.max(commandCount, fallbackCount);
  } else {
    commandToLines = fallbackCommandMap;
    fieldToLines = fallbackFieldMap;
    commandCount = fallbackCount;
  }

  // Collect fields from base search line (to skip during enrichment)
  const baseFields = new Set<string>();
  const firstBaseLineIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('|');
  });
  if (firstBaseLineIndex !== -1) {
    const assignments = lines[firstBaseLineIndex].matchAll(SPL_REGEX.FIELD_ASSIGNMENT);
    for (const match of assignments) {
      baseFields.add(normalizeId(match[1]));
    }
  }

  // Build line token index once for O(1) lookups (avoids O(n*m) nested loops)
  const lineTokenIndex = buildLineTokenIndex(lines);

  // Enrich field-to-lines mapping by finding additional occurrences
  fieldToLines.forEach((lineList, field) => {
    if (baseFields.has(field)) {
      lineList.sort((a, b) => a - b);
      return;
    }
    // O(n) scan using pre-built index instead of O(n*m) nested loop
    for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
      const tokens = lineTokenIndex.get(lineNum);
      if (tokens?.has(field) && !lineList.includes(lineNum)) {
        lineList.push(lineNum);
      }
    }
    lineList.sort((a, b) => a - b);
  });

  const uniqueCommands = Array.from(commandToLines.keys());
  const fields = Array.from(fieldToLines.keys()).slice(0, ANALYSIS_CONFIG.TOP_FIELDS_LIMIT);
  const warnings = runPatternChecks(code, lines);

  return {
    lineCount: nonEmptyLines.length,
    commandCount,
    uniqueCommands,
    commandToLines,
    fields,
    fieldToLines,
    warnings,
  };
}
