import { SPL_REGEX, ANALYSIS_CONFIG } from '../../model/constants/splinter.constants';
import type { SplAnalysis, LinterWarning } from '../../model/splinter.schemas';
import { SPL_ANALYSIS_PATTERNS } from './spl-analysis.config';
import { parseSPL, type ParseResult } from '@/entities/spl/lib/parser';
import { extractFromAst } from './extractFromAst';

/*
 * SPL analysis helper for the SPLinter feature.
 * Extracts statistics such as line count, command count, unique commands,
 * fields, and maps of commands/fields to line numbers.
 */

export { type SplAnalysis };

/**
 * Analyze SPL code using the parsed AST when available.
 * Falls back to simple regex extraction if parsing fails.
 */
export function analyzeSpl(code: string, parseResult?: ParseResult | null): SplAnalysis {
  // Split into lines and filter out empty ones for the line count.
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  // Use provided parse result or parse on the fly
  const pr: ParseResult | null = parseResult ?? parseSPL(code);

  let commandToLines = new Map<string, number[]>();
  let fieldToLines = new Map<string, number[]>();
  let commandCount = 0;

  if (pr?.ast) {
    const extracted = extractFromAst(pr.ast);
    commandToLines = extracted.commandToLines;
    fieldToLines = extracted.fieldToLines;
    commandCount = extracted.commandCount;
  }

  // Fallback to basic line-based extraction when AST is unavailable or yields nothing
  if (!pr?.ast || commandToLines.size === 0) {
    // Fallback to basic line-based extraction
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
          const command = commandMatch[1].toLowerCase();
          if (!commandToLines.has(command)) {
            commandToLines.set(command, []);
          }
          commandToLines.get(command)!.push(index + 1);
          commandCount += 1;
        }
      });

      const fieldMatches = line.matchAll(SPL_REGEX.FIELD_ASSIGNMENT);
      for (const match of fieldMatches) {
        const field = match[1].toLowerCase();
        if (!fieldToLines.has(field)) {
          fieldToLines.set(field, []);
        }
        fieldToLines.get(field)!.push(index + 1);
      }
    });
  }

  const uniqueCommands = Array.from(commandToLines.keys());
  const fields = Array.from(fieldToLines.keys()).slice(0, ANALYSIS_CONFIG.TOP_FIELDS_LIMIT);

  // Run pattern checks
  const warnings: LinterWarning[] = [];
  SPL_ANALYSIS_PATTERNS.forEach((pattern) => {
    const patternWarnings = pattern.check(code, lines);
    patternWarnings.forEach((w) => {
      warnings.push({
        ...w,
        severity: pattern.severity,
      });
    });
  });

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
