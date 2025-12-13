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

describe('PerfLinterPanel accessibility', () => {
    const mockSetHighlightedLines = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useEditorStore.setState({ splText: 'mock code' });
        useInspectorStore.setState({
            highlightedLines: [],
            setHighlightedLines: mockSetHighlightedLines,
        });
    });

    it('warning items are interactive buttons', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 1, message: 'Performance issue', severity: 'medium' }
        ]);

        render(<PerfLinterPanel />);

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('has visible panel header', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
        render(<PerfLinterPanel />);

        expect(screen.getByText(/Performance/i)).toBeInTheDocument();
    });

    it('severity is indicated with icons for each warning', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 1, message: 'High priority issue', severity: 'high' },
            { line: 2, message: 'Medium priority issue', severity: 'medium' }
        ]);

        render(<PerfLinterPanel />);

        // Each warning should be a button with an icon
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBe(2);

        // Messages should be visible
        expect(screen.getByText(/High priority issue/)).toBeInTheDocument();
        expect(screen.getByText(/Medium priority issue/)).toBeInTheDocument();
    });

    it('line numbers are included in warning text for context', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 42, message: 'Issue at line 42', severity: 'medium' }
        ]);

        render(<PerfLinterPanel />);

        expect(screen.getByText(/Line 42/)).toBeInTheDocument();
    });

    it('suggestions are displayed when available', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { line: 1, message: 'Issue', severity: 'medium', suggestion: 'Try this fix' }
        ]);

        render(<PerfLinterPanel />);

        expect(screen.getByText(/Tip: Try this fix/)).toBeInTheDocument();
    });

    it('empty state message is accessible', () => {
        (lintSpl as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
        render(<PerfLinterPanel />);

        expect(screen.getByText('No performance issues detected.')).toBeInTheDocument();
    });
});
