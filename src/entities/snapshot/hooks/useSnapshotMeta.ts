/**
 * Snapshot metadata hook
 *
 * Small helper that uses the project's meta query to produce a human
 * friendly timestamp and relative age for the currently loaded snapshot
 * data. Intended to be used in header badges and status displays.
 *
 * @module entities/snapshot/hooks
 */
import { useMemo } from 'react';
import { useMetaQuery } from '../api/meta.queries';

interface SnapshotMeta {
  generatedAt: Date | null;
  formattedTime: string;
  relativeAge: string;
  env?: string;
  status: 'loading' | 'success' | 'error';
}

/**
 * Computes a human-readable relative age from a Date.
 * Returns strings like "< 1 min ago", "10 min ago", "2 hours ago", "> 1 day"
 */
function computeRelativeAge(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMinutes < 1) {
    return '< 1 min ago';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return '> 1 day';
  }
}

/**
 * Hook for fetching and parsing snapshot metadata from /data/meta.json.
 * Returns formatted time, relative age, and loading/error states.
 *
 * Now uses TanStack Query for data fetching with automatic caching.
 */
export function useSnapshotMeta(): SnapshotMeta {
  const { data, isLoading, isError } = useMetaQuery();

  return useMemo(() => {
    if (isLoading) {
      return {
        generatedAt: null,
        formattedTime: '',
        relativeAge: 'unknown',
        status: 'loading' as const,
      };
    }

    if (isError || !data) {
      return {
        generatedAt: null,
        formattedTime: '',
        relativeAge: 'unknown',
        status: 'error' as const,
      };
    }

    const generatedAt = new Date(data.generated_at);

    // Validate the parsed date
    if (isNaN(generatedAt.getTime())) {
      return {
        generatedAt: null,
        formattedTime: '',
        relativeAge: 'unknown',
        status: 'error' as const,
      };
    }

    const formattedTime = generatedAt.toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const relativeAge = computeRelativeAge(generatedAt);

    return {
      generatedAt,
      formattedTime,
      relativeAge,
      env: data.env,
      status: 'success' as const,
    };
  }, [data, isLoading, isError]);
}
