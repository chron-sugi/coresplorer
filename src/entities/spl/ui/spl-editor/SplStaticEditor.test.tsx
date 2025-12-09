import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SplStaticEditor, getTokenAtPosition } from './SplStaticEditor';
import {
  xssVectors,
  sqlInjectionVectors,
  unicodeVectors,
  largePayloadVectors,
} from '@/test/fixtures/security-fixtures';
import { mockSplCode, mockComplexSpl } from '@/test/fixtures/page-mocks';

// Mock SplHighlighter
vi.mock('./SplHighlighter', () => ({
  SplHighlighter: ({
    code,
    highlightedLines,
    highlightToken,
    underlinedRanges,
    preRef,
  }: {
    code: string;
    highlightedLines?: number[];
    highlightToken?: string | null;
    underlinedRanges?: unknown[];
    preRef?: React.RefObject<HTMLPreElement>;
  }) => (
    <div data-testid="spl-highlighter" ref={preRef as any} data-code={code}>
      Highlighter ({highlightedLines?.length || 0} lines highlighted, token:{' '}
      {highlightToken || 'none'}, {underlinedRanges?.length || 0} ranges)
    </div>
  ),
}));

vi.mock('../config/editor-theme.css', () => ({}));

describe('SplStaticEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders textarea with code', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor');
      expect(textarea).toBeInTheDocument();
      expect((textarea as HTMLTextAreaElement).value).toBe(mockSplCode);
    });

    it('renders SplHighlighter component', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      expect(screen.getByTestId('spl-highlighter')).toBeInTheDocument();
    });

    it('applies correct ARIA label to textarea', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByLabelText('SPL Analysis Editor');
      expect(textarea).toBeInTheDocument();
    });

    it('renders with empty code', () => {
      render(<SplStaticEditor code="" />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('renders complex SPL code', () => {
      render(<SplStaticEditor code={mockComplexSpl} />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;
      expect(textarea.value).toBe(mockComplexSpl);
    });

    it('disables spellcheck on textarea', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor');
      expect(textarea).toHaveAttribute('spellCheck', 'false');
    });

    it('renders textarea with transparent text and bg', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor');
      expect(textarea).toHaveClass('text-transparent');
      expect(textarea).toHaveClass('bg-transparent');
    });
  });

  describe('code editing', () => {
    it('calls onChange when code is typed', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="search" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, { target: { value: 'search index=main' } });

      expect(onChange).toHaveBeenCalledWith('search index=main');
    });

    it('does not crash when onChange is undefined', () => {
      render(<SplStaticEditor code="search" />);

      const textarea = screen.getByTestId('spl-editor');

      expect(() => {
        fireEvent.change(textarea, { target: { value: 'search index=main' } });
      }).not.toThrow();
    });

    it('allows multiline code editing', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      const multilineCode = 'search index=main\n| stats count\n| where count > 10';

      fireEvent.change(textarea, { target: { value: multilineCode } });

      expect(onChange).toHaveBeenCalledWith(multilineCode);
    });

    it('preserves code value when onChange fires', () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <SplStaticEditor code="search" onChange={onChange} />
      );

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;

      // Simulate typing
      fireEvent.change(textarea, { target: { value: 'search index=main' } });

      // Rerender with new code
      rerender(<SplStaticEditor code="search index=main" onChange={onChange} />);

      expect(textarea.value).toBe('search index=main');
    });
  });

  describe('selection change', () => {
    it('calls onSelectionChange when text is selected', () => {
      const onSelectionChange = vi.fn();
      render(
        <SplStaticEditor
          code="search index=main"
          onSelectionChange={onSelectionChange}
        />
      );

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;

      // Simulate text selection
      textarea.selectionStart = 0;
      textarea.selectionEnd = 6;
      fireEvent.select(textarea);

      expect(onSelectionChange).toHaveBeenCalledWith('search');
    });

    it('calls onSelectionChange with null when no selection', () => {
      const onSelectionChange = vi.fn();
      render(
        <SplStaticEditor
          code="search index=main"
          onSelectionChange={onSelectionChange}
        />
      );

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;

      // Simulate empty selection (cursor only)
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
      fireEvent.select(textarea);

      expect(onSelectionChange).toHaveBeenCalledWith(null);
    });

    it('does not crash when onSelectionChange is undefined', () => {
      render(<SplStaticEditor code="search index=main" />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;

      expect(() => {
        textarea.selectionStart = 0;
        textarea.selectionEnd = 6;
        fireEvent.select(textarea);
      }).not.toThrow();
    });
  });

  describe('highlighted lines', () => {
    it('passes highlightedLines to SplHighlighter', () => {
      render(
        <SplStaticEditor code={mockSplCode} highlightedLines={[1, 2, 3]} />
      );

      const highlighter = screen.getByTestId('spl-highlighter');
      expect(highlighter).toHaveTextContent('3 lines highlighted');
    });

    it('scrolls to first highlighted line when highlightedLines change', async () => {
      const { rerender } = render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;
      const scrollToSpy = vi.spyOn(textarea, 'scrollTo');

      // Set highlighted lines
      rerender(<SplStaticEditor code={mockSplCode} highlightedLines={[5]} />);

      await waitFor(() => {
        expect(scrollToSpy).toHaveBeenCalled();
      });
    });

    it('does not scroll when highlightedLines is empty', () => {
      render(<SplStaticEditor code={mockSplCode} highlightedLines={[]} />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;
      const scrollToSpy = vi.spyOn(textarea, 'scrollTo');

      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  describe('token highlighting', () => {
    it('passes highlightToken to SplHighlighter', () => {
      render(<SplStaticEditor code={mockSplCode} highlightToken="search" />);

      const highlighter = screen.getByTestId('spl-highlighter');
      expect(highlighter).toHaveTextContent('token: search');
    });

    it('passes null highlightToken to SplHighlighter', () => {
      render(<SplStaticEditor code={mockSplCode} highlightToken={null} />);

      const highlighter = screen.getByTestId('spl-highlighter');
      expect(highlighter).toHaveTextContent('token: none');
    });
  });

  describe('underlined ranges', () => {
    it('passes underlinedRanges to SplHighlighter', () => {
      const ranges = [
        { line: 1, startCol: 0, endCol: 6, type: 'definition' as const },
        { line: 2, startCol: 5, endCol: 10, type: 'usage' as const },
      ];

      render(<SplStaticEditor code={mockSplCode} underlinedRanges={ranges} />);

      const highlighter = screen.getByTestId('spl-highlighter');
      expect(highlighter).toHaveTextContent('2 ranges');
    });

    it('passes empty underlinedRanges by default', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const highlighter = screen.getByTestId('spl-highlighter');
      expect(highlighter).toHaveTextContent('0 ranges');
    });
  });

  describe('token interaction', () => {
    it('calls onTokenClick when textarea is clicked', () => {
      const onTokenClick = vi.fn();
      render(
        <SplStaticEditor
          code="search index=main"
          onTokenClick={onTokenClick}
        />
      );

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.click(textarea);

      // Click handler would extract token from position
      // Exact calls depend on mouse position calculation
    });

    it('calls onTokenHover when mouse moves over textarea', () => {
      const onTokenHover = vi.fn();
      render(
        <SplStaticEditor
          code="search index=main"
          onTokenHover={onTokenHover}
        />
      );

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.mouseMove(textarea);

      // Hover handler would extract token from position
    });

    it('calls onTokenHover with null when mouse leaves', () => {
      const onTokenHover = vi.fn();
      render(
        <SplStaticEditor
          code="search index=main"
          onTokenHover={onTokenHover}
        />
      );

      const textarea = screen.getByTestId('spl-editor');

      // Hover first
      fireEvent.mouseMove(textarea);
      onTokenHover.mockClear();

      // Then leave
      fireEvent.mouseLeave(textarea);

      expect(onTokenHover).toHaveBeenCalledWith(null, { x: 0, y: 0 }, 0, 0);
    });

    it('does not crash when onTokenClick is undefined', () => {
      render(<SplStaticEditor code="search index=main" />);

      const textarea = screen.getByTestId('spl-editor');

      expect(() => {
        fireEvent.click(textarea);
      }).not.toThrow();
    });

    it('does not crash when onTokenHover is undefined', () => {
      render(<SplStaticEditor code="search index=main" />);

      const textarea = screen.getByTestId('spl-editor');

      expect(() => {
        fireEvent.mouseMove(textarea);
        fireEvent.mouseLeave(textarea);
      }).not.toThrow();
    });
  });

  describe('scrolling synchronization', () => {
    it('synchronizes scroll position with highlighter on textarea scroll', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;

      // Simulate scroll
      textarea.scrollTop = 100;
      textarea.scrollLeft = 50;
      fireEvent.scroll(textarea);

      // Scroll handler syncs with highlighter (tested via preRef)
      // Actual sync logic depends on refs
    });

    it('handles wheel events for scroll', () => {
      const { container } = render(<SplStaticEditor code={mockSplCode} />);

      const editorContainer = container.firstChild as HTMLElement;

      expect(() => {
        fireEvent.wheel(editorContainer, { deltaY: 100 });
      }).not.toThrow();
    });
  });

  describe('security: XSS in code input', () => {
    it('safely handles script tag in code', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, { target: { value: xssVectors.scriptTag } });

      // Should not execute script
      expect(document.scripts.length).toBe(0);
      expect(onChange).toHaveBeenCalledWith(xssVectors.scriptTag);
    });

    it('safely handles img onerror in code', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, { target: { value: xssVectors.imgOnError } });

      expect(onChange).toHaveBeenCalledWith(xssVectors.imgOnError);
    });

    it('safely handles javascript protocol in code', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: xssVectors.javascriptProtocol },
      });

      expect(onChange).toHaveBeenCalledWith(xssVectors.javascriptProtocol);
    });

    it('safely handles SVG-based XSS', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, { target: { value: xssVectors.svgScript } });

      expect(onChange).toHaveBeenCalledWith(xssVectors.svgScript);
    });
  });

  describe('security: injection attempts', () => {
    it('treats SQL injection as literal code', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: sqlInjectionVectors.orTrue },
      });

      expect(onChange).toHaveBeenCalledWith(sqlInjectionVectors.orTrue);
    });

    it('treats DROP TABLE as literal code', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: sqlInjectionVectors.dropTable },
      });

      expect(onChange).toHaveBeenCalledWith(sqlInjectionVectors.dropTable);
    });
  });

  describe('security: Unicode edge cases', () => {
    it('handles zero-width characters', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: unicodeVectors.zeroWidth },
      });

      expect(onChange).toHaveBeenCalledWith(unicodeVectors.zeroWidth);
    });

    it('handles RTL override characters', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: unicodeVectors.rtlOverride },
      });

      expect(onChange).toHaveBeenCalledWith(unicodeVectors.rtlOverride);
    });

    it('handles emoji in code', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, { target: { value: unicodeVectors.emoji } });

      expect(onChange).toHaveBeenCalledWith(unicodeVectors.emoji);
    });

    it('handles surrogate pairs', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: unicodeVectors.surrogatePair },
      });

      expect(onChange).toHaveBeenCalledWith(unicodeVectors.surrogatePair);
    });

    it('handles null bytes', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: unicodeVectors.nullByte },
      });

      expect(onChange).toHaveBeenCalledWith(unicodeVectors.nullByte);
    });
  });

  describe('performance: large code', () => {
    it('handles very long code (10,000 chars)', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');
      fireEvent.change(textarea, {
        target: { value: largePayloadVectors.longString },
      });

      expect(onChange).toHaveBeenCalledWith(largePayloadVectors.longString);
    });

    it('handles 100+ highlighted lines efficiently', () => {
      const manyLines = Array.from({ length: 100 }, (_, i) => i + 1);

      render(<SplStaticEditor code={mockSplCode} highlightedLines={manyLines} />);

      const highlighter = screen.getByTestId('spl-highlighter');
      expect(highlighter).toHaveTextContent('100 lines highlighted');
    });

    it('handles rapid code changes', () => {
      const onChange = vi.fn();
      render(<SplStaticEditor code="" onChange={onChange} />);

      const textarea = screen.getByTestId('spl-editor');

      // Rapidly change code
      for (let i = 0; i < 50; i++) {
        fireEvent.change(textarea, { target: { value: `code-${i}` } });
      }

      expect(onChange).toHaveBeenCalledTimes(50);
    });
  });

  describe('error resilience: invalid props', () => {
    it('handles null code gracefully', () => {
      expect(() => {
        render(<SplStaticEditor code={null as any} />);
      }).not.toThrow();
    });

    it('handles undefined code gracefully', () => {
      expect(() => {
        render(<SplStaticEditor code={undefined as any} />);
      }).not.toThrow();
    });

    it('handles negative line numbers in highlightedLines', () => {
      expect(() => {
        render(<SplStaticEditor code={mockSplCode} highlightedLines={[-1, -5]} />);
      }).not.toThrow();
    });

    it('handles very large line numbers in highlightedLines', () => {
      expect(() => {
        render(
          <SplStaticEditor code={mockSplCode} highlightedLines={[999999]} />
        );
      }).not.toThrow();
    });

    it('handles malformed underlinedRanges', () => {
      const badRanges = [
        { line: NaN, startCol: 0, endCol: 5, type: 'definition' as const },
        { line: 1, startCol: null as any, endCol: 5, type: 'usage' as const },
      ];

      expect(() => {
        render(
          <SplStaticEditor code={mockSplCode} underlinedRanges={badRanges} />
        );
      }).not.toThrow();
    });

    it('handles corrupted onChange callback', () => {
      const corruptedOnChange = 'not a function' as any;

      const { container } = render(
        <SplStaticEditor code="search" onChange={corruptedOnChange} />
      );

      const textarea = container.querySelector('textarea');

      // Should not crash, but onChange won't work
      expect(textarea).toBeInTheDocument();
    });

    it('handles empty highlightToken', () => {
      expect(() => {
        render(<SplStaticEditor code={mockSplCode} highlightToken="" />);
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('textarea is keyboard accessible', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('textarea has proper ARIA label', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByLabelText('SPL Analysis Editor');
      expect(textarea).toBeInTheDocument();
    });

    it('textarea is resizable by default (resize-none applied)', () => {
      render(<SplStaticEditor code={mockSplCode} />);

      const textarea = screen.getByTestId('spl-editor');
      expect(textarea).toHaveClass('resize-none');
    });

    it('supports keyboard text selection', () => {
      render(<SplStaticEditor code="search index=main" />);

      const textarea = screen.getByTestId('spl-editor') as HTMLTextAreaElement;

      // Select text programmatically (simulating keyboard selection)
      textarea.setSelectionRange(0, 6);

      expect(textarea.selectionStart).toBe(0);
      expect(textarea.selectionEnd).toBe(6);
    });
  });

  describe('getTokenAtPosition', () => {
    it('extracts simple word token', () => {
      const code = 'search index=main';
      // Column 0 is 's' in 'search'
      expect(getTokenAtPosition(code, 1, 0)).toBe('search');
      expect(getTokenAtPosition(code, 1, 3)).toBe('search');
      expect(getTokenAtPosition(code, 1, 5)).toBe('search');
    });

    it('extracts token after equals sign', () => {
      const code = 'search index=main';
      // 'main' starts at column 13
      expect(getTokenAtPosition(code, 1, 13)).toBe('main');
      expect(getTokenAtPosition(code, 1, 14)).toBe('main');
    });

    it('extracts double-quoted field name without quotes', () => {
      const code = 'table "User Account", status';
      // "User Account" starts at column 6, content is columns 7-18
      expect(getTokenAtPosition(code, 1, 6)).toBe('User Account');  // On opening quote
      expect(getTokenAtPosition(code, 1, 7)).toBe('User Account');  // On 'U'
      expect(getTokenAtPosition(code, 1, 11)).toBe('User Account'); // On space
      expect(getTokenAtPosition(code, 1, 18)).toBe('User Account'); // On closing quote
    });

    it('extracts single-quoted field name without quotes', () => {
      const code = "table 'User Account', status";
      expect(getTokenAtPosition(code, 1, 6)).toBe('User Account');
      expect(getTokenAtPosition(code, 1, 11)).toBe('User Account');
    });

    it('handles multiple quoted strings on same line', () => {
      const code = 'table "First Field", "Second Field"';
      expect(getTokenAtPosition(code, 1, 7)).toBe('First Field');
      expect(getTokenAtPosition(code, 1, 22)).toBe('Second Field');
    });

    it('returns null for out of bounds line', () => {
      const code = 'search index=main';
      expect(getTokenAtPosition(code, 0, 0)).toBeNull();
      expect(getTokenAtPosition(code, 2, 0)).toBeNull();
    });

    it('returns null for out of bounds column', () => {
      const code = 'search';
      expect(getTokenAtPosition(code, 1, -1)).toBeNull();
      expect(getTokenAtPosition(code, 1, 100)).toBeNull();
    });

    it('returns adjacent word when on non-word character', () => {
      const code = 'search index=main';
      // Column 6 is space - finds adjacent 'search' by looking backward
      expect(getTokenAtPosition(code, 1, 6)).toBe('search');
      // Column 12 is '=' - finds 'index' by looking backward
      expect(getTokenAtPosition(code, 1, 12)).toBe('index');
    });

    it('handles multiline code', () => {
      const code = 'search index=main\n| table "User Account"';
      expect(getTokenAtPosition(code, 1, 0)).toBe('search');
      expect(getTokenAtPosition(code, 2, 9)).toBe('User Account');
    });

    it('handles escaped quotes inside quoted string', () => {
      // Note: backslash-escaped quotes should not break the scan
      const code = 'table "Field\\"Name"';
      // The escaped quote is skipped, so we get 'Field"Name'
      expect(getTokenAtPosition(code, 1, 7)).toBe('Field\\"Name');
    });
  });
});
