import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagramToolbar } from './Toolbar';

describe('DiagramToolbar', () => {
    const mockOnZoomIn = vi.fn();
    const mockOnZoomOut = vi.fn();
    const mockOnFitView = vi.fn();
    const mockOnToggleAutoImpact = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(
            <DiagramToolbar
                autoImpactMode={false}
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
                onToggleAutoImpact={mockOnToggleAutoImpact}
            />
        );
        expect(screen.getByTitle('Enable auto-impact')).toBeInTheDocument();
    });

    it('calls onToggleAutoImpact when clicked', () => {
        render(
            <DiagramToolbar
                autoImpactMode={false}
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
                onToggleAutoImpact={mockOnToggleAutoImpact}
            />
        );
        const button = screen.getByTitle('Enable auto-impact');
        fireEvent.click(button);
        expect(mockOnToggleAutoImpact).toHaveBeenCalled();
    });

    it('shows correct active state', () => {
        render(
            <DiagramToolbar
                autoImpactMode={true}
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
                onToggleAutoImpact={mockOnToggleAutoImpact}
            />
        );
        expect(screen.getByTitle('Disable auto-impact')).toBeInTheDocument();
    });

    it('calls zoom and fit handlers', () => {
        render(
            <DiagramToolbar
                autoImpactMode={false}
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
                onToggleAutoImpact={mockOnToggleAutoImpact}
            />
        );
        
        fireEvent.click(screen.getByTitle('Zoom in'));
        expect(mockOnZoomIn).toHaveBeenCalled();
        
        fireEvent.click(screen.getByTitle('Zoom out'));
        expect(mockOnZoomOut).toHaveBeenCalled();
        
        fireEvent.click(screen.getByTitle('Fit view'));
        expect(mockOnFitView).toHaveBeenCalled();
    });
});