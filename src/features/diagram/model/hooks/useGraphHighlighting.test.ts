import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGraphHighlighting } from './useGraphHighlighting';

describe('useGraphHighlighting', () => {
    const edges = [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' }
    ];

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useGraphHighlighting(edges));

        expect(result.current.focusNodeId).toBeNull();
        expect(result.current.impactMode).toBe('off');
        expect(result.current.highlightedNodes.size).toBe(0);
        expect(result.current.highlightedEdges.size).toBe(0);
    });

    it('should update focus node and compute highlights', () => {
        const { result } = renderHook(() => useGraphHighlighting(edges));

        act(() => {
            result.current.setFocusNodeId('2');
            result.current.setImpactMode('downstream');
        });

        expect(result.current.focusNodeId).toBe('2');
        expect(result.current.impactMode).toBe('downstream');
        
        // 2 -> 3. So 2 and 3 should be highlighted.
        expect(result.current.highlightedNodes.has('2')).toBe(true);
        expect(result.current.highlightedNodes.has('3')).toBe(true);
        expect(result.current.highlightedEdges.has('e2-3')).toBe(true);
    });

    it('should clear highlighting', () => {
        const { result } = renderHook(() => useGraphHighlighting(edges));

        act(() => {
            result.current.setFocusNodeId('2');
            result.current.setImpactMode('upstream');
        });

        expect(result.current.focusNodeId).toBe('2');

        act(() => {
            result.current.clearHighlighting();
        });

        expect(result.current.focusNodeId).toBeNull();
        expect(result.current.impactMode).toBe('off');
        expect(result.current.highlightedNodes.size).toBe(0);
    });
});
