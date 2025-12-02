import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PerfLinterPanel } from './PerfLinterPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { lintSpl, useEditorStore } from '@/entities/spl';

// Mock dependencies (override lintSpl but keep other exports)
vi.mock('@/entities/spl', async () => {
    const actual = await vi.importActual('@/entities/spl');
    return {
        ...actual,
        lintSpl: vi.fn(),
    };
});

describe('PerfLinterPanel', () => {
    const mockSetHighlightedLines = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useEditorStore.setState({ splText: 'mock code' });
        useInspectorStore.setState({
            highlightedLines: [],
            setHighlightedLines: mockSetHighlightedLines,
        });
    });

    it('renders empty state when no warnings found', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
        render(<PerfLinterPanel />);
        expect(screen.getByText('No performance issues detected.')).toBeInTheDocument();
    });

    it('renders warnings correctly', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 1, message: 'Bad code', severity: 'medium', suggestion: 'Fix it' },
            { line: 5, message: 'Very bad code', severity: 'high' }
        ]);

        render(<PerfLinterPanel />);

        expect(screen.getByText(/Line 1: Bad code/)).toBeInTheDocument();
        expect(screen.getByText(/Tip: Fix it/)).toBeInTheDocument();
        expect(screen.getByText(/Line 5: Very bad code/)).toBeInTheDocument();
    });

    it('highlights line on click', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 10, message: 'Issue', severity: 'medium' }
        ]);

        render(<PerfLinterPanel />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetHighlightedLines).toHaveBeenCalledWith([10]);
    });

    it('handles large number of warnings without crashing', () => {
        const manyWarnings = Array.from({ length: 1000 }, (_, i) => ({
            line: i,
            message: `Issue ${i}`,
            severity: i % 2 === 0 ? 'medium' : 'high'
        }));
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue(manyWarnings);

        render(<PerfLinterPanel />);
        
        expect(screen.getByText(/Line 0: Issue 0/)).toBeInTheDocument();
        expect(screen.getByText(/Line 999: Issue 999/)).toBeInTheDocument();
    });

    it('renders correctly with malformed warning data', () => {
        // Adversarial: Missing optional fields or unexpected data
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 1, message: '', severity: 'medium' }, // Empty message
            { line: -1, message: 'Negative line', severity: 'high' } // Invalid line
        ]);

        render(<PerfLinterPanel />);
        expect(screen.getByText(/Line 1:/)).toBeInTheDocument();
        expect(screen.getByText(/Line -1: Negative line/)).toBeInTheDocument();
    });
});
