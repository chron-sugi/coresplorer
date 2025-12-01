import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Layout } from './Layout';

// Mock the Header widget
vi.mock('@/widgets/header', () => ({
  Header: ({ searchComponent }: { searchComponent?: React.ReactNode }) => (
    <header data-testid="header">
      {searchComponent && <div data-testid="search-component">{searchComponent}</div>}
    </header>
  ),
}));

describe('Layout', () => {
  describe('rendering', () => {
    it('renders children in main content area', () => {
      render(
        <Layout>
          <div data-testid="main-content">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('always renders Header component', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders leftPanel when provided', () => {
      render(
        <Layout leftPanel={<div data-testid="left-panel">Left Panel Content</div>}>
          <div>Main Content</div>
        </Layout>
      );

      expect(screen.getByTestId('left-panel')).toBeInTheDocument();
      expect(screen.getByText('Left Panel Content')).toBeInTheDocument();
    });

    it('does not render leftPanel area when not provided', () => {
      const { container } = render(
        <Layout>
          <div>Main Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('left-panel')).not.toBeInTheDocument();
      // Verify structure - should only have header and main
      const mainElements = container.querySelectorAll('main');
      expect(mainElements).toHaveLength(1);
    });

    it('renders searchComponent in Header when provided', () => {
      render(
        <Layout searchComponent={<div data-testid="custom-search">Search Box</div>}>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByTestId('custom-search')).toBeInTheDocument();
      expect(screen.getByText('Search Box')).toBeInTheDocument();
    });

    it('does not render searchComponent when not provided', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.queryByTestId('search-component')).not.toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('applies correct layout classes for full screen', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('flex', 'h-screen', 'flex-col', 'overflow-hidden');
    });

    it('applies padding to main when leftPanel is present', () => {
      const { container } = render(
        <Layout leftPanel={<div>Panel</div>}>
          <div>Content</div>
        </Layout>
      );

      const main = container.querySelector('main');
      expect(main).toHaveClass('p-6');
    });

    it('does not apply padding to main when leftPanel is absent', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const main = container.querySelector('main');
      expect(main).not.toHaveClass('p-6');
    });
  });

  describe('adversarial tests', () => {
    it('handles null children gracefully', () => {
      expect(() => {
        render(<Layout>{null}</Layout>);
      }).not.toThrow();
    });

    it('handles undefined leftPanel and searchComponent', () => {
      expect(() => {
        render(
          <Layout leftPanel={undefined} searchComponent={undefined}>
            <div>Content</div>
          </Layout>
        );
      }).not.toThrow();
    });

    it('handles very long complex children', () => {
      const longContent = Array(100)
        .fill(null)
        .map((_, i) => <div key={i}>Item {i}</div>);

      expect(() => {
        render(<Layout>{longContent}</Layout>);
      }).not.toThrow();

      expect(screen.getByText('Item 0')).toBeInTheDocument();
      expect(screen.getByText('Item 99')).toBeInTheDocument();
    });

    it('handles multiple nested Layouts', () => {
      expect(() => {
        render(
          <Layout>
            <Layout>
              <Layout>
                <div>Deeply nested content</div>
              </Layout>
            </Layout>
          </Layout>
        );
      }).not.toThrow();

      expect(screen.getByText('Deeply nested content')).toBeInTheDocument();
    });

    it('handles empty fragment as children', () => {
      expect(() => {
        render(<Layout>{<></>}</Layout>);
      }).not.toThrow();
    });

    it('handles searchComponent that throws error during render', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const ErrorComponent = () => {
        throw new Error('Search error');
      };

      expect(() => {
        render(
          <Layout searchComponent={<ErrorComponent />}>
            <div>Content</div>
          </Layout>
        );
      }).toThrow('Search error');

      consoleErrorSpy.mockRestore();
    });
  });
});
