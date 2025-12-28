import { useMemo } from 'react';
import { analyzeSpl } from '../../lib/spl/analyzeSpl';
import type { SplAnalysis } from '../../lib/spl/analyzeSpl';
import type { ParseResult } from '@/entities/spl';
import { badgeVariants, warningCardVariants, warningBadgeVariants, warningTextVariants, sectionHeaderVariants } from '../splinter.variants';
import { logSplAnalysisError } from '@/shared/lib/spl-error-logger';

/**
 * Props for the SplStats component
 */
interface SplStatsProps {
  code: string;
  parseResult?: ParseResult | null;
  onCommandClick?: (command: string, lines: number[]) => void;
  onFieldClick?: (field: string, lines: number[]) => void;
  activeCommand?: string | null;
  activeField?: string | null;
}

/**
 * Query statistics and analysis panel
 * 
 * Analyzes SPL code and displays comprehensive statistics including line count,
 * command usage, field extraction, warnings, and recommendations. Provides interactive
 * badges for commands and fields that highlight corresponding lines in the editor.
 * 
 * @param props - Component props
 * @param props.code - SPL query text to analyze
 * @param props.onCommandClick - Callback when command badge is clicked
 * @param props.onFieldClick - Callback when field badge is clicked
 * @param props.activeCommand - Currently highlighted command
 * @param props.activeField - Currently highlighted field
 * @returns Rendered statistics panel with interactive elements
 */
export function SplStats({
  code,
  parseResult = null,
  onCommandClick,
  onFieldClick,
  activeCommand,
  activeField,
}: SplStatsProps): React.JSX.Element {
  const stats: SplAnalysis = useMemo(() => {
    try {
      return analyzeSpl(code, parseResult);
    } catch (error) {
      logSplAnalysisError(
        error instanceof Error ? error : new Error(String(error)),
        {
          functionName: 'SplStats.stats',
          code,
          parseResultAvailable: !!parseResult,
          astAvailable: !!parseResult?.ast,
          lineCount: code.split('\n').length,
        }
      );
      // Return minimal valid stats to prevent UI crash
      return {
        lineCount: 0,
        commandCount: 0,
        uniqueCommands: [],
        unknownCommands: [],
        commandToLines: new Map(),
        fields: [],
        fieldToLines: new Map(),
        warnings: [],
      };
    }
  }, [code, parseResult]);
  const baseSearchLines = useMemo(() => {
    const lines = code.split('\n');
    const lineIndex = lines.findIndex((line) => line.trim().length > 0 && !line.trim().startsWith('|'));
    return lineIndex === -1 ? [] : [lineIndex + 1];
  }, [code]);

  const displayCommandMap = useMemo(() => {
    if (stats.commandToLines.has('search') || baseSearchLines.length === 0) {
      return stats.commandToLines;
    }
    const merged = new Map(stats.commandToLines);
    merged.set('search', baseSearchLines);
    return merged;
  }, [baseSearchLines, stats.commandToLines]);

  const displayCommands = useMemo(() => {
    if (displayCommandMap.has('search') && !stats.uniqueCommands.includes('search')) {
      return ['search', ...stats.uniqueCommands];
    }
    return stats.uniqueCommands;
  }, [displayCommandMap, stats.uniqueCommands]);

  return (
    <div data-testid="stats-panel" className="p-4 space-y-6 overflow-auto h-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 pb-6 mb-6 border-b border-slate-700/30">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="text-2xl font-bold text-sky-400">{stats.lineCount}</div>
          <div className="text-xs text-slate-400 mt-1">Lines</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="text-2xl font-bold text-emerald-400">{stats.commandCount}</div>
          <div className="text-xs text-slate-400 mt-1">Commands</div>
        </div>
      </div>

      {/* Commands Used */}
      <div>
        <h3 className={sectionHeaderVariants()}>
          COMMANDS · {displayCommands.length}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {displayCommands.map((cmd, idx) => {
            const isUnknown = stats.unknownCommands.includes(cmd);
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  const lines = displayCommandMap.get(cmd) || [];
                  onCommandClick?.(cmd, lines);
                }}
                className={badgeVariants({
                  state: activeCommand === cmd ? 'active' : 'inactive',
                  variant: isUnknown ? 'unknown' : 'command'
                })}
                title={isUnknown ? 'Unknown SPL command' : undefined}
              >
                {cmd}
              </button>
            );
          })}
          {stats.uniqueCommands.length === 0 && (
            <p className="text-xs text-slate-500 italic">No commands detected</p>
          )}
        </div>
      </div>

      {/* Fields */}
      {stats.fields.length > 0 && (
        <div>
          <h3 className={sectionHeaderVariants()}>
            FIELDS · {stats.fields.length}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {stats.fields.map((field, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  const lines = stats.fieldToLines.get(field) || [];
                  onFieldClick?.(field, lines);
                }}
                className={badgeVariants({
                  state: activeField === field ? 'active' : 'inactive',
                  variant: 'field'
                })}
              >
                {field}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {stats.warnings && stats.warnings.length > 0 && (
        <div className="pt-6 mt-6 border-t border-slate-700/30">
          <h3 className={sectionHeaderVariants()}>
            ANALYSIS · {stats.warnings.length}
          </h3>
          <div className="space-y-2">
            {stats.warnings.map((warning, idx) => (
              <div key={idx} className={warningCardVariants({ severity: warning.severity })}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={warningBadgeVariants({ severity: warning.severity })}>
                    {warning.severity}
                  </span>
                  <span className="text-slate-500 font-mono">Line {warning.line}</span>
                </div>
                <div className={warningTextVariants({ severity: warning.severity })}>{warning.message}</div>
                {warning.suggestion && (
                  <div className="text-slate-500 italic mt-1">
                    Tip: {warning.suggestion}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
