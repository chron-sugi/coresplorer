# Security Assessment Report - CoreSplorer Static Web Application

**Assessment Type:** Report Only (No Implementation)
**Date:** 2025-12-01
**Scope:** Full vulnerability assessment with remediation recommendations
**Overall Risk Rating:** HIGH - Multiple exploitable XSS vectors exist in core functionality

---

## Executive Summary

This security assessment identified **5 critical/high XSS vulnerabilities** and several medium-risk issues in the CoreSplorer static web application. The primary attack surface is the SPL editor and syntax highlighting system, which uses `innerHTML` and `dangerouslySetInnerHTML` with insufficient input sanitization.

### Vulnerability Summary

| ID | Vulnerability | Severity | Location |
|----|--------------|----------|----------|
| VULN-001 | ReDoS + XSS in Token Highlighting | Critical | CodeBlock.tsx:216-222 |
| VULN-002 | ReDoS + XSS in Token Highlighting | Critical | SplHighlighter.tsx:165-171 |
| VULN-003 | Unsafe dangerouslySetInnerHTML | Critical | SPLEditor.tsx:156 |
| VULN-004 | Unsafe Attribute Injection | High | token-wrapper.ts:124-137 |
| VULN-005 | Incomplete XSS Filtering | Medium | CodeBlock.tsx:204-205 |
| VULN-006 | Path Traversal in Dynamic Import | Medium | node-details.queries.ts:21 |
| VULN-007 | Information Disclosure | Low | ErrorBoundary.tsx:101-105 |

---

## Detailed Vulnerability Findings

### VULN-001: ReDoS + XSS in Token Highlighting (CodeBlock.tsx)

**Severity:** Critical
**CWE:** CWE-79 (XSS), CWE-1333 (ReDoS)
**Location:** `src/shared/ui/code-block/CodeBlock.tsx:216-222`

#### Vulnerable Code

```typescript
const regex = new RegExp(`\\b(${highlightToken})\\b`, 'gi');
const highlightedHTML = originalHTML.replace(
    regex,
    '<mark class="token-highlight-persistent">$1</mark>'
);
codeElement.innerHTML = highlightedHTML;
```

#### Issue

`highlightToken` from user interaction is passed directly to RegExp constructor without escaping regex metacharacters, then result is assigned to innerHTML.

#### Attack Vectors

1. **ReDoS:** Token containing `(a+)+` causes catastrophic backtracking, freezing the browser
2. **XSS:** Token containing `</mark><img src=x onerror=alert(1)>` injects executable HTML

#### Proof of Concept

```javascript
// ReDoS - causes browser hang
highlightToken = "(a+)+$"

// XSS - executes JavaScript
highlightToken = "</mark><img src=x onerror=alert(document.domain)><mark>"
```

#### Remediation

```typescript
// Escape regex metacharacters before use
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const escapedToken = escapeRegex(highlightToken);
const regex = new RegExp(`\\b(${escapedToken})\\b`, 'gi');
```

---

### VULN-002: ReDoS + XSS in Token Highlighting (SplHighlighter.tsx)

**Severity:** Critical
**CWE:** CWE-79 (XSS), CWE-1333 (ReDoS)
**Location:** `src/widgets/spl-static-editor/ui/SplHighlighter.tsx:165-171`

#### Issue

Identical vulnerability to VULN-001 - same code pattern duplicated.

#### Remediation

Same fix as VULN-001. Extract to shared utility function to prevent future duplication.

---

### VULN-003: Unsafe dangerouslySetInnerHTML in SPL Editor

**Severity:** Critical (partially mitigated by Prism.js)
**CWE:** CWE-79 (Cross-site Scripting)
**Location:** `src/features/spl-editor/ui/SPLEditor.tsx:156`

#### Vulnerable Code

```typescript
<code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
```

#### Data Flow

```
User SPL input
  → Prism.highlight()
  → wrapTokensWithPositions()
  → dangerouslySetInnerHTML
```

#### Issue

User input flows through syntax highlighting pipeline to innerHTML. While Prism.js provides HTML escaping, defense-in-depth is lacking. If Prism fails to escape or a bypass is found, XSS is possible.

#### Remediation

Add comprehensive HTML sanitization (event handler removal) before innerHTML assignment.

---

### VULN-004: Unsafe Attribute Injection in Token Wrapper

**Severity:** High
**CWE:** CWE-79 (Cross-site Scripting)
**Location:** `src/features/spl-editor/utils/token-wrapper.ts:124-137`

#### Vulnerable Code

```typescript
return `<span class="${className}" data-line="${position.line}" ...>${content}</span>`;
```

#### Issue

1. `className` is extracted from HTML and reinserted without escaping
2. `content` is escaped in data attribute but NOT escaped in the element body

#### Attack Vector

If Prism.js generates or passes through a malformed className like `token' onclick='alert(1)`, it would result in attribute injection.

#### Remediation

```typescript
// Escape className for attribute context
const safeClassName = className.replace(/['"<>&]/g, '');
// Escape content in element body
return `<span class="${safeClassName}" ...>${escapeHtml(content)}</span>`;
```

---

### VULN-005: Incomplete XSS Filtering

**Severity:** Medium
**CWE:** CWE-79 (Cross-site Scripting)
**Location:** `src/shared/ui/code-block/CodeBlock.tsx:204-205`

#### Vulnerable Code

```typescript
codeElement.querySelectorAll('script').forEach((node) => node.remove());
```

#### Issue

Only removes `<script>` tags. Other XSS vectors bypass this filter:
- Event handlers: `onmouseover`, `onerror`, `onfocus`, etc.
- JavaScript URLs: `href="javascript:alert(1)"`

#### Proof of Concept

```html
<!-- Bypasses current filter -->
<span onmouseover="alert(1)">hover me</span>
<a href="javascript:alert(1)">click me</a>
<img src=x onerror="alert(1)">
```

#### Remediation

```typescript
function sanitizeHighlightedHTML(element: HTMLElement): void {
  // Remove script tags
  element.querySelectorAll('script').forEach((node) => node.remove());

  // Remove dangerous event handlers
  const dangerousAttrs = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
    'onkeyup', 'onkeypress', 'onanimationend', 'ontransitionend'
  ];

  element.querySelectorAll('*').forEach((el) => {
    dangerousAttrs.forEach((attr) => el.removeAttribute(attr));
    // Remove javascript: URLs
    if (el.getAttribute('href')?.startsWith('javascript:')) {
      el.removeAttribute('href');
    }
    if (el.getAttribute('src')?.startsWith('javascript:')) {
      el.removeAttribute('src');
    }
  });
}
```

---

### VULN-006: Path Traversal in Dynamic Import

**Severity:** Medium
**CWE:** CWE-22 (Path Traversal)
**Location:** `src/features/diagram/api/node-details.queries.ts:21`

#### Vulnerable Code

```typescript
const module = await import(`/data/nodes/details/${nodeId}.json`);
```

#### Issue

`nodeId` comes from URL parameter and could contain path traversal sequences like `../` to access files outside the intended directory.

#### Attack Vector

```
URL: /diagram/../../../sensitive-file
nodeId = "../../../sensitive-file"
```

#### Remediation

```typescript
// Validate nodeId format before use
const isValidNodeId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(id);
};

if (!nodeId || !isValidNodeId(nodeId)) {
  throw new DiagramFetchError('Invalid node ID format');
}
const module = await import(`/data/nodes/details/${nodeId}.json`);
```

---

### VULN-007: Information Disclosure via Stack Traces

**Severity:** Low
**CWE:** CWE-209 (Error Message Information Disclosure)
**Location:** `src/app/error-boundary/ErrorBoundary.tsx:101-105`

#### Issue

Full stack traces with file paths are exposed in the UI, potentially revealing internal application structure and implementation details to attackers.

#### Remediation

```typescript
// Only show stack traces in development
{import.meta.env.DEV && (
  <pre className="...">
    {this.state.error.message}
    {'\n\n'}
    {this.state.error.stack}
  </pre>
)}
{!import.meta.env.DEV && (
  <p className="...">An error occurred. Please refresh the page.</p>
)}
```

---

## Positive Security Findings

The following security controls are properly implemented:

| Control | Status | Details |
|---------|--------|---------|
| Zod Schema Validation | Implemented | All JSON imports validated with strict schemas |
| Prototype Pollution Protection | Protected | Zod strict schemas reject unknown keys |
| SPL Parser ReDoS | Safe | Chevrotain lexer uses safe regex patterns |
| No eval/Function Usage | Confirmed | No dynamic code execution found |
| No localStorage Exposure | Confirmed | No sensitive data in client storage |
| TypeScript Strict Mode | Enabled | Type safety enforced |

---

## Files Requiring Modification

| File | Changes | Priority |
|------|---------|----------|
| `src/shared/ui/code-block/CodeBlock.tsx` | Regex escaping, improved sanitization | Critical |
| `src/widgets/spl-static-editor/ui/SplHighlighter.tsx` | Regex escaping, improved sanitization | Critical |
| `src/features/spl-editor/utils/token-wrapper.ts` | Attribute escaping for className and content | High |
| `src/features/diagram/api/node-details.queries.ts` | nodeId validation | Medium |
| `src/pages/diagram/DiagramPage.tsx` | nodeId validation | Medium |
| `src/app/error-boundary/ErrorBoundary.tsx` | Hide stack traces in production | Medium |

## New Files to Create

| File | Purpose |
|------|---------|
| `src/shared/lib/security/escapeRegex.ts` | Regex metacharacter escaping utility |
| `src/shared/lib/security/sanitizeHTML.ts` | HTML sanitization utility |
| `src/shared/ui/code-block/CodeBlock.security.test.tsx` | XSS/ReDoS security tests |
| `src/features/diagram/api/node-details.security.test.ts` | Path traversal security tests |

---

## Security Test Recommendations

### CodeBlock.security.test.tsx

```typescript
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
      expect(container.innerHTML).not.toContain('<img');
      expect(container.innerHTML).not.toContain('onerror');
    });

    it('should not execute script tags in code', () => {
      const maliciousCode = '<script>alert(1)</script>';
      const { container } = render(<CodeBlock code={maliciousCode} />);
      expect(container.querySelectorAll('script')).toHaveLength(0);
    });

    it('should remove event handlers from highlighted content', () => {
      const maliciousCode = '<span onmouseover="alert(1)">test</span>';
      const { container } = render(<CodeBlock code={maliciousCode} />);
      const spans = container.querySelectorAll('span');
      spans.forEach(span => {
        expect(span.getAttribute('onmouseover')).toBeNull();
      });
    });
  });

  describe('ReDoS Prevention', () => {
    it('should handle regex metacharacters in highlight tokens safely', () => {
      const regexToken = '(a+)+$';
      expect(() => {
        render(<CodeBlock code="test" highlightToken={regexToken} />);
      }).not.toThrow();
    });

    it('should handle special characters without catastrophic backtracking', () => {
      const tokens = ['.*', '[a-z]+', '(foo|bar)*', '\\d+'];
      tokens.forEach(token => {
        expect(() => {
          render(<CodeBlock code="test" highlightToken={token} />);
        }).not.toThrow();
      });
    });
  });
});
```

### node-details.security.test.ts

```typescript
import { describe, it, expect } from 'vitest';

describe('Node Details Security Tests', () => {
  describe('Path Traversal Prevention', () => {
    const invalidNodeIds = [
      '../../../etc/passwd',
      '..%2F..%2Fetc%2Fpasswd',
      'foo/../bar',
      '....//etc',
      'node<script>',
      'node"onclick="alert(1)',
    ];

    invalidNodeIds.forEach(nodeId => {
      it(`should reject invalid nodeId: ${nodeId}`, () => {
        const isValid = /^[a-zA-Z0-9_-]+$/.test(nodeId);
        expect(isValid).toBe(false);
      });
    });

    const validNodeIds = ['node-123', 'my_node', 'NodeName', 'abc123'];

    validNodeIds.forEach(nodeId => {
      it(`should accept valid nodeId: ${nodeId}`, () => {
        const isValid = /^[a-zA-Z0-9_-]+$/.test(nodeId);
        expect(isValid).toBe(true);
      });
    });
  });
});
```

---

## Test Payloads for Manual Verification

### XSS Payloads for SPL Editor

```spl
| eval field="<img src=x onerror=alert(1)>"
| stats count as "<script>alert(1)</script>"
| eval "<svg onload=alert(1)>"=value
| rename "<iframe src='javascript:alert(1)'>" as x
```

### ReDoS Payloads for Token Highlighting

```
(a+)+$
((a+)+)+
([a-zA-Z]+)*X
(.*a){20}
```

### Path Traversal Payloads

```
../../../etc/passwd
..%2F..%2F..%2Fetc%2Fpasswd
....//....//etc/passwd
..\/..\/..\/etc\/passwd
```

---

## Remediation Priority

1. **Immediate (Critical):** Fix VULN-001 and VULN-002 - ReDoS + XSS in token highlighting
2. **High:** Fix VULN-004 - Attribute injection in token wrapper
3. **Medium:** Fix VULN-003, VULN-005, VULN-006 - Defense-in-depth improvements
4. **Low:** Fix VULN-007 - Information disclosure

---

## References

- [CWE-79: Cross-site Scripting (XSS)](https://cwe.mitre.org/data/definitions/79.html)
- [CWE-1333: Inefficient Regular Expression Complexity](https://cwe.mitre.org/data/definitions/1333.html)
- [CWE-22: Path Traversal](https://cwe.mitre.org/data/definitions/22.html)
- [CWE-209: Error Message Information Disclosure](https://cwe.mitre.org/data/definitions/209.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
