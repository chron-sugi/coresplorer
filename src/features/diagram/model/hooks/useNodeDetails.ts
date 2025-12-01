/**
 * Node details loader hook
 *
 * Provides a small caching layer and validation for node details JSON files
 * that are bundled with the snapshot data. Uses dynamic imports collected
 * via Vite's `import.meta.glob`.
 */
import { useState, useCallback } from 'react';
import { NodeDetailSchema } from '@/entities/snapshot';
import type { NodeDetail } from '@/entities/snapshot';
import { DiagramDataFetchError, DiagramValidationError } from '../../diagram.errors';

type UseNodeDetailsOptions = Record<string, never>;

// Import all node details JSON files
const nodeDetailsModules = import.meta.glob('@/data/nodes/details/*.json', { eager: true });

export const useNodeDetails = (_options: UseNodeDetailsOptions = {}): {
    nodeDetailsData: Record<string, NodeDetail>;
    loading: boolean;
    error: string | null;
    fetchNodeDetails: (nodeId: string) => Promise<void>;
} => {
    
    // Store details in a map for caching
    const [nodeDetailsData, setNodeDetailsData] = useState<Record<string, NodeDetail>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNodeDetails = useCallback(async (nodeId: string) => {
        if (nodeDetailsData[nodeId]) return; // Already cached

        setLoading(true);
        try {
            // Find the module for the requested node ID
            // The key will be something like "/src/data/nodes/details/node-1.json"
            const modulePath = Object.keys(nodeDetailsModules).find(path => path.endsWith(`/${nodeId}.json`));
            
            if (!modulePath) {
                throw new DiagramDataFetchError(
                    `Details not found for node ${nodeId}`,
                    new Error('File not found in bundle'),
                    nodeId
                );
            }

            const rawData = (nodeDetailsModules[modulePath] as Record<string, NodeDetail>).default || nodeDetailsModules[modulePath];
            
            // Runtime validation with Zod
            const parseResult = NodeDetailSchema.safeParse(rawData);
            if (!parseResult.success) {
                throw new DiagramValidationError(
                    `Invalid node details structure for ${nodeId}`,
                    parseResult.error,
                    rawData
                );
            }
            
            setNodeDetailsData(prev => ({
                ...prev,
                [nodeId]: parseResult.data
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            
            if (err instanceof DiagramDataFetchError || err instanceof DiagramValidationError) {
                console.error(`[${err.name}]`, {
                    message: err.message,
                    url: 'url' in err ? err.url : undefined,
                    cause: err.cause
                });
            } else {
                console.error('Unexpected error:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [nodeDetailsData]);

    return { nodeDetailsData, fetchNodeDetails, loading, error };
};

