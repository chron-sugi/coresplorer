import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as DiagramStore from '../../../model/store/diagram.store';
import * as DiagramDataHook from '../../../model/hooks/useDiagramData';
import { NodeImpactTab } from './NodeImpactTab';

describe('NodeImpactTab', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                coreId: 'core-1',
                hiddenTypes: new Set(),
            };
            return selector(state);
        });

        vi.spyOn(DiagramDataHook, 'useDiagramData').mockReturnValue({
            fullData: {
                nodes: [
                    { id: 'node-1', edges: [{ target: 'node-2' }] },
                    { id: 'node-2', edges: [] },
                ],
            },
        } as any);
    });


    it('renders with node ID', () => {
        render(<NodeImpactTab nodeId="node-1" />);
        expect(screen.getByText('Impact Analysis')).toBeInTheDocument();
        expect(screen.getByText('Upstream Sources')).toBeInTheDocument();
        expect(screen.getByText('Downstream Nodes')).toBeInTheDocument();
    });
});
