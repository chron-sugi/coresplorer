import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { formatValidationError, logValidationError } from './validation-logger';

describe('validation-logger', () => {
  describe('formatValidationError', () => {
    it('formats a simple type error', () => {
      const schema = z.object({ name: z.string() });
      const result = schema.safeParse({ name: 123 });

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error, { name: 123 });

      expect(formatted.issueCount).toBe(1);
      expect(formatted.issues[0].path).toBe('name');
      expect(formatted.issues[0].expected).toBe('string');
      expect(formatted.issues[0].received).toBe('number');
    });

    it('formats nested path correctly', () => {
      const schema = z.object({
        nodes: z.array(z.object({ type: z.string() })),
      });
      const data = { nodes: [{ type: 'valid' }, { type: 123 }] };
      const result = schema.safeParse(data);

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error);
      expect(formatted.issues[0].path).toBe('nodes[1].type');
    });

    it('formats root-level errors', () => {
      const schema = z.string();
      const result = schema.safeParse(123);

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error);
      expect(formatted.issues[0].path).toBe('(root)');
    });

    it('formats enum errors with options', () => {
      const schema = z.object({
        type: z.enum(['saved_search', 'data_model', 'macro']),
      });
      const result = schema.safeParse({ type: 'invalid_type' });

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error);
      // Zod uses 'invalid_value' code for enum mismatches
      expect(formatted.issues[0].code).toBe('invalid_value');
      expect(formatted.issues[0].expected).toContain('saved_search');
    });

    it('truncates large arrays in data sample', () => {
      const schema = z.object({ id: z.string() });
      const largeData = {
        id: 123,
        nodes: Array(100).fill({ id: 'node', name: 'test' }),
      };
      const result = schema.safeParse(largeData);

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error, largeData);
      const sample = formatted.dataSample as Record<string, unknown>;
      const nodesSample = sample.nodes as unknown[];

      // 3 items + "and X more" message
      expect(nodesSample.length).toBe(4);
      expect(nodesSample[3]).toBe('... and 97 more items');
    });

    it('truncates objects with many keys', () => {
      const schema = z.object({ id: z.string() });
      const manyKeys: Record<string, number> = {};
      for (let i = 0; i < 20; i++) {
        manyKeys[`key${i}`] = i;
      }
      const result = schema.safeParse(manyKeys);

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error, manyKeys);
      const sample = formatted.dataSample as Record<string, unknown>;

      expect(sample['...']).toBe('10 more keys');
    });

    it('includes context message', () => {
      const schema = z.object({ id: z.string() });
      const result = schema.safeParse({ id: 123 });

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(
        result.error,
        undefined,
        'GraphSchema failed'
      );
      expect(formatted.message).toBe('GraphSchema failed');
    });

    it('includes timestamp', () => {
      const schema = z.object({ id: z.string() });
      const result = schema.safeParse({ id: 123 });

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error);
      expect(formatted.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('handles multiple issues', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const result = schema.safeParse({ name: 123, age: 'invalid' });

      if (result.success) throw new Error('Expected validation to fail');

      const formatted = formatValidationError(result.error);
      expect(formatted.issueCount).toBe(2);
      expect(formatted.issues).toHaveLength(2);
    });
  });

  describe('logValidationError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'group').mockImplementation(() => {});
      vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('logs with console.group for collapsible output', () => {
      const schema = z.object({ id: z.string() });
      const result = schema.safeParse({ id: 123 });

      if (result.success) throw new Error('Expected validation to fail');

      logValidationError(result.error, { id: 123 }, 'Test context');

      expect(console.group).toHaveBeenCalledWith(
        expect.stringContaining('[DataValidationError]')
      );
      expect(console.group).toHaveBeenCalledWith('Validation Issues:');
      expect(console.error).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });

    it('logs data sample when provided', () => {
      const schema = z.object({ id: z.string() });
      const result = schema.safeParse({ id: 123 });

      if (result.success) throw new Error('Expected validation to fail');

      logValidationError(result.error, { id: 123 });

      expect(console.group).toHaveBeenCalledWith('Data Sample (truncated):');
    });

    it('skips data sample when not provided', () => {
      const schema = z.object({ id: z.string() });
      const result = schema.safeParse({ id: 123 });

      if (result.success) throw new Error('Expected validation to fail');

      logValidationError(result.error);

      expect(console.group).not.toHaveBeenCalledWith(
        'Data Sample (truncated):'
      );
    });
  });
});
