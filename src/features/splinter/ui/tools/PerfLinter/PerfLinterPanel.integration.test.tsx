import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { PerfLinterPanel } from './PerfLinterPanel';
import { useInspectorStore } from '../../../model/store/splinter.store';
import { useEditorStore } from '@/entities/spl';

describe('PerfLinterPanel Integration', () => {
    beforeEach(() => {
        useEditorStore.setState({ splText: '' });
        useInspectorStore.setState({
            highlightedLines: [],
            activeCommand: null,
            activeField: null,
            selectedText: null
        });
    });

    it('displays warnings for problematic SPL commands using real domain logic', () => {
        const problematicSpl = `search index=main 
| join type=inner host [ search index=network ] 
| transaction host maxspan=5m`;

        useEditorStore.setState({ splText: problematicSpl });
        render(<PerfLinterPanel />);

        // Check for "join" warning (Critical)
        // Text is: Avoid using "join" as it is resource intensive and has limits.
        expect(screen.getByText(/Avoid using "join"/i)).toBeInTheDocument();
        // Critical/Warning labels are not displayed as text, but indicated by color/icon.
        // We verify the message is present.

        // Check for "transaction" warning (Warning)
        // Text is: "transaction" is memory intensive.
        expect(screen.getByText(/"transaction" is memory intensive/i)).toBeInTheDocument();
    });

    it('highlights the relevant line when a warning is clicked', () => {
        const spl = `search index=main 
| join type=inner host [ search index=network ]`;
        
        useEditorStore.setState({ splText: spl });
        render(<PerfLinterPanel />);

        const joinWarning = screen.getByText(/Avoid using "join"/i);
        fireEvent.click(joinWarning);

        // 'join' is on line 2
        const state = useInspectorStore.getState();
        expect(state.highlightedLines).toEqual([2]);
    });

    it('shows "No issues found" for clean SPL', () => {
        const cleanSpl = `search index=main | stats count by host`;
        
        useEditorStore.setState({ splText: cleanSpl });
        render(<PerfLinterPanel />);

        expect(screen.getByText('No performance issues detected.')).toBeInTheDocument();
    });
});
