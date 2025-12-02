/**
 * Security Utilities Tests
 *
 * Tests for security utility functions.
 *
 * @module shared/lib/security/security.test
 */
import { describe, it, expect } from 'vitest';
import { escapeRegex, sanitizeElement, escapeHtml, sanitizeAttribute } from './index';

describe('escapeRegex', () => {
  it('should escape all regex metacharacters', () => {
    const metacharacters = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(metacharacters);
    
    // Each metacharacter should be preceded by backslash
    expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('should return empty string for empty input', () => {
    expect(escapeRegex('')).toBe('');
  });

  it('should not modify strings without metacharacters', () => {
    expect(escapeRegex('hello world')).toBe('hello world');
  });

  it('should handle mixed content', () => {
    expect(escapeRegex('user (admin)')).toBe('user \\(admin\\)');
  });

  it('should prevent ReDoS patterns from being dangerous', () => {
    const redosPattern = '(a+)+$';
    const escaped = escapeRegex(redosPattern);
    
    // The escaped pattern should be safe to use in RegExp
    const regex = new RegExp(escaped);
    expect(regex.test('(a+)+$')).toBe(true);
    
    // Should not cause catastrophic backtracking on test input
    const startTime = Date.now();
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!'.match(regex);
    expect(Date.now() - startTime).toBeLessThan(100);
  });
});

describe('escapeHtml', () => {
  it('should escape angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(escapeHtml("'hello'")).toBe('&#039;hello&#039;');
  });

  it('should handle complex XSS payloads', () => {
    const xss = '<img src=x onerror="alert(\'xss\')">';
    const escaped = escapeHtml(xss);
    expect(escaped).not.toContain('<');
    expect(escaped).not.toContain('>');
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
  });
});

describe('sanitizeAttribute', () => {
  it('should remove dangerous characters', () => {
    expect(sanitizeAttribute("class' onclick='alert")).toBe('class onclick=alert');
  });

  it('should remove angle brackets', () => {
    expect(sanitizeAttribute('class<script>')).toBe('classscript');
  });

  it('should remove newlines', () => {
    expect(sanitizeAttribute("class\nwith\rnewlines")).toBe('classwithnewlines');
  });
});

describe('sanitizeElement', () => {
  it('should remove script tags', () => {
    const div = document.createElement('div');
    div.innerHTML = '<script>alert(1)</script><p>safe</p>';
    
    sanitizeElement(div);
    
    expect(div.querySelectorAll('script')).toHaveLength(0);
    expect(div.querySelector('p')?.textContent).toBe('safe');
  });

  it('should remove event handlers', () => {
    const div = document.createElement('div');
    div.innerHTML = '<img src="x" onerror="alert(1)" onclick="evil()">';
    
    sanitizeElement(div);
    
    const img = div.querySelector('img');
    expect(img?.getAttribute('onerror')).toBeNull();
    expect(img?.getAttribute('onclick')).toBeNull();
    expect(img?.getAttribute('src')).toBe('x'); // Safe attributes preserved
  });

  it('should remove javascript: URLs from href', () => {
    const div = document.createElement('div');
    div.innerHTML = '<a href="javascript:alert(1)">click</a>';
    
    sanitizeElement(div);
    
    const link = div.querySelector('a');
    expect(link?.getAttribute('href')).toBeNull();
  });

  it('should remove javascript: URLs from src', () => {
    const div = document.createElement('div');
    div.innerHTML = '<iframe src="javascript:alert(1)"></iframe>';
    
    sanitizeElement(div);
    
    const iframe = div.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBeNull();
  });

  it('should remove data:text/html URLs from src', () => {
    const div = document.createElement('div');
    div.innerHTML = '<iframe src="data:text/html,<script>alert(1)</script>"></iframe>';
    
    sanitizeElement(div);
    
    const iframe = div.querySelector('iframe');
    expect(iframe?.getAttribute('src')).toBeNull();
  });

  it('should remove srcdoc attribute', () => {
    const div = document.createElement('div');
    div.innerHTML = '<iframe srcdoc="<script>alert(1)</script>"></iframe>';
    
    sanitizeElement(div);
    
    const iframe = div.querySelector('iframe');
    expect(iframe?.getAttribute('srcdoc')).toBeNull();
  });

  it('should handle nested dangerous content', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div onclick="evil()">
        <span onmouseover="bad()">
          <a href="javascript:alert(1)">link</a>
        </span>
      </div>
    `;
    
    sanitizeElement(div);
    
    div.querySelectorAll('*').forEach(el => {
      expect(el.getAttribute('onclick')).toBeNull();
      expect(el.getAttribute('onmouseover')).toBeNull();
    });
    expect(div.querySelector('a')?.getAttribute('href')).toBeNull();
  });

  it('should preserve safe content and attributes', () => {
    const div = document.createElement('div');
    div.innerHTML = '<div class="container" id="main"><p>Hello World</p></div>';
    
    sanitizeElement(div);
    
    const container = div.querySelector('.container');
    expect(container?.getAttribute('id')).toBe('main');
    expect(div.querySelector('p')?.textContent).toBe('Hello World');
  });
});
