import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeDetailsSection } from './NodeDetailsTab';
import type { NodeDetails } from '../../../model/diagram.schemas';

describe('NodeDetailsSection', () => {
    const mockNodeDetails: NodeDetails = {
        name: 'Test Node',
        owner: 'admin',
        app: 'search',
        last_modified: '2023-10-27T10:00:00Z',
        description: 'A test node description',
        spl_code: 'search index=main | stats count',
        attributes: { key1: 'value1', key2: 'value2' }
    };

    it('renders empty state when nodeId or nodeDetails is null', () => {
        const { rerender } = render(
            <NodeDetailsSection nodeId={null} nodeDetails={mockNodeDetails} />
        );
        expect(screen.getByText('Select a node to view details')).toBeInTheDocument();

        rerender(
            <NodeDetailsSection nodeId="node-1" nodeDetails={null} />
        );
        expect(screen.getByText('Select a node to view details')).toBeInTheDocument();
    });

    it('renders node details correctly', () => {
        render(
            <NodeDetailsSection nodeId="node-1" nodeDetails={mockNodeDetails} />
        );

        // Check for node ID
        expect(screen.getByText('node-1')).toBeInTheDocument();

        // Check for details
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('search')).toBeInTheDocument();

        // Check for attributes
        expect(screen.getByText('key1:')).toBeInTheDocument();
        expect(screen.getByText('value1')).toBeInTheDocument();
        expect(screen.getByText('key2:')).toBeInTheDocument();
        expect(screen.getByText('value2')).toBeInTheDocument();

        // Date formatting check
        expect(screen.getByText(/2023/)).toBeInTheDocument();
    });

    it('shows fallback when attributes are missing', () => {
        const detailsWithoutAttrs = { ...mockNodeDetails, attributes: null };
        render(
            <NodeDetailsSection nodeId="node-1" nodeDetails={detailsWithoutAttrs} />
        );
        expect(screen.getByText('No attributes available')).toBeInTheDocument();
    });

    it('shows fallback when attributes are empty', () => {
        const detailsWithEmptyAttrs = { ...mockNodeDetails, attributes: {} };
        render(
            <NodeDetailsSection nodeId="node-1" nodeDetails={detailsWithEmptyAttrs} />
        );
        expect(screen.getByText('No attributes available')).toBeInTheDocument();
    });

    it('formatDate behavior for invalid date strings', () => {
        const detailsWithInvalidDate = { ...mockNodeDetails, last_modified: 'not-a-date' };
        render(
            <NodeDetailsSection nodeId="node-1" nodeDetails={detailsWithInvalidDate} />
        );
        expect(screen.getByText('not-a-date')).toBeInTheDocument();
    });
});
