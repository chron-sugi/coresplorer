/**
 * Derive Filter Options
 *
 * Extracts unique filter values from knowledge objects.
 *
 * @module features/ko-explorer/lib/deriveFilterOptions
 */
import type { KnowledgeObject } from '@/entities/knowledge-object';

export interface FilterOptions {
  types: string[];
  apps: string[];
  owners: string[];
}

/**
 * Extracts unique, sorted filter options from a list of knowledge objects.
 *
 * @param kos - Array of knowledge objects
 * @returns Object containing sorted arrays of unique types, apps, and owners
 */
export function deriveFilterOptions(kos: KnowledgeObject[]): FilterOptions {
  const typesSet = new Set<string>();
  const appsSet = new Set<string>();
  const ownersSet = new Set<string>();

  for (const ko of kos) {
    if (ko.type) typesSet.add(ko.type);
    if (ko.app) appsSet.add(ko.app);
    if (ko.owner) ownersSet.add(ko.owner);
  }

  return {
    types: Array.from(typesSet).sort(),
    apps: Array.from(appsSet).sort(),
    owners: Array.from(ownersSet).sort(),
  };
}
