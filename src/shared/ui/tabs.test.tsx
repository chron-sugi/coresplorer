/**
 * Tabs Component Tests
 *
 * Tests for the shared Tabs components including:
 * - Tabs, TabsList, TabsTrigger, TabsContent
 * - Tab switching functionality
 * - Controlled and uncontrolled modes
 * - Keyboard navigation
 * - Styling and className handling
 * - Ref forwarding
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

describe('Tabs', () => {
  const SimpleTabs = ({ defaultValue = 'tab1', onValueChange = undefined as any }) => (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  );

  describe('rendering', () => {
    it('renders all tab triggers', () => {
      render(<SimpleTabs />);
      expect(screen.getByRole('tab', { name: /tab 1/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tab 2/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /tab 3/i })).toBeInTheDocument();
    });

    it('shows default tab content', () => {
      render(<SimpleTabs defaultValue="tab1" />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('renders tablist with proper role', () => {
      render(<SimpleTabs />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('renders tab triggers with proper role', () => {
      render(<SimpleTabs />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });
  });

  describe('tab switching', () => {
    it('switches tabs on click', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      await user.click(tab2);

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('calls onValueChange when tab changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<SimpleTabs onValueChange={handleChange} />);

      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      await user.click(tab2);

      expect(handleChange).toHaveBeenCalledWith('tab2');
    });

    it('updates selected state correctly', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs />);

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });

      expect(tab1).toHaveAttribute('data-state', 'active');
      expect(tab2).toHaveAttribute('data-state', 'inactive');

      await user.click(tab2);

      expect(tab1).toHaveAttribute('data-state', 'inactive');
      expect(tab2).toHaveAttribute('data-state', 'active');
    });
  });

  describe('keyboard navigation', () => {
    it('navigates tabs with arrow keys', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs />);

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      tab1.focus();

      await user.keyboard('{ArrowRight}');

      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      expect(tab2).toHaveFocus();
    });

    it('wraps to first tab when arrowing right from last tab', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs />);

      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      tab3.focus();

      await user.keyboard('{ArrowRight}');

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('navigates backwards with left arrow', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs defaultValue="tab2" />);

      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      tab2.focus();

      await user.keyboard('{ArrowLeft}');

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('supports Home key to jump to first tab', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs defaultValue="tab3" />);

      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      tab3.focus();

      await user.keyboard('{Home}');

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveFocus();
    });

    it('supports End key to jump to last tab', async () => {
      const user = userEvent.setup();
      render(<SimpleTabs />);

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      tab1.focus();

      await user.keyboard('{End}');

      const tab3 = screen.getByRole('tab', { name: /tab 3/i });
      expect(tab3).toHaveFocus();
    });
  });

  describe('TabsList', () => {
    it('applies default styling classes', () => {
      render(<SimpleTabs />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('inline-flex', 'h-10', 'bg-muted');
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tablist">
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveClass('custom-tablist');
    });

    it('forwards ref', () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('TabsTrigger', () => {
    it('applies default styling classes', () => {
      render(<SimpleTabs />);
      const tab = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab).toHaveClass('tabs-trigger', 'inline-flex', 'items-center');
    });

    it('applies custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Custom
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      const tab = screen.getByRole('tab', { name: /custom/i });
      expect(tab).toHaveClass('custom-trigger');
    });

    it('forwards ref', () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>
              Tab
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('can be disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1" onValueChange={handleChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      await user.click(tab2);

      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('TabsContent', () => {
    it('applies default styling classes', () => {
      const { container } = render(<SimpleTabs />);
      const content = container.querySelector('[role="tabpanel"]');
      expect(content).toHaveClass('mt-2', 'ring-offset-background');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">
            Content
          </TabsContent>
        </Tabs>
      );
      const content = container.querySelector('[role="tabpanel"]');
      expect(content).toHaveClass('custom-content');
    });

    it('forwards ref', () => {
      const ref = { current: null };
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>
            Content
          </TabsContent>
        </Tabs>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('has proper tabpanel role', () => {
      const { container } = render(<SimpleTabs />);
      const content = container.querySelector('[role="tabpanel"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('works in controlled mode', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('tab1');
        return (
          <Tabs value={value} onValueChange={setValue}>
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content 1</TabsContent>
            <TabsContent value="tab2">Content 2</TabsContent>
          </Tabs>
        );
      };

      const user = userEvent.setup();
      render(<TestComponent />);

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      await user.click(tab2);

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<SimpleTabs />);
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();

      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveAttribute('aria-selected');
    });

    it('marks selected tab as aria-selected=true', () => {
      render(<SimpleTabs defaultValue="tab1" />);
      const tab1 = screen.getByRole('tab', { name: /tab 1/i });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('marks unselected tabs as aria-selected=false', () => {
      render(<SimpleTabs defaultValue="tab1" />);
      const tab2 = screen.getByRole('tab', { name: /tab 2/i });
      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });

    it('has focus-visible ring styles on content', () => {
      const { container } = render(<SimpleTabs />);
      const content = container.querySelector('[role="tabpanel"]');
      expect(content).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });
});
