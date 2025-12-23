import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { SplAnalysisEditor } from './SplAnalysisEditor';

// Mock scrollIntoView and scrollTo since they are not available in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

describe('SplAnalysisEditor', () => {
  describe('basic rendering', () => {
    test('renders CodeBlock with highlighted lines overlay', () => {
      const sampleCode = `search index=main\nstats count by host`;
      render(
        <SplAnalysisEditor
          code={sampleCode}
          highlightedLines={[2]}
          highlightToken={null}
        />
      );
      // The overlay divs are rendered inside CodeBlock with class "absolute left-0 right-0 w-full"
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(1);
      // Verify that the overlay corresponds to line 2
      const style = overlays[0].getAttribute('style');
      expect(style).toContain('calc');
      expect(style).toContain('1.5em');
      expect(style).toContain('1rem');
    });

    test('applies token highlight when highlightToken is provided', () => {
      const sampleCode = `search index=main\nstats count by host`;
      render(
        <SplAnalysisEditor
          code={sampleCode}
          highlightedLines={[]}
          highlightToken="host"
        />
      );
      // Token highlights are rendered as <mark class="token-highlight-persistent">
      const mark = document.querySelector('mark.token-highlight-persistent');
      expect(mark).toBeInTheDocument();
      expect(mark?.textContent).toBe('host');
    });

    test('renders with language set to spl', () => {
      const sampleCode = `search index=main`;
      render(
        <SplAnalysisEditor
          code={sampleCode}
          highlightedLines={[]}
          highlightToken={null}
        />
      );
      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
    });

    test('shows line numbers', () => {
      const sampleCode = `search index=main\nstats count`;
      render(
        <SplAnalysisEditor
          code={sampleCode}
          highlightedLines={[]}
          highlightToken={null}
        />
      );
      const preElement = document.querySelector('pre.line-numbers');
      expect(preElement).toBeInTheDocument();
    });
  });

  describe('empty and edge cases', () => {
    test('renders with empty code string', () => {
      render(
        <SplAnalysisEditor
          code=""
          highlightedLines={[]}
          highlightToken={null}
        />
      );
      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
    });

    test('renders with whitespace-only code', () => {
      render(
        <SplAnalysisEditor
          code="   \n  \n   "
          highlightedLines={[]}
          highlightToken={null}
        />
      );
      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
    });

    test('renders with single line code', () => {
      render(
        <SplAnalysisEditor
          code="search index=main"
          highlightedLines={[1]}
          highlightToken={null}
        />
      );
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(1);
    });

    test('handles very long code (many lines)', () => {
      const longCode = Array.from({ length: 100 }, (_, i) => `| eval field${i}=${i}`).join('\n');
      render(
        <SplAnalysisEditor
          code={longCode}
          highlightedLines={[50]}
          highlightToken={null}
        />
      );
      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toContain('field50');
    });
  });

  describe('highlighted lines', () => {
    test('renders no overlays when highlightedLines is empty', () => {
      render(
        <SplAnalysisEditor
          code="search index=main\nstats count"
          highlightedLines={[]}
          highlightToken={null}
        />
      );
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(0);
    });

    test('renders multiple highlighted line overlays', () => {
      render(
        <SplAnalysisEditor
          code="search index=main\nstats count by host\n| table host count"
          highlightedLines={[1, 2, 3]}
          highlightToken={null}
        />
      );
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(3);
    });

    test('handles non-sequential highlighted lines', () => {
      render(
        <SplAnalysisEditor
          code="line1\nline2\nline3\nline4\nline5"
          highlightedLines={[1, 3, 5]}
          highlightToken={null}
        />
      );
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(3);
    });

    test('calculates correct top position for each highlighted line', () => {
      render(
        <SplAnalysisEditor
          code="line1\nline2\nline3"
          highlightedLines={[1, 2, 3]}
          highlightToken={null}
        />
      );
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');

      // Verify each line has correct position calculation
      // Format: calc(1rem + 1.5em * (N - 1))
      expect(overlays[0].getAttribute('style')).toContain('(1 - 1)');
      expect(overlays[1].getAttribute('style')).toContain('(2 - 1)');
      expect(overlays[2].getAttribute('style')).toContain('(3 - 1)');
    });
  });

  describe('token highlighting', () => {
    test('does not highlight when token is null', () => {
      render(
        <SplAnalysisEditor
          code="search index=main host=server1"
          highlightedLines={[]}
          highlightToken={null}
        />
      );
      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBe(0);
    });

    test('highlights token appearing multiple times', () => {
      render(
        <SplAnalysisEditor
          code="search index=main | stats count by host | where host!=''"
          highlightedLines={[]}
          highlightToken="host"
        />
      );
      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBe(2);
      marks.forEach(mark => {
        expect(mark.textContent).toBe('host');
      });
    });

    test('does not highlight partial matches (word boundaries)', () => {
      render(
        <SplAnalysisEditor
          code="search hostname=server1 | eval newhost=host"
          highlightedLines={[]}
          highlightToken="host"
        />
      );
      // Should only highlight standalone "host", not "hostname" or "newhost"
      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBe(1);
      expect(marks[0].textContent).toBe('host');
    });

    test('handles token not found in code', () => {
      render(
        <SplAnalysisEditor
          code="search index=main | stats count"
          highlightedLines={[]}
          highlightToken="nonexistent"
        />
      );
      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBe(0);
    });

    test('highlights are case-insensitive', () => {
      render(
        <SplAnalysisEditor
          code="search HOST=server1 | eval host=lower(HOST)"
          highlightedLines={[]}
          highlightToken="host"
        />
      );
      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      // Should match HOST, host, and HOST
      expect(marks.length).toBeGreaterThanOrEqual(2);
    });

    test('handles special regex characters in token', () => {
      // This tests that escapeRegex is working
      render(
        <SplAnalysisEditor
          code="search field.name=value | eval test=1"
          highlightedLines={[]}
          highlightToken="field.name"
        />
      );
      // Should not throw error and render properly
      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
    });
  });

  describe('combined features', () => {
    test('renders both highlighted lines and token highlight', () => {
      render(
        <SplAnalysisEditor
          code="search index=main\n| stats count by host\n| table host count"
          highlightedLines={[2]}
          highlightToken="host"
        />
      );

      // Check line highlights
      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(1);

      // Check token highlights
      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBe(2);
    });

    test('renders with no highlights and no token (plain viewer)', () => {
      render(
        <SplAnalysisEditor
          code="search index=main | stats count"
          highlightedLines={[]}
          highlightToken={null}
        />
      );

      const overlays = document.querySelectorAll('.absolute.left-0.right-0.w-full');
      expect(overlays.length).toBe(0);

      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBe(0);

      // Code should still be present
      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toContain('search index=main');
    });
  });

  describe('SPL syntax', () => {
    test('renders complex SPL with subsearch', () => {
      const complexSpl = `search index=main
| stats count by host
| join host [search index=other | stats avg(cpu) by host]
| table host count`;

      render(
        <SplAnalysisEditor
          code={complexSpl}
          highlightedLines={[3]}
          highlightToken="host"
        />
      );

      const codeElement = document.querySelector('code.language-spl');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement?.textContent).toContain('join');
    });

    test('renders SPL with pipes and eval expressions', () => {
      const spl = `| makeresults
| eval a=1, b=2, c=a+b
| where c > 2
| table a b c`;

      render(
        <SplAnalysisEditor
          code={spl}
          highlightedLines={[2, 4]}
          highlightToken="c"
        />
      );

      const marks = document.querySelectorAll('mark.token-highlight-persistent');
      expect(marks.length).toBeGreaterThanOrEqual(2); // c appears multiple times
    });
  });
});
