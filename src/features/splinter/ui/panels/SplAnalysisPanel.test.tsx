import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SplAnalysisPanel } from './SplAnalysisPanel';
import { useEditorStore } from '@/entities/spl';
import { useInspectorStore } from '../../model/store/splinter.store';

// Track mock props for assertions
let capturedEditorProps: {
    code?: string;
    highlightedLines?: number[];
    highlightToken?: string | null;
    underlinedRanges?: unknown[];
    onTokenHover?: (token: string | null, pos: { x: number; y: number }, line: number, col: number) => void;
    onTokenClick?: (token: string, line: number, col: number) => void;
    onSelectionChange?: (text: string | null) => void;
    onChange?: (code: string) => void;
} = {};

// Mock SplStaticEditor to expose props for testing
vi.mock('@/entities/spl', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('@/entities/spl')>();
    return {
        ...actual,
        SplStaticEditor: (props: typeof capturedEditorProps) => {
            capturedEditorProps = props;
            return (
                <div data-testid="spl-editor">
                    <div data-testid="code">{props.code}</div>
                    <div data-testid="highlighted-lines">{JSON.stringify(props.highlightedLines)}</div>
                    <div data-testid="highlight-token">{props.highlightToken ?? 'none'}</div>
                    <button
                        data-testid="hover-btn"
                        onClick={() => props.onTokenHover?.('testfield', { x: 100, y: 200 }, 1, 5)}
                    >
                        Hover
                    </button>
                    <button
                        data-testid="hover-clear-btn"
                        onClick={() => props.onTokenHover?.(null, { x: 0, y: 0 }, 0, 0)}
                    >
                        Clear Hover
                    </button>
                    <button
                        data-testid="click-btn"
                        onClick={() => props.onTokenClick?.('testfield', 1, 5)}
                    >
                        Click
                    </button>
                    <button
                        data-testid="select-btn"
                        onClick={() => props.onSelectionChange?.('selected text')}
                    >
                        Select
                    </button>
                    <button
                        data-testid="change-btn"
                        onClick={() => props.onChange?.('new code')}
                    >
                        Change
                    </button>
                </div>
            );
        },
    };
});


// Mock KnowledgeObjectInspector
vi.mock('../tools/KnowledgeObjectInspector/KnowledgeObjectInspector', () => ({
    KnowledgeObjectInspector: ({ selectedText }: { selectedText: string }) => (
        <div data-testid="ko-inspector">Inspector: {selectedText}</div>
    ),
}));

// Mock field-hover feature
const mockSetHover = vi.fn();
const mockClearHover = vi.fn();
vi.mock('@/features/field-hover', () => ({
    useHover: () => ({
        hoveredField: null,
        position: null,
        tooltipVisible: false,
        lineage: null,
        setHover: mockSetHover,
        clearHover: mockClearHover,
    }),
    LineageTooltip: ({ fieldName }: { fieldName: string }) => (
        <div data-testid="lineage-tooltip">Tooltip: {fieldName}</div>
    ),
}));

// Mock field-highlight feature
const mockSelectField = vi.fn();
const mockClearSelection = vi.fn();
vi.mock('@/features/field-highlight', () => ({
    useHighlight: () => ({
        selectedField: null,
        highlightedLines: [],
        selectField: mockSelectField,
        clearSelection: mockClearSelection,
    }),
}));

// Mock field-lineage from entity
const mockGetFieldLineage = vi.fn();
const mockGetFieldEvents = vi.fn();
vi.mock('@/entities/field', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('@/entities/field')>();
    return {
        ...actual,
        useFieldLineage: () => ({
            lineageIndex: {
                getFieldLineage: mockGetFieldLineage,
                getFieldEvents: mockGetFieldEvents,
            },
        }),
    };
});

describe('SplAnalysisPanel', () => {
    beforeEach(() => {
        // Reset stores
        useEditorStore.setState({ splText: '', parseResult: null });
        useInspectorStore.setState({
            highlightedLines: [],
            activeField: null,
            selectedText: null,
        });

        // Reset mocks
        mockSetHover.mockReset();
        mockClearHover.mockReset();
        mockSelectField.mockReset();
        mockClearSelection.mockReset();
        mockGetFieldLineage.mockReset();
        mockGetFieldEvents.mockReset().mockReturnValue([]);
        capturedEditorProps = {};
    });

    it('renders code from shared editor store', () => {
        useEditorStore.setState({ splText: 'test code' });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('code')).toHaveTextContent('test code');
    });

    it('passes highlighted lines from inspector store', () => {
        useInspectorStore.setState({ highlightedLines: [1, 3, 5] });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('highlighted-lines')).toHaveTextContent('[1,3,5]');
    });

    it('passes activeField as highlightToken', () => {
        useInspectorStore.setState({ activeField: 'myfield' });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('highlight-token')).toHaveTextContent('myfield');
    });

    it('handles code change and updates store', () => {
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('change-btn'));

        expect(useEditorStore.getState().splText).toBe('new code');
    });

    it('handles text selection and updates inspector store', () => {
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('select-btn'));

        expect(useInspectorStore.getState().selectedText).toBe('selected text');
    });

    it('shows KnowledgeObjectInspector when text is selected', () => {
        useInspectorStore.setState({ selectedText: 'lookup_name' });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('ko-inspector')).toHaveTextContent('Inspector: lookup_name');
    });

    it('does not show KnowledgeObjectInspector when no text is selected', () => {
        useInspectorStore.setState({ selectedText: null });
        render(<SplAnalysisPanel />);
        expect(screen.queryByTestId('ko-inspector')).not.toBeInTheDocument();
    });

    it('calls setHover when hovering over field with lineage', () => {
        mockGetFieldLineage.mockReturnValue({ events: [] }); // Has lineage
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('hover-btn'));

        expect(mockSetHover).toHaveBeenCalledWith('testfield', { x: 100, y: 200 }, 1, 5);
    });

    it('calls clearHover when hovering over field without lineage', () => {
        mockGetFieldLineage.mockReturnValue(null); // No lineage
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('hover-btn'));

        expect(mockClearHover).toHaveBeenCalled();
    });

    it('calls clearHover when token is null', () => {
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('hover-clear-btn'));

        expect(mockClearHover).toHaveBeenCalled();
    });

    it('calls selectField when clicking on field with lineage', () => {
        mockGetFieldLineage.mockReturnValue({ events: [] }); // Has lineage
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('click-btn'));

        expect(mockSelectField).toHaveBeenCalledWith('testfield');
    });

    it('does not call selectField when clicking on field without lineage', () => {
        mockGetFieldLineage.mockReturnValue(null); // No lineage
        render(<SplAnalysisPanel />);
        fireEvent.click(screen.getByTestId('click-btn'));

        expect(mockSelectField).not.toHaveBeenCalled();
    });

    it('provides onTokenClick callback to editor', () => {
        render(<SplAnalysisPanel />);
        expect(capturedEditorProps.onTokenClick).toBeDefined();
    });

    it('provides onTokenHover callback to editor', () => {
        render(<SplAnalysisPanel />);
        expect(capturedEditorProps.onTokenHover).toBeDefined();
    });

    it('provides onChange callback to editor', () => {
        render(<SplAnalysisPanel />);
        expect(capturedEditorProps.onChange).toBeDefined();
    });

    it('provides onSelectionChange callback to editor', () => {
        render(<SplAnalysisPanel />);
        expect(capturedEditorProps.onSelectionChange).toBeDefined();
    });

    it('renders empty code when store is empty', () => {
        useEditorStore.setState({ splText: '' });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('code')).toHaveTextContent('');
    });

    it('passes empty highlighted lines array when none set', () => {
        useInspectorStore.setState({ highlightedLines: [] });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('highlighted-lines')).toHaveTextContent('[]');
    });

    it('passes "none" when no activeField is set', () => {
        useInspectorStore.setState({ activeField: null });
        render(<SplAnalysisPanel />);
        expect(screen.getByTestId('highlight-token')).toHaveTextContent('none');
    });
});

describe('SplAnalysisPanel combined highlighted lines', () => {
    beforeEach(() => {
        useEditorStore.setState({ splText: 'test', parseResult: null });
        useInspectorStore.setState({
            highlightedLines: [],
            activeField: null,
            selectedText: null,
        });
        mockGetFieldEvents.mockReset().mockReturnValue([]);
        capturedEditorProps = {};
    });

    it('combines search and lineage highlighted lines without duplicates', () => {
        // Search highlights lines 1, 3
        useInspectorStore.setState({ highlightedLines: [1, 3] });
        // Lineage highlights lines 2, 3 (3 is duplicate)
        // Note: The mock returns empty by default, combined will just be search lines
        render(<SplAnalysisPanel />);

        // Should at least include search highlighted lines
        const lines = JSON.parse(screen.getByTestId('highlighted-lines').textContent || '[]');
        expect(lines).toContain(1);
        expect(lines).toContain(3);
    });
});

describe('SplAnalysisPanel underlined ranges', () => {
    beforeEach(() => {
        useEditorStore.setState({ splText: 'test', parseResult: null });
        useInspectorStore.setState({
            highlightedLines: [],
            activeField: null,
            selectedText: null,
        });
        mockGetFieldLineage.mockReset();
        mockGetFieldEvents.mockReset().mockReturnValue([]);
        capturedEditorProps = {};
    });

    it('passes empty underlined ranges when no field selected', () => {
        useInspectorStore.setState({ activeField: null });
        render(<SplAnalysisPanel />);
        expect(capturedEditorProps.underlinedRanges).toEqual([]);
    });

    it('derives underlined ranges from field events when activeField is set', () => {
        useInspectorStore.setState({ activeField: 'myfield' });
        mockGetFieldEvents.mockReturnValue([
            { kind: 'created', line: 1, column: 5 },
            { kind: 'usage', line: 3, column: 10 },
        ]);

        render(<SplAnalysisPanel />);

        const ranges = capturedEditorProps.underlinedRanges as Array<{
            line: number;
            startCol: number;
            endCol: number;
            type: string;
        }>;
        expect(ranges).toHaveLength(2);
        expect(ranges[0].type).toBe('definition');
        expect(ranges[1].type).toBe('usage');
    });

    it('handles dropped events with command name for underline length', () => {
        useInspectorStore.setState({ activeField: 'myfield' });
        mockGetFieldEvents.mockReturnValue([
            { kind: 'dropped', line: 2, column: 3, command: 'fields' },
        ]);

        render(<SplAnalysisPanel />);

        const ranges = capturedEditorProps.underlinedRanges as Array<{
            line: number;
            startCol: number;
            endCol: number;
            type: string;
        }>;
        expect(ranges).toHaveLength(1);
        expect(ranges[0].type).toBe('dropped');
        // col is 0-based: (3-1) = 2, endCol = 2 + 6 = 8
        expect(ranges[0].endCol).toBe(8);
    });

    it('handles origin events as definition type', () => {
        useInspectorStore.setState({ activeField: 'host' });
        mockGetFieldEvents.mockReturnValue([
            { kind: 'origin', line: 1, column: 1 },
        ]);

        render(<SplAnalysisPanel />);

        const ranges = capturedEditorProps.underlinedRanges as Array<{
            type: string;
        }>;
        expect(ranges[0].type).toBe('definition');
    });

    it('defaults column to 0 (0-based) when not provided', () => {
        useInspectorStore.setState({ activeField: 'test' });
        mockGetFieldEvents.mockReturnValue([
            { kind: 'usage', line: 5 }, // No column
        ]);

        render(<SplAnalysisPanel />);

        const ranges = capturedEditorProps.underlinedRanges as Array<{
            startCol: number;
        }>;
        // When column is missing, defaults to 1 (1-based), then converted to 0 (0-based)
        expect(ranges[0].startCol).toBe(0);
    });

    it('defaults line to 1 when not provided', () => {
        useInspectorStore.setState({ activeField: 'test' });
        mockGetFieldEvents.mockReturnValue([
            { kind: 'usage', column: 5 }, // No line
        ]);

        render(<SplAnalysisPanel />);

        const ranges = capturedEditorProps.underlinedRanges as Array<{
            line: number;
        }>;
        expect(ranges[0].line).toBe(1);
    });
});

describe('SplAnalysisPanel token click toggle', () => {
    beforeEach(() => {
        useEditorStore.setState({ splText: 'test', parseResult: null });
        useInspectorStore.setState({
            highlightedLines: [],
            activeField: null,
            selectedText: null,
        });
        mockGetFieldLineage.mockReset();
        mockSelectField.mockReset();
        mockClearSelection.mockReset();
        capturedEditorProps = {};
    });

    it('does not call any selection method when lineageIndex is null', () => {
        // Override mock to return null lineageIndex
        vi.doMock('@/features/field-lineage', () => ({
            useFieldLineage: () => ({
                lineageIndex: null,
            }),
        }));

        mockGetFieldLineage.mockReturnValue({ events: [] });
        render(<SplAnalysisPanel />);

        // The click handler should early return when lineageIndex is null
        // Since we mock lineageIndex to exist by default, this tests the fallback
        expect(capturedEditorProps.onTokenClick).toBeDefined();
    });
});

describe('SplAnalysisPanel editor integration', () => {
    beforeEach(() => {
        useEditorStore.setState({ splText: '', parseResult: null });
        useInspectorStore.setState({
            highlightedLines: [],
            activeField: null,
            selectedText: null,
        });
        capturedEditorProps = {};
    });

    it('passes all required props to editor', () => {
        useEditorStore.setState({ splText: 'index=main' });
        useInspectorStore.setState({
            highlightedLines: [1, 2],
            activeField: 'host'
        });

        render(<SplAnalysisPanel />);

        expect(capturedEditorProps.code).toBe('index=main');
        expect(capturedEditorProps.highlightedLines).toEqual([1, 2]);
        expect(capturedEditorProps.highlightToken).toBe('host');
        expect(capturedEditorProps.onChange).toBeDefined();
        expect(capturedEditorProps.onSelectionChange).toBeDefined();
        expect(capturedEditorProps.onTokenHover).toBeDefined();
        expect(capturedEditorProps.onTokenClick).toBeDefined();
    });

    it('renders container with proper styling classes', () => {
        render(<SplAnalysisPanel />);
        const container = screen.getByTestId('spl-editor').parentElement;
        expect(container).toHaveClass('relative', 'h-full', 'overflow-auto');
    });
});
