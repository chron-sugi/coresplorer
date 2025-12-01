/**
 * Diagram data queries
 *
 * Contains hooks that fetch the global graph JSON and validate it
 * for use by the diagram feature.
 */
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/shared/config';
import { GraphSchema } from '@/entities/snapshot';
import { DiagramDataFetchError, DiagramValidationError } from '../diagram.errors';

async function fetchGraphData() {
    const response = await fetch(apiConfig.endpoints.graph);
    if (!response.ok) {
        throw new DiagramDataFetchError(
            `Failed to fetch diagram data: ${response.status} ${response.statusText}`,
            response.url
        );
    }
    const json = await response.json();
    
    const parseResult = GraphSchema.safeParse(json);
    if (!parseResult.success) {
        throw new DiagramValidationError(
            'Invalid diagram data structure',
            parseResult.error,
            json
        );
    }
    
    return parseResult.data;
}

export function useDiagramGraphQuery() {
    return useQuery({
        queryKey: ['diagram', 'graph'],
        queryFn: fetchGraphData,
    });
}
