import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContextPanel } from './ContextPanel';

describe('ContextPanel', () => {
  describe('rendering', () => {
    it('renders with title', () => {
      render(
        <ContextPanel title="Test Title">
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <ContextPanel>
          <div data-testid="child">Child Content</div>
        </ContextPanel>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(
        <ContextPanel title="Title" subtitle={<span>Subtitle</span>}>
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('renders header content when provided', () => {
      render(
        <ContextPanel headerContent={<div data-testid="header">Header</div>}>
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders empty state when provided', () => {
      render(
        <ContextPanel emptyState={<div>No selection</div>}>
          <div>Hidden content</div>
        </ContextPanel>
      );
      expect(screen.getByText('No selection')).toBeInTheDocument();
    });
  });

  describe('collapsed state', () => {
    it('renders collapsed view when isCollapsed is true', () => {
      render(
        <ContextPanel isCollapsed={true} onToggleCollapse={() => {}}>
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.getByLabelText('Expand context panel')).toBeInTheDocument();
    });

    it('renders expanded view when isCollapsed is false', () => {
      render(
        <ContextPanel isCollapsed={false} onToggleCollapse={() => {}}>
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.getByLabelText('Collapse context panel')).toBeInTheDocument();
    });

    it('renders collapsed content when provided', () => {
      render(
        <ContextPanel
          isCollapsed={true}
          collapsedContent={<div data-testid="collapsed-content">Collapsed</div>}
        >
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.getByTestId('collapsed-content')).toBeInTheDocument();
    });
  });

  describe('side positioning', () => {
    it('applies right border for left side', () => {
      const { container } = render(
        <ContextPanel side="left">
          <div>Content</div>
        </ContextPanel>
      );
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('border-r');
    });

    it('applies left border for right side', () => {
      const { container } = render(
        <ContextPanel side="right">
          <div>Content</div>
        </ContextPanel>
      );
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('border-l');
    });

    it('defaults to right side', () => {
      const { container } = render(
        <ContextPanel>
          <div>Content</div>
        </ContextPanel>
      );
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('border-l');
    });
  });

  describe('toggle callback', () => {
    it('calls onToggleCollapse when expand button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <ContextPanel isCollapsed={true} onToggleCollapse={onToggle}>
          <div>Content</div>
        </ContextPanel>
      );

      await user.click(screen.getByLabelText('Expand context panel'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleCollapse when collapse button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <ContextPanel isCollapsed={false} onToggleCollapse={onToggle}>
          <div>Content</div>
        </ContextPanel>
      );

      await user.click(screen.getByLabelText('Collapse context panel'));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('does not render toggle button when onToggleCollapse is not provided', () => {
      render(
        <ContextPanel isCollapsed={false}>
          <div>Content</div>
        </ContextPanel>
      );
      expect(screen.queryByLabelText('Collapse context panel')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible expand button', () => {
      render(
        <ContextPanel isCollapsed={true} onToggleCollapse={() => {}}>
          <div>Content</div>
        </ContextPanel>
      );
      const button = screen.getByLabelText('Expand context panel');
      expect(button).toHaveAttribute('title', 'Expand panel');
    });

    it('has accessible collapse button', () => {
      render(
        <ContextPanel isCollapsed={false} onToggleCollapse={() => {}}>
          <div>Content</div>
        </ContextPanel>
      );
      const button = screen.getByLabelText('Collapse context panel');
      expect(button).toHaveAttribute('title', 'Collapse panel');
    });

    it('title is rendered as heading', () => {
      render(
        <ContextPanel title="Panel Title">
          <div>Content</div>
        </ContextPanel>
      );
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Panel Title');
    });
  });

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ContextPanel className="custom-class">
          <div>Content</div>
        </ContextPanel>
      );
      const panel = container.firstChild as HTMLElement;
      expect(panel.className).toContain('custom-class');
    });
  });
});
