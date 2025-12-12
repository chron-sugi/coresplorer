/**
 * SearchCommand Tests
 *
 * Tests for the global search command component with dual-action icons.
 *
 * @module widgets/header/ui/SearchCommand.test
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchCommand } from './SearchCommand';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock graph data
const mockGraphData = {
  nodes: [
    { id: 'saved-search-1', label: 'Security Operations Hub', type: 'saved_search' },
    { id: 'lookup-1', label: 'Assets Lookup', type: 'lookup' },
    { id: 'data-model-1', label: 'Authentication DM', type: 'data_model' },
    { id: 'index-1', label: 'Main Index', type: 'index' },
    { id: 'macro-1', label: 'Get Severity', type: 'macro' },
  ],
};

vi.mock('@/entities/snapshot', () => ({
  useDiagramGraphQuery: vi.fn(() => ({
    data: mockGraphData,
    isLoading: false,
    error: null,
  })),
}));

describe('SearchCommand', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderSearchCommand = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SearchCommand />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('rendering', () => {
    it('renders search button with placeholder text', () => {
      renderSearchCommand();

      expect(screen.getByText('Search objects...')).toBeInTheDocument();
    });

    it('renders keyboard shortcut hint', () => {
      renderSearchCommand();

      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });
  });

  describe('dialog opening', () => {
    it('opens command dialog when button clicked', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
      });
    });

    it('opens command dialog on Cmd+K', async () => {
      renderSearchCommand();

      fireEvent.keyDown(document, { key: 'k', metaKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
      });
    });

    it('opens command dialog on Ctrl+K', async () => {
      renderSearchCommand();

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument();
      });
    });
  });

  describe('search results', () => {
    it('displays knowledge objects in search results', async () => {
      renderSearchCommand();

      // Open dialog
      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Security Operations Hub')).toBeInTheDocument();
        expect(screen.getByText('Assets Lookup')).toBeInTheDocument();
        expect(screen.getByText('Authentication DM')).toBeInTheDocument();
      });
    });

    it('shows node type in parentheses', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('(saved_search)')).toBeInTheDocument();
        expect(screen.getByText('(lookup)')).toBeInTheDocument();
      });
    });
  });

  describe('dual action icons', () => {
    it('renders Network (diagram) icon for each result', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const diagramButtons = screen.getAllByTitle('View in diagram');
        expect(diagramButtons.length).toBeGreaterThan(0);
      });
    });

    it('renders Code (SPL) icon for each result', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Should have both enabled and disabled code icons
        const enabledButtons = screen.getAllByTitle('Load SPL code');
        const disabledButtons = screen.getAllByTitle('No SPL code available');
        expect(enabledButtons.length + disabledButtons.length).toBeGreaterThan(0);
      });
    });

    it('disables Code icon for lookup nodes', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const disabledButtons = screen.getAllByTitle('No SPL code available');
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });

    it('disables Code icon for data_model nodes', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const disabledButtons = screen.getAllByTitle('No SPL code available');
        // Should have at least lookup and data_model disabled
        expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('enables Code icon for saved_search nodes', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const enabledButtons = screen.getAllByTitle('Load SPL code');
        expect(enabledButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('navigation: diagram', () => {
    it('navigates to diagram when row is selected', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Security Operations Hub')).toBeInTheDocument();
      });

      // Click on the result row (via cmdk onSelect)
      const result = screen.getByText('Security Operations Hub');
      fireEvent.click(result);

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/diagram/')
      );
    });

    it('navigates to diagram when Network icon clicked', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const diagramButtons = screen.getAllByTitle('View in diagram');
        fireEvent.click(diagramButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/diagram/')
      );
    });
  });

  describe('navigation: splinter', () => {
    it('navigates to splinter with loadNodeId when Code icon clicked', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const codeButtons = screen.getAllByTitle('Load SPL code');
        fireEvent.click(codeButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/splinter', {
        state: { loadNodeId: expect.any(String) },
      });
    });

    it('does not navigate when disabled Code icon clicked', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const disabledButtons = screen.getAllByTitle('No SPL code available');
        mockNavigate.mockClear();
        fireEvent.click(disabledButtons[0]);
      });

      // Should not navigate to splinter for disabled buttons
      expect(mockNavigate).not.toHaveBeenCalledWith('/splinter', expect.anything());
    });
  });

  describe('event propagation', () => {
    it('stops propagation when Network icon clicked (no double navigation)', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const diagramButtons = screen.getAllByTitle('View in diagram');
        fireEvent.click(diagramButtons[0]);
      });

      // Should only navigate once (not twice from both icon and row)
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('stops propagation when Code icon clicked (no double navigation)', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        const codeButtons = screen.getAllByTitle('Load SPL code');
        fireEvent.click(codeButtons[0]);
      });

      // Should only navigate once (not twice from both icon and row)
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('nodeHasSpl helper', () => {
    it('correctly identifies nodes without SPL (lookup, data_model, index)', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Count disabled buttons - should be 3 (lookup, data_model, index)
        const disabledButtons = screen.getAllByTitle('No SPL code available');
        expect(disabledButtons).toHaveLength(3);
      });
    });

    it('correctly identifies nodes with SPL (saved_search, macro)', async () => {
      renderSearchCommand();

      const button = screen.getByRole('button', { name: /search objects/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Count enabled buttons - should be 2 (saved_search, macro)
        const enabledButtons = screen.getAllByTitle('Load SPL code');
        expect(enabledButtons).toHaveLength(2);
      });
    });
  });
});
