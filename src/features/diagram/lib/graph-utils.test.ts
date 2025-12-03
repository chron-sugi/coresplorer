import { describe, it, expect } from 'vitest';
import {
    buildAdjacencyMaps,
    getUpstreamNodes,
    getDownstreamNodes,
    findShortestPath,
    getPathEdges,
    computeHighlights
} from './graph-utils';
import type { GraphEdge } from './graph-utils.types';

describe('graph-utils', () => {
    const edges: GraphEdge[] = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e2-4', source: '2', target: '4' },
        { id: 'e4-5', source: '4', target: '5' },
        { id: 'e3-5', source: '3', target: '5' }, // Multiple paths to 5
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e6-1', source: '6', target: '1' }, // Cycle
    ];

    describe('buildAdjacencyMaps', () => {
        it('correctly builds outgoing and incoming maps', () => {
            const { outgoing, incoming } = buildAdjacencyMaps(edges);

            expect(outgoing['1']).toEqual(new Set(['2']));
            expect(outgoing['2']).toEqual(new Set(['3', '4']));
            expect(incoming['2']).toEqual(new Set(['1']));
            expect(incoming['5']).toEqual(new Set(['3', '4']));
        });

        it('handles empty edges', () => {
            const { outgoing, incoming } = buildAdjacencyMaps([]);
            expect(outgoing).toEqual({});
            expect(incoming).toEqual({});
        });
    });

    describe('getUpstreamNodes', () => {
        const { incoming } = buildAdjacencyMaps(edges);

        it('finds all ancestors including those in cycles', () => {
            // 2 <- 1 <- 6 <- 5 <- 4/3 <- 2... (cycle)
            // Due to the cycle, all nodes are reachable upstream from 2
            const upstream = getUpstreamNodes('2', incoming);
            expect(upstream).toContain('1');
            expect(upstream).toContain('6');
            expect(upstream).toContain('5');
            expect(upstream).toContain('4');
            expect(upstream).toContain('3');
            expect(upstream.size).toBe(5); // All other nodes in the cycle
        });

        it('finds all ancestors including cycles safely', () => {
            // 5 <- 4 <- 2 <- 1 <- 6 <- 5...
            const upstream = getUpstreamNodes('5', incoming);
            expect(upstream.has('4')).toBe(true);
            expect(upstream.has('3')).toBe(true);
            expect(upstream.has('2')).toBe(true);
            expect(upstream.has('1')).toBe(true);
            expect(upstream.has('6')).toBe(true);
            expect(upstream.has('5')).toBe(false); // Should not contain self
        });

        it('returns empty set for node with no incoming edges', () => {
            // Create a disconnected edge for testing
            const disconnectedEdges = [{ id: 'e-iso', source: 'A', target: 'B' }];
            const { incoming: inc } = buildAdjacencyMaps(disconnectedEdges);
            const upstream = getUpstreamNodes('A', inc);
            expect(upstream.size).toBe(0);
        });
    });

    describe('getDownstreamNodes', () => {
        const { outgoing } = buildAdjacencyMaps(edges);

        it('finds direct children', () => {
            const downstream = getDownstreamNodes('2', outgoing);
            expect(downstream.has('3')).toBe(true);
            expect(downstream.has('4')).toBe(true);
        });

        it('finds all descendants including cycles safely', () => {
            const downstream = getDownstreamNodes('1', outgoing);
            expect(downstream.has('2')).toBe(true);
            expect(downstream.has('3')).toBe(true);
            expect(downstream.has('4')).toBe(true);
            expect(downstream.has('5')).toBe(true);
            expect(downstream.has('6')).toBe(true);
            expect(downstream.has('1')).toBe(false); // Should not contain self
        });

        it('returns empty set for node with no outgoing edges', () => {
             // Create a disconnected edge for testing
             const disconnectedEdges = [{ id: 'e-iso', source: 'A', target: 'B' }];
             const { outgoing: out } = buildAdjacencyMaps(disconnectedEdges);
             const downstream = getDownstreamNodes('B', out);
             expect(downstream.size).toBe(0);
        });
    });

    describe('findShortestPath', () => {
        const { outgoing } = buildAdjacencyMaps(edges);

        it('finds path between adjacent nodes', () => {
            const path = findShortestPath('1', '2', outgoing);
            expect(path).toEqual(['1', '2']);
        });

        it('finds path multiple hops away', () => {
            // 1 -> 2 -> 4 -> 5
            const path = findShortestPath('1', '5', outgoing);
            // Could be 1->2->3->5 or 1->2->4->5. Both length 4 (3 hops).
            expect(path).toHaveLength(4);
            expect(path?.[0]).toBe('1');
            expect(path?.[3]).toBe('5');
        });

        it('returns null if no path exists', () => {
             const disconnectedEdges = [{ id: 'e-iso', source: 'A', target: 'B' }, { id: 'e-iso2', source: 'C', target: 'D' }];
             const { outgoing: out } = buildAdjacencyMaps(disconnectedEdges);
             const path = findShortestPath('A', 'C', out);
             expect(path).toBeNull();
        });

        it('returns single node array if source equals target', () => {
            const path = findShortestPath('1', '1', outgoing);
            expect(path).toEqual(['1']);
        });
    });

    describe('getPathEdges', () => {
        it('returns correct edges for a path', () => {
            const path = ['1', '2', '4'];
            const pathEdges = getPathEdges(path, edges);
            expect(pathEdges.has('e1-2')).toBe(true);
            expect(pathEdges.has('e2-4')).toBe(true);
            expect(pathEdges.size).toBe(2);
        });

        it('returns empty set for single node path', () => {
            const path = ['1'];
            const pathEdges = getPathEdges(path, edges);
            expect(pathEdges.size).toBe(0);
        });

        it('ignores missing edges', () => {
             const path = ['1', '999']; // 999 doesn't exist/connect
             const pathEdges = getPathEdges(path, edges);
             expect(pathEdges.size).toBe(0);
        });
    });

    describe('computeHighlights', () => {
        const { outgoing, incoming } = buildAdjacencyMaps(edges);

        it('returns empty sets if mode is off', () => {
            const result = computeHighlights({
                focusNodeId: '1',
                impactMode: 'off',
                incomingMap: incoming,
                outgoingMap: outgoing,
                edges
            });
            expect(result.nodes.size).toBe(0);
            expect(result.edges.size).toBe(0);
        });

        it('returns empty sets if no focus node', () => {
             const result = computeHighlights({
                focusNodeId: null,
                impactMode: 'both',
                incomingMap: incoming,
                outgoingMap: outgoing,
                edges
            });
            expect(result.nodes.size).toBe(0);
            expect(result.edges.size).toBe(0);
        });

        it('highlights upstream correctly', () => {
            // 2 <- 1
            const result = computeHighlights({
                focusNodeId: '2',
                impactMode: 'upstream',
                incomingMap: incoming,
                outgoingMap: outgoing,
                edges
            });
            expect(result.nodes.has('2')).toBe(true);
            expect(result.nodes.has('1')).toBe(true);
            expect(result.edges.has('e1-2')).toBe(true); // Edge from 1 to 2 should be highlighted
        });

        it('highlights downstream correctly', () => {
            // 2 -> 3, 2 -> 4
            const result = computeHighlights({
                focusNodeId: '2',
                impactMode: 'downstream',
                incomingMap: incoming,
                outgoingMap: outgoing,
                edges
            });
            expect(result.nodes.has('2')).toBe(true);
            expect(result.nodes.has('3')).toBe(true);
            expect(result.nodes.has('4')).toBe(true);
            expect(result.edges.has('e2-3')).toBe(true);
            expect(result.edges.has('e2-4')).toBe(true);
        });

        it('highlights both directions', () => {
             // 1 -> 2 -> 3
             const result = computeHighlights({
                focusNodeId: '2',
                impactMode: 'both',
                incomingMap: incoming,
                outgoingMap: outgoing,
                edges
            });
            expect(result.nodes.has('1')).toBe(true);
            expect(result.nodes.has('2')).toBe(true);
            expect(result.nodes.has('3')).toBe(true);
            expect(result.edges.has('e1-2')).toBe(true);
            expect(result.edges.has('e2-3')).toBe(true);
        });
    });
});
