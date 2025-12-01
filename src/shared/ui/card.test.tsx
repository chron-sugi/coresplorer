/**
 * Card Component Tests
 *
 * Tests for the shared Card primitives including:
 * - Card wrapper
 * - CardHeader, CardTitle, CardDescription
 * - CardContent and CardFooter
 * - Ref forwarding and composition
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies default card styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'shadow-sm');
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card', 'rounded-lg');
    });

    it('forwards HTML attributes', () => {
      render(
        <Card data-testid="test-card" role="region" aria-label="Card region">
          Content
        </Card>
      );
      const card = screen.getByTestId('test-card');
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Card region');
    });

    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardHeader', () => {
    it('renders children correctly', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('applies default header styles', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('applies custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-header', 'flex');
    });

    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('renders children correctly', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders as h3 element', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Title');
    });

    it('applies default title styles', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.firstChild as HTMLElement;
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });

    it('applies custom className', () => {
      const { container } = render(<CardTitle className="custom-title">Title</CardTitle>);
      const title = container.firstChild as HTMLElement;
      expect(title).toHaveClass('custom-title', 'text-2xl');
    });

    it('forwards ref to heading element', () => {
      const ref = { current: null };
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe('CardDescription', () => {
    it('renders children correctly', () => {
      render(<CardDescription>Card description text</CardDescription>);
      expect(screen.getByText('Card description text')).toBeInTheDocument();
    });

    it('renders as p element', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.querySelector('p');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Description');
    });

    it('applies default description styles', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.firstChild as HTMLElement;
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      const { container } = render(
        <CardDescription className="custom-desc">Description</CardDescription>
      );
      const description = container.firstChild as HTMLElement;
      expect(description).toHaveClass('custom-desc', 'text-sm');
    });

    it('forwards ref to paragraph element', () => {
      const ref = { current: null };
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('CardContent', () => {
    it('renders children correctly', () => {
      render(<CardContent>Content area</CardContent>);
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('applies default content styles', () => {
      const { container } = render(<CardContent>Content</CardContent>);
      const content = container.firstChild as HTMLElement;
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('applies custom className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>);
      const content = container.firstChild as HTMLElement;
      expect(content).toHaveClass('custom-content', 'p-6');
    });

    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardFooter', () => {
    it('renders children correctly', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('applies default footer styles', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('applies custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('custom-footer', 'flex');
    });

    it('forwards ref to div element', () => {
      const ref = { current: null };
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Card Composition', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card Title</CardTitle>
            <CardDescription>This is a test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      // Verify all parts are rendered
      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByText('Test Card Title')).toBeInTheDocument();
      expect(screen.getByText('This is a test card description')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
    });

    it('works with partial composition', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
          </CardHeader>
          <CardContent>Content only</CardContent>
        </Card>
      );

      expect(screen.getByText('Simple Card')).toBeInTheDocument();
      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('maintains proper DOM hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      const children = Array.from(card.children);

      // Verify order: header, content, footer
      expect(children[0]).toHaveClass('flex', 'flex-col'); // CardHeader
      expect(children[1]).toHaveClass('p-6', 'pt-0'); // CardContent
      expect(children[2]).toHaveClass('flex', 'items-center'); // CardFooter
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes on Card', () => {
      render(
        <Card aria-labelledby="card-title" role="article">
          <CardTitle id="card-title">Accessible Card</CardTitle>
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
      expect(screen.getByText('Accessible Card')).toHaveAttribute('id', 'card-title');
    });

    it('supports semantic HTML with proper heading hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Main Title');
    });
  });

  describe('Styling flexibility', () => {
    it('allows complete style override with className', () => {
      const { container } = render(
        <Card className="bg-blue-500 border-none rounded-none">
          Custom Styled Card
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-blue-500', 'border-none', 'rounded-none');
    });

    it('combines default and custom classes properly', () => {
      const { container } = render(
        <Card className="shadow-lg hover:shadow-xl">
          Card
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      // Should have both default and custom classes
      expect(card).toHaveClass('rounded-lg', 'border', 'shadow-lg', 'hover:shadow-xl');
    });
  });
});
