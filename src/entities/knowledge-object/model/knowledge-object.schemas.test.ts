import { describe, it, expect } from 'vitest';
import { IndexNodeSchema, IndexSchema } from './knowledge-object.schemas';

describe('IndexNodeSchema', () => {
  it('should parse a valid IndexNode with all fields', () => {
    const validNode = {
      label: 'Test Dashboard',
      type: 'dashboard',
      app: 'search',
      owner: 'admin',
      isolated: true,
    };

    const result = IndexNodeSchema.parse(validNode);

    expect(result).toEqual(validNode);
  });

  it('should parse a valid IndexNode without optional isolated field', () => {
    const validNode = {
      label: 'Test Dashboard',
      type: 'dashboard',
      app: 'search',
      owner: 'admin',
    };

    const result = IndexNodeSchema.parse(validNode);

    expect(result).toEqual(validNode);
    expect(result.isolated).toBeUndefined();
  });

  it('should reject IndexNode missing required label field', () => {
    const invalidNode = {
      type: 'dashboard',
      app: 'search',
      owner: 'admin',
    };

    const result = IndexNodeSchema.safeParse(invalidNode);

    expect(result.success).toBe(false);
  });

  it('should reject IndexNode missing required type field', () => {
    const invalidNode = {
      label: 'Test',
      app: 'search',
      owner: 'admin',
    };

    const result = IndexNodeSchema.safeParse(invalidNode);

    expect(result.success).toBe(false);
  });

  it('should reject IndexNode with invalid field type', () => {
    const invalidNode = {
      label: 123, // should be string
      type: 'dashboard',
      app: 'search',
      owner: 'admin',
    };

    const result = IndexNodeSchema.safeParse(invalidNode);

    expect(result.success).toBe(false);
  });

  it('should reject IndexNode with invalid isolated type', () => {
    const invalidNode = {
      label: 'Test',
      type: 'dashboard',
      app: 'search',
      owner: 'admin',
      isolated: 'yes', // should be boolean
    };

    const result = IndexNodeSchema.safeParse(invalidNode);

    expect(result.success).toBe(false);
  });
});

describe('IndexSchema', () => {
  it('should parse a valid IndexSchema with multiple nodes', () => {
    const validIndex = {
      'node-1': {
        label: 'Dashboard 1',
        type: 'dashboard',
        app: 'search',
        owner: 'admin',
      },
      'node-2': {
        label: 'Lookup 1',
        type: 'lookup',
        app: 'security',
        owner: 'user1',
        isolated: false,
      },
    };

    const result = IndexSchema.parse(validIndex);

    expect(result).toEqual(validIndex);
  });

  it('should parse an empty IndexSchema', () => {
    const emptyIndex = {};

    const result = IndexSchema.parse(emptyIndex);

    expect(result).toEqual({});
  });

  it('should reject IndexSchema with invalid node value', () => {
    const invalidIndex = {
      'node-1': {
        label: 'Valid',
        type: 'dashboard',
        app: 'search',
        owner: 'admin',
      },
      'node-2': {
        label: 'Invalid',
        // missing required fields
      },
    };

    const result = IndexSchema.safeParse(invalidIndex);

    expect(result.success).toBe(false);
  });
});
