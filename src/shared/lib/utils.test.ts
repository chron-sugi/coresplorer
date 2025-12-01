import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      const condition1 = true;
      const condition2 = false;
      expect(cn('foo', condition1 && 'bar', condition2 && 'baz')).toBe('foo bar');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('handles arrays and objects', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
      expect(cn({ foo: true, bar: false })).toBe('foo');
    });

    it('handles empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn(null, undefined, false)).toBe('');
    });
  });
});
