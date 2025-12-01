import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { SplAnalysisEditor } from './SplAnalysisEditor';

const sampleCode = `search index=main\nstats count by host`;

// Mock scrollIntoView and scrollTo since they are not available in jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.scrollTo = vi.fn();

describe('SplViewer component', () => {
  test('renders CodeBlock with highlighted lines overlay', () => {
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
});
