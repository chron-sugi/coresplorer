/**
 * useFilterUrlSync Hook
 *
 * Synchronizes filter state with URL search parameters.
 * Reads from URL on mount and updates URL when filters change.
 *
 * @module features/ko-explorer/model/hooks/useFilterUrlSync
 */
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFilterStore } from '../store/useFilterStore';
import {
  decodeArrayParam,
  encodeArrayParam,
  decodeUrlParam,
  encodeUrlParam,
} from '@/shared/lib/urlEncoding';

/** URL parameter keys */
const URL_PARAMS = {
  SEARCH: 'q',
  TYPE: 'type',
  APP: 'app',
  OWNER: 'owner',
} as const;

/**
 * Hook that synchronizes filter store state with URL search parameters.
 *
 * On mount: reads URL params and populates store
 * On store change: updates URL params
 *
 * URL format: ?q=searchterm&type=value1,value2&app=value1&owner=value1,value2
 */
export function useFilterUrlSync(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialized = useRef(false);

  const searchTerm = useFilterStore((state) => state.searchTerm);
  const types = useFilterStore((state) => state.types);
  const apps = useFilterStore((state) => state.apps);
  const owners = useFilterStore((state) => state.owners);
  const setSearchTerm = useFilterStore((state) => state.setSearchTerm);
  const setTypes = useFilterStore((state) => state.setTypes);
  const setApps = useFilterStore((state) => state.setApps);
  const setOwners = useFilterStore((state) => state.setOwners);

  // On mount: read URL params and populate store
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const urlSearch = decodeUrlParam(searchParams.get(URL_PARAMS.SEARCH));
    const urlTypes = decodeArrayParam(searchParams.get(URL_PARAMS.TYPE));
    const urlApps = decodeArrayParam(searchParams.get(URL_PARAMS.APP));
    const urlOwners = decodeArrayParam(searchParams.get(URL_PARAMS.OWNER));

    if (urlSearch) setSearchTerm(urlSearch);
    if (urlTypes.length > 0) setTypes(urlTypes);
    if (urlApps.length > 0) setApps(urlApps);
    if (urlOwners.length > 0) setOwners(urlOwners);
  }, [searchParams, setSearchTerm, setTypes, setApps, setOwners]);

  // On store change: update URL params
  useEffect(() => {
    if (!isInitialized.current) return;

    const newParams = new URLSearchParams(searchParams);

    // Update search param
    const searchParam = encodeUrlParam(searchTerm);
    if (searchParam) {
      newParams.set(URL_PARAMS.SEARCH, searchParam);
    } else {
      newParams.delete(URL_PARAMS.SEARCH);
    }

    // Update type param
    const typeParam = encodeArrayParam(types);
    if (typeParam) {
      newParams.set(URL_PARAMS.TYPE, typeParam);
    } else {
      newParams.delete(URL_PARAMS.TYPE);
    }

    // Update app param
    const appParam = encodeArrayParam(apps);
    if (appParam) {
      newParams.set(URL_PARAMS.APP, appParam);
    } else {
      newParams.delete(URL_PARAMS.APP);
    }

    // Update owner param
    const ownerParam = encodeArrayParam(owners);
    if (ownerParam) {
      newParams.set(URL_PARAMS.OWNER, ownerParam);
    } else {
      newParams.delete(URL_PARAMS.OWNER);
    }

    // Only update if params changed to avoid infinite loops
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [searchTerm, types, apps, owners, searchParams, setSearchParams]);
}
