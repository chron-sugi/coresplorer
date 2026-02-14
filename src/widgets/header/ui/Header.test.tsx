import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';
import { RouterWrapper } from '@/test/utils/RouterWrapper';

// Mock dependencies
vi.mock('@/shared/ui/button', () => ({
  Button: ({
    children,
    variant,
    size,
    className,
    asChild,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    className?: string;
    asChild?: boolean;
  }) => (
    <button data-variant={variant} data-size={size} className={className} data-as-child={asChild}>
      {children}
    </button>
  ),
}));

vi.mock('@/entities/snapshot', () => ({
  useSnapshotMeta: () => ({
    formattedTime: '2024-01-15 10:30',
    relativeAge: '5 minutes ago',
    status: 'success',
  }),
}));

describe('Header', () => {
  describe('rendering', () => {
    it('renders logo/title', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      expect(screen.getByText('CoreSplorer')).toBeInTheDocument();
    });

    it('renders all 4 navigation buttons', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      expect(screen.getByRole('link', { name: /knowledge objects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dependency map/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /search analysis/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /index lineage/i })).toBeInTheDocument();
    });

    it('renders SnapshotFreshnessBadge', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      expect(screen.getByTestId('snapshot-freshness-badge')).toBeInTheDocument();
    });

    it('renders searchComponent when provided', () => {
      render(
        <RouterWrapper>
          <Header searchComponent={<div data-testid="custom-search">Search Box</div>} />
        </RouterWrapper>
      );

      expect(screen.getByTestId('custom-search')).toBeInTheDocument();
      expect(screen.getByText('Search Box')).toBeInTheDocument();
    });

    it('does not render searchComponent when not provided', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      expect(screen.queryByTestId('custom-search')).not.toBeInTheDocument();
    });
  });

  describe('navigation links', () => {
    it('"Knowledge Objects" links to "/"', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /knowledge objects/i });
      expect(link).toHaveAttribute('href', '/');
    });

    it('"Dependency Map" links to "/diagram"', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /dependency map/i });
      expect(link).toHaveAttribute('href', '/diagram');
    });

    it('"Search Analysis" links to "/splinter"', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /search analysis/i });
      expect(link).toHaveAttribute('href', '/splinter');
    });

    it('"Index Lineage" links to "/index-lineage"', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /index lineage/i });
      expect(link).toHaveAttribute('href', '/index-lineage');
    });
  });

  describe('active route highlighting', () => {
    it('highlights "Knowledge Objects" when on "/" route', () => {
      render(
        <RouterWrapper initialEntries={['/']}>
          <Header />
        </RouterWrapper>
      );

      const koButton = screen.getByRole('link', { name: /knowledge objects/i });
      expect(koButton.className).toContain('text-sky-400');
      expect(koButton.className).toContain('bg-sky-500/10');
    });

    it('highlights "Dependency Map" when on "/diagram" route', () => {
      render(
        <RouterWrapper initialEntries={['/diagram']}>
          <Header />
        </RouterWrapper>
      );

      const diagramButton = screen.getByRole('link', { name: /dependency map/i });
      expect(diagramButton.className).toContain('text-sky-400');
      expect(diagramButton.className).toContain('bg-sky-500/10');
    });

    it('highlights "Search Analysis" when on "/splinter" route', () => {
      render(
        <RouterWrapper initialEntries={['/splinter']}>
          <Header />
        </RouterWrapper>
      );

      const splinterButton = screen.getByRole('link', { name: /search analysis/i });
      expect(splinterButton.className).toContain('text-sky-400');
      expect(splinterButton.className).toContain('bg-sky-500/10');
    });

    it('highlights "Index Lineage" when on "/index-lineage" route', () => {
      render(
        <RouterWrapper initialEntries={['/index-lineage']}>
          <Header />
        </RouterWrapper>
      );

      const lineageButton = screen.getByRole('link', { name: /index lineage/i });
      expect(lineageButton.className).toContain('text-sky-400');
      expect(lineageButton.className).toContain('bg-sky-500/10');
    });

    it('highlights "Dependency Map" when on "/diagram/node-123" (subpath)', () => {
      render(
        <RouterWrapper initialEntries={['/diagram/node-123']}>
          <Header />
        </RouterWrapper>
      );

      const diagramButton = screen.getByRole('link', { name: /dependency map/i });
      expect(diagramButton.className).toContain('text-sky-400');
    });

    it('does not highlight home when on other routes', () => {
      render(
        <RouterWrapper initialEntries={['/diagram']}>
          <Header />
        </RouterWrapper>
      );

      const koButton = screen.getByRole('link', { name: /knowledge objects/i });
      expect(koButton.className).not.toContain('text-sky-400');
      expect(koButton.className).toContain('text-muted-foreground');
    });
  });

  describe('adversarial tests', () => {
    it('handles pathname with query params', () => {
      render(
        <RouterWrapper initialEntries={['/diagram?foo=bar&baz=qux']}>
          <Header />
        </RouterWrapper>
      );

      const diagramButton = screen.getByRole('link', { name: /dependency map/i });
      expect(diagramButton.className).toContain('text-sky-400');
    });

    it('handles pathname with hash', () => {
      render(
        <RouterWrapper initialEntries={['/splinter#section']}>
          <Header />
        </RouterWrapper>
      );

      const splinterButton = screen.getByRole('link', { name: /search analysis/i });
      expect(splinterButton.className).toContain('text-sky-400');
    });

    it('handles very long pathname', () => {
      const longPath = '/diagram/' + 'node-'.repeat(100);

      expect(() => {
        render(
          <RouterWrapper initialEntries={[longPath]}>
            <Header />
          </RouterWrapper>
        );
      }).not.toThrow();
    });

    it('handles special characters in pathname', () => {
      render(
        <RouterWrapper initialEntries={['/diagram/<script>alert("xss")</script>']}>
          <Header />
        </RouterWrapper>
      );

      // Should still highlight diagram correctly despite special chars
      const diagramButton = screen.getByRole('link', { name: /dependency map/i });
      expect(diagramButton.className).toContain('text-sky-400');
    });

    it('handles searchComponent that is null', () => {
      expect(() => {
        render(
          <RouterWrapper>
            <Header searchComponent={null} />
          </RouterWrapper>
        );
      }).not.toThrow();
    });

    it('handles searchComponent that is undefined', () => {
      expect(() => {
        render(
          <RouterWrapper>
            <Header searchComponent={undefined} />
          </RouterWrapper>
        );
      }).not.toThrow();
    });
  });
});
