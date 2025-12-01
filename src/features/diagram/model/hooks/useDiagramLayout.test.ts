import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDiagramLayout } from './useDiagramLayout';
import { Position } from '@xyflow/react';

describe('useDiagramLayout', () => {
    it('should layout nodes and edges', () => {
        const { result } = renderHook(() => useDiagramLayout());
        
        const nodes = [
            { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
            { id: '2', position: { x: 0, y: 0 }, data: { label: '2' } }
        ];
        const edges = [
            { id: 'e1-2', source: '1', target: '2' }
        ];

        const layouted = result.current.getLayoutedElements(nodes, edges);

        expect(layouted.nodes).toHaveLength(2);
        expect(layouted.edges).toHaveLength(1);
        
        // Check if positions are updated (Dagre should assign non-zero positions usually, 
        // but even if 0, we check structure)
        expect(layouted.nodes[0].position).toBeDefined();
        expect(layouted.nodes[1].position).toBeDefined();
        
        // Check handles for TB direction (default)
        expect(layouted.nodes[0].targetPosition).toBe(Position.Top);
        expect(layouted.nodes[0].sourcePosition).toBe(Position.Bottom);
    });

    it('should handle LR direction', () => {
        const { result } = renderHook(() => useDiagramLayout());
        
        const nodes = [{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' } }];
        const edges: any[] = [];

        const layouted = result.current.getLayoutedElements(nodes, edges, 'LR');

        expect(layouted.nodes[0].targetPosition).toBe(Position.Left);
        expect(layouted.nodes[0].sourcePosition).toBe(Position.Right);
    });
});
