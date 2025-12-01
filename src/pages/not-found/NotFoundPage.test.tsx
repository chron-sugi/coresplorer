import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotFoundPage } from './NotFoundPage';
import { RouterWrapper } from '@/test/utils/RouterWrapper';

// Mock the shared UI components
vi.mock('@/shared/ui/button', () => ({
  Button: ({
    children,
    variant,
    asChild,
  }: {
    children: React.ReactNode;
    variant?: string;
    asChild?: boolean;
  }) => (
    <button data-variant={variant} data-as-child={asChild}>
      {children}
    </button>
  ),
}));

describe('NotFoundPage', () => {
  describe('rendering', () => {
    it('renders 404 error message', () => {
      render(
        <RouterWrapper>
          <NotFoundPage />
        </RouterWrapper>
      );

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(
          /The page you're looking for doesn't exist or has been moved/i
        )
      ).toBeInTheDocument();
    });

    it('renders "Go Home" button with correct link', () => {
      render(
        <RouterWrapper>
          <NotFoundPage />
        </RouterWrapper>
      );

      const homeLink = screen.getByRole('link', { name: /go home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('renders "View Diagram" button with correct link', () => {
      render(
        <RouterWrapper>
          <NotFoundPage />
        </RouterWrapper>
      );

      const diagramLink = screen.getByRole('link', { name: /view diagram/i });
      expect(diagramLink).toBeInTheDocument();
      expect(diagramLink).toHaveAttribute('href', '/diagram');
    });

    it('renders support contact message', () => {
      render(
        <RouterWrapper>
          <NotFoundPage />
        </RouterWrapper>
      );

      expect(
        screen.getByText(/If you believe this is an error, please contact support/i)
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('both navigation buttons are keyboard accessible', () => {
      render(
        <RouterWrapper>
          <NotFoundPage />
        </RouterWrapper>
      );

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      // Both links should be focusable and keyboard-navigable
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href');
      });
    });

    it('renders without crashing', () => {
      expect(() => {
        render(
          <RouterWrapper>
            <NotFoundPage />
          </RouterWrapper>
        );
      }).not.toThrow();
    });
  });
});
