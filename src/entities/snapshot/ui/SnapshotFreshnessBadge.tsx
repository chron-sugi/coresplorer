import { Clock } from 'lucide-react';
import { useSnapshotMeta } from '../hooks/useSnapshotMeta';

/**
 * Snapshot freshness indicator badge
 *
 * Displays the timestamp and relative age of the current data snapshot.
 * Shows loading/error states when metadata is unavailable. Rendered in the
 * application header for global visibility.
 *
 * @module entities/snapshot/ui
 * @returns Rendered badge with snapshot timestamp
 */
export function SnapshotFreshnessBadge() {
  const { formattedTime, relativeAge, status } = useSnapshotMeta();

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <>
          <Clock className="h-3 w-3" />
          <span>Snapshot: loading...</span>
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <Clock className="h-3 w-3" />
          <span>Snapshot: unknown</span>
        </>
      );
    }

    return (
      <>
        <Clock className="h-3 w-3" />
        <span>Snapshot: {formattedTime} | {relativeAge}</span>
      </>
    );
  };

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs text-slate-400"
      data-testid="snapshot-freshness-badge"
    >
      {renderContent()}
    </div>
  );
}
