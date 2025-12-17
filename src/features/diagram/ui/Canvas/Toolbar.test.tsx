import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagramToolbar } from './Toolbar';

describe('DiagramToolbar', () => {
    const mockOnZoomIn = vi.fn();
    const mockOnZoomOut = vi.fn();
    const mockOnFitView = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(
            <DiagramToolbar
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
            />
        );
        expect(screen.getByTitle('Zoom in')).toBeInTheDocument();
        expect(screen.getByTitle('Zoom out')).toBeInTheDocument();
        expect(screen.getByTitle('Fit view')).toBeInTheDocument();
    });

    it('calls zoom and fit handlers', () => {
        render(
            <DiagramToolbar
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
            />
        );

        fireEvent.click(screen.getByTitle('Zoom in'));
        expect(mockOnZoomIn).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('Zoom out'));
        expect(mockOnZoomOut).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('Fit view'));
        expect(mockOnFitView).toHaveBeenCalled();
    });

    it('renders center on core button when handler is provided', () => {
        const mockOnCenterOnCore = vi.fn();
        render(
            <DiagramToolbar
                onZoomIn={mockOnZoomIn}
                onZoomOut={mockOnZoomOut}
                onFitView={mockOnFitView}
                onCenterOnCore={mockOnCenterOnCore}
            />
        );

        const centerButton = screen.getByTitle('Center on core node');
        expect(centerButton).toBeInTheDocument();

        fireEvent.click(centerButton);
        expect(mockOnCenterOnCore).toHaveBeenCalled();
    });
});
