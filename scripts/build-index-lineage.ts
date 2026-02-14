import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

type GraphEdge = {
  source: string;
  target: string;
};

type GraphNode = {
  id: string;
  label: string;
  type: string;
  edges?: GraphEdge[];
};

type GraphData = {
  version: string;
  nodes: GraphNode[];
};

type NodeDetail = {
  id: string;
  type: string;
  spl_code?: string | null;
};

type TraversedPath = {
  pathNodeIds: string[];
  cycleDetected: boolean;
};

type RecordAccumulator = {
  lineageKey: string;
  indexId: string;
  indexLabel: string;
  sourcetype: string;
  source: string;
  directDependents: Set<string>;
  transitiveDependents: Set<string>;
  terminals: Set<string>;
  maxDepth: number;
};

const UNKNOWN_SOURCETYPE = '__unknown_sourcetype__';
const UNKNOWN_SOURCE = '__unknown_source__';

const SOURCETYPE_PATTERN = /\bsourcetype\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s|)]+))/gi;
const SOURCE_PATTERN = /\bsource\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s|)]+))/gi;

export interface IndexLineageRecord {
  lineage_key: string;
  index_id: string;
  index_label: string;
  sourcetype: string;
  source: string;
  direct_dependent_count: number;
  transitive_dependent_count: number;
  terminal_count: number;
  max_depth: number;
}

export interface IndexLineagePath {
  lineage_key: string;
  index_id: string;
  source_object_id: string;
  source_object_type: string;
  terminal_object_id: string;
  terminal_object_type: string;
  path_node_ids: string[];
  path_length: number;
  cycle_detected: boolean;
}

export interface IndexLineageDataset {
  version: string;
  unknown_tokens: {
    sourcetype: string;
    source: string;
  };
  records: IndexLineageRecord[];
  paths: IndexLineagePath[];
}

function compareStrings(a: string, b: string): number {
  return a.localeCompare(b);
}

function normalizeExtractedValue(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '').replace(/[),]+$/g, '');
}

function extractTokenValues(pattern: RegExp, splCode: string | null | undefined): string[] {
  if (!splCode) {
    return [];
  }

  const values = new Set<string>();
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(splCode);

  while (match !== null) {
    const raw = match[1] || match[2] || match[3] || '';
    const normalized = normalizeExtractedValue(raw);
    if (normalized) {
      values.add(normalized);
    }
    match = pattern.exec(splCode);
  }

  return Array.from(values).sort(compareStrings);
}

export function extractSourcetypeAndSource(splCode: string | null | undefined): {
  sourcetypes: string[];
  sources: string[];
} {
  const sourcetypes = extractTokenValues(SOURCETYPE_PATTERN, splCode);
  const sources = extractTokenValues(SOURCE_PATTERN, splCode);

  return { sourcetypes, sources };
}

export function dedupeEdgesFromGraph(graph: GraphData): GraphEdge[] {
  const uniqueEdges = new Set<string>();

  graph.nodes.forEach((node) => {
    (node.edges ?? []).forEach((edge) => {
      uniqueEdges.add(`${edge.source}->${edge.target}`);
    });
  });

  return Array.from(uniqueEdges)
    .map((edgeKey) => {
      const [source, target] = edgeKey.split('->');
      return { source, target };
    })
    .sort((a, b) => {
      if (a.source !== b.source) {
        return compareStrings(a.source, b.source);
      }
      return compareStrings(a.target, b.target);
    });
}

export function buildReverseAdjacency(edges: GraphEdge[], nodeIds: string[]): Map<string, Set<string>> {
  const reverseAdjacency = new Map<string, Set<string>>();

  nodeIds.forEach((nodeId) => {
    reverseAdjacency.set(nodeId, new Set());
  });

  edges.forEach((edge) => {
    if (!reverseAdjacency.has(edge.target)) {
      reverseAdjacency.set(edge.target, new Set());
    }
    if (!reverseAdjacency.has(edge.source)) {
      reverseAdjacency.set(edge.source, new Set());
    }
    reverseAdjacency.get(edge.target)!.add(edge.source);
  });

  return reverseAdjacency;
}

export function collectDependentPaths(
  indexId: string,
  directSourceId: string,
  reverseAdjacency: Map<string, Set<string>>
): TraversedPath[] {
  const pathStack: Array<{ currentId: string; path: string[]; visited: Set<string> }> = [
    {
      currentId: directSourceId,
      path: [indexId, directSourceId],
      visited: new Set([indexId, directSourceId]),
    },
  ];

  const results: TraversedPath[] = [];

  while (pathStack.length > 0) {
    const state = pathStack.pop()!;
    const dependents = Array.from(reverseAdjacency.get(state.currentId) ?? []).sort(compareStrings);

    if (dependents.length === 0) {
      results.push({
        pathNodeIds: state.path,
        cycleDetected: false,
      });
      continue;
    }

    let hasExpanded = false;

    dependents.forEach((dependentId) => {
      hasExpanded = true;
      if (state.visited.has(dependentId)) {
        results.push({
          pathNodeIds: [...state.path, dependentId],
          cycleDetected: true,
        });
        return;
      }

      const nextVisited = new Set(state.visited);
      nextVisited.add(dependentId);

      pathStack.push({
        currentId: dependentId,
        path: [...state.path, dependentId],
        visited: nextVisited,
      });
    });

    if (!hasExpanded) {
      results.push({
        pathNodeIds: state.path,
        cycleDetected: false,
      });
    }
  }

  const deduped = new Map<string, TraversedPath>();
  results.forEach((result) => {
    const key = `${result.cycleDetected ? 'cycle' : 'path'}|${result.pathNodeIds.join('->')}`;
    if (!deduped.has(key)) {
      deduped.set(key, result);
    }
  });

  return Array.from(deduped.values()).sort((a, b) => {
    const pathA = a.pathNodeIds.join('->');
    const pathB = b.pathNodeIds.join('->');
    if (pathA !== pathB) {
      return compareStrings(pathA, pathB);
    }
    return Number(a.cycleDetected) - Number(b.cycleDetected);
  });
}

function toLineageKey(indexId: string, sourcetype: string, source: string): string {
  return `${indexId}|${sourcetype}|${source}`;
}

function parseLineageKey(lineageKey: string): {
  indexId: string;
  sourcetype: string;
  source: string;
} {
  const [indexId, sourcetype, source] = lineageKey.split('|');
  return { indexId, sourcetype, source };
}

function loadJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function loadNodeDetails(nodeIds: string[], nodesDirPath: string): Map<string, NodeDetail> {
  const detailsById = new Map<string, NodeDetail>();

  nodeIds.forEach((nodeId) => {
    const detailPath = path.join(nodesDirPath, `${nodeId}.json`);
    if (!fs.existsSync(detailPath)) {
      return;
    }

    const detail = loadJsonFile<NodeDetail>(detailPath);
    detailsById.set(nodeId, detail);
  });

  return detailsById;
}

export function buildIndexLineageDataset(
  graph: GraphData,
  nodeDetailsById: Map<string, NodeDetail>
): IndexLineageDataset {
  const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
  const uniqueEdges = dedupeEdgesFromGraph(graph);
  const reverseAdjacency = buildReverseAdjacency(
    uniqueEdges,
    graph.nodes.map((node) => node.id)
  );

  const recordsByKey = new Map<string, RecordAccumulator>();
  const paths: IndexLineagePath[] = [];

  const indexNodes = graph.nodes
    .filter((node) => node.type === 'index')
    .sort((a, b) => compareStrings(a.id, b.id));

  indexNodes.forEach((indexNode) => {
    const directDependents = Array.from(reverseAdjacency.get(indexNode.id) ?? []).sort(compareStrings);

    directDependents.forEach((directDependentId) => {
      const directDependentNode = nodeById.get(directDependentId);
      const directDependentType = directDependentNode?.type ?? 'unknown';
      const directDependentSpl = nodeDetailsById.get(directDependentId)?.spl_code;

      const extracted = extractSourcetypeAndSource(directDependentSpl);
      const sourcetypes = extracted.sourcetypes.length > 0
        ? extracted.sourcetypes
        : [UNKNOWN_SOURCETYPE];
      const sources = extracted.sources.length > 0
        ? extracted.sources
        : [UNKNOWN_SOURCE];

      const dependentPaths = collectDependentPaths(indexNode.id, directDependentId, reverseAdjacency);

      sourcetypes.forEach((sourcetype) => {
        sources.forEach((source) => {
          const lineageKey = toLineageKey(indexNode.id, sourcetype, source);

          if (!recordsByKey.has(lineageKey)) {
            recordsByKey.set(lineageKey, {
              lineageKey,
              indexId: indexNode.id,
              indexLabel: indexNode.label,
              sourcetype,
              source,
              directDependents: new Set<string>(),
              transitiveDependents: new Set<string>(),
              terminals: new Set<string>(),
              maxDepth: 0,
            });
          }

          const accumulator = recordsByKey.get(lineageKey)!;
          accumulator.directDependents.add(directDependentId);

          dependentPaths.forEach((dependentPath) => {
            const terminalObjectId = dependentPath.pathNodeIds[dependentPath.pathNodeIds.length - 1];
            const terminalObjectType = nodeById.get(terminalObjectId)?.type ?? 'unknown';
            const pathLength = Math.max(0, dependentPath.pathNodeIds.length - 1);

            paths.push({
              lineage_key: lineageKey,
              index_id: indexNode.id,
              source_object_id: directDependentId,
              source_object_type: directDependentType,
              terminal_object_id: terminalObjectId,
              terminal_object_type: terminalObjectType,
              path_node_ids: dependentPath.pathNodeIds,
              path_length: pathLength,
              cycle_detected: dependentPath.cycleDetected,
            });

            dependentPath.pathNodeIds
              .slice(1)
              .forEach((nodeId) => accumulator.transitiveDependents.add(nodeId));

            accumulator.terminals.add(terminalObjectId);
            accumulator.maxDepth = Math.max(accumulator.maxDepth, pathLength);
          });
        });
      });
    });
  });

  const dedupedPaths = new Map<string, IndexLineagePath>();
  paths.forEach((lineagePath) => {
    const pathKey = [
      lineagePath.lineage_key,
      lineagePath.source_object_id,
      lineagePath.terminal_object_id,
      lineagePath.cycle_detected ? '1' : '0',
      lineagePath.path_node_ids.join('->'),
    ].join('|');

    if (!dedupedPaths.has(pathKey)) {
      dedupedPaths.set(pathKey, lineagePath);
    }
  });

  const sortedPaths = Array.from(dedupedPaths.values()).sort((a, b) => {
    if (a.lineage_key !== b.lineage_key) {
      return compareStrings(a.lineage_key, b.lineage_key);
    }
    if (a.source_object_id !== b.source_object_id) {
      return compareStrings(a.source_object_id, b.source_object_id);
    }
    if (a.terminal_object_id !== b.terminal_object_id) {
      return compareStrings(a.terminal_object_id, b.terminal_object_id);
    }
    return compareStrings(a.path_node_ids.join('->'), b.path_node_ids.join('->'));
  });

  const records: IndexLineageRecord[] = Array.from(recordsByKey.values())
    .map((accumulator) => ({
      lineage_key: accumulator.lineageKey,
      index_id: accumulator.indexId,
      index_label: accumulator.indexLabel,
      sourcetype: accumulator.sourcetype,
      source: accumulator.source,
      direct_dependent_count: accumulator.directDependents.size,
      transitive_dependent_count: accumulator.transitiveDependents.size,
      terminal_count: accumulator.terminals.size,
      max_depth: accumulator.maxDepth,
    }))
    .sort((a, b) => {
      if (a.index_id !== b.index_id) {
        return compareStrings(a.index_id, b.index_id);
      }
      if (a.sourcetype !== b.sourcetype) {
        return compareStrings(a.sourcetype, b.sourcetype);
      }
      return compareStrings(a.source, b.source);
    });

  return {
    version: '1.0.0',
    unknown_tokens: {
      sourcetype: UNKNOWN_SOURCETYPE,
      source: UNKNOWN_SOURCE,
    },
    records,
    paths: sortedPaths,
  };
}

function run(): void {
  const rootDir = process.cwd();
  const graphPath = path.join(rootDir, 'public', 'data', 'graph.json');
  const nodesDirPath = path.join(rootDir, 'public', 'data', 'nodes');
  const outputPath = path.join(rootDir, 'public', 'data', 'index_lineage.json');

  const graph = loadJsonFile<GraphData>(graphPath);
  const detailsById = loadNodeDetails(
    graph.nodes.map((node) => node.id),
    nodesDirPath
  );

  const dataset = buildIndexLineageDataset(graph, detailsById);

  fs.writeFileSync(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf-8');

  console.log(`Generated ${outputPath}`);
  console.log(`Records: ${dataset.records.length}`);
  console.log(`Paths: ${dataset.paths.length}`);
}

const isDirectExecution = (() => {
  const currentFilePath = fileURLToPath(import.meta.url);
  const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
  return currentFilePath === invokedPath;
})();

if (isDirectExecution) {
  run();
}

