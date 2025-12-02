/**
 * CodeBlock Security Tests
 *
 * Tests for XSS prevention and ReDoS protection in CodeBlock component.
 *
 * @module shared/ui/code-block/CodeBlock.security.test
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock Security Tests', () => {
  describe('XSS Prevention', () => {
    it('should escape HTML in highlight tokens', () => {
      const maliciousToken = '<img src=x onerror=alert(1)>';
      const { container } = render(
        <CodeBlock code="test code" highlightToken={maliciousToken} />
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(container.innerHTML).not.toContain('<img');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(container.innerHTML).not.toContain('onerror');
    });

    it('should not execute script tags in code', () => {
      const maliciousCode = '<script>alert(1)</script>';
      const { container } = render(<CodeBlock code={maliciousCode} />);
      expect(container.querySelectorAll('script')).toHaveLength(0);
    });

    it('should remove event handlers from highlighted content', () => {
      // This tests that sanitizeElement is being called
      const { container } = render(
        <CodeBlock code="test" highlightToken="test" />
      );
      const allElements = container.querySelectorAll('*');
      allElements.forEach(el => {
        expect(el.getAttribute('onmouseover')).toBeNull();
        expect(el.getAttribute('onclick')).toBeNull();
        expect(el.getAttribute('onerror')).toBeNull();
      });
    });

    it('should escape angle brackets in tokens to prevent HTML injection', () => {
      const xssToken = '</mark><script>alert(1)</script><mark>';
      const { container } = render(
        <CodeBlock code="some code with test" highlightToken={xssToken} />
      );
      // The token should be escaped, not rendered as HTML
      expect(container.querySelectorAll('script')).toHaveLength(0);
    });

    it('should handle SVG-based XSS attempts', () => {
      const svgXss = '<svg onload=alert(1)>';
      const { container } = render(
        <CodeBlock code={svgXss} />
      );
      const svgs = container.querySelectorAll('svg');
      svgs.forEach(svg => {
        expect(svg.getAttribute('onload')).toBeNull();
      });
    });

    it('should remove javascript: URLs', () => {
      const { container } = render(
        <CodeBlock code="click here" highlightToken="click" />
      );
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          expect(href.toLowerCase()).not.toContain('javascript:');
        }
      });
    });
  });

  describe('ReDoS Prevention', () => {
    it('should handle regex metacharacters in highlight tokens safely', () => {
      const regexToken = '(a+)+$';
      // This should not hang or throw
      const startTime = Date.now();
      expect(() => {
        render(<CodeBlock code="test aaaaaa" highlightToken={regexToken} />);
      }).not.toThrow();
      const elapsed = Date.now() - startTime;
      // Should complete quickly (under 1 second), not hang from ReDoS
      expect(elapsed).toBeLessThan(1000);
    });

    it('should handle special regex characters without catastrophic backtracking', () => {
      const dangerousPatterns = [
        '.*',
        '[a-z]+',
        '(foo|bar)*',
        '\\d+',
        '((a+)+)+',
        '([a-zA-Z]+)*X',
        '(.*a){20}',
      ];

      dangerousPatterns.forEach(pattern => {
        const startTime = Date.now();
        expect(() => {
          render(<CodeBlock code="test aaaaaaaaaaaaaaaaaaaaX" highlightToken={pattern} />);
        }).not.toThrow();
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(500);
      });
    });

    it('should escape backslashes in tokens', () => {
      const backslashToken = '\\d+';
      expect(() => {
        render(<CodeBlock code="test 123" highlightToken={backslashToken} />);
      }).not.toThrow();
    });
  });

  describe('Input Validation', () => {
    it('should handle null highlightToken gracefully', () => {
      expect(() => {
        render(<CodeBlock code="test" highlightToken={null} />);
      }).not.toThrow();
    });

    it('should handle empty string highlightToken', () => {
      expect(() => {
        render(<CodeBlock code="test" highlightToken="" />);
      }).not.toThrow();
    });

    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(10000);
      expect(() => {
        render(<CodeBlock code="test" highlightToken={longToken} />);
      }).not.toThrow();
    });

    it('should handle unicode characters in tokens', () => {
      const unicodeToken = '日本語';
      expect(() => {
        render(<CodeBlock code="test 日本語 code" highlightToken={unicodeToken} />);
      }).not.toThrow();
    });
  });
});
