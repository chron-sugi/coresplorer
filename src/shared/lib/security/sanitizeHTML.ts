/**
 * HTML Sanitization Utility
 *
 * Removes dangerous HTML elements and attributes to prevent XSS attacks.
 * Provides defense-in-depth for DOM manipulation operations.
 *
 * @module shared/lib/security/sanitizeHTML
 */

/**
 * List of dangerous event handler attributes that can execute JavaScript.
 */
const DANGEROUS_ATTRS = [
  'onload', 'onerror', 'onclick', 'ondblclick', 'onmousedown', 'onmouseup',
  'onmouseover', 'onmouseout', 'onmousemove', 'onmouseenter', 'onmouseleave',
  'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onkeydown',
  'onkeyup', 'onkeypress', 'oninput', 'oncontextmenu', 'ondrag', 'ondragstart',
  'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondrop',
  'onanimationend', 'onanimationstart', 'onanimationiteration',
  'ontransitionend', 'ontransitionstart', 'onwheel', 'onscroll',
  'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerenter',
  'onpointerleave', 'onpointercancel', 'ontouchstart', 'ontouchend',
  'ontouchmove', 'ontouchcancel', 'oncopy', 'oncut', 'onpaste',
  'onbeforeunload', 'onunload', 'onhashchange', 'onpopstate',
] as const;

/**
 * Sanitize an HTML element by removing dangerous content.
 *
 * Removes:
 * - Script tags
 * - Event handler attributes (onclick, onerror, etc.)
 * - JavaScript: URLs in href/src attributes
 * - Data: URLs in src attributes (potential XSS vector)
 *
 * @param element - HTML element to sanitize (mutates in place)
 *
 * @example
 * const div = document.createElement('div');
 * div.innerHTML = '<img src=x onerror="alert(1)">';
 * sanitizeElement(div);
 * // div.innerHTML is now '<img src="x">'
 */
export function sanitizeElement(element: HTMLElement): void {
  // Remove script tags
  element.querySelectorAll('script').forEach((node) => node.remove());

  // Remove style tags (can contain expressions in older browsers)
  element.querySelectorAll('style').forEach((node) => node.remove());

  // Process all elements
  element.querySelectorAll('*').forEach((el) => {
    // Remove dangerous event handlers
    DANGEROUS_ATTRS.forEach((attr) => {
      el.removeAttribute(attr);
    });

    // Also check for any attribute starting with 'on' (catches custom events)
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Remove javascript: URLs
    const href = el.getAttribute('href');
    if (href && href.toLowerCase().trim().startsWith('javascript:')) {
      el.removeAttribute('href');
    }

    const src = el.getAttribute('src');
    if (src) {
      const lowerSrc = src.toLowerCase().trim();
      if (lowerSrc.startsWith('javascript:') || lowerSrc.startsWith('data:text/html')) {
        el.removeAttribute('src');
      }
    }

    // Remove formaction with javascript:
    const formaction = el.getAttribute('formaction');
    if (formaction && formaction.toLowerCase().trim().startsWith('javascript:')) {
      el.removeAttribute('formaction');
    }

    // Remove srcdoc (can contain executable HTML)
    el.removeAttribute('srcdoc');
  });
}

/**
 * Escape HTML special characters in a string.
 *
 * Use this when inserting user content into HTML context.
 *
 * @param str - String to escape
 * @returns Escaped string safe for HTML insertion
 *
 * @example
 * const userInput = '<script>alert(1)</script>';
 * const safe = escapeHtml(userInput);
 * // '&lt;script&gt;alert(1)&lt;/script&gt;'
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize a string for use in HTML attribute context.
 *
 * Removes characters that could break out of attribute quotes.
 *
 * @param str - String to sanitize
 * @returns Sanitized string safe for attribute values
 */
export function sanitizeAttribute(str: string): string {
  return str.replace(/['"<>&\r\n]/g, '');
}
