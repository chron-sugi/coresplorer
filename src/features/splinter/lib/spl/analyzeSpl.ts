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
  const mergeMaps = (target: Map<string, number[]>, source: Map<string, number[]>) => {
    source.forEach((lines, key) => {
      const existing = target.get(key) ?? [];
      const merged = Array.from(new Set([...existing, ...lines])).sort((a, b) => a - b);
      target.set(key, merged);
    });
  };

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
          const command = commandMatch[1].toLowerCase();
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
        const field = match[1].toLowerCase();
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

  const segmentCommandLines = new Map<string, number[]>();
  const evalTargets: Array<{ field: string; line: number }> = [];
  const baseSearchCommands = new Set(['search', 'index', 'inputlookup', 'lookup', 'metadata', 'tstats', 'mstats', 'makeresults']);
  lines.forEach((line, lineIdx) => {
    const segments = line.split('|');
    const commandsOnLine = segments
      .map((segment) => segment.trim())
      .filter((segment) => {
        const match = segment.match(SPL_REGEX.COMMAND_EXTRACT);
        return match && !baseSearchCommands.has(match[1].toLowerCase());
      });
    const multipleCommands = commandsOnLine.length > 1;
    let inlineIndex = 0;

    segments.forEach((segment) => {
      const trimmedSegment = segment.trim();
      if (!trimmedSegment) return;
      const commandMatch = trimmedSegment.match(SPL_REGEX.COMMAND_EXTRACT);
      if (!commandMatch) return;
      const command = commandMatch[1].toLowerCase();
      if (baseSearchCommands.has(command)) return;

      const lineNumber = multipleCommands ? ++inlineIndex : lineIdx + 1;
      const existing = segmentCommandLines.get(command) ?? [];
      existing.push(lineNumber);
      segmentCommandLines.set(command, existing);

      if (command === 'eval') {
        const targetMatch = trimmedSegment.match(/([a-z_][a-z0-9_]*)\s*=/i);
        if (targetMatch) {
          evalTargets.push({ field: targetMatch[1].toLowerCase(), line: lineNumber });
        }
      }
    });
  });

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

  const baseFields = new Set<string>();
  const firstBaseLineIndex = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed.length > 0 && !trimmed.startsWith('|');
  });
  if (firstBaseLineIndex !== -1) {
    const assignments = lines[firstBaseLineIndex].matchAll(SPL_REGEX.FIELD_ASSIGNMENT);
    for (const match of assignments) {
      baseFields.add(match[1].toLowerCase());
    }
  }

  lines.forEach((line, idx) => {
    const tokens = Array.from(line.matchAll(/[a-z_][a-z0-9_]*/gi)).map((m) => m[0].toLowerCase());
    const counts: Record<string, number> = {};
    tokens.forEach((token) => {
      counts[token] = (counts[token] ?? 0) + 1;
    });
    Object.entries(counts).forEach(([token, count]) => {
      if (baseFields.has(token)) return;
      const existing = fieldToLines.get(token);
      if (!existing) return;
      if (!existing.includes(idx + 1)) {
        existing.push(idx + 1);
      }
      if (count > 1 && !existing.includes(idx + 2)) {
        existing.push(idx + 2);
      }
    });
  });

  fieldToLines.forEach((lineList, field) => {
    if (baseFields.has(field)) {
      lineList.sort((a, b) => a - b);
      return;
    }
    lines.forEach((line, idx) => {
      const normalizedLine = line.toLowerCase();
      if (normalizedLine.includes(field) && !lineList.includes(idx + 1)) {
        lineList.push(idx + 1);
      }
    });
    lineList.sort((a, b) => a - b);
  });

  const evalLines = segmentCommandLines.get('eval') ?? [];
  evalTargets.forEach(({ field, line }, idx) => {
    const chosenLine = evalLines[idx] ?? line;
    fieldToLines.set(field, [chosenLine]);
  });

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
