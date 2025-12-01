/**
 * Popover Component Tests
 *
 * Tests for the shared Popover components including:
 * - Popover, PopoverTrigger, PopoverContent, PopoverAnchor
 * - Opening and closing behavior
 * - Positioning and alignment
 * - Styling and className handling
 * - Ref forwarding
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './popover';

describe('Popover', () => {
  const SimplePopover = ({ content = 'Popover content', triggerText = 'Open' }) => (
    <Popover>
      <PopoverTrigger>{triggerText}</PopoverTrigger>
      <PopoverContent>{content}</PopoverContent>
    </Popover>
  );

  describe('rendering', () => {
    it('renders trigger element', () => {
      render(<SimplePopover />);
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('does not show content initially', () => {
      render(<SimplePopover />);
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });

    it('shows content when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('hides content when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SimplePopover />
          <button>Outside</button>
        </div>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      const outside = screen.getByText('Outside');
      await user.click(outside);

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });
  });

  describe('PopoverContent', () => {
    it('applies default sideOffset', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('applies custom sideOffset', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent sideOffset={10}>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('applies default styling classes', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass('popover-content', 'z-50', 'rounded-md', 'border');
      });
    });

    it('applies custom className', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent className="custom-popover">Custom</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Custom');
        expect(content).toHaveClass('custom-popover');
      });
    });

    it('supports default center alignment', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });
    });

    it('supports custom alignment', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent align="start">Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('renders complex content', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <div>
              <h3>Popover Title</h3>
              <p>Description text</p>
              <button>Action</button>
            </div>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover Title')).toBeInTheDocument();
        expect(screen.getByText('Description text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
      });
    });
  });

  describe('PopoverTrigger', () => {
    it('renders as button by default', () => {
      render(<SimplePopover />);
      const trigger = screen.getByText('Open');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('can wrap custom element with asChild', () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button className="custom-btn">Custom Trigger</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByRole('button', { name: /custom trigger/i });
      expect(trigger).toHaveClass('custom-btn');
    });

    it('toggles popover on click', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');

      // Open
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      // Close
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });
  });

  describe('PopoverAnchor', () => {
    it('allows positioning popover relative to different element', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverAnchor>
            <div>Anchor element</div>
          </PopoverAnchor>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Anchored content</PopoverContent>
        </Popover>
      );

      expect(screen.getByText('Anchor element')).toBeInTheDocument();

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Anchored content')).toBeInTheDocument();
      });
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to PopoverContent', async () => {
      const ref = { current: null };
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent ref={ref}>Content</PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe('controlled mode', () => {
    it('works in controlled mode', async () => {
      const TestComponent = () => {
        const [open, setOpen] = React.useState(false);
        return (
          <>
            <button onClick={() => setOpen(!open)}>Toggle</button>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger>Trigger</PopoverTrigger>
              <PopoverContent>Controlled content</PopoverContent>
            </Popover>
          </>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();

      const toggleBtn = screen.getByText('Toggle');
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByText('Controlled content')).toBeInTheDocument();
      });

      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.queryByText('Controlled content')).not.toBeInTheDocument();
      });
    });
  });

  describe('styling', () => {
    it('has proper z-index for layering', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass('z-50');
      });
    });

    it('has border and shadow styling', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass('border-border', 'shadow-md');
      });
    });

    it('has background and text color', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass('bg-popover', 'text-popover-foreground');
      });
    });

    it('has default width', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Popover content');
        expect(content).toHaveClass('w-72');
      });
    });
  });

  describe('interactions', () => {
    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      render(<SimplePopover />);

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
      });
    });

    it('allows interaction with content', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <button onClick={handleClick}>Click me</button>
          </PopoverContent>
        </Popover>
      );

      const trigger = screen.getByText('Open');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Click me')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
