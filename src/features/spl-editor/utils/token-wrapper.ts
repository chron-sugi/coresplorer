/**
 * Token Wrapper Utility
 * 
 * Post-processes PrismJS highlighted HTML to add position data attributes
 * for hover/click detection.
 * 
 * @module components/spl-editor/utils/token-wrapper
 */

import { buildLineOffsetIndex, offsetToPosition } from './position-mapping';
import { escapeHtml, sanitizeAttribute } from '@/shared/lib';

/**
 * Wrap highlighted tokens with position data attributes.
 * 
 * @param highlightedHtml - HTML from PrismJS
 * @param originalText - Original SPL text
 * @returns HTML with data-line, data-column, data-content attributes
 */
export function wrapTokensWithPositions(
  highlightedHtml: string,
  originalText: string
): string {
  const lineOffsets = buildLineOffsetIndex(originalText);
  
  // Parse the HTML and process each token
  const doc = new DOMParser().parseFromString(
    `<div>${highlightedHtml}</div>`,
    'text/html'
  );
  
  const container = doc.body.firstElementChild;
  if (!container) return highlightedHtml;

  // Track position in original text
  let currentOffset = 0;

  // Process all text nodes and spans
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null
  );

  const elementsToProcess: Array<{
    element: Element;
    content: string;
    offset: number;
  }> = [];

  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      currentOffset += text.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.tagName === 'SPAN' && element.classList.length > 0) {
        const content = element.textContent || '';
        const startOffset = findTextInOriginal(originalText, content, currentOffset);
        
        if (startOffset !== -1) {
          elementsToProcess.push({
            element,
            content,
            offset: startOffset,
          });
        }
      }
    }
  }

  // Add data attributes to collected elements
  for (const { element, content, offset } of elementsToProcess) {
    const position = offsetToPosition(offset, lineOffsets);
    
    element.setAttribute('data-line', String(position.line));
    element.setAttribute('data-column', String(position.column));
    element.setAttribute('data-content', content);
    element.setAttribute('data-start-offset', String(offset));
    element.setAttribute('data-end-offset', String(offset + content.length));
    
    // Add token type from class
    const tokenType = Array.from(element.classList)
      .find(c => c.startsWith('token-') || c !== 'token');
    if (tokenType) {
      element.setAttribute('data-token-type', tokenType);
    }
  }

  return container.innerHTML;
}

/**
 * Find text in original string, starting from a given offset.
 */
function findTextInOriginal(
  original: string,
  text: string,
  startFrom: number
): number {
  // Try to find the text starting from the expected position
  const index = original.indexOf(text, startFrom);
  
  // If not found from startFrom, try from the beginning
  if (index === -1) {
    return original.indexOf(text);
  }
  
  return index;
}

/**
 * Simpler approach: wrap tokens using regex replacement.
 * This works better when we can't use DOMParser (e.g., SSR).
 */
export function wrapTokensWithPositionsSimple(
  highlightedHtml: string,
  originalText: string
): string {
  const lineOffsets = buildLineOffsetIndex(originalText);
  let currentOffset = 0;

  // Match span tokens from PrismJS
  return highlightedHtml.replace(
    /<span class="([^"]+)">([^<]*)<\/span>/g,
    (match, className, content) => {
      // Find this content in original text
      const offset = originalText.indexOf(content, currentOffset);
      if (offset !== -1) {
        currentOffset = offset + content.length;
        const position = offsetToPosition(offset, lineOffsets);
        
        // Sanitize className to prevent attribute injection
        const safeClassName = sanitizeAttribute(className);
        // Escape content for attribute context AND for element body
        const escapedContent = escapeHtml(content);
        
        return `<span class="${safeClassName}" data-line="${position.line}" data-column="${position.column}" data-content="${escapedContent}" data-token-type="${safeClassName}">${escapedContent}</span>`;
      }
      return match;
    }
  );
}

/**
 * Escape HTML special characters.
 * @deprecated Use escapeHtml from @/shared/lib instead
 */
function escapeHtmlLegacy(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
