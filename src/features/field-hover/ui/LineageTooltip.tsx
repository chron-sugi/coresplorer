/**
 * LineageTooltip
 *
 * Tooltip component that displays field lineage information on hover.
 * Shows field name, type, origin, and dependencies.
 *
 * @module features/field-hover/ui/LineageTooltip
 */

import type { FieldLineage } from '@/features/field-lineage';
import { FieldOriginBadge } from './FieldOriginBadge';
import { DependencyList } from './DependencyList';

interface LineageTooltipProps {
  /** Field name being hovered */
  fieldName: string;
  /** Complete lineage data for the field */
  lineage: FieldLineage | null;
  /** Position for tooltip placement */
  position: { x: number; y: number };
  /** Whether tooltip is visible */
  visible?: boolean;
}

const dataTypeColors: Record<string, string> = {
  string: 'bg-emerald-900/50 text-emerald-300',
  number: 'bg-blue-900/50 text-blue-300',
  boolean: 'bg-amber-900/50 text-amber-300',
  timestamp: 'bg-violet-900/50 text-violet-300',
  multivalue: 'bg-cyan-900/50 text-cyan-300',
  unknown: 'bg-slate-800/50 text-slate-400',
};

export function LineageTooltip({
  fieldName,
  lineage,
  position,
  visible = true,
}: LineageTooltipProps): React.JSX.Element | null {
  if (!visible) return null;

  const dataType = lineage?.dataType ?? 'unknown';
  const typeColorClass = dataTypeColors[dataType] ?? dataTypeColors.unknown;
  const origin = lineage?.origin ?? null;
  const dependencies = lineage?.dependsOn ?? [];
  const dependedOnBy = lineage?.dependedOnBy ?? [];

  // Calculate tooltip position (offset from cursor)
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: position.x + 12,
    top: position.y + 12,
    zIndex: 50,
    maxWidth: 300,
  };

  return (
    <div
      data-testid="lineage-tooltip"
      style={tooltipStyle}
      className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3 space-y-2"
    >
      {/* Header: Field name and type */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-sm text-slate-100 font-medium">
          {fieldName}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-2xs font-medium ${typeColorClass}`}>
          {dataType}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50" />

      {/* Origin */}
      <FieldOriginBadge origin={origin} />

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <DependencyList dependencies={dependencies} label="Depends on" />
      )}

      {/* Depended on by */}
      {dependedOnBy.length > 0 && (
        <DependencyList dependencies={dependedOnBy} label="Used by" />
      )}

      {/* Multivalue indicator */}
      {lineage?.isMultivalue && (
        <div className="text-2xs text-cyan-400">
          ⊕ Multivalue field
        </div>
      )}

      {/* Confidence indicator */}
      {lineage?.confidence && lineage.confidence !== 'high' && (
        <div className="text-2xs text-amber-400">
          ⚠ Confidence: {lineage.confidence}
        </div>
      )}
    </div>
  );
}
