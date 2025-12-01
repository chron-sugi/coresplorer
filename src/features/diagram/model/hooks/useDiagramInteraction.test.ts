import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDiagramInteraction } from './useDiagramInteraction';
import type { ReactFlowInstance } from '@xyflow/react';

describe('useDiagramInteraction', () => {
    const mockSetFocusNodeId = vi.fn();
    const mockSetSelectedNodeId = vi.fn();
    const mockSetActiveTab = vi.fn();
    const mockSetImpactMode = vi.fn();
    const mockClearHighlighting = vi.fn();
    const mockFitView = vi.fn();

    const mockRfInstance = {
        fitView: mockFitView,
    } as unknown as ReactFlowInstance;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle node click', () => {
        const { result } = renderHook(() => useDiagramInteraction({
            rfInstance: mockRfInstance,
            autoImpactMode: true,
            setFocusNodeId: mockSetFocusNodeId,
            setSelectedNodeId: mockSetSelectedNodeId,
            setActiveTab: mockSetActiveTab,
            setImpactMode: mockSetImpactMode,
            clearHighlighting: mockClearHighlighting
        }));

        const mockNode = { id: 'node-1', position: { x: 0, y: 0 }, data: {} };
        const mockEvent = {} as React.MouseEvent;

        act(() => {
            result.current.onNodeClick(mockEvent, mockNode);
        });

        expect(mockSetFocusNodeId).toHaveBeenCalledWith('node-1');
        expect(mockSetSelectedNodeId).toHaveBeenCalledWith('node-1');
        expect(mockSetActiveTab).toHaveBeenCalledWith('details');
        expect(mockSetImpactMode).toHaveBeenCalledWith('both');
    });

    it('should handle node click with autoImpactMode off', () => {
        const { result } = renderHook(() => useDiagramInteraction({
            rfInstance: mockRfInstance,
            autoImpactMode: false,
            setFocusNodeId: mockSetFocusNodeId,
            setSelectedNodeId: mockSetSelectedNodeId,
            setActiveTab: mockSetActiveTab,
            setImpactMode: mockSetImpactMode,
            clearHighlighting: mockClearHighlighting
        }));

        const mockNode = { id: 'node-1', position: { x: 0, y: 0 }, data: {} };
        const mockEvent = {} as React.MouseEvent;

        act(() => {
            result.current.onNodeClick(mockEvent, mockNode);
        });

        expect(mockSetImpactMode).toHaveBeenCalledWith('off');
    });

    it('should handle pane click', () => {
        const { result } = renderHook(() => useDiagramInteraction({
            rfInstance: mockRfInstance,
            autoImpactMode: true,
            setFocusNodeId: mockSetFocusNodeId,
            setSelectedNodeId: mockSetSelectedNodeId,
            setActiveTab: mockSetActiveTab,
            setImpactMode: mockSetImpactMode,
            clearHighlighting: mockClearHighlighting
        }));

        act(() => {
            result.current.onPaneClick();
        });

        expect(mockClearHighlighting).toHaveBeenCalled();
        expect(mockSetSelectedNodeId).toHaveBeenCalledWith(null);
        expect(mockSetFocusNodeId).toHaveBeenCalledWith(null);
    });

    it('should focus node programmatically', () => {
        const { result } = renderHook(() => useDiagramInteraction({
            rfInstance: mockRfInstance,
            autoImpactMode: true,
            setFocusNodeId: mockSetFocusNodeId,
            setSelectedNodeId: mockSetSelectedNodeId,
            setActiveTab: mockSetActiveTab,
            setImpactMode: mockSetImpactMode,
            clearHighlighting: mockClearHighlighting
        }));

        act(() => {
            result.current.focusNode('node-1');
        });

        expect(mockSetFocusNodeId).toHaveBeenCalledWith('node-1');
        expect(mockSetSelectedNodeId).toHaveBeenCalledWith('node-1');
        expect(mockSetActiveTab).toHaveBeenCalledWith('details');
        expect(mockFitView).toHaveBeenCalledWith(expect.objectContaining({
            nodes: [{ id: 'node-1' }]
        }));
    });
});
