import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NodeDetailsSection } from './NodeDetailsTab';
import type { NodeDetails } from '../../../diagram.schemas';

describe('NodeDetailsSection', () => {
    const mockNodeDetails: NodeDetails = {
        name: 'Test Node',
        owner: 'admin',
        app: 'search',
        last_modified: '2023-10-27T10:00:00Z',
        description: 'A test node description',
        spl_code: 'search index=main | stats count'
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
        expect(screen.getByText('A test node description')).toBeInTheDocument();
        
        // Date formatting check
        expect(screen.getByText(/2023/)).toBeInTheDocument();
    });

    it('uses fallback description when missing', () => {
        const detailsWithoutDesc = { ...mockNodeDetails, description: '' };
        render(
            <NodeDetailsSection nodeId="node-1" nodeDetails={detailsWithoutDesc} />
        );
        expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    it('formatDate behavior for invalid date strings', () => {
        const detailsWithInvalidDate = { ...mockNodeDetails, last_modified: 'not-a-date' };
        render(
            <NodeDetailsSection nodeId="node-1" nodeDetails={detailsWithInvalidDate} />
        );
        expect(screen.getByText('not-a-date')).toBeInTheDocument();
    });
});
