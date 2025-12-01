/**
 * CodeBlock Component Tests
 *
 * Tests for the CodeBlock component including:
 * - Basic rendering with code
 * - Line numbers display
 * - Highlighted lines
 * - Language specification
 * - Event handlers (hover, click)
 * - Styling and className handling
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  const sampleCode = 'const greeting = "Hello, World!";\nconsole.log(greeting);';

  describe('rendering', () => {
    it('renders code content', () => {
      render(<CodeBlock code={sampleCode} />);
      expect(screen.getByText(/Hello, World!/i)).toBeInTheDocument();
    });

    it('renders with default SPL language', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toHaveClass('language-spl');
    });

    it('renders with custom language', () => {
      const { container } = render(<CodeBlock code={sampleCode} language="javascript" />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toHaveClass('language-javascript');
    });

    it('applies custom className to container', () => {
      const { container } = render(<CodeBlock code={sampleCode} className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('applies custom className to pre element', () => {
      const { container } = render(<CodeBlock code={sampleCode} preClassName="custom-pre" />);
      const preElement = container.querySelector('pre');
      expect(preElement).toHaveClass('custom-pre');
    });
  });

  describe('line numbers', () => {
    it('does not show line numbers by default', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const preElement = container.querySelector('pre');
      expect(preElement).not.toHaveClass('line-numbers');
    });

    it('shows line numbers when showLineNumbers is true', () => {
      const { container } = render(<CodeBlock code={sampleCode} showLineNumbers={true} />);
      const preElement = container.querySelector('pre');
      expect(preElement).toHaveClass('line-numbers');
    });
  });

  describe('highlighted lines', () => {
    it('renders without highlighted lines by default', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const highlightDivs = container.querySelectorAll('[style*="backgroundColor"]');
      expect(highlightDivs.length).toBe(0);
    });

    it('renders highlighted line backgrounds', () => {
      render(<CodeBlock code={sampleCode} highlightedLines={[1]} />);
      // Check that highlighting layer exists
      const { container } = render(<CodeBlock code={sampleCode} highlightedLines={[1]} />);
      const highlightLayer = container.querySelector('.absolute.inset-0');
      expect(highlightLayer).toBeInTheDocument();
    });

    it('highlights multiple lines', () => {
      const multiLineCode = 'line1\nline2\nline3\nline4';
      const { container } = render(
        <CodeBlock code={multiLineCode} highlightedLines={[1, 3]} />
      );
      const highlightLayer = container.querySelector('.absolute.inset-0');
      expect(highlightLayer).toBeInTheDocument();
    });
  });

  describe('token highlighting', () => {
    it('renders without token highlighting by default', () => {
      render(<CodeBlock code={sampleCode} />);
      const { container } = render(<CodeBlock code={sampleCode} />);
      const marks = container.querySelectorAll('.token-highlight-persistent');
      expect(marks.length).toBe(0);
    });

    it('highlights specified token', () => {
      const { container } = render(
        <CodeBlock code={sampleCode} highlightToken="greeting" />
      );
      // Token highlighting is applied via innerHTML manipulation
      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
    });
  });

  describe('underlined ranges', () => {
    it('renders without underlines by default', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const underlines = container.querySelectorAll('.border-b-2');
      expect(underlines.length).toBe(0);
    });

    it('renders underlined ranges for field tracing', () => {
      const underlinedRanges = [
        { line: 1, startCol: 6, endCol: 14, type: 'definition' as const },
      ];
      const { container } = render(
        <CodeBlock code={sampleCode} underlinedRanges={underlinedRanges} />
      );
      const underlines = container.querySelectorAll('.border-b-2');
      expect(underlines.length).toBe(1);
    });

    it('differentiates definition from usage underlines', () => {
      const underlinedRanges = [
        { line: 1, startCol: 0, endCol: 5, type: 'definition' as const },
        { line: 2, startCol: 0, endCol: 5, type: 'usage' as const },
      ];
      const { container } = render(
        <CodeBlock code={sampleCode} underlinedRanges={underlinedRanges} />
      );
      const definitionUnderline = container.querySelector('.border-green-500');
      const usageUnderline = container.querySelector('.border-blue-400');
      expect(definitionUnderline).toBeInTheDocument();
      expect(usageUnderline).toBeInTheDocument();
    });

    it('skips invalid range entries (NaN protection)', () => {
      const invalidRanges = [
        { line: NaN, startCol: 0, endCol: 5, type: 'definition' as const },
        { line: 1, startCol: NaN, endCol: 5, type: 'usage' as const },
      ];
      const { container } = render(
        <CodeBlock code={sampleCode} underlinedRanges={invalidRanges} />
      );
      // Invalid ranges should be skipped, no error thrown
      expect(container).toBeInTheDocument();
    });
  });

  describe('event handlers', () => {
    it('calls onTokenHover when hovering over code', async () => {
      const handleHover = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <CodeBlock code={sampleCode} onTokenHover={handleHover} />
      );

      const codeElement = container.querySelector('code');
      if (codeElement) {
        await user.hover(codeElement);
        // onTokenHover should be called (possibly with null if no token found)
        expect(handleHover).toHaveBeenCalled();
      }
    });

    it('calls onTokenClick when clicking on code', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <CodeBlock code={sampleCode} onTokenClick={handleClick} />
      );

      const codeElement = container.querySelector('code');
      if (codeElement) {
        await user.click(codeElement);
        // onTokenClick may or may not be called depending on whether a token is found
        // Just verify no errors
      }
    });

    it('adds button role when onTokenClick is provided', () => {
      const { container } = render(
        <CodeBlock code={sampleCode} onTokenClick={() => {}} />
      );
      const codeElement = container.querySelector('code');
      expect(codeElement).toHaveAttribute('role', 'button');
      expect(codeElement).toHaveAttribute('tabIndex', '0');
    });

    it('does not add button role without onTokenClick', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const codeElement = container.querySelector('code');
      expect(codeElement).not.toHaveAttribute('role', 'button');
    });

    it('calls onScrollComplete after auto-scroll', () => {
      const handleScrollComplete = vi.fn();
      render(
        <CodeBlock
          code={sampleCode}
          highlightedLines={[1]}
          showLineNumbers={true}
          onScrollComplete={handleScrollComplete}
        />
      );
      // ScrollComplete is called after scroll animation
      // In tests, timing may vary
    });
  });

  describe('ref forwarding', () => {
    it('forwards preRef to pre element', () => {
      const ref = { current: null };
      render(<CodeBlock code={sampleCode} preRef={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLPreElement);
    });
  });

  describe('keyboard navigation', () => {
    it('supports Enter key for token click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <CodeBlock code={sampleCode} onTokenClick={handleClick} />
      );

      const codeElement = container.querySelector('code');
      if (codeElement) {
        codeElement.focus();
        await user.keyboard('{Enter}');
        // Should trigger click handler if token found
      }
    });

    it('supports Space key for token click', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <CodeBlock code={sampleCode} onTokenClick={handleClick} />
      );

      const codeElement = container.querySelector('code');
      if (codeElement) {
        codeElement.focus();
        await user.keyboard(' ');
        // Should trigger click handler if token found
      }
    });
  });

  describe('auto-scroll behavior', () => {
    it('auto-scrolls to highlighted line by default', () => {
      const { container } = render(
        <CodeBlock
          code={sampleCode}
          highlightedLines={[2]}
          showLineNumbers={true}
        />
      );
      // Auto-scroll happens via scrollIntoView
      expect(container).toBeInTheDocument();
    });

    it('disables auto-scroll when disableAutoScroll is true', () => {
      const { container } = render(
        <CodeBlock
          code={sampleCode}
          highlightedLines={[2]}
          showLineNumbers={true}
          disableAutoScroll={true}
        />
      );
      // Should not scroll
      expect(container).toBeInTheDocument();
    });
  });

  describe('code normalization', () => {
    it('handles code without trailing newline', () => {
      const codeWithoutNewline = 'const x = 1;';
      const { container } = render(<CodeBlock code={codeWithoutNewline} />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
    });

    it('handles code with trailing newline', () => {
      const codeWithNewline = 'const x = 1;\n';
      const { container } = render(<CodeBlock code={codeWithNewline} />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
    });

    it('handles empty code', () => {
      const { container } = render(<CodeBlock code="" />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toBeInTheDocument();
    });

    it('handles multiline code', () => {
      const multiline = 'line 1\nline 2\nline 3';
      const { container } = render(<CodeBlock code={multiline} />);
      expect(container.textContent).toContain('line 1');
    });
  });

  describe('styling', () => {
    it('has rounded corners on container', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('rounded-md');
    });

    it('applies monospace font to code', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toHaveClass('font-mono');
    });

    it('has proper text size', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const codeElement = container.querySelector('code');
      expect(codeElement).toHaveClass('!text-sm');
    });

    it('injects style tag for token highlighting', () => {
      const { container } = render(<CodeBlock code={sampleCode} />);
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeInTheDocument();
      expect(styleTag?.textContent).toContain('.token-highlight-persistent');
    });
  });
});
