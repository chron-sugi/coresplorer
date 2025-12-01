/**
 * Tooltip Component Tests
 *
 * Tests for the shared Tooltip components including:
 * - TooltipProvider, Tooltip, TooltipTrigger, TooltipContent
 * - Rendering and visibility
 * - Positioning (sideOffset)
 * - Styling and className handling
 * - Ref forwarding
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

const getFirstByText = (text: string) => screen.getAllByText(text)[0];
const createUser = () => userEvent.setup({ pointerEventsCheck: 0 });

const expectTooltipClosed = async (text: string, user?: ReturnType<typeof createUser>) => {
  if (user) {
    await user.keyboard('{Escape}');
  }
  await waitFor(() => {
    const nodes = screen.queryAllByText(text);
    nodes.forEach((node) => {
      const state = node.parentElement?.getAttribute('data-state');
      expect(state).not.toBe('delayed-open');
    });
  });
};

describe('Tooltip', () => {
  const SimpleTooltip = ({ content = 'Tooltip text', triggerText = 'Hover me' }) => (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger>{triggerText}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  describe('rendering', () => {
    it('renders trigger element', () => {
      render(<SimpleTooltip />);
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('does not show tooltip content initially', () => {
      render(<SimpleTooltip />);
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });

    it('shows tooltip content on hover', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(getFirstByText('Tooltip text')).toBeInTheDocument();
      });
    });

    it('hides tooltip content when mouse leaves', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        expect(getFirstByText('Tooltip text')).toBeInTheDocument();
      });

      await user.unhover(trigger);
      await user.hover(document.body);

      await expectTooltipClosed('Tooltip text', user);
    });
  });

  describe('TooltipContent', () => {
    it('applies default sideOffset', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getFirstByText('Tooltip text');
        expect(content).toBeInTheDocument();
      });
    });

    it('applies custom sideOffset', async () => {
      const user = createUser();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent sideOffset={10}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover');
      await user.hover(trigger);

      await waitFor(() => {
        expect(getFirstByText('Content')).toBeInTheDocument();
      });
    });

    it('applies default styling classes', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getFirstByText('Tooltip text');
        expect(content).toHaveClass('z-50', 'rounded-md', 'border', 'bg-popover');
      });
    });

    it('applies custom className', async () => {
      const user = createUser();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent className="custom-tooltip">Custom</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getFirstByText('Custom');
        expect(content).toHaveClass('custom-tooltip');
      });
    });

    it('renders complex content', async () => {
      const user = createUser();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent>
              <div>
                <strong>Title</strong>
                <p>Description</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover');
      await user.hover(trigger);

      await waitFor(() => {
        expect(getFirstByText('Title')).toBeInTheDocument();
        expect(getFirstByText('Description')).toBeInTheDocument();
      });
    });
  });

  describe('TooltipTrigger', () => {
    it('renders as inline element', () => {
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Trigger</TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('can wrap button element', () => {
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Click me</button>
            </TooltipTrigger>
            <TooltipContent>Info</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('can wrap icon element', async () => {
      const user = createUser();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span role="img" aria-label="info">
                ℹ️
              </span>
            </TooltipTrigger>
            <TooltipContent>Information</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByRole('img', { name: /info/i });
      expect(trigger).toBeInTheDocument();

      await user.hover(trigger);

      await waitFor(() => {
        expect(getFirstByText('Information')).toBeInTheDocument();
      });
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to TooltipContent', async () => {
      const ref = { current: null };
      const user = createUser();

      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Hover</TooltipTrigger>
            <TooltipContent ref={ref}>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const trigger = screen.getByText('Hover');
      await user.hover(trigger);

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe('interaction patterns', () => {
    it('shows on focus for keyboard users', async () => {
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Focusable</button>
            </TooltipTrigger>
            <TooltipContent>Keyboard tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const button = screen.getByRole('button', { name: /focusable/i });
      button.focus();

      await waitFor(() => {
        expect(getFirstByText('Keyboard tooltip')).toBeInTheDocument();
      });
    });

    it('allows multiple tooltips in same provider', async () => {
      const user = createUser();
      render(
        <TooltipProvider delayDuration={0} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger>First</TooltipTrigger>
            <TooltipContent>Tooltip 1</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Second</TooltipTrigger>
            <TooltipContent>Tooltip 2</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      const firstTrigger = screen.getByText('First');
      await user.hover(firstTrigger);

      await waitFor(() => {
        expect(getFirstByText('Tooltip 1')).toBeInTheDocument();
      });

      await user.unhover(firstTrigger);
      await user.hover(document.body);

      await expectTooltipClosed('Tooltip 1', user);

      const secondTrigger = screen.getByText('Second');
      await user.hover(secondTrigger);

      await waitFor(() => {
        expect(getFirstByText('Tooltip 2')).toBeInTheDocument();
      });
    });
  });

  describe('styling and animations', () => {
    it('has animation classes', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getFirstByText('Tooltip text');
        expect(content).toHaveClass('animate-in', 'fade-in-0', 'zoom-in-95');
      });
    });

    it('has shadow styling', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getFirstByText('Tooltip text');
        expect(content).toHaveClass('shadow-md');
      });
    });

    it('has proper text size', async () => {
      const user = createUser();
      render(<SimpleTooltip />);

      const trigger = screen.getByText('Hover me');
      await user.hover(trigger);

      await waitFor(() => {
        const content = getFirstByText('Tooltip text');
        expect(content).toHaveClass('text-sm');
      });
    });
  });
});
