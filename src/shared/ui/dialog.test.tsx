/**
 * Dialog Component Tests
 *
 * Tests for the shared Dialog components including:
 * - Dialog, DialogTrigger, DialogContent, DialogOverlay
 * - DialogHeader, DialogFooter, DialogTitle, DialogDescription
 * - Opening and closing behavior
 * - Close button functionality
 * - Styling and className handling
 * - Accessibility features
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

describe('Dialog', () => {
  const SimpleDialog = ({ title = 'Dialog Title', description = 'Dialog description' }) => (
    <Dialog>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div>Dialog body content</div>
        <DialogFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  describe('rendering', () => {
    it('renders trigger button', () => {
      render(<SimpleDialog />);
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('does not show content initially', () => {
      render(<SimpleDialog />);
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });

    it('shows content when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog description')).toBeInTheDocument();
        expect(screen.getByText('Dialog body content')).toBeInTheDocument();
      });
    });
  });

  describe('DialogContent', () => {
    it('renders overlay', async () => {
      const user = userEvent.setup();
      const { container } = render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const overlay = container.querySelector('.dialog-overlay');
        expect(overlay).toBeInTheDocument();
      });
    });

    it('applies default styling classes', async () => {
      const user = userEvent.setup();
      const { container } = render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const content = container.querySelector('.dialog-content');
        expect(content).toHaveClass('fixed', 'border', 'bg-background', 'shadow-lg');
      });
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent className="custom-dialog">
            <DialogTitle>Title</DialogTitle>
            Content
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = container.querySelector('.dialog-content');
        expect(content).toHaveClass('custom-dialog');
      });
    });

    it('renders close button', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('DialogHeader', () => {
    it('renders children', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(screen.getByText('Dialog description')).toBeInTheDocument();
      });
    });

    it('applies default styling', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader data-testid="header">Header content</DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const header = screen.getByTestId('header');
        expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5');
      });
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader className="custom-header" data-testid="header">
              Header
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const header = screen.getByTestId('header');
        expect(header).toHaveClass('custom-header');
      });
    });
  });

  describe('DialogTitle', () => {
    it('renders title text', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog title="Custom Title" />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Custom Title')).toBeInTheDocument();
      });
    });

    it('applies default styling', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const title = screen.getByText('Dialog Title');
        expect(title).toHaveClass('text-lg', 'font-semibold', 'leading-none');
      });
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle className="custom-title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const title = screen.getByText('Title');
        expect(title).toHaveClass('custom-title');
      });
    });
  });

  describe('DialogDescription', () => {
    it('renders description text', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog description="Custom description" />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Custom description')).toBeInTheDocument();
      });
    });

    it('applies default styling', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const description = screen.getByText('Dialog description');
        expect(description).toHaveClass('text-sm', 'text-muted-foreground');
      });
    });
  });

  describe('DialogFooter', () => {
    it('renders footer buttons', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      });
    });

    it('applies default styling', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">Footer</DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('flex', 'flex-col-reverse', 'sm:flex-row');
      });
    });
  });

  describe('interactions', () => {
    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });

    it('closes when overlay is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
      });

      const overlay = container.querySelector('.dialog-overlay');
      if (overlay) {
        await user.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
      });
    });

    it('allows interaction with dialog content', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <button onClick={handleClick}>Action</button>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      });

      const actionButton = screen.getByRole('button', { name: /action/i });
      await user.click(actionButton);

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('works in controlled mode', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);
        return (
          <>
            <button onClick={() => setOpen(!open)}>Toggle</button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogTitle>Controlled Dialog</DialogTitle>
                <p>This is controlled</p>
              </DialogContent>
            </Dialog>
          </>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();

      const toggleBtn = screen.getByText('Toggle');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();
      });

      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has dialog role', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
      });
    });

    it('has accessible title', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog', { name: /dialog title/i });
        expect(dialog).toBeInTheDocument();
      });
    });

    it('has accessible description', async () => {
      const user = userEvent.setup();
      render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAccessibleDescription();
      });
    });
  });

  describe('styling', () => {
    it('overlay has dark background', async () => {
      const user = userEvent.setup();
      const { container } = render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const overlay = container.querySelector('.dialog-overlay');
        expect(overlay).toHaveClass('bg-black/80');
      });
    });

    it('content is centered', async () => {
      const user = userEvent.setup();
      const { container } = render(<SimpleDialog />);

      const trigger = screen.getByText('Open Dialog');
      await user.click(trigger);

      await waitFor(() => {
        const content = container.querySelector('.dialog-content');
        expect(content).toHaveClass('left-1/2', 'top-1/2', '-translate-x-1/2', '-translate-y-1/2');
      });
    });
  });
});
