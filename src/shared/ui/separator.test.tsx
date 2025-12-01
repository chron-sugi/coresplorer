/**
 * Separator Component Tests
 *
 * Tests for the shared Separator component including:
 * - Horizontal and vertical orientations
 * - Decorative vs semantic separators
 * - Styling and className handling
 * - Ref forwarding
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator', () => {
  describe('rendering', () => {
    it('renders with default horizontal orientation', () => {
      const { container } = render(<Separator />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('applies default horizontal styling', () => {
      const { container } = render(<Separator />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('applies custom className', () => {
      const { container } = render(<Separator className="custom-separator" />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('custom-separator', 'bg-border');
    });

    it('is decorative by default', () => {
      const { container } = render(<Separator />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('orientations', () => {
    it('renders horizontal separator', () => {
      const { container } = render(<Separator orientation="horizontal" />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('renders vertical separator', () => {
      const { container } = render(<Separator orientation="vertical" />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveClass('h-full', 'w-[1px]');
    });

    it('applies correct styles for vertical orientation', () => {
      const { container } = render(<Separator orientation="vertical" />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).not.toHaveClass('h-[1px]', 'w-full');
      expect(separator).toHaveClass('h-full', 'w-[1px]');
    });
  });

  describe('decorative vs semantic', () => {
    it('is aria-hidden when decorative=true', () => {
      const { container } = render(<Separator decorative={true} />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('has separator role when decorative=false', () => {
      const { container } = render(<Separator decorative={false} />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('role', 'separator');
      expect(separator).not.toHaveAttribute('aria-hidden');
    });

    it('has correct aria-orientation when semantic', () => {
      const { container } = render(
        <Separator decorative={false} orientation="vertical" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('role', 'separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('styling', () => {
    it('has default background color class', () => {
      const { container } = render(<Separator />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('bg-border');
    });

    it('has shrink-0 class to prevent flex shrinking', () => {
      const { container } = render(<Separator />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('shrink-0');
    });

    it('combines default and custom classes', () => {
      const { container } = render(
        <Separator className="my-4 bg-red-500" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('bg-border', 'my-4', 'bg-red-500');
    });

    it('allows overriding orientation styles with className', () => {
      const { container } = render(
        <Separator className="h-0.5 w-1/2" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('h-0.5', 'w-1/2');
    });
  });

  describe('ref forwarding', () => {
    it('forwards ref to separator element', () => {
      const ref = { current: null };
      render(<Separator ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref points to the actual DOM element', () => {
      const ref = { current: null };
      render(<Separator ref={ref} />);
      expect(ref.current).toHaveAttribute('data-orientation');
    });
  });

  describe('HTML attributes', () => {
    it('forwards data attributes', () => {
      const { container } = render(
        <Separator data-testid="test-separator" data-custom="value" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('data-testid', 'test-separator');
      expect(separator).toHaveAttribute('data-custom', 'value');
    });

    it('forwards style prop', () => {
      const { container } = render(
        <Separator style={{ margin: '10px' }} />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveStyle({ margin: '10px' });
    });
  });

  describe('use cases', () => {
    it('works as divider in vertical layout', () => {
      const { container } = render(
        <div className="flex flex-col">
          <div>Content 1</div>
          <Separator />
          <div>Content 2</div>
        </div>
      );
      const separator = container.querySelector('[data-orientation]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('works as divider in horizontal layout', () => {
      const { container } = render(
        <div className="flex">
          <div>Left</div>
          <Separator orientation="vertical" />
          <div>Right</div>
        </div>
      );
      const separator = container.querySelector('[data-orientation]');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('can be styled as thick divider', () => {
      const { container } = render(
        <Separator className="h-1" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('h-1');
    });

    it('can be styled with custom colors', () => {
      const { container } = render(
        <Separator className="bg-primary" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveClass('bg-primary');
    });
  });

  describe('accessibility', () => {
    it('is hidden from screen readers when decorative', () => {
      const { container } = render(<Separator />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('is visible to screen readers when semantic', () => {
      const { container } = render(<Separator decorative={false} />);
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('role', 'separator');
      expect(separator).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('communicates orientation to screen readers when semantic', () => {
      const { container } = render(
        <Separator decorative={false} orientation="horizontal" />
      );
      const separator = container.firstChild as HTMLElement;
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });
});
