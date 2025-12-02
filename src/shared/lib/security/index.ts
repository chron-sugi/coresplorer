/**
 * Security Utilities
 *
 * Centralized security functions for XSS prevention, input sanitization,
 * and safe string handling.
 *
 * @module shared/lib/security
 */

export { escapeRegex } from './escapeRegex';
export { sanitizeElement, escapeHtml, sanitizeAttribute } from './sanitizeHTML';
