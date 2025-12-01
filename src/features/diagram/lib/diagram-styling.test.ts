import { describe, it, expect } from 'vitest';
import { applyDiagramStyles } from './diagram-styling';
import type { Node, Edge } from '@xyflow/react';

describe('applyDiagramStyles', () => {
    const mockNodes: Node[] = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
        { id: '2', position: { x: 0, y: 0 }, data: { label: 'Node 2' } },
    ];
    const mockEdges: Edge[] = [
        { id: 'e1-2', source: '1', target: '2' }
    ];

    it('should return original arrays if impact mode is off and no focus node', () => {
        const state = {
            highlightedNodes: new Set<string>(),
            highlightedEdges: new Set<string>(),
            impactMode: 'off' as const,
            focusNodeId: null
        };

        const result = applyDiagramStyles(mockNodes, mockEdges, state);

        expect(result.nodes).toBe(mockNodes);
        expect(result.edges).toBe(mockEdges);
    });

    it('should highlight focused node and dim others', () => {
        const state = {
            highlightedNodes: new Set(['1']),
            highlightedEdges: new Set<string>(),
            impactMode: 'both' as const,
            focusNodeId: '1'
        };

        const result = applyDiagramStyles(mockNodes, mockEdges, state);

        expect(result.nodes).not.toBe(mockNodes);
        
        const node1 = result.nodes.find(n => n.id === '1');
        const node2 = result.nodes.find(n => n.id === '2');

        expect(node1?.data.isFocused).toBe(true);
        expect(node1?.data.isHighlighted).toBe(true);
        expect(node1?.data.isDimmed).toBe(false);

        expect(node2?.data.isFocused).toBe(false);
        expect(node2?.data.isHighlighted).toBe(false);
        expect(node2?.data.isDimmed).toBe(true);
    });

    it('should highlight edges', () => {
        const state = {
            highlightedNodes: new Set(['1', '2']),
            highlightedEdges: new Set(['e1-2']),
            impactMode: 'both' as const,
            focusNodeId: '1'
        };

        const result = applyDiagramStyles(mockNodes, mockEdges, state);

        const edge = result.edges[0];
        expect(edge.style?.strokeWidth).toBe(2.5);
        expect(edge.animated).toBe(true);
        expect(edge.style?.opacity).toBe(1);
    });
});
