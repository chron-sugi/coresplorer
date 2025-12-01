import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NodeFilterSection } from './NodeFilterSection';
import * as DiagramStore from '../../model/store/diagram.store';
import userEvent from '@testing-library/user-event';

vi.mock('../../model/constants/diagram.constants', () => ({
    NODE_TYPES: ['saved_search', 'dashboard', 'lookup'],
    TYPE_ICONS: {
        saved_search: () => <div>SavedSearchIcon</div>,
        dashboard: () => <div>DashboardIcon</div>,
        lookup: () => <div>LookupIcon</div>,
    },
}));

describe('NodeFilterSection', () => {
    const mockToggleHiddenType = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                hiddenTypes: new Set(),
                toggleHiddenType: mockToggleHiddenType,
            };
            return selector(state);
        });
    });

    it('renders all node types', () => {
        render(<NodeFilterSection />);

        expect(screen.getByText('saved_search')).toBeInTheDocument();
        expect(screen.getByText('dashboard')).toBeInTheDocument();
        expect(screen.getByText('lookup')).toBeInTheDocument();
    });

    it('toggles type visibility when clicked', async () => {
        const user = userEvent.setup();
        render(<NodeFilterSection />);

        const savedSearchButton = screen.getByText('saved_search').closest('button');
        await user.click(savedSearchButton!);

        expect(mockToggleHiddenType).toHaveBeenCalledWith('saved_search');
    });

    it('applies correct styling for hidden types', () => {
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                hiddenTypes: new Set(['saved_search']),
                toggleHiddenType: mockToggleHiddenType,
            };
            return selector(state);
        });

        render(<NodeFilterSection />);

        const savedSearchButton = screen.getByText('saved_search').closest('button');
        expect(savedSearchButton).toHaveClass('opacity-40', 'line-through');
    });
});

