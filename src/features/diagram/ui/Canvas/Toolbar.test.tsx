import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagramToolbar } from './Toolbar';
import * as DiagramStore from '../../model/store/diagram.store';

// Mock dependencies
vi.mock('@xyflow/react', async () => {
    return {
        Controls: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        ControlButton: ({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) => (
            <button onClick={onClick} title={title}>{children}</button>
        ),
        useReactFlow: () => ({
            zoomIn: vi.fn(),
            zoomOut: vi.fn(),
            fitView: vi.fn(),
            getNode: vi.fn(),
            setCenter: vi.fn(),
        }),
    };
});

describe('DiagramToolbar', () => {
    const mockSetAutoImpactMode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the store hook to execute the selector against our mock state
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                coreId: 'core-1',
                autoImpactMode: false,
                setAutoImpactMode: mockSetAutoImpactMode,
            };
            return selector(state);
        });
    });

    it('renders correctly', () => {
        render(<DiagramToolbar />);
        expect(screen.getByTitle('Enable auto-impact')).toBeInTheDocument();
    });

    it('toggles autoImpactMode when clicked', () => {
        render(<DiagramToolbar />);
        const button = screen.getByTitle('Enable auto-impact');
        fireEvent.click(button);
        // The component calls setAutoImpactMode(!autoImpactMode)
        // autoImpactMode is false in initial state, so it should be called with true
        expect(mockSetAutoImpactMode).toHaveBeenCalledWith(true);
    });

    it('shows correct active state', () => {
        // Update mock for this specific test
        vi.spyOn(DiagramStore, 'useDiagramStore').mockImplementation((selector: any) => {
            const state = {
                coreId: 'core-1',
                autoImpactMode: true,
                setAutoImpactMode: mockSetAutoImpactMode,
            };
            return selector(state);
        });

        render(<DiagramToolbar />);
        expect(screen.getByTitle('Disable auto-impact')).toBeInTheDocument();
    });
});

