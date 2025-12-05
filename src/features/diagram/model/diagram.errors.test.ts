import { describe, it, expect } from 'vitest';
import { DiagramDataFetchError, DiagramLayoutError, DiagramValidationError } from './diagram.errors';

describe('diagram errors', () => {
  it('preserves name, cause, and url for DiagramDataFetchError', () => {
    const err = new DiagramDataFetchError('fetch failed', 'root-cause', 'http://example.com/graph.json');
    expect(err.name).toBe('DiagramDataFetchError');
    expect(err.message).toContain('fetch failed');
    expect(err.cause).toBe('root-cause');
    expect(err.url).toBe('http://example.com/graph.json');
  });

  it('preserves name and cause for DiagramLayoutError', () => {
    const err = new DiagramLayoutError('layout failed', new Error('dagre'));
    expect(err.name).toBe('DiagramLayoutError');
    expect(err.cause).toBeInstanceOf(Error);
    expect((err.cause as Error).message).toBe('dagre');
  });

  it('preserves name, cause, and data for DiagramValidationError', () => {
    const payload = { foo: 'bar' };
    const err = new DiagramValidationError('invalid data', 'cause', payload);
    expect(err.name).toBe('DiagramValidationError');
    expect(err.cause).toBe('cause');
    expect(err.data).toEqual(payload);
  });
});
