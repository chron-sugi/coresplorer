/**
 * FieldOriginBadge
 *
 * Displays the origin of a field (where it was created and by what command).
 *
 * @module features/field-hover/ui/FieldOriginBadge
 */

import type { FieldEvent } from '@/features/field-lineage';

interface FieldOriginBadgeProps {
  origin: FieldEvent | null;
  className?: string;
}

const eventKindLabels: Record<string, string> = {
  origin: 'Implicit field',
  created: 'Created',
  modified: 'Modified',
  renamed: 'Renamed',
  consumed: 'Used',
  dropped: 'Dropped',
};

const eventKindColors: Record<string, string> = {
  origin: 'text-slate-400',
  created: 'text-emerald-400',
  modified: 'text-amber-400',
  renamed: 'text-blue-400',
  consumed: 'text-cyan-400',
  dropped: 'text-red-400',
};

export function FieldOriginBadge({ origin, className = '' }: FieldOriginBadgeProps): React.JSX.Element {
  if (!origin) {
    return (
      <div className={`text-xs text-slate-500 ${className}`}>
        Unknown origin
      </div>
    );
  }

  const label = eventKindLabels[origin.kind] ?? origin.kind;
  const colorClass = eventKindColors[origin.kind] ?? 'text-slate-400';

  return (
    <div className={`text-xs ${className}`}>
      <span className={colorClass}>{label}</span>
      {origin.command !== 'implicit' && (
        <>
          <span className="text-slate-500"> at line </span>
          <span className="text-slate-300 font-mono">{origin.line}</span>
          <span className="text-slate-500"> by </span>
          <span className="text-violet-400 font-mono">{origin.command}</span>
        </>
      )}
      {origin.expression && (
        <div className="mt-1 text-slate-400 font-mono text-2xs truncate max-w-48">
          {origin.expression}
        </div>
      )}
    </div>
  );
}
