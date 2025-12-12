/**
 * HighlightLegend
 *
 * Shows the currently selected field and a color key for highlight types.
 *
 * @module features/field-highlight/ui/HighlightLegend
 */

import { X, Lock, Unlock } from 'lucide-react';
import { fieldEventStyles } from '@/shared/config/theme.config';

interface HighlightLegendProps {
  /** Selected field name */
  fieldName: string;
  /** Whether selection is locked */
  isLocked: boolean;
  /** Clear selection callback */
  onClear: () => void;
  /** Toggle lock callback */
  onToggleLock: () => void;
  /** Optional className */
  className?: string;
  /** Layout variant: 'card' (floating) or 'bar' (header) */
  variant?: 'card' | 'bar';
}

const legendItems = [
  { label: fieldEventStyles.labels.created, colorClass: fieldEventStyles.bg.created },
  { label: fieldEventStyles.labels.consumed, colorClass: fieldEventStyles.bg.consumed },
  { label: fieldEventStyles.labels.dropped, colorClass: fieldEventStyles.bg.dropped },
];

/**
 * Thin underline used for each legend entry.
 * Kept as a standalone component so we can reuse styling across layouts.
 */
function UnderlineIndicator({ colorClass }: { colorClass: string }) {
  return (
    <span
      className={`relative inline-block h-[2px] w-12 rounded-full ${colorClass}`}
      aria-hidden="true"
    />
  );
}

/**
 * Legend item with label stacked over color bar.
 */
function LegendItem({ label, colorClass }: { label: string; colorClass: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xs text-slate-400 leading-none">{label}</span>
      <UnderlineIndicator colorClass={colorClass} />
    </div>
  );
}

export function HighlightLegend({
  fieldName,
  isLocked,
  onClear,
  onToggleLock,
  className = '',
  variant = 'card',
}: HighlightLegendProps): React.JSX.Element {
  if (variant === 'bar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {/* Field Name & Actions */}
        <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Selected:</span>
          <span className="font-mono text-sm text-slate-100">{fieldName}</span>
          
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={isLocked ? 'Unlock selection' : 'Lock selection'}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Legend Items */}
        <div className="flex items-center gap-4">
          {legendItems.map((item) => (
            <LegendItem key={item.label} label={item.label} colorClass={item.colorClass} />
          ))}
        </div>
      </div>
    );
  }

  // Default Card Layout
  return (
    <div
      data-testid="highlight-legend"
      className={`bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg ${className}`}
    >
      {/* Header with field name and actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Selected:</span>
          <span className="font-mono text-sm text-slate-100">{fieldName}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isLocked ? 'Unlock selection' : 'Lock selection'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50 mb-2" />

      {/* Color legend - label over color bar */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {legendItems.map((item) => (
          <LegendItem key={item.label} label={item.label} colorClass={item.colorClass} />
        ))}
      </div>
    </div>
  );
}
