/**
 * useKnowledgeObjectInspector
 *
 * Hook used by the Object Inspector overlay to resolve a selected token into
 * inspector details. Currently uses an in-memory `MOCK_OBJECTS` mapping.
 *
 * @module features/splinter/model/hooks/useKnowledgeObjectInspector
 */

import { useMemo } from 'react';

/**
 * Details displayed in the Object Inspector overlay.
 * Different from KnowledgeObject in ko-explorer which represents index.json entries.
 */
export interface InspectorObjectDetails {
  name: string;
  type: 'macro' | 'lookup_def' | 'lookup_file' | 'saved_search';
  definition: string;
  args?: string[];
  fields?: string[];
}

// Mock data for now - in real app this would call an API
const MOCK_OBJECTS: Record<string, InspectorObjectDetails> = {
  'base_web_traffic_macro': {
    name: 'base_web_traffic_macro',
    type: 'macro',
    definition: 'index=web sourcetype=access_combined',
    args: []
  },
  'postprocess_site_summary_macro': {
    name: 'postprocess_site_summary_macro',
    type: 'macro',
    definition: 'stats sum(count) by site | where count > 100',
    args: ['site', 'site_type', 'site_tier']
  },
  'host_inventory': {
    name: 'host_inventory',
    type: 'lookup_def',
    definition: 'host_inventory.csv',
    fields: ['host', 'site', 'owner', 'team']
  },
  'http_status_lookup': {
    name: 'http_status_lookup',
    type: 'lookup_def',
    definition: 'http_status.csv',
    fields: ['status', 'status_category', 'http_description']
  },
  'site_metadata': {
    name: 'site_metadata',
    type: 'lookup_def',
    definition: 'site_metadata.csv',
    fields: ['site', 'site_type', 'site_owner', 'site_tier']
  },
  'sla_targets': {
    name: 'sla_targets',
    type: 'lookup_def',
    definition: 'sla_targets.csv',
    fields: ['site_tier', 'traffic_bucket', 'target_error_rate', 'target_availability']
  }
};

export function useKnowledgeObjectInspector(selectedText: string | null) {
  // Compute object details directly from selectedText via useMemo
  const objectDetails = useMemo(() => {
    if (!selectedText) {
      return null;
    }
    // Simple matching logic for now
    // In reality, we'd parse the context (e.g., is it inside backticks?)
    const cleanText = selectedText.replace(/[`]/g, '').trim();
    const obj = MOCK_OBJECTS[cleanText];
    return obj || null;
  }, [selectedText]);

  return { objectDetails };
}
