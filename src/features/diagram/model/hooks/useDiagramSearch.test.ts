import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDiagramSearch } from './useDiagramSearch';

type TestNode = {
    id: string;
    position: { x: number; y: number };
    data: { label?: string; object_type?: string; app?: string };
};

describe('useDiagramSearch', () => {
    const mockNodes: TestNode[] = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node A', object_type: 'type1' } },
        { id: '2', position: { x: 0, y: 0 }, data: { label: 'Node B', object_type: 'type2' } },
        { id: '3', position: { x: 0, y: 0 }, data: { label: 'Another Node', object_type: 'type1' } },
    ];

    const mockOnSelectNode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with closed state', () => {
        const { result } = renderHook(() => useDiagramSearch({ nodes: mockNodes, onSelectNode: mockOnSelectNode }));
        expect(result.current.isOpen).toBe(false);
        expect(result.current.query).toBe('');
        expect(result.current.suggestions).toEqual([]);
    });

    it('should open and close search', () => {
        const { result } = renderHook(() => useDiagramSearch({ nodes: mockNodes, onSelectNode: mockOnSelectNode }));

        act(() => {
            result.current.openSearch();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.closeSearch();
        });
        expect(result.current.isOpen).toBe(false);
        expect(result.current.query).toBe('');
        expect(result.current.suggestions).toEqual([]);
    });

    it('should filter suggestions based on query', () => {
        const { result } = renderHook(() => useDiagramSearch({ nodes: mockNodes, onSelectNode: mockOnSelectNode }));

        act(() => {
            result.current.setQuery('Node');
        });

        expect(result.current.suggestions).toHaveLength(3); // "Node A", "Node B", "Another Node"

        act(() => {
            result.current.setQuery('Another');
        });
        expect(result.current.suggestions).toHaveLength(1);
        expect(result.current.suggestions[0].label).toBe('Another Node');
    });

    it('should handle selection', () => {
        const { result } = renderHook(() => useDiagramSearch({ nodes: mockNodes, onSelectNode: mockOnSelectNode }));

        act(() => {
            result.current.openSearch();
            result.current.handleSelectSuggestion('1');
        });

        expect(mockOnSelectNode).toHaveBeenCalledWith('1');
        expect(result.current.isOpen).toBe(false);
    });

    it('should open on Ctrl+F', () => {
        const { result } = renderHook(() => useDiagramSearch({ nodes: mockNodes, onSelectNode: mockOnSelectNode }));
        
        const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        act(() => {
            window.dispatchEvent(event);
        });

        expect(result.current.isOpen).toBe(true);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });
});
