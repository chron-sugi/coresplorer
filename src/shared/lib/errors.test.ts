import { describe, it, expect } from 'vitest';
import { DataFetchError, DataValidationError } from './errors';

describe('errors', () => {
  describe('DataFetchError', () => {
    it('creates error with message only', () => {
      const error = new DataFetchError('Failed to fetch data');
      expect(error.message).toBe('Failed to fetch data');
      expect(error.name).toBe('DataFetchError');
      expect(error.url).toBeUndefined();
      expect(error.cause).toBeUndefined();
    });

    it('creates error with message and URL', () => {
      const error = new DataFetchError('Failed to fetch', '/api/data');
      expect(error.message).toBe('Failed to fetch');
      expect(error.url).toBe('/api/data');
      expect(error.cause).toBeUndefined();
    });

    it('creates error with message, URL, and cause', () => {
      const cause = new Error('Network error');
      const error = new DataFetchError('Failed to fetch', '/api/data', cause);
      expect(error.message).toBe('Failed to fetch');
      expect(error.url).toBe('/api/data');
      expect(error.cause).toBe(cause);
    });

    it('extends Error', () => {
      const error = new DataFetchError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataFetchError);
    });

    it('has correct stack trace', () => {
      const error = new DataFetchError('Test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('DataFetchError');
    });
  });

  describe('DataValidationError', () => {
    it('creates error with message only', () => {
      const error = new DataValidationError('Invalid data format');
      expect(error.message).toBe('Invalid data format');
      expect(error.name).toBe('DataValidationError');
      expect(error.cause).toBeUndefined();
      expect(error.data).toBeUndefined();
    });

    it('creates error with message and cause', () => {
      const cause = new Error('Zod validation failed');
      const error = new DataValidationError('Invalid format', cause);
      expect(error.message).toBe('Invalid format');
      expect(error.cause).toBe(cause);
      expect(error.data).toBeUndefined();
    });

    it('creates error with message, cause, and data', () => {
      const cause = new Error('Validation error');
      const invalidData = { foo: 'bar', invalid: true };
      const error = new DataValidationError('Invalid', cause, invalidData);
      expect(error.message).toBe('Invalid');
      expect(error.cause).toBe(cause);
      expect(error.data).toEqual(invalidData);
    });

    it('extends Error', () => {
      const error = new DataValidationError('Test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataValidationError);
    });

    it('preserves data for debugging', () => {
      const data = { id: 123, name: null, items: [] };
      const error = new DataValidationError('Missing required field', undefined, data);
      expect(error.data).toEqual(data);
    });
  });
});
