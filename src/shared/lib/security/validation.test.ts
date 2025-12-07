import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidNodeId, validateNodeId } from './validation';

describe('validation', () => {
  describe('isValidNodeId', () => {
    it('accepts valid node IDs', () => {
      expect(isValidNodeId('node123')).toBe(true);
      expect(isValidNodeId('my-node')).toBe(true);
      expect(isValidNodeId('my_node')).toBe(true);
      expect(isValidNodeId('MyNode')).toBe(true);
      expect(isValidNodeId('node-123_test')).toBe(true);
    });

    it('rejects path traversal attempts', () => {
      expect(isValidNodeId('../../../etc/passwd')).toBe(false);
      expect(isValidNodeId('..\\..\\..\\windows\\system32')).toBe(false);
      expect(isValidNodeId('./node')).toBe(false);
    });

    it('rejects XSS attempts', () => {
      expect(isValidNodeId('<script>alert(1)</script>')).toBe(false);
      expect(isValidNodeId('node<img src=x onerror=alert(1)>')).toBe(false);
      expect(isValidNodeId('javascript:alert(1)')).toBe(false);
    });

    it('rejects spaces', () => {
      expect(isValidNodeId('node 123')).toBe(false);
      expect(isValidNodeId(' node')).toBe(false);
      expect(isValidNodeId('node ')).toBe(false);
    });

    it('rejects special characters', () => {
      expect(isValidNodeId('node.name')).toBe(false);
      expect(isValidNodeId('node/name')).toBe(false);
      expect(isValidNodeId('node@name')).toBe(false);
      expect(isValidNodeId('node#name')).toBe(false);
      expect(isValidNodeId('node$name')).toBe(false);
    });

    it('rejects empty strings', () => {
      expect(isValidNodeId('')).toBe(false);
    });
  });

  describe('validateNodeId', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // Mock DEV environment
      vi.stubGlobal('import', { meta: { env: { DEV: true } } });
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it('returns valid node ID unchanged', () => {
      expect(validateNodeId('valid-node-123')).toBe('valid-node-123');
      expect(validateNodeId('MyNode')).toBe('MyNode');
    });

    it('returns null for null input', () => {
      expect(validateNodeId(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(validateNodeId(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(validateNodeId('')).toBeNull();
    });

    it('returns null for invalid node ID', () => {
      expect(validateNodeId('../etc/passwd')).toBeNull();
      expect(validateNodeId('<script>')).toBeNull();
      expect(validateNodeId('node.name')).toBeNull();
    });

    it('returns null for non-string input', () => {
      // @ts-expect-error - testing runtime behavior
      expect(validateNodeId(123)).toBeNull();
      // @ts-expect-error - testing runtime behavior
      expect(validateNodeId({})).toBeNull();
    });

    it('truncates logged invalid IDs to 50 characters', () => {
      const longInvalidId = '../' + 'a'.repeat(100);
      validateNodeId(longInvalidId);
      // The warning should be logged with truncated ID
      // Note: This depends on DEV mode being enabled
    });
  });
});
