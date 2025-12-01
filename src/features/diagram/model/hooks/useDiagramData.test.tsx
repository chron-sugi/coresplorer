/**
 * useDiagramData hook tests
 *
 * Test suite for the useDiagramData hook that fetches and transforms
 * the diagram graph data for React Flow rendering.
 */

import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDiagramData } from './useDiagramData';
import { server } from '@/shared/testing/server';
import { http, HttpResponse } from 'msw';
import { apiConfig } from '@/shared/config';

// Create a wrapper with QueryClient
function createWrapper(): React.FC<{ children: React.ReactNode }> {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries in tests
            },
        },
    });
    
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
    
    return Wrapper;
}

describe('useDiagramData', () => {
    const mockGraphData = {
        version: '1.0.0',
        nodes: [
            { 
                id: 'node-1', 
                label: 'Node 1', 
                type: 'saved_search', 
                app: 'search', 
                owner: 'admin', 
                last_modified: '2023-01-01T00:00:00Z',
                edges: [{ source: 'node-1', target: 'node-2', label: 'uses' }] 
            },
            { 
                id: 'node-2', 
                label: 'Node 2', 
                type: 'index',
                app: 'system',
                owner: 'nobody',
                last_modified: '2023-01-01T00:00:00Z',
                edges: []
            }
        ]
    };

    beforeEach(() => {
        // Reset handlers to default (defined in handlers.ts) or clear them
        server.resetHandlers();
    });

    it('should successfully fetch and process data', async () => {
        // Override handler for this test if needed, or rely on default
        server.use(
            http.get(apiConfig.endpoints.graph, () => {
                return HttpResponse.json(mockGraphData);
            })
        );

        const { result } = renderHook(() => useDiagramData('node-1', new Set()), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeNull();
        expect(result.current.fullData).toBeDefined();
        expect(result.current.nodes.length).toBe(2);
        expect(result.current.edges.length).toBe(1);
    });

    it('should handle fetch errors', async () => {
        server.use(
            http.get(apiConfig.endpoints.graph, () => {
                return HttpResponse.json({ error: 'Server error' }, { status: 500 });
            })
        );

        const { result } = renderHook(() => useDiagramData('node-1', new Set()), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.nodes.length).toBe(0);
    });

    it('should filter hidden node types', async () => {
        server.use(
            http.get(apiConfig.endpoints.graph, () => {
                return HttpResponse.json(mockGraphData);
            })
        );

        const hiddenTypes = new Set(['saved_search']);
        const { result } = renderHook(() => useDiagramData('node-1', hiddenTypes), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Only node-2 (index) should be visible
        expect(result.current.nodes.length).toBe(1);
        expect(result.current.nodes[0].id).toBe('node-2');
    });

    it('should handle BFS from core node', async () => {
        server.use(
            http.get(apiConfig.endpoints.graph, () => {
                return HttpResponse.json(mockGraphData);
            })
        );

        const { result } = renderHook(() => useDiagramData('node-1', new Set()), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Both nodes are connected via BFS
        expect(result.current.effectiveCoreId).toBe('node-1');
        expect(result.current.nodes.length).toBe(2);
    });
});
