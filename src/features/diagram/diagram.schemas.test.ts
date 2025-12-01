import { describe, it, expect } from 'vitest';
import {
    DiagramEdgeSchema,
    DiagramNodeDataSchema,
    DiagramDataSchema,
    NodeDetailsSchema,
    NodeDetailsDataSchema
} from './diagram.schemas';

describe('Diagram Schemas', () => {
    describe('DiagramEdgeSchema', () => {
        it('accepts valid edge', () => {
            const validEdge = { from: 'node-a', to: 'node-b' };
            const result = DiagramEdgeSchema.safeParse(validEdge);
            expect(result.success).toBe(true);
        });

        it('rejects edge missing required fields', () => {
            const invalidEdge = { from: 'node-a' }; // missing 'to'
            const result = DiagramEdgeSchema.safeParse(invalidEdge);
            expect(result.success).toBe(false);
        });

        it('rejects edge with wrong types', () => {
            const invalidEdge = { from: 123, to: 'node-b' }; // from should be string
            const result = DiagramEdgeSchema.safeParse(invalidEdge);
            expect(result.success).toBe(false);
        });
    });

    describe('DiagramNodeDataSchema', () => {
        const validNodeBase = {
            object_type: 'saved_search',
            label: 'My Search',
            linked_nodes: ['node-b', 'node-c'],
            edges: [{ from: 'node-a', to: 'node-b' }]
        };

        it('accepts valid node data with optional fields', () => {
            const validNode = { ...validNodeBase, name: 'search_1' };
            const result = DiagramNodeDataSchema.safeParse(validNode);
            expect(result.success).toBe(true);
        });

        it('accepts valid node data without optional fields', () => {
            const validNode = { ...validNodeBase };
            const result = DiagramNodeDataSchema.safeParse(validNode);
            expect(result.success).toBe(true);
        });

        it('rejects node missing required fields', () => {
            const invalidNode = { ...validNodeBase, label: undefined };
            const result = DiagramNodeDataSchema.safeParse(invalidNode);
            expect(result.success).toBe(false);
        });

        it('rejects node with invalid edges', () => {
            const invalidNode = {
                ...validNodeBase,
                edges: [{ from: 'node-a' }] // Invalid edge
            };
            const result = DiagramNodeDataSchema.safeParse(invalidNode);
            expect(result.success).toBe(false);
        });
    });

    describe('DiagramDataSchema', () => {
        it('accepts valid diagram data record', () => {
            const validData = {
                'node-a': {
                    object_type: 'saved_search',
                    label: 'Node A',
                    linked_nodes: [],
                    edges: []
                },
                'node-b': {
                    object_type: 'index',
                    label: 'Node B',
                    linked_nodes: [],
                    edges: []
                }
            };
            const result = DiagramDataSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('rejects diagram data with invalid node', () => {
            const invalidData = {
                'node-a': {
                    object_type: 'saved_search',
                    // missing label
                    linked_nodes: [],
                    edges: []
                }
            };
            const result = DiagramDataSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('NodeDetailsSchema', () => {
        const validDetailsBase = {
            name: 'Test Node',
            owner: 'admin',
            app: 'search',
            last_modified: '2023-10-27T10:00:00Z',
            description: 'Description'
        };

        it('accepts valid details with spl_code', () => {
            const validDetails = { ...validDetailsBase, spl_code: 'search index=main' };
            const result = NodeDetailsSchema.safeParse(validDetails);
            expect(result.success).toBe(true);
        });

        it('accepts valid details without spl_code', () => {
            const validDetails = { ...validDetailsBase };
            const result = NodeDetailsSchema.safeParse(validDetails);
            expect(result.success).toBe(true);
        });

        it('rejects details missing required fields', () => {
            const invalidDetails = { ...validDetailsBase, owner: undefined };
            const result = NodeDetailsSchema.safeParse(invalidDetails);
            expect(result.success).toBe(false);
        });

        it('rejects details with wrong types', () => {
            const invalidDetails = { ...validDetailsBase, app: 123 }; // app should be string
            const result = NodeDetailsSchema.safeParse(invalidDetails);
            expect(result.success).toBe(false);
        });
    });

    describe('NodeDetailsDataSchema', () => {
        it('accepts valid node details record', () => {
            const validData = {
                'node-1': {
                    name: 'Node 1',
                    owner: 'user',
                    app: 'app',
                    last_modified: 'date',
                    description: 'desc'
                }
            };
            const result = NodeDetailsDataSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });
});
