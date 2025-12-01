import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubsearchPanel } from './SubsearchPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { findFoldableRanges } from '../../../lib/folding/folding';
import { useEditorStore } from '@/entities/spl';

vi.mock('../../../lib/folding/folding');

describe('SubsearchPanel', () => {
    const mockSetHighlightedLines = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useEditorStore.setState({ splText: 'mock code' });
        useInspectorStore.setState({
            highlightedLines: [],
            setHighlightedLines: mockSetHighlightedLines,
        });
    });

    it('renders empty state when no ranges found', () => {
        (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([]);
        render(<SubsearchPanel />);
        expect(screen.getByText('No structural elements found.')).toBeInTheDocument();
    });

    it('renders ranges correctly', () => {
        (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { startLine: 1, endLine: 5, type: 'subsearch' },
            { startLine: 10, endLine: 15, type: 'subsearch' }
        ]);

        render(<SubsearchPanel />);

        expect(screen.getByText('Subsearch (Lines 1-5)')).toBeInTheDocument();
        expect(screen.getByText('Subsearch (Lines 10-15)')).toBeInTheDocument();
    });

    it('highlights lines on click', () => {
        (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { startLine: 2, endLine: 4, type: 'subsearch' }
        ]);

        render(<SubsearchPanel />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Should highlight lines 2, 3, 4
        expect(mockSetHighlightedLines).toHaveBeenCalledWith([2, 3, 4]);
    });

    it('handles single line ranges (edge case)', () => {
        (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { startLine: 5, endLine: 5, type: 'subsearch' }
        ]);

        render(<SubsearchPanel />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetHighlightedLines).toHaveBeenCalledWith([5]);
    });

    it('handles inverted ranges (adversarial)', () => {
        // Start > End
        (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { startLine: 10, endLine: 5, type: 'subsearch' }
        ]);

        render(<SubsearchPanel />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // The loop `for (let i = range.startLine; i <= range.endLine; i++)` will not execute
        // So it should call with empty array
        expect(mockSetHighlightedLines).toHaveBeenCalledWith([]);
    });

    it('handles large ranges', () => {
        (findFoldableRanges as unknown as ReturnType<typeof vi.fn>).mockReturnValue([
            { startLine: 1, endLine: 1000, type: 'subsearch' }
        ]);

        render(<SubsearchPanel />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Should call with array of 1000 items
        expect(mockSetHighlightedLines).toHaveBeenCalledWith(expect.any(Array));
        const args = mockSetHighlightedLines.mock.calls[0][0];
        expect(args).toHaveLength(1000);
        expect(args[0]).toBe(1);
        expect(args[999]).toBe(1000);
    });
});
