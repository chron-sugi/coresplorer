/**
 * Token Wrapper Utility Tests
 *
 * Tests for token wrapper utilities.
 *
 * @module features/spl-editor/lib/token-wrapper.test
 */
import { describe, it, expect } from 'vitest';
import { wrapTokensWithPositionsSimple } from './token-wrapper';

describe('wrapTokensWithPositionsSimple', () => {
  it('wraps simple token with position data', () => {
    const html = '<span class="token keyword">eval</span>';
    const text = 'eval field=value';

    const result = wrapTokensWithPositionsSimple(html, text);

    expect(result).toContain('data-line="1"');
    expect(result).toContain('data-column="1"');
    expect(result).toContain('data-content="eval"');
    expect(result).toContain('data-token-type="token keyword"');
  });

  it('wraps multiple tokens', () => {
    const html = '<span class="token keyword">eval</span> <span class="token variable">field</span>';
    const text = 'eval field';

    const result = wrapTokensWithPositionsSimple(html, text);

    expect(result).toContain('data-line="1"');
    expect(result).toContain('data-column="1"'); // eval
    expect(result).toContain('data-column="6"'); // field
  });

  it('handles multi-line text', () => {
    const html = '<span class="token keyword">eval</span>\n<span class="token variable">field</span>';
    const text = 'eval\nfield';

    const result = wrapTokensWithPositionsSimple(html, text);

    expect(result).toContain('data-line="1"'); // eval
    expect(result).toContain('data-line="2"'); // field
  });

  it('escapes HTML in content attribute', () => {
    const html = '<span class="token string">"test"</span>';
    const text = '"test"';

    const result = wrapTokensWithPositionsSimple(html, text);

    expect(result).toContain('data-content="&quot;test&quot;"');
  });

  it('handles tokens with no matches in original text', () => {
    const html = '<span class="token keyword">eval</span>';
    const text = 'different text';

    const result = wrapTokensWithPositionsSimple(html, text);

    // Should return original HTML if token not found
    expect(result).toContain('eval');
  });

  it('preserves token classes', () => {
    const html = '<span class="token keyword highlight">eval</span>';
    const text = 'eval field';

    const result = wrapTokensWithPositionsSimple(html, text);

    expect(result).toContain('class="token keyword highlight"');
  });

  it('handles empty content', () => {
    const html = '';
    const text = '';

    const result = wrapTokensWithPositionsSimple(html, text);

    expect(result).toBe('');
  });
});
