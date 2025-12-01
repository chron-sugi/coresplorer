import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagramPage } from './DiagramPage';
import { RouterWrapper } from '@/test/utils/RouterWrapper';
import { useDiagramStore } from '@/features/diagram/model/store/diagram.store';
import {
  xssVectors,
  pathTraversalVectors,
  sqlInjectionVectors,
  unicodeVectors,
} from '@/test/fixtures/security-fixtures';

// Mock child components to speed up tests
vi.mock('@/widgets/layout', () => ({
  Layout: ({
    children,
    leftPanel,
    searchComponent,
  }: {
    children: React.ReactNode;
    leftPanel?: React.ReactNode;
    searchComponent?: React.ReactNode;
  }) => (
    <div data-testid="layout">
      {leftPanel && <div data-testid="left-panel">{leftPanel}</div>}
      {searchComponent && <div data-testid="search-component">{searchComponent}</div>}
      <main>{children}</main>
    </div>
  ),
}));

vi.mock('@/features/diagram/ui/ContextPanel/ContextPanel', () => ({
  DiagramContextPanel: () => <div data-testid="context-panel">Context Panel</div>,
}));

vi.mock('@/features/diagram/ui/Search/SearchCommand', () => ({
  SearchCommand: () => <div data-testid="search-command">Search</div>,
}));

vi.mock('@/features/diagram/ui/Canvas/Canvas', () => ({
  DiagramCanvas: () => <div data-testid="diagram-canvas">Canvas</div>,
}));

describe('DiagramPage', () => {
  // Reset store before each test to ensure clean state
  beforeEach(() => {
    useDiagramStore.getState().reset();
  });

  describe('integration: URL parameter handling', () => {
    it('renders with default state when no nodeId in URL', () => {
      render(
        <RouterWrapper initialEntries={['/diagram']}>
          <DiagramPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('diagram-canvas')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('syncs nodeId from URL to store', async () => {
      render(
        <RouterWrapper initialEntries={['/diagram/node-123']}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        const state = useDiagramStore.getState();
        expect(state.coreId).toBe('node-123');
      });
    });

    it('shows loading state when coreId does not match URL param', () => {
      // Set store to different node first
      useDiagramStore.getState().setCoreId('node-999');

      render(
        <RouterWrapper initialEntries={['/diagram/node-123']}>
          <DiagramPage />
        </RouterWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('diagram-canvas')).not.toBeInTheDocument();
    });

    it('shows content when coreId matches URL param', async () => {
      render(
        <RouterWrapper initialEntries={['/diagram/node-123']}>
          <DiagramPage />
        </RouterWrapper>
      );

      // Wait for effect to sync coreId
      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe('node-123');
      });

      // Should show canvas once synced
      await waitFor(() => {
        expect(screen.getByTestId('diagram-canvas')).toBeInTheDocument();
      });
    });
  });

  describe('integration: store synchronization', () => {
    it('updates store coreId when URL has nodeId parameter', async () => {
      const initialCoreId = useDiagramStore.getState().coreId;
      expect(initialCoreId).toBe(''); // Initial state is empty

      render(
        <RouterWrapper initialEntries={['/diagram/node-456']}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        const updatedCoreId = useDiagramStore.getState().coreId;
        expect(updatedCoreId).toBe('node-456');
      });
    });

    it('does not call setCoreId when URL has no nodeId', () => {
      const setCoreId = vi.spyOn(useDiagramStore.getState(), 'setCoreId');

      render(
        <RouterWrapper initialEntries={['/diagram']}>
          <DiagramPage />
        </RouterWrapper>
      );

      expect(setCoreId).not.toHaveBeenCalled();
    });

    it('handles multiple renders with same nodeId efficiently', async () => {
      const { rerender } = render(
        <RouterWrapper initialEntries={['/diagram/node-789']}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe('node-789');
      });

      // Rerender with same nodeId
      rerender(
        <RouterWrapper initialEntries={['/diagram/node-789']}>
          <DiagramPage />
        </RouterWrapper>
      );

      // Store should still have same value
      expect(useDiagramStore.getState().coreId).toBe('node-789');
    });
  });

  describe('rendering', () => {
    it('always renders Layout component', () => {
      render(
        <RouterWrapper>
          <DiagramPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('renders DiagramContextPanel in leftPanel slot', () => {
      render(
        <RouterWrapper>
          <DiagramPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByTestId('context-panel')).toBeInTheDocument();
    });

    it('renders SearchCommand in searchComponent slot', () => {
      render(
        <RouterWrapper>
          <DiagramPage />
        </RouterWrapper>
      );

      expect(screen.getByTestId('search-component')).toBeInTheDocument();
      expect(screen.getByTestId('search-command')).toBeInTheDocument();
    });

    it('renders DiagramCanvas when synced', async () => {
      render(
        <RouterWrapper initialEntries={['/diagram/node-abc']}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('diagram-canvas')).toBeInTheDocument();
      });
    });
  });

  describe('security: XSS in URL', () => {
    it('safely handles script tag in node ID', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${xssVectors.scriptTag}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        const state = useDiagramStore.getState();
        // Should store the raw string, not execute it
        expect(state.coreId).toBe(xssVectors.scriptTag);
      });

      // Should not cause any script execution
      expect(document.scripts.length).toBe(0);
    });

    it('safely handles img onerror in node ID', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${xssVectors.imgOnError}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(xssVectors.imgOnError);
      });
    });
  });

  describe('security: path traversal', () => {
    it('treats path traversal as literal node ID', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${pathTraversalVectors.unixEtcPasswd}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(pathTraversalVectors.unixEtcPasswd);
      });
    });

    it('handles Windows path traversal', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${pathTraversalVectors.windowsSystem32}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(pathTraversalVectors.windowsSystem32);
      });
    });
  });

  describe('security: injection attacks', () => {
    it('treats SQL injection as literal string', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${sqlInjectionVectors.orTrue}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(sqlInjectionVectors.orTrue);
      });
    });
  });

  describe('security: Unicode edge cases', () => {
    it('handles zero-width characters', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${unicodeVectors.zeroWidth}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(unicodeVectors.zeroWidth);
      });
    });

    it('handles RTL override characters', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${unicodeVectors.rtlOverride}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(unicodeVectors.rtlOverride);
      });
    });

    it('handles emoji in node ID', async () => {
      render(
        <RouterWrapper initialEntries={[`/diagram/${unicodeVectors.emoji}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(unicodeVectors.emoji);
      });
    });
  });

  describe('error resilience: invalid store state', () => {
    it('handles store with null coreId gracefully', () => {
      // Manually corrupt store
      useDiagramStore.setState({ coreId: null as any });

      expect(() => {
        render(
          <RouterWrapper>
            <DiagramPage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });

    it('handles store with undefined coreId gracefully', () => {
      useDiagramStore.setState({ coreId: undefined as any });

      expect(() => {
        render(
          <RouterWrapper>
            <DiagramPage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('performance: extreme values', () => {
    it('handles very long node ID (10,000 chars)', async () => {
      const longNodeId = 'a'.repeat(10000);

      render(
        <RouterWrapper initialEntries={[`/diagram/${longNodeId}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(longNodeId);
      });
    });

    it('handles special characters in node ID', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      render(
        <RouterWrapper initialEntries={[`/diagram/${specialChars}`]}>
          <DiagramPage />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(useDiagramStore.getState().coreId).toBe(specialChars);
      });
    });
  });
});
