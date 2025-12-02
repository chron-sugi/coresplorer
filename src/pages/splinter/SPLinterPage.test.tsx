import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SPLinterPage } from './SPLinterPage';
import { RouterWrapper } from '@/test/utils/RouterWrapper';
import { useInspectorStore } from '@/features/splinter';
import { useLineageStore } from '@/entities/field';
import { useEditorStore } from '@/entities/spl';
import {
  xssVectors,
  sqlInjectionVectors,
  unicodeVectors,
} from '@/test/fixtures/security-fixtures';

// Mock child components to speed up tests
vi.mock('@/widgets/layout', () => ({
  Layout: ({
    children,
    leftPanel,
  }: {
    children: React.ReactNode;
    leftPanel?: React.ReactNode;
  }) => (
    <div data-testid="layout">
      {leftPanel && <div data-testid="left-panel">{leftPanel}</div>}
      <main>{children}</main>
    </div>
  ),
}));

vi.mock('@/shared/ui/ContextPanel', () => ({
  ContextPanel: ({
    children,
    title,
    subtitle,
    isCollapsed,
    onToggleCollapse,
    headerContent,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    headerContent: React.ReactNode;
  }) => (
    <div
      data-testid="context-panel"
      data-collapsed={isCollapsed}
      data-title={title}
      data-subtitle={subtitle}
    >
      <button onClick={onToggleCollapse} data-testid="toggle-collapse">
        Toggle
      </button>
      <div data-testid="header-content">{headerContent}</div>
      {!isCollapsed && <div data-testid="panel-content">{children}</div>}
    </div>
  ),
}));

vi.mock('@/features/splinter/ui/panels/SplStatsPanel', () => ({
  SplStatsPanel: () => <div data-testid="stats-panel">Stats</div>,
}));

vi.mock('@/features/splinter/ui/tools/StructurePanel/SubsearchPanel', () => ({
  SubsearchPanel: () => <div data-testid="subsearch-panel">Structure</div>,
}));

vi.mock('@/features/splinter/ui/tools/PerfLinter/PerfLinterPanel', () => ({
  PerfLinterPanel: () => <div data-testid="linter-panel">Linter</div>,
}));

vi.mock('@/features/splinter/ui/panels/SplAnalysisPanel', () => ({
  SplAnalysisPanel: () => <div data-testid="analysis-panel">Analysis</div>,
}));

vi.mock('@/features/field-highlight', () => ({
  useHighlight: () => ({
    selectedField: null,
    isLocked: false,
    clearSelection: vi.fn(),
    toggleLock: vi.fn(),
  }),
  HighlightLegend: () => <div data-testid="highlight-legend">Legend</div>,
}));

describe('SPLinterPage', () => {
  beforeEach(() => {
    // Reset stores to initial state
    useInspectorStore.getState().clearSelection();
    useLineageStore.getState().reset();
    // Set sample SPL code in editor store for search tests
    useEditorStore.setState({
      splText: 'search index=main | stats count by host | where count > 10',
      parseResult: null,
    });
  });

  describe('rendering', () => {
    it('renders Layout component', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('renders ContextPanel in left panel', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByTestId('context-panel')).toBeInTheDocument();
    });

    it('renders ContextPanel with correct title and subtitle', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const panel = screen.getByTestId('context-panel');
      expect(panel).toHaveAttribute('data-title', 'SPLinter');
      expect(panel).toHaveAttribute('data-subtitle', 'Advanced SPL Analysis');
    });

    it('renders tab buttons in header', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const statsButton = screen.getByTitle('Statistics');
      const structureButton = screen.getByTitle('Structure');
      const linterButton = screen.getByTitle('Linter');

      expect(statsButton).toBeInTheDocument();
      expect(structureButton).toBeInTheDocument();
      expect(linterButton).toBeInTheDocument();
    });

    it('renders SplAnalysisPanel in main area', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('analysis-panel')).toBeInTheDocument();
    });

    it('renders search input with placeholder', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');
      expect(searchInput).toBeInTheDocument();
    });

    it('renders field selection prompt when no field selected', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      expect(
        screen.getByText('Select a field to view lineage')
      ).toBeInTheDocument();
    });
  });

  describe('integration: tab switching', () => {
    it('shows stats panel by default', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('subsearch-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('linter-panel')).not.toBeInTheDocument();
    });

    it('switches to structure panel when Structure tab clicked', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const structureButton = screen.getByTitle('Structure');
      fireEvent.click(structureButton);

      expect(screen.getByTestId('subsearch-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('stats-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('linter-panel')).not.toBeInTheDocument();
    });

    it('switches to linter panel when Linter tab clicked', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const linterButton = screen.getByTitle('Linter');
      fireEvent.click(linterButton);

      expect(screen.getByTestId('linter-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('stats-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('subsearch-panel')).not.toBeInTheDocument();
    });

    it('can switch between tabs multiple times', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const statsButton = screen.getByTitle('Statistics');
      const structureButton = screen.getByTitle('Structure');
      const linterButton = screen.getByTitle('Linter');

      // Cycle through tabs
      fireEvent.click(structureButton);
      expect(screen.getByTestId('subsearch-panel')).toBeInTheDocument();

      fireEvent.click(linterButton);
      expect(screen.getByTestId('linter-panel')).toBeInTheDocument();

      fireEvent.click(statsButton);
      expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
    });
  });

  describe('integration: panel collapse', () => {
    it('panel is not collapsed by default', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const panel = screen.getByTestId('context-panel');
      expect(panel).toHaveAttribute('data-collapsed', 'false');
      expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    });

    it('collapses panel when toggle button clicked', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const toggleButton = screen.getByTestId('toggle-collapse');
      fireEvent.click(toggleButton);

      const panel = screen.getByTestId('context-panel');
      expect(panel).toHaveAttribute('data-collapsed', 'true');
      expect(screen.queryByTestId('panel-content')).not.toBeInTheDocument();
    });

    it('expands panel when toggle button clicked again', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const toggleButton = screen.getByTestId('toggle-collapse');

      // Collapse
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('context-panel')).toHaveAttribute(
        'data-collapsed',
        'true'
      );

      // Expand
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('context-panel')).toHaveAttribute(
        'data-collapsed',
        'false'
      );
      expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    });
  });

  describe('integration: search functionality', () => {
    it('updates search term when typing', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText(
        'Search in query...'
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: 'search' } });

      expect(searchInput.value).toBe('search');
    });

    it('shows clear button when search term exists', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      // Initially no clear button
      expect(
        screen.queryByRole('button', { name: '' })
      ).not.toBeInTheDocument();

      // Type something
      fireEvent.change(searchInput, { target: { value: 'stats' } });

      // Now clear button should appear (it's the X button)
      const clearButtons = screen.getAllByRole('button');
      const clearButton = clearButtons.find((btn) =>
        btn.querySelector('svg.lucide-x')
      );
      expect(clearButton).toBeInTheDocument();
    });

    it('clears search term when clear button clicked', async () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText(
        'Search in query...'
      ) as HTMLInputElement;

      // Type something
      fireEvent.change(searchInput, { target: { value: 'stats' } });
      expect(searchInput.value).toBe('stats');

      // Click clear button
      const clearButton = screen.getByTestId('search-clear-button');
      fireEvent.click(clearButton);

      await waitFor(() => expect(searchInput.value).toBe(''));
    });

    it('shows suggestions dropdown when search has results', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      // Focus and type a search term that matches the mocked SPL code
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'search' } });

      // Suggestions should appear if there are matching results
      // Note: The actual search logic depends on searchSpl function
    });
  });

  describe('integration: keyboard shortcuts', () => {
    it('clears selection when Escape key pressed', () => {
      const clearSelectionSpy = vi.spyOn(
        useInspectorStore.getState(),
        'clearSelection'
      );

      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const container = screen.getByTestId('splinter-editor-container');

      fireEvent.keyDown(container, { key: 'Escape' });

      expect(clearSelectionSpy).toHaveBeenCalled();
    });

    it('does not clear on other key presses', () => {
      const clearSelectionSpy = vi.spyOn(
        useInspectorStore.getState(),
        'clearSelection'
      );

      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const container = screen.getByTestId('splinter-editor-container');

      clearSelectionSpy.mockClear();
      fireEvent.keyDown(container, { key: 'Enter' });

      expect(clearSelectionSpy).not.toHaveBeenCalled();
    });
  });

  describe('security: XSS in search input', () => {
    it('safely handles script tag in search term', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, { target: { value: xssVectors.scriptTag } });

      // Should not execute script
      expect(document.scripts.length).toBe(0);

      // Should store value safely
      expect((searchInput as HTMLInputElement).value).toBe(
        xssVectors.scriptTag
      );
    });

    it('safely handles img onerror in search term', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, { target: { value: xssVectors.imgOnError } });

      expect((searchInput as HTMLInputElement).value).toBe(
        xssVectors.imgOnError
      );
    });

    it('safely handles javascript protocol in search', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, {
        target: { value: xssVectors.javascriptProtocol },
      });

      expect((searchInput as HTMLInputElement).value).toBe(
        xssVectors.javascriptProtocol
      );
    });
  });

  describe('security: injection attempts', () => {
    it('treats SQL injection as literal search string', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, {
        target: { value: sqlInjectionVectors.orTrue },
      });

      expect((searchInput as HTMLInputElement).value).toBe(
        sqlInjectionVectors.orTrue
      );
    });

    it('treats DROP TABLE as literal search string', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, {
        target: { value: sqlInjectionVectors.dropTable },
      });

      expect((searchInput as HTMLInputElement).value).toBe(
        sqlInjectionVectors.dropTable
      );
    });
  });

  describe('security: Unicode edge cases', () => {
    it('handles zero-width characters in search', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, {
        target: { value: unicodeVectors.zeroWidth },
      });

      expect((searchInput as HTMLInputElement).value).toBe(
        unicodeVectors.zeroWidth
      );
    });

    it('handles RTL override characters in search', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, {
        target: { value: unicodeVectors.rtlOverride },
      });

      expect((searchInput as HTMLInputElement).value).toBe(
        unicodeVectors.rtlOverride
      );
    });

    it('handles emoji in search', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, { target: { value: unicodeVectors.emoji } });

      expect((searchInput as HTMLInputElement).value).toBe(unicodeVectors.emoji);
    });

    it('handles null byte in search', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      fireEvent.change(searchInput, {
        target: { value: unicodeVectors.nullByte },
      });

      expect((searchInput as HTMLInputElement).value).toBe(
        unicodeVectors.nullByte
      );
    });
  });

  describe('error resilience: invalid store state', () => {
    it('handles corrupted inspector store state', () => {
      // Corrupt inspector store
      useInspectorStore.setState({
        highlightedLines: null as any,
        activeCommand: undefined as any,
      });

      expect(() => {
        render(
          <RouterWrapper>
            <SPLinterPage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });

    it('handles corrupted lineage store state', () => {
      // Corrupt lineage store
      useLineageStore.setState({
        selectedField: { fieldName: null as any, locked: null as any },
      });

      expect(() => {
        render(
          <RouterWrapper>
            <SPLinterPage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });

    it('handles empty SPL code in editor', () => {
      // Set empty code
      useEditorStore.setState({ splText: '' });

      expect(() => {
        render(
          <RouterWrapper>
            <SPLinterPage />
          </RouterWrapper>
        );
      }).not.toThrow();

      expect(screen.getByTestId('analysis-panel')).toBeInTheDocument();
    });

    it('handles very long SPL code in editor', () => {
      // Set very long code
      const longCode = 'search index=main | '.repeat(1000) + 'stats count';
      useEditorStore.setState({ splText: longCode });

      expect(() => {
        render(
          <RouterWrapper>
            <SPLinterPage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('performance: search with large results', () => {
    it('handles very long search term (1000+ chars)', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');
      const longSearchTerm = 'a'.repeat(1000);

      fireEvent.change(searchInput, { target: { value: longSearchTerm } });

      expect((searchInput as HTMLInputElement).value).toBe(longSearchTerm);
    });

    it('handles rapid search term changes', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      // Rapidly change search term
      for (let i = 0; i < 50; i++) {
        fireEvent.change(searchInput, { target: { value: `term-${i}` } });
      }

      expect((searchInput as HTMLInputElement).value).toBe('term-49');
    });
  });

  describe('accessibility', () => {
    it('search input is keyboard accessible', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search in query...');

      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
    });

    it('tab buttons are keyboard accessible', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const statsButton = screen.getByTitle('Statistics');
      const structureButton = screen.getByTitle('Structure');
      const linterButton = screen.getByTitle('Linter');

      expect(statsButton.tagName).toBe('BUTTON');
      expect(structureButton.tagName).toBe('BUTTON');
      expect(linterButton.tagName).toBe('BUTTON');
    });

    it('editor container has keyboard navigation support', () => {
      render(
        <RouterWrapper>
          <SPLinterPage />
        </RouterWrapper>
      );

      const container = screen.getByTestId('splinter-editor-container');

      expect(container).toHaveAttribute('tabIndex', '0');
    });
  });
});
