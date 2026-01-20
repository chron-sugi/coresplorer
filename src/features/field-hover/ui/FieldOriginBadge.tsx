/**
 * FieldOriginBadge
 *
 * Displays the origin of a field (where it was created and by what command).
 *
 * @module features/field-hover/ui/FieldOriginBadge
 */

import type { FieldEvent } from '@/entities/field';
import { fieldEventStyles } from '@/shared/config/theme.config';

interface FieldOriginBadgeProps {
  origin: FieldEvent | null;
  className?: string;
}

const eventKindLabels: Record<string, string> = fieldEventStyles.labels;
const eventKindColors: Record<string, string> = fieldEventStyles.text;

export function FieldOriginBadge({ origin, className = '' }: FieldOriginBadgeProps): React.JSX.Element {
  if (!origin) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        Unknown origin
      </div>
    );
  }

  const label = eventKindLabels[origin.kind] ?? origin.kind;
  const colorClass = eventKindColors[origin.kind] ?? 'text-muted-foreground';

  return (
    <div className={`text-xs ${className}`}>
      <span className={colorClass}>{label}</span>
      {origin.command !== 'implicit' && (
        <>
          <span className="text-muted-foreground"> at line </span>
          <span className="text-foreground font-mono">{origin.line}</span>
          <span className="text-muted-foreground"> by </span>
          <span className="text-violet-400 font-mono">{origin.command}</span>
        </>
      )}
      {origin.expression && (
        <div className="mt-1 text-muted-foreground font-mono text-2xs truncate max-w-48">
          {origin.expression}
        </div>
      )}
    </div>
  );
}
