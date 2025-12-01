import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  SnapshotFreshnessBadge: () => <div data-testid="snapshot-badge">Snapshot Badge</div>,
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

    it('renders all 3 navigation buttons', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      expect(screen.getByRole('link', { name: /knowledge objects/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /dependency map/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /splinter/i })).toBeInTheDocument();
    });

    it('renders SnapshotFreshnessBadge', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      expect(screen.getByTestId('snapshot-badge')).toBeInTheDocument();
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

    it('"SPLinter" links to "/splinter"', () => {
      render(
        <RouterWrapper>
          <Header />
        </RouterWrapper>
      );

      const link = screen.getByRole('link', { name: /splinter/i });
      expect(link).toHaveAttribute('href', '/splinter');
    });
  });

  describe('active route highlighting', () => {
    it('highlights "Knowledge Objects" when on "/" route', () => {
      render(
        <RouterWrapper initialEntries={['/']}>
          <Header />
        </RouterWrapper>
      );

      const koButton = screen.getByRole('link', { name: /knowledge objects/i }).parentElement;
      expect(koButton?.className).toContain('text-sky-400');
      expect(koButton?.className).toContain('bg-sky-950/50');
    });

    it('highlights "Dependency Map" when on "/diagram" route', () => {
      render(
        <RouterWrapper initialEntries={['/diagram']}>
          <Header />
        </RouterWrapper>
      );

      const diagramButton = screen.getByRole('link', { name: /dependency map/i }).parentElement;
      expect(diagramButton?.className).toContain('text-sky-400');
      expect(diagramButton?.className).toContain('bg-sky-950/50');
    });

    it('highlights "SPLinter" when on "/splinter" route', () => {
      render(
        <RouterWrapper initialEntries={['/splinter']}>
          <Header />
        </RouterWrapper>
      );

      const splinterButton = screen.getByRole('link', { name: /splinter/i }).parentElement;
      expect(splinterButton?.className).toContain('text-sky-400');
      expect(splinterButton?.className).toContain('bg-sky-950/50');
    });

    it('highlights "Dependency Map" when on "/diagram/node-123" (subpath)', () => {
      render(
        <RouterWrapper initialEntries={['/diagram/node-123']}>
          <Header />
        </RouterWrapper>
      );

      const diagramButton = screen.getByRole('link', { name: /dependency map/i }).parentElement;
      expect(diagramButton?.className).toContain('text-sky-400');
    });

    it('does not highlight home when on other routes', () => {
      render(
        <RouterWrapper initialEntries={['/diagram']}>
          <Header />
        </RouterWrapper>
      );

      const koButton = screen.getByRole('link', { name: /knowledge objects/i }).parentElement;
      expect(koButton?.className).not.toContain('text-sky-400');
      expect(koButton?.className).toContain('text-slate-400');
    });
  });

  describe('adversarial tests', () => {
    it('handles pathname with query params', () => {
      render(
        <RouterWrapper initialEntries={['/diagram?foo=bar&baz=qux']}>
          <Header />
        </RouterWrapper>
      );

      const diagramButton = screen.getByRole('link', { name: /dependency map/i }).parentElement;
      expect(diagramButton?.className).toContain('text-sky-400');
    });

    it('handles pathname with hash', () => {
      render(
        <RouterWrapper initialEntries={['/splinter#section']}>
          <Header />
        </RouterWrapper>
      );

      const splinterButton = screen.getByRole('link', { name: /splinter/i }).parentElement;
      expect(splinterButton?.className).toContain('text-sky-400');
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
      const diagramButton = screen.getByRole('link', { name: /dependency map/i }).parentElement;
      expect(diagramButton?.className).toContain('text-sky-400');
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
