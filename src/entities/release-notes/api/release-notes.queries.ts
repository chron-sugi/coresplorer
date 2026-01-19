/**
 * Release Notes Queries
 *
 * TanStack Query hooks for fetching release notes data from release_notes.json.
 * Provides caching, automatic refetching, and proper loading/error states.
 *
 * @module entities/release-notes/api/release-notes.queries
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { DataFetchError, DataValidationError } from '@/shared/lib';
import { ReleaseNotesSchema } from '../model';
import type { ReleaseNotes } from '../model';

/**
 * Fetches and validates release notes data from the API
 */
async function fetchReleaseNotes(): Promise<ReleaseNotes> {
  const response = await fetch(apiConfig.endpoints.releaseNotes);

  if (!response.ok) {
    throw new DataFetchError(
      `Failed to fetch release notes: ${response.status} ${response.statusText}`,
      response.url
    );
  }

  const json = await response.json();

  const parseResult = ReleaseNotesSchema.safeParse(json);
  if (!parseResult.success) {
    throw new DataValidationError(
      'Invalid release notes data structure',
      parseResult.error,
      json
    );
  }

  return parseResult.data;
}

/**
 * Query key factory for release notes queries
 */
export const releaseNotesQueryKeys = {
  all: ['releaseNotes'] as const,
  list: () => [...releaseNotesQueryKeys.all, 'list'] as const,
};

/**
 * TanStack Query hook for fetching release notes
 *
 * @returns Query result with release notes array
 *
 * @example
 * const { data, isLoading, error } = useReleaseNotesQuery();
 */
export function useReleaseNotesQuery() {
  return useQuery({
    queryKey: releaseNotesQueryKeys.list(),
    queryFn: fetchReleaseNotes,
  });
}
