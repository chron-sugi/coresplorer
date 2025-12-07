import { describe, it, expect } from 'vitest';
import {
  encodeUrlParam,
  decodeUrlParam,
  encodeArrayParam,
  decodeArrayParam,
} from './urlEncoding';

describe('urlEncoding', () => {
  describe('encodeUrlParam', () => {
    it('encodes special characters', () => {
      expect(encodeUrlParam('hello world')).toBe('hello%20world');
      expect(encodeUrlParam('foo&bar')).toBe('foo%26bar');
      expect(encodeUrlParam('a=b')).toBe('a%3Db');
    });

    it('returns empty string for null/undefined', () => {
      expect(encodeUrlParam(null)).toBe('');
      expect(encodeUrlParam(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(encodeUrlParam('')).toBe('');
    });

    it('preserves alphanumeric characters', () => {
      expect(encodeUrlParam('abc123')).toBe('abc123');
      expect(encodeUrlParam('HelloWorld')).toBe('HelloWorld');
    });

    it('encodes unicode characters', () => {
      expect(encodeUrlParam('café')).toBe('caf%C3%A9');
    });
  });

  describe('decodeUrlParam', () => {
    it('decodes encoded characters', () => {
      expect(decodeUrlParam('hello%20world')).toBe('hello world');
      expect(decodeUrlParam('foo%26bar')).toBe('foo&bar');
      expect(decodeUrlParam('a%3Db')).toBe('a=b');
    });

    it('returns empty string for null/undefined', () => {
      expect(decodeUrlParam(null)).toBe('');
      expect(decodeUrlParam(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(decodeUrlParam('')).toBe('');
    });

    it('returns original value for invalid encoding', () => {
      expect(decodeUrlParam('%invalid')).toBe('%invalid');
      expect(decodeUrlParam('%')).toBe('%');
    });

    it('handles already decoded strings', () => {
      expect(decodeUrlParam('hello world')).toBe('hello world');
    });
  });

  describe('encodeArrayParam', () => {
    it('encodes array as comma-separated string', () => {
      expect(encodeArrayParam(['foo', 'bar'])).toBe('foo,bar');
      expect(encodeArrayParam(['a', 'b', 'c'])).toBe('a,b,c');
    });

    it('encodes special characters in array elements', () => {
      expect(encodeArrayParam(['hello world', 'foo&bar'])).toBe(
        'hello%20world,foo%26bar'
      );
    });

    it('returns empty string for empty array', () => {
      expect(encodeArrayParam([])).toBe('');
    });

    it('returns empty string for null/undefined', () => {
      // @ts-expect-error - testing runtime behavior
      expect(encodeArrayParam(null)).toBe('');
      // @ts-expect-error - testing runtime behavior
      expect(encodeArrayParam(undefined)).toBe('');
    });

    it('handles single element array', () => {
      expect(encodeArrayParam(['single'])).toBe('single');
    });
  });

  describe('decodeArrayParam', () => {
    it('decodes comma-separated string to array', () => {
      expect(decodeArrayParam('foo,bar')).toEqual(['foo', 'bar']);
      expect(decodeArrayParam('a,b,c')).toEqual(['a', 'b', 'c']);
    });

    it('decodes encoded characters in array elements', () => {
      expect(decodeArrayParam('hello%20world,foo%26bar')).toEqual([
        'hello world',
        'foo&bar',
      ]);
    });

    it('returns empty array for empty string', () => {
      expect(decodeArrayParam('')).toEqual([]);
    });

    it('returns empty array for null/undefined', () => {
      expect(decodeArrayParam(null)).toEqual([]);
      expect(decodeArrayParam(undefined)).toEqual([]);
    });

    it('filters out empty strings', () => {
      expect(decodeArrayParam('foo,,bar')).toEqual(['foo', 'bar']);
      expect(decodeArrayParam(',foo,bar,')).toEqual(['foo', 'bar']);
    });

    it('handles single element', () => {
      expect(decodeArrayParam('single')).toEqual(['single']);
    });
  });

  describe('encode/decode roundtrip', () => {
    it('preserves values through roundtrip', () => {
      const original = 'hello world';
      expect(decodeUrlParam(encodeUrlParam(original))).toBe(original);
    });

    it('preserves array values through roundtrip', () => {
      const original = ['foo', 'bar', 'hello world'];
      expect(decodeArrayParam(encodeArrayParam(original))).toEqual(original);
    });
  });
});
