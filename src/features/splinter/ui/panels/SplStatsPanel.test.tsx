import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SplStatsPanel } from './SplStatsPanel';
import { useEditorStore } from '@/entities/spl';
import { useInspectorStore } from '../../model/store/splinter.store';

// Mock SplStats to expose props for testing
vi.mock('../components/SplStats', () => ({
    SplStats: ({
        code,
        onCommandClick,
        onFieldClick,
        activeCommand,
        activeField,
    }: {
        code: string;
        onCommandClick?: (command: string, lines: number[]) => void;
        onFieldClick?: (field: string, lines: number[]) => void;
        activeCommand?: string | null;
        activeField?: string | null;
    }) => (
        <div data-testid="spl-stats">
            <div data-testid="code">{code}</div>
            <div data-testid="active-command">{activeCommand ?? 'none'}</div>
            <div data-testid="active-field">{activeField ?? 'none'}</div>
            <button
                data-testid="command-btn"
                onClick={() => onCommandClick?.('stats', [1, 2])}
            >
                stats
            </button>
            <button
                data-testid="field-btn"
                onClick={() => onFieldClick?.('host', [2, 3])}
            >
                host
            </button>
        </div>
    ),
}));

describe('SplStatsPanel', () => {
    beforeEach(() => {
        // Reset stores before each test
        useEditorStore.setState({ splText: '', parseResult: null });
        useInspectorStore.setState({
            activeCommand: null,
            activeField: null,
            highlightedLines: [],
        });
    });

    it('renders code from shared editor store', () => {
        useEditorStore.setState({ splText: 'index=main | stats count' });
        render(<SplStatsPanel />);
        expect(screen.getByTestId('code')).toHaveTextContent('index=main | stats count');
    });

    it('passes activeCommand from inspector store', () => {
        useInspectorStore.setState({ activeCommand: 'eval' });
        render(<SplStatsPanel />);
        expect(screen.getByTestId('active-command')).toHaveTextContent('eval');
    });

    it('passes activeField from inspector store', () => {
        useInspectorStore.setState({ activeField: 'host' });
        render(<SplStatsPanel />);
        expect(screen.getByTestId('active-field')).toHaveTextContent('host');
    });

    it('sets active command and highlighted lines on command click', () => {
        render(<SplStatsPanel />);
        fireEvent.click(screen.getByTestId('command-btn'));

        const state = useInspectorStore.getState();
        expect(state.activeCommand).toBe('stats');
        expect(state.activeField).toBeNull();
        expect(state.highlightedLines).toEqual([1, 2]);
    });

    it('clears active command on second click (toggle)', () => {
        useInspectorStore.setState({ activeCommand: 'stats', highlightedLines: [1, 2] });
        render(<SplStatsPanel />);
        fireEvent.click(screen.getByTestId('command-btn'));

        const state = useInspectorStore.getState();
        expect(state.activeCommand).toBeNull();
        expect(state.highlightedLines).toEqual([]);
    });

    it('sets active field and highlighted lines on field click', () => {
        render(<SplStatsPanel />);
        fireEvent.click(screen.getByTestId('field-btn'));

        const state = useInspectorStore.getState();
        expect(state.activeField).toBe('host');
        expect(state.activeCommand).toBeNull();
        expect(state.highlightedLines).toEqual([2, 3]);
    });

    it('clears active field on second click (toggle)', () => {
        useInspectorStore.setState({ activeField: 'host', highlightedLines: [2, 3] });
        render(<SplStatsPanel />);
        fireEvent.click(screen.getByTestId('field-btn'));

        const state = useInspectorStore.getState();
        expect(state.activeField).toBeNull();
        expect(state.highlightedLines).toEqual([]);
    });

    it('clears active field when command is clicked', () => {
        useInspectorStore.setState({ activeField: 'host', highlightedLines: [2] });
        render(<SplStatsPanel />);
        fireEvent.click(screen.getByTestId('command-btn'));

        const state = useInspectorStore.getState();
        expect(state.activeField).toBeNull();
        expect(state.activeCommand).toBe('stats');
    });

    it('clears active command when field is clicked', () => {
        useInspectorStore.setState({ activeCommand: 'eval', highlightedLines: [1] });
        render(<SplStatsPanel />);
        fireEvent.click(screen.getByTestId('field-btn'));

        const state = useInspectorStore.getState();
        expect(state.activeCommand).toBeNull();
        expect(state.activeField).toBe('host');
    });
});
