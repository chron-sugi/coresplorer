/**
 * HighlightLegend
 *
 * Shows the currently selected field and a color key for highlight types.
 *
 * @module features/field-highlight/ui/HighlightLegend
 */

import { X, Lock, Unlock } from 'lucide-react';

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
  { label: 'Created', colorClass: 'bg-emerald-400' },
  { label: 'Modified', colorClass: 'bg-amber-400' },
  { label: 'Used', colorClass: 'bg-cyan-400' },
  { label: 'Dropped', colorClass: 'bg-red-400' },
];

/**
 * Underline indicator that matches the editor's field underline style.
 */
function UnderlineIndicator({ colorClass }: { colorClass: string }): React.JSX.Element {
  return (
    <span className="relative inline-block w-4 h-3">
      {/* Text placeholder */}
      <span className="text-[8px] text-slate-500 font-mono">ab</span>
      {/* Underline */}
      <span className={`absolute bottom-0 left-0 right-0 h-[2px] ${colorClass}`} />
    </span>
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
              onClick={onToggleLock}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={isLocked ? 'Unlock selection' : 'Lock selection'}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            <button
              onClick={onClear}
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
            <div key={item.label} className="flex items-center gap-1.5">
              <UnderlineIndicator colorClass={item.colorClass} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
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
            onClick={onToggleLock}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={isLocked ? 'Unlock selection' : 'Lock selection'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700/50 mb-2" />

      {/* Color legend - underline style to match editor */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <UnderlineIndicator colorClass={item.colorClass} />
            <span className="text-2xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
