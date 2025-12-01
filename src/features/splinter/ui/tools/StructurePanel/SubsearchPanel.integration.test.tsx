import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SubsearchPanel } from './SubsearchPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { useEditorStore } from '@/entities/spl';

describe('SubsearchPanel Integration', () => {
    beforeEach(() => {
        useEditorStore.setState({ splText: '' });
        useInspectorStore.setState({
            highlightedLines: [],
            activeCommand: null,
            activeField: null,
            selectedText: null
        });
    });

    it('displays foldable ranges for subsearches using real domain logic', () => {
        const splWithSubsearch = `search index=main 
| join host [ 
    search index=network 
    | stats count by host 
]`;

        useEditorStore.setState({ splText: splWithSubsearch });
        render(<SubsearchPanel />);

        // The subsearch starts at line 2 and ends at line 5
        // We use a custom matcher to handle potential whitespace issues in JSDOM rendering
        expect(screen.getByText((content) => content.replace(/\s+/g, '').includes('Subsearch(Lines2-5)'))).toBeInTheDocument();
    });

    it('highlights the range when clicked', () => {
        const splWithSubsearch = `search index=main 
| join host [ 
    search index=network 
]`;

        useEditorStore.setState({ splText: splWithSubsearch });
        render(<SubsearchPanel />);

        const rangeItem = screen.getByText((content) => content.replace(/\s+/g, '').includes('Subsearch(Lines2-4)'));
        fireEvent.click(rangeItem);

        const state = useInspectorStore.getState();
        // It should highlight lines 2, 3, 4
        expect(state.highlightedLines).toEqual([2, 3, 4]);
    });

    it('shows "No foldable ranges" for flat SPL', () => {
        const flatSpl = `search index=main | stats count by host`;
        
        useEditorStore.setState({ splText: flatSpl });
        render(<SubsearchPanel />);

        expect(screen.getByText('No structural elements found.')).toBeInTheDocument();
    });
});
