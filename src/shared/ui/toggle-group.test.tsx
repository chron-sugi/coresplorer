/**
 * ToggleGroup Component Tests
 *
 * Tests for the shared ToggleGroup components including:
 * - ToggleGroup and ToggleGroupItem
 * - Single and multiple selection modes
 * - Variants (default, outline)
 * - Sizes (sm, default, lg)
 * - Context provider functionality
 * - Styling and className handling
 * - Ref forwarding
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

describe('ToggleGroup', () => {
  describe('rendering', () => {
    it('renders all toggle items', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Center')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });

    it('applies default container styling', () => {
      const { container } = render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass('flex', 'items-center', 'gap-1');
    });

    it('applies custom className to group', () => {
      const { container } = render(
        <ToggleGroup type="single" className="custom-group">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const group = container.firstChild as HTMLElement;
      expect(group).toHaveClass('custom-group');
    });
  });

  describe('single selection mode', () => {
    it('allows selecting one item', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ToggleGroup type="single" onValueChange={handleChange}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
        </ToggleGroup>
      );

      const leftItem = screen.getByText('Left');
      await user.click(leftItem);

      expect(handleChange).toHaveBeenCalledWith('left');
    });

    it('deselects when clicking selected item', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ToggleGroup type="single" defaultValue="left" onValueChange={handleChange}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
        </ToggleGroup>
      );

      const leftItem = screen.getByText('Left');
      expect(leftItem).toHaveAttribute('data-state', 'on');

      await user.click(leftItem);

      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('switches selection when clicking different item', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ToggleGroup type="single" defaultValue="left" onValueChange={handleChange}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
        </ToggleGroup>
      );

      const centerItem = screen.getByText('Center');
      await user.click(centerItem);

      expect(handleChange).toHaveBeenCalledWith('center');
    });
  });

  describe('multiple selection mode', () => {
    it('allows selecting multiple items', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ToggleGroup type="multiple" onValueChange={handleChange}>
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
        </ToggleGroup>
      );

      const boldItem = screen.getByText('Bold');
      const italicItem = screen.getByText('Italic');

      await user.click(boldItem);
      expect(handleChange).toHaveBeenCalledWith(['bold']);

      await user.click(italicItem);
      expect(handleChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    });

    it('deselects individual items', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ToggleGroup
          type="multiple"
          defaultValue={['bold', 'italic']}
          onValueChange={handleChange}
        >
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        </ToggleGroup>
      );

      const boldItem = screen.getByText('Bold');
      await user.click(boldItem);

      expect(handleChange).toHaveBeenCalledWith(['italic']);
    });
  });

  describe('variants', () => {
    it('applies default variant', () => {
      render(
        <ToggleGroup type="single" variant="default">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('border', 'border-border', 'bg-muted');
    });

    it('applies outline variant', () => {
      render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('bg-transparent');
    });

    it('inherits variant from group to items', () => {
      render(
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
          <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
        </ToggleGroup>
      );

      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');

      expect(item1).toHaveClass('bg-transparent');
      expect(item2).toHaveClass('bg-transparent');
    });

    it('allows item to override group variant', () => {
      render(
        <ToggleGroup type="single" variant="default">
          <ToggleGroupItem value="item" variant="outline">
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('bg-transparent');
    });
  });

  describe('sizes', () => {
    it('applies default size', () => {
      render(
        <ToggleGroup type="single" size="default">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('h-8', 'px-3');
    });

    it('applies small size', () => {
      render(
        <ToggleGroup type="single" size="sm">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('h-7', 'px-2', 'text-xs');
    });

    it('applies large size', () => {
      render(
        <ToggleGroup type="single" size="lg">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('h-10', 'px-4');
    });

    it('inherits size from group to items', () => {
      render(
        <ToggleGroup type="single" size="sm">
          <ToggleGroupItem value="item1">Item 1</ToggleGroupItem>
          <ToggleGroupItem value="item2">Item 2</ToggleGroupItem>
        </ToggleGroup>
      );

      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');

      expect(item1).toHaveClass('h-7', 'px-2');
      expect(item2).toHaveClass('h-7', 'px-2');
    });

    it('allows item to override group size', () => {
      render(
        <ToggleGroup type="single" size="default">
          <ToggleGroupItem value="item" size="lg">
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('h-10', 'px-4');
    });
  });

  describe('states', () => {
    it('shows on state for selected item in single mode', () => {
      render(
        <ToggleGroup type="single" defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      );

      const leftItem = screen.getByText('Left');
      const rightItem = screen.getByText('Right');

      expect(leftItem).toHaveAttribute('data-state', 'on');
      expect(rightItem).toHaveAttribute('data-state', 'off');
    });

    it('shows on state for selected items in multiple mode', () => {
      render(
        <ToggleGroup type="multiple" defaultValue={['bold', 'italic']}>
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
        </ToggleGroup>
      );

      const boldItem = screen.getByText('Bold');
      const italicItem = screen.getByText('Italic');
      const underlineItem = screen.getByText('Underline');

      expect(boldItem).toHaveAttribute('data-state', 'on');
      expect(italicItem).toHaveAttribute('data-state', 'on');
      expect(underlineItem).toHaveAttribute('data-state', 'off');
    });

    it('supports disabled items', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(
        <ToggleGroup type="single" onValueChange={handleChange}>
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center" disabled>
            Center
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const centerItem = screen.getByText('Center');
      await user.click(centerItem);

      expect(handleChange).not.toHaveBeenCalled();
      expect(centerItem).toBeDisabled();
    });
  });

  describe('ToggleGroupItem', () => {
    it('applies custom className', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item" className="custom-item">
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('custom-item');
    });

    it('forwards ref', () => {
      const ref = { current: null };
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item" ref={ref}>
            Item
          </ToggleGroupItem>
        </ToggleGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('has proper button role', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByRole('button', { name: /item/i });
      expect(item).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref on ToggleGroup', () => {
      const ref = { current: null };
      render(
        <ToggleGroup type="single" ref={ref}>
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('accessibility', () => {
    it('has proper pressed state for aria', () => {
      render(
        <ToggleGroup type="single" defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      );

      const leftItem = screen.getByText('Left');
      const rightItem = screen.getByText('Right');

      expect(leftItem).toHaveAttribute('aria-pressed', 'true');
      expect(rightItem).toHaveAttribute('aria-pressed', 'false');
    });

    it('has focus-visible ring styles', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="item">Item</ToggleGroupItem>
        </ToggleGroup>
      );

      const item = screen.getByText('Item');
      expect(item).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });

  describe('controlled mode', () => {
    it('works in controlled single mode', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('left');
        return (
          <ToggleGroup type="single" value={value} onValueChange={setValue}>
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      const leftItem = screen.getByText('Left');
      const rightItem = screen.getByText('Right');

      expect(leftItem).toHaveAttribute('data-state', 'on');

      await user.click(rightItem);

      expect(rightItem).toHaveAttribute('data-state', 'on');
      expect(leftItem).toHaveAttribute('data-state', 'off');
    });

    it('works in controlled multiple mode', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState<string[]>(['bold']);
        return (
          <ToggleGroup type="multiple" value={value} onValueChange={setValue}>
            <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
            <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
          </ToggleGroup>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      const italicItem = screen.getByText('Italic');

      await user.click(italicItem);

      expect(screen.getByText('Bold')).toHaveAttribute('data-state', 'on');
      expect(italicItem).toHaveAttribute('data-state', 'on');
    });
  });
});
