/**
 * Badge Component Tests
 *
 * Tests for the shared Badge component including:
 * - Rendering with different variants
 * - Rendering with different sizes
 * - Interactive badge functionality
 * - Icon support
 * - Accessibility
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge } from './badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('renders with default variant and size', () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-slate-800', 'text-slate-300');
      expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
    });

    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('renders as span by default', () => {
      const { container } = render(<Badge>Span Badge</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('Span Badge');
    });
  });

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default">Default</Badge>);
      const badge = screen.getByText('Default');
      expect(badge).toHaveClass('bg-slate-800', 'text-slate-300', 'border-slate-700');
    });

    it('renders active variant', () => {
      render(<Badge variant="active">Active</Badge>);
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-sky-600', 'text-white', 'border-sky-500');
    });

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>);
      const badge = screen.getByText('Warning');
      expect(badge).toHaveClass('bg-yellow-900/20', 'text-yellow-300/80');
    });

    it('renders error variant', () => {
      render(<Badge variant="error">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-900/20', 'text-red-300/80');
    });

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByText('Success');
      expect(badge).toHaveClass('bg-green-900/20', 'text-green-300/80');
    });

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>);
      const badge = screen.getByText('Info');
      expect(badge).toHaveClass('bg-blue-900/20', 'text-blue-300/80');
    });

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      const badge = screen.getByText('Secondary');
      expect(badge).toHaveClass('bg-violet-900/20', 'text-violet-300/80');
    });

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>);
      const badge = screen.getByText('Outline');
      expect(badge).toHaveClass('bg-transparent', 'text-slate-300', 'border-slate-600');
    });
  });

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Badge size="sm">Small</Badge>);
      const badge = screen.getByText('Small');
      expect(badge).toHaveClass('px-1', 'py-0', 'text-2xs');
    });

    it('renders medium size', () => {
      render(<Badge size="md">Medium</Badge>);
      const badge = screen.getByText('Medium');
      expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
    });

    it('renders large size', () => {
      render(<Badge size="lg">Large</Badge>);
      const badge = screen.getByText('Large');
      expect(badge).toHaveClass('px-2', 'py-1', 'text-sm');
    });
  });

  describe('interactive functionality', () => {
    it('renders as button when interactive is true', () => {
      render(
        <Badge interactive={true} onClick={() => {}}>
          Interactive
        </Badge>
      );
      const badge = screen.getByRole('button', { name: /interactive/i });
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('cursor-pointer', 'hover:opacity-80');
    });

    it('handles click events when interactive', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Badge interactive={true} onClick={handleClick}>
          Click me
        </Badge>
      );

      const badge = screen.getByRole('button');
      await user.click(badge);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not add interactive classes when interactive is false', () => {
      render(<Badge interactive={false}>Not Interactive</Badge>);
      const badge = screen.getByText('Not Interactive');
      expect(badge).not.toHaveClass('cursor-pointer');
    });

    it('renders as span when not interactive', () => {
      const { container } = render(<Badge interactive={false}>Span</Badge>);
      const span = container.querySelector('span');
      const button = container.querySelector('button');
      expect(span).toBeInTheDocument();
      expect(button).not.toBeInTheDocument();
    });
  });

  describe('icon support', () => {
    it('renders icon before text', () => {
      const TestIcon = () => <span data-testid="test-icon">🔔</span>;
      const { container } = render(
        <Badge icon={<TestIcon />}>
          Notification
        </Badge>
      );

      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(screen.getByText('Notification')).toBeInTheDocument();

      // Verify icon wrapper exists with correct class
      const iconWrapper = container.querySelector('.mr-1.inline-flex');
      expect(iconWrapper).toBeInTheDocument();
      expect(iconWrapper).toContainElement(icon);
    });

    it('renders without icon when icon prop is not provided', () => {
      const { container } = render(<Badge>No Icon</Badge>);
      const iconWrapper = container.querySelector('.mr-1');
      expect(iconWrapper).not.toBeInTheDocument();
    });

    it('icon wrapper has correct spacing class', () => {
      const TestIcon = () => <span data-testid="test-icon">✓</span>;
      const { container } = render(
        <Badge icon={<TestIcon />}>
          With Icon
        </Badge>
      );

      const iconWrapper = container.querySelector('.mr-1.inline-flex');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('HTML attributes', () => {
    it('forwards standard HTML attributes', () => {
      render(
        <Badge data-testid="custom-badge" title="Badge title">
          Badge
        </Badge>
      );

      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveAttribute('title', 'Badge title');
    });

    it('forwards aria attributes', () => {
      render(
        <Badge aria-label="Status badge" role="status">
          Status
        </Badge>
      );

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Status badge');
    });
  });

  describe('combinations', () => {
    it('combines variant, size, and interactive', () => {
      render(
        <Badge variant="warning" size="lg" interactive={true} onClick={() => {}}>
          Combined
        </Badge>
      );

      const badge = screen.getByRole('button');
      expect(badge).toHaveClass('bg-yellow-900/20'); // variant
      expect(badge).toHaveClass('px-2', 'py-1', 'text-sm'); // size
      expect(badge).toHaveClass('cursor-pointer'); // interactive
    });

    it('combines all features together', () => {
      const handleClick = vi.fn();
      const TestIcon = () => <span data-testid="icon">⚠️</span>;

      render(
        <Badge
          variant="error"
          size="sm"
          interactive={true}
          onClick={handleClick}
          icon={<TestIcon />}
          className="custom-class"
        >
          Full Feature Badge
        </Badge>
      );

      const badge = screen.getByRole('button');
      expect(badge).toHaveClass('bg-red-900/20'); // variant
      expect(badge).toHaveClass('px-1', 'py-0'); // size
      expect(badge).toHaveClass('cursor-pointer'); // interactive
      expect(badge).toHaveClass('custom-class'); // custom className
      expect(screen.getByTestId('icon')).toBeInTheDocument(); // icon
      expect(screen.getByText('Full Feature Badge')).toBeInTheDocument();
    });
  });
});
