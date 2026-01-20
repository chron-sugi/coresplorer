import { describe, it, expect } from 'vitest';
import { analyzeLineage } from './analyzer';
import { parseSPL } from '@/entities/spl';
import {
  createRootScope,
  createSubsearchScope,
  createSubsearchScopeId,
  isRootScope,
  isSubsearchScope,
  isAncestorScope,
  parseScopeId,
  ROOT_SCOPE_ID,
} from './scope-utils';

const parse = (spl: string) => {
  const pr = parseSPL(spl);
  if (!pr.ast) throw new Error('Failed to parse SPL for test');
  return pr.ast;
};

// =============================================================================
// SCOPE UTILITIES
// =============================================================================

describe('scope utilities', () => {
  describe('createRootScope', () => {
    it('creates root scope with correct properties', () => {
      const scope = createRootScope();
      expect(scope.id).toBe(ROOT_SCOPE_ID);
      expect(scope.type).toBe('root');
      expect(scope.parentId).toBeNull();
    });
  });

  describe('createSubsearchScopeId', () => {
    it('generates correct path-based ID', () => {
      expect(createSubsearchScopeId('root', 'append', 5)).toBe('root.append@L5');
      expect(createSubsearchScopeId('root', 'join', 10)).toBe('root.join@L10');
    });

    it('supports nested scope IDs', () => {
      expect(createSubsearchScopeId('root.append@L5', 'join', 10)).toBe('root.append@L5.join@L10');
    });
  });

  describe('createSubsearchScope', () => {
    it('creates subsearch scope with correct properties', () => {
      const parent = createRootScope();
      const scope = createSubsearchScope(parent, 'append', 5);

      expect(scope.id).toBe('root.append@L5');
      expect(scope.type).toBe('subsearch');
      expect(scope.parentId).toBe('root');
      expect(scope.command).toBe('append');
      expect(scope.line).toBe(5);
    });
  });

  describe('isRootScope / isSubsearchScope', () => {
    it('correctly identifies root scope', () => {
      const root = createRootScope();
      expect(isRootScope(root)).toBe(true);
      expect(isSubsearchScope(root)).toBe(false);
    });

    it('correctly identifies subsearch scope', () => {
      const root = createRootScope();
      const sub = createSubsearchScope(root, 'append', 5);
      expect(isRootScope(sub)).toBe(false);
      expect(isSubsearchScope(sub)).toBe(true);
    });
  });

  describe('isAncestorScope', () => {
    it('root is ancestor of subsearch', () => {
      const root = createRootScope();
      const sub = createSubsearchScope(root, 'append', 5);
      expect(isAncestorScope(root, sub)).toBe(true);
    });

    it('subsearch is not ancestor of root', () => {
      const root = createRootScope();
      const sub = createSubsearchScope(root, 'append', 5);
      expect(isAncestorScope(sub, root)).toBe(false);
    });

    it('scope is not its own ancestor', () => {
      const root = createRootScope();
      expect(isAncestorScope(root, root)).toBe(false);
    });
  });

  describe('parseScopeId', () => {
    it('parses root scope ID', () => {
      const result = parseScopeId('root');
      expect(result.parts).toEqual(['root']);
      expect(result.depth).toBe(0);
    });

    it('parses single-level subsearch scope ID', () => {
      const result = parseScopeId('root.append@L5');
      expect(result.parts).toEqual(['root', 'append@L5']);
      expect(result.depth).toBe(1);
    });

    it('parses nested subsearch scope ID', () => {
      const result = parseScopeId('root.append@L5.join@L10');
      expect(result.parts).toEqual(['root', 'append@L5', 'join@L10']);
      expect(result.depth).toBe(2);
    });
  });
});

// =============================================================================
// CORE BUG FIX: MAIN PIPELINE FIELDS NOT DROPPED BY SUBSEARCH
// =============================================================================

describe('scope-aware field lineage: subsearch isolation', () => {
  it('field in main pipeline is NOT dropped by stats inside append subsearch', () => {
    const spl = `index=main
| eval myfield="test"
| append [search index=other | stats count by host]
| table myfield, host, count`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // myfield was created in main pipeline at line 2
    const myfield = index.getFieldLineage('myfield');
    expect(myfield).not.toBeNull();

    // myfield should still exist after the append (line 4)
    // The stats inside the subsearch should NOT have dropped it
    expect(index.fieldExistsAt('myfield', 4)).toBe(true);

    // count should be available from the subsearch
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('field in main pipeline is NOT dropped by stats inside join subsearch', () => {
    const spl = `index=main
| eval myfield="test"
| join host [search index=other | stats count by host]
| table myfield, host, count`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // myfield should still exist after the join
    expect(index.fieldExistsAt('myfield', 4)).toBe(true);
  });

  it('field in main pipeline is NOT dropped by stats inside appendcols subsearch', () => {
    const spl = `index=main
| eval myfield="test"
| appendcols [search index=other | stats count]
| table myfield, count`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // myfield should still exist after appendcols
    const myfield = index.getFieldLineage('myfield');
    expect(myfield).not.toBeNull();
    expect(index.fieldExistsAt('myfield', 4)).toBe(true);
  });
});

// =============================================================================
// SCOPE ID ON EVENTS
// =============================================================================

describe('scope-aware field lineage: event scope IDs', () => {
  it('events in root pipeline have root scope ID', () => {
    const spl = `index=main | eval myfield=1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    const myfield = index.getFieldLineage('myfield');
    expect(myfield).not.toBeNull();

    const createdEvent = myfield?.events.find(e => e.kind === 'created');
    expect(createdEvent?.scopeId).toBe('root');
  });

  it('can filter events by scope ID', () => {
    const spl = `index=main | eval myfield=1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // Use the scope-aware query method
    const rootEvents = index.getFieldEventsInScope?.('myfield', 'root') ?? [];
    expect(rootEvents.length).toBeGreaterThan(0);

    // Non-existent scope should return empty
    const otherEvents = index.getFieldEventsInScope?.('myfield', 'root.append@L99') ?? [];
    expect(otherEvents.length).toBe(0);
  });
});

// =============================================================================
// UNION WITH MULTIPLE SUBSEARCHES
// =============================================================================

describe('scope-aware field lineage: union command', () => {
  it('handles union with multiple subsearches', () => {
    // Note: union parsing may vary - this tests the concept
    const spl = `index=main
| eval mainfield=1
| append [search index=a | stats count as count_a]
| append [search index=b | stats sum(bytes) as total_b]
| table mainfield, count_a, total_b`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // mainfield should survive all appends
    expect(index.fieldExistsAt('mainfield', 5)).toBe(true);

    // Fields from subsearches should be available
    expect(index.getFieldLineage('count_a')).not.toBeNull();
    expect(index.getFieldLineage('total_b')).not.toBeNull();
  });
});

// =============================================================================
// COMPLEX SCENARIOS
// =============================================================================

describe('scope-aware field lineage: complex scenarios', () => {
  it('field created in main, used in subsearch predicate, still exists after', () => {
    const spl = `index=main
| eval threshold=100
| append [search index=other | where value > 50 | stats count]
| eval result=threshold * 2`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // threshold should still exist and be usable after append
    const threshold = index.getFieldLineage('threshold');
    expect(threshold).not.toBeNull();
    expect(index.fieldExistsAt('threshold', 4)).toBe(true);

    // result should be created and depend on threshold
    const result = index.getFieldLineage('result');
    expect(result).not.toBeNull();
    expect(result?.dependsOn).toContain('threshold');
  });

  it('tracks lineage through pipeline with multiple subsearch commands', () => {
    const spl = `index=main
| eval field1=1
| append [search index=other | stats count as sub1_count]
| eval field2=field1+1
| append [search index=other | stats sum(x) as sub2_sum]
| eval field3=field2+1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // All fields created in main pipeline should survive
    expect(index.fieldExistsAt('field1', 7)).toBe(true);
    expect(index.fieldExistsAt('field2', 7)).toBe(true);
    expect(index.fieldExistsAt('field3', 7)).toBe(true);

    // Subsearch fields should also be available
    expect(index.getFieldLineage('sub1_count')).not.toBeNull();
    expect(index.getFieldLineage('sub2_sum')).not.toBeNull();
  });
});

// =============================================================================
// SCOPE QUERY METHODS
// =============================================================================

describe('scope-aware field lineage: query methods', () => {
  it('getAllScopes returns registered scopes', () => {
    const spl = `index=main | eval x=1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    const scopes = index.getAllScopes?.() ?? [];
    expect(scopes.length).toBeGreaterThan(0);
    expect(scopes.some(s => s.id === 'root')).toBe(true);
  });

  it('getScope returns scope by ID', () => {
    const spl = `index=main | eval x=1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    const rootScope = index.getScope?.('root');
    expect(rootScope).not.toBeNull();
    expect(rootScope?.type).toBe('root');
  });

  it('fieldExistsInScope checks field presence in specific scope', () => {
    const spl = `index=main | eval x=1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.fieldExistsInScope?.('x', 'root')).toBe(true);
    expect(index.fieldExistsInScope?.('nonexistent', 'root')).toBe(false);
  });
});

// =============================================================================
// BUG FIX: SEARCH TERM FIELDS NOT REPORTED AS CREATED
// =============================================================================

describe('scope-aware field lineage: search term field filtering', () => {
  it('index field from subsearch search expression is NOT reported as created', () => {
    // This was a bug: "index" from "search index=errors" was being reported
    // as "created" at the append statement
    const spl = `index=main
| eval threshold=100
| append [search index=errors | stats count as error_count by src]
| table threshold, error_count, src`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // error_count and src should be created by the subsearch
    const errorCount = index.getFieldLineage('error_count');
    expect(errorCount).not.toBeNull();
    const errorCountOrigin = index.getFieldOrigin('error_count');
    expect(errorCountOrigin?.kind).toBe('created');

    // "index" should NOT have a 'created' origin from the append
    // It should either not be tracked or have 'origin' kind (implicit)
    const indexField = index.getFieldLineage('index');
    if (indexField) {
      const indexOrigin = index.getFieldOrigin('index');
      // If it exists, it should be consumed, not created
      expect(indexOrigin?.kind).not.toBe('created');
    }
  });

  it('host field from subsearch search expression is NOT reported as created', () => {
    const spl = `index=main
| eval myfield=1
| join host [search index=other host=server* | stats count by host]
| table myfield, host, count`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // count should be created by the subsearch
    const countField = index.getFieldLineage('count');
    expect(countField).not.toBeNull();
    const countOrigin = index.getFieldOrigin('count');
    expect(countOrigin?.kind).toBe('created');

    // host should exist (as join key or implicit), but not created by the subsearch
    // Its origin should be 'origin' (implicit) not 'created'
    const hostOrigin = index.getFieldOrigin('host');
    expect(hostOrigin?.kind).toBe('origin');
  });

  it('only explicitly created fields are merged from subsearch', () => {
    const spl = `index=main
| eval main_field=1
| append [search index=other sourcetype=access | stats count as sub_count, avg(bytes) as avg_bytes]
| table main_field, sub_count, avg_bytes`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // These should be created by the subsearch stats
    expect(index.getFieldOrigin('sub_count')?.kind).toBe('created');
    expect(index.getFieldOrigin('avg_bytes')?.kind).toBe('created');

    // sourcetype should NOT be reported as created
    const sourcetypeField = index.getFieldLineage('sourcetype');
    if (sourcetypeField) {
      expect(index.getFieldOrigin('sourcetype')?.kind).not.toBe('created');
    }
  });
});
