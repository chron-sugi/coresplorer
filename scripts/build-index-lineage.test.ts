import { describe, it, expect } from 'vitest';
import {
  dedupeEdgesFromGraph,
  buildReverseAdjacency,
  collectDependentPaths,
  extractSourcetypeAndSource,
  buildIndexLineageDataset,
} from './build-index-lineage';

describe('build-index-lineage', () => {
  it('dedupes repeated edges across graph nodes', () => {
    const graph = {
      version: '1.0.0',
      nodes: [
        {
          id: 'a-main-index',
          label: 'A',
          type: 'index',
          edges: [
            { source: 'saved-a', target: 'a-main-index' },
            { source: 'saved-a', target: 'a-main-index' },
          ],
        },
        {
          id: 'saved-a',
          label: 'Saved A',
          type: 'saved_search',
          edges: [{ source: 'saved-a', target: 'a-main-index' }],
        },
      ],
    };

    const edges = dedupeEdgesFromGraph(graph);

    expect(edges).toEqual([{ source: 'saved-a', target: 'a-main-index' }]);
  });

  it('collects transitive dependent paths from index to leaf dependents', () => {
    const reverseAdj = buildReverseAdjacency(
      [
        { source: 'saved-a', target: 'a-main-index' },
        { source: 'dash-a', target: 'saved-a' },
      ],
      ['a-main-index', 'saved-a', 'dash-a']
    );

    const paths = collectDependentPaths('a-main-index', 'saved-a', reverseAdj);

    expect(paths).toEqual([
      {
        pathNodeIds: ['a-main-index', 'saved-a', 'dash-a'],
        cycleDetected: false,
      },
    ]);
  });

  it('detects cycles and marks cycle paths', () => {
    const reverseAdj = buildReverseAdjacency(
      [
        { source: 'saved-a', target: 'a-main-index' },
        { source: 'dash-a', target: 'saved-a' },
        { source: 'saved-a', target: 'dash-a' },
      ],
      ['a-main-index', 'saved-a', 'dash-a']
    );

    const paths = collectDependentPaths('a-main-index', 'saved-a', reverseAdj);

    expect(paths).toEqual([
      {
        pathNodeIds: ['a-main-index', 'saved-a', 'dash-a', 'saved-a'],
        cycleDetected: true,
      },
    ]);
  });

  it('extracts sourcetype and source values from SPL', () => {
    const spl = 'index=main sourcetype=auth source="/var/log/auth.log" OR sourcetype=linux_secure';
    const extracted = extractSourcetypeAndSource(spl);

    expect(extracted.sourcetypes).toEqual(['auth', 'linux_secure']);
    expect(extracted.sources).toEqual(['/var/log/auth.log']);
  });

  it('falls back to unknown tokens when sourcetype/source are missing', () => {
    const graph = {
      version: '1.0.0',
      nodes: [
        {
          id: 'a-main-index',
          label: 'A',
          type: 'index',
          edges: [{ source: 'saved-a', target: 'a-main-index' }],
        },
        {
          id: 'saved-a',
          label: 'Saved A',
          type: 'saved_search',
          edges: [{ source: 'dash-a', target: 'saved-a' }],
        },
        {
          id: 'dash-a',
          label: 'Dash A',
          type: 'dashboard',
          edges: [],
        },
      ],
    };

    const detailsById = new Map<string, { id: string; type: string; spl_code?: string | null }>([
      ['saved-a', { id: 'saved-a', type: 'saved_search', spl_code: 'index=main | stats count' }],
    ]);

    const dataset = buildIndexLineageDataset(graph, detailsById);

    expect(dataset.records).toHaveLength(1);
    expect(dataset.records[0].lineage_key).toBe('a-main-index|__unknown_sourcetype__|__unknown_source__');
    expect(dataset.records[0].transitive_dependent_count).toBe(2);
    expect(dataset.paths[0].path_node_ids).toEqual(['a-main-index', 'saved-a', 'dash-a']);
  });
});

