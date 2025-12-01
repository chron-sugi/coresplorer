import { describe, it, expect } from 'vitest';
import { deriveFilterOptions } from './deriveFilterOptions';
import type { KnowledgeObject } from '@/entities/knowledge-object';

describe('deriveFilterOptions', () => {
  it('should return empty arrays when given empty input', () => {
    const result = deriveFilterOptions([]);

    expect(result).toEqual({
      types: [],
      apps: [],
      owners: [],
    });
  });

  it('should extract values from a single knowledge object', () => {
    const kos: KnowledgeObject[] = [
      {
        id: 'ko-1',
        name: 'Test KO',
        type: 'dashboard',
        app: 'search',
        owner: 'admin',
        isolated: false,
      },
    ];

    const result = deriveFilterOptions(kos);

    expect(result).toEqual({
      types: ['dashboard'],
      apps: ['search'],
      owners: ['admin'],
    });
  });

  it('should return sorted unique values from multiple knowledge objects', () => {
    const kos: KnowledgeObject[] = [
      { id: '1', name: 'A', type: 'macro', app: 'search', owner: 'bob', isolated: false },
      { id: '2', name: 'B', type: 'dashboard', app: 'security', owner: 'alice', isolated: false },
      { id: '3', name: 'C', type: 'lookup', app: 'network', owner: 'charlie', isolated: false },
    ];

    const result = deriveFilterOptions(kos);

    expect(result.types).toEqual(['dashboard', 'lookup', 'macro']);
    expect(result.apps).toEqual(['network', 'search', 'security']);
    expect(result.owners).toEqual(['alice', 'bob', 'charlie']);
  });

  it('should deduplicate values when knowledge objects share the same type, app, or owner', () => {
    const kos: KnowledgeObject[] = [
      { id: '1', name: 'A', type: 'dashboard', app: 'search', owner: 'admin', isolated: false },
      { id: '2', name: 'B', type: 'dashboard', app: 'search', owner: 'admin', isolated: false },
      { id: '3', name: 'C', type: 'dashboard', app: 'security', owner: 'admin', isolated: false },
    ];

    const result = deriveFilterOptions(kos);

    expect(result.types).toEqual(['dashboard']);
    expect(result.apps).toEqual(['search', 'security']);
    expect(result.owners).toEqual(['admin']);
  });

  it('should exclude empty string values from results', () => {
    const kos: KnowledgeObject[] = [
      { id: '1', name: 'A', type: 'dashboard', app: 'search', owner: 'admin', isolated: false },
      { id: '2', name: 'B', type: '', app: '', owner: '', isolated: false },
    ];

    const result = deriveFilterOptions(kos);

    expect(result.types).toEqual(['dashboard']);
    expect(result.apps).toEqual(['search']);
    expect(result.owners).toEqual(['admin']);
  });
});
