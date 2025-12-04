/**
 * Tests for SPL pattern interpreter
 *
 * @module entities/spl/lib/parser/patterns/interpreter.test
 */

import { describe, it, expect } from 'vitest';
import { interpretPattern } from './interpreter';
import {
  binCommand,
  renameCommand,
  fillnullCommand,
  dedupCommand,
  sortCommand,
  statsCommand,
} from './registry';
import type { CommandSyntax } from './types';

// =============================================================================
// MOCK AST NODES
// =============================================================================

function createBinAstNode(field: string, alias?: string) {
  return {
    type: 'BinCommand',
    field,
    alias: alias || null,
    span: null,
    location: mockLocation(),
  };
}

function createRenameAstNode(renamings: Array<{ old: string; new: string }>) {
  return {
    type: 'RenameCommand',
    renamings: renamings.map(r => ({
      type: 'RenameMapping',
      oldField: { name: r.old },
      newField: { name: r.new },
      location: mockLocation(),
    })),
    location: mockLocation(),
  };
}

function createFillnullAstNode(value: string | null, fields: string[]) {
  return {
    type: 'FillnullCommand',
    value,
    fields: fields.map(f => ({ name: f })),
    location: mockLocation(),
  };
}

function createDedupAstNode(fields: string[], count?: number) {
  return {
    type: 'DedupCommand',
    fields: fields.map(f => ({ name: f })),
    count: count || null,
    location: mockLocation(),
  };
}

function createSortAstNode(fields: string[], limit?: number) {
  return {
    type: 'SortCommand',
    sortFields: fields.map(f => ({ name: f })),
    limit: limit || null,
    location: mockLocation(),
  };
}

function createStatsAstNode(
  variant: 'stats' | 'eventstats' | 'streamstats' | 'chart' | 'timechart',
  aggregations: Array<{ function: string; field?: string; outputField: string }>,
  byFields: string[] = []
) {
  return {
    type: 'StatsCommand',
    variant,
    aggregations: aggregations.map(agg => ({
      type: 'Aggregation',
      function: agg.function,
      field: agg.field ? { fieldName: agg.field, isWildcard: false } : null,
      alias: null,
      outputField: agg.outputField,
      location: mockLocation(),
    })),
    byFields: byFields.map(f => ({ fieldName: f, isWildcard: false })),
    preservesFields: variant === 'eventstats' || variant === 'streamstats',
    location: mockLocation(),
  };
}

function mockLocation() {
  return {
    startLine: 1,
    startColumn: 1,
    endLine: 1,
    endColumn: 10,
    startOffset: 0,
    endOffset: 10,
  };
}

// =============================================================================
// BIN COMMAND TESTS
// =============================================================================

describe('Pattern Interpreter - bin command', () => {
  it('interprets bin command without alias', () => {
    const astNode = createBinAstNode('size');

    const result = interpretPattern(binCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.modifies).toContainEqual({ fieldName: 'size', dependsOn: undefined });
    expect(result.creates).toHaveLength(0);
    expect(result.consumes).toHaveLength(0);
  });

  it('interprets bin command with alias', () => {
    const astNode = createBinAstNode('age', 'age_bucket');

    const result = interpretPattern(binCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.modifies).toContainEqual({ fieldName: 'age', dependsOn: undefined });
    expect(result.creates).toContainEqual({ fieldName: 'age_bucket', dependsOn: undefined });
  });

  it('rejects wrong command type', () => {
    const wrongNode = createRenameAstNode([{ old: 'foo', new: 'bar' }]);

    const result = interpretPattern(binCommand, wrongNode);

    expect(result.matched).toBe(false);
    expect(result.error).toContain('does not match');
  });
});

// =============================================================================
// RENAME COMMAND TESTS
// =============================================================================

describe('Pattern Interpreter - rename command', () => {
  it('interprets single rename', () => {
    const astNode = createRenameAstNode([{ old: 'count', new: 'total' }]);

    const result = interpretPattern(renameCommand, astNode);

    expect(result.matched).toBe(true);
    // rename drops the old field (not consumes)
    expect(result.drops).toContain('count');
    expect(result.creates).toContainEqual({ fieldName: 'total', dependsOn: ['count'] });
  });

  it('interprets multiple renames', () => {
    const astNode = createRenameAstNode([
      { old: 'count', new: 'total' },
      { old: 'size', new: 'bytes' },
    ]);

    const result = interpretPattern(renameCommand, astNode);

    expect(result.matched).toBe(true);
    // rename drops the old fields (not consumes)
    expect(result.drops).toContain('count');
    expect(result.drops).toContain('size');
    expect(result.creates).toContainEqual({ fieldName: 'total', dependsOn: ['count'] });
    expect(result.creates).toContainEqual({ fieldName: 'bytes', dependsOn: ['size'] });
  });

  it('handles wildcard field renames', () => {
    const astNode = createRenameAstNode([{ old: 'foo*', new: 'bar*' }]);

    const result = interpretPattern(renameCommand, astNode);

    expect(result.matched).toBe(true);
    // rename drops the old field (not consumes)
    expect(result.drops).toContain('foo*');
    expect(result.creates).toContainEqual({ fieldName: 'bar*', dependsOn: ['foo*'] });
  });
});

// =============================================================================
// FILLNULL COMMAND TESTS
// =============================================================================

describe('Pattern Interpreter - fillnull command', () => {
  it('interprets fillnull with default value and fields', () => {
    const astNode = createFillnullAstNode('0', ['foo', 'bar']);

    const result = interpretPattern(fillnullCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.modifies).toContainEqual({ fieldName: 'foo', dependsOn: undefined });
    expect(result.modifies).toContainEqual({ fieldName: 'bar', dependsOn: undefined });
  });

  it('interprets fillnull with no fields specified', () => {
    const astNode = createFillnullAstNode('NULL', []);

    const result = interpretPattern(fillnullCommand, astNode);

    expect(result.matched).toBe(true);
    // No fields specified means all null fields affected
    // Pattern handles this as optional field-list
  });

  it('interprets fillnull with no value specified', () => {
    const astNode = createFillnullAstNode(null, ['status']);

    const result = interpretPattern(fillnullCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.modifies).toContainEqual({ fieldName: 'status', dependsOn: undefined });
  });
});

// =============================================================================
// DEDUP COMMAND TESTS
// =============================================================================

describe('Pattern Interpreter - dedup command', () => {
  it('interprets dedup with fields', () => {
    const astNode = createDedupAstNode(['host']);

    const result = interpretPattern(dedupCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.consumes).toContain('host');
  });

  it('interprets dedup with multiple fields', () => {
    const astNode = createDedupAstNode(['source', 'sourcetype']);

    const result = interpretPattern(dedupCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.consumes).toContain('source');
    expect(result.consumes).toContain('sourcetype');
  });

  it('interprets dedup with count', () => {
    const astNode = createDedupAstNode(['host'], 3);

    const result = interpretPattern(dedupCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.consumes).toContain('host');
  });
});

// =============================================================================
// SORT COMMAND TESTS
// =============================================================================

describe('Pattern Interpreter - sort command', () => {
  it('interprets sort with fields', () => {
    const astNode = createSortAstNode(['_time', 'host']);

    const result = interpretPattern(sortCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.consumes).toContain('_time');
    expect(result.consumes).toContain('host');
  });

  it('interprets sort with limit', () => {
    const astNode = createSortAstNode(['size'], 100);

    const result = interpretPattern(sortCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.consumes).toContain('size');
  });

  it('interprets sort with multiple fields and limit', () => {
    const astNode = createSortAstNode(['ip', 'url'], 50);

    const result = interpretPattern(sortCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.consumes).toContain('ip');
    expect(result.consumes).toContain('url');
  });
});

// =============================================================================
// FIELD EFFECT TESTS
// =============================================================================

describe('Pattern Interpreter - field effects', () => {
  it('distinguishes creates vs modifies', () => {
    const binNode = createBinAstNode('size', 'size_bucket');

    const result = interpretPattern(binCommand, binNode);

    expect(result.creates).toContainEqual({ fieldName: 'size_bucket', dependsOn: undefined });
    expect(result.modifies).toContainEqual({ fieldName: 'size', dependsOn: undefined });
    expect(result.creates.map(c => c.fieldName)).not.toContain('size');
    expect(result.modifies.map(m => m.fieldName)).not.toContain('size_bucket');
  });

  it('distinguishes drops vs creates in rename', () => {
    const renameNode = createRenameAstNode([{ old: 'foo', new: 'bar' }]);

    const result = interpretPattern(renameCommand, renameNode);

    // rename drops old field and creates new field
    expect(result.drops).toContain('foo');
    expect(result.creates).toContainEqual({ fieldName: 'bar', dependsOn: ['foo'] });
    expect(result.creates.map(c => c.fieldName)).not.toContain('foo');
    expect(result.drops).not.toContain('bar');
  });

  it('correctly identifies modifies for fillnull', () => {
    const fillnullNode = createFillnullAstNode('0', ['count', 'total']);

    const result = interpretPattern(fillnullCommand, fillnullNode);

    expect(result.modifies).toContainEqual({ fieldName: 'count', dependsOn: undefined });
    expect(result.modifies).toContainEqual({ fieldName: 'total', dependsOn: undefined });
    expect(result.creates).toHaveLength(0);
    expect(result.consumes).toHaveLength(0);
  });

  it('correctly identifies consumes for dedup', () => {
    const dedupNode = createDedupAstNode(['field1', 'field2']);

    const result = interpretPattern(dedupCommand, dedupNode);

    expect(result.consumes).toContain('field1');
    expect(result.consumes).toContain('field2');
    expect(result.creates).toHaveLength(0);
    expect(result.modifies).toHaveLength(0);
  });
});

// =============================================================================
// QUANTIFIER TESTS
// =============================================================================

describe('Pattern Interpreter - quantifiers', () => {
  it('handles optional group (?) when present', () => {
    const binWithAlias = createBinAstNode('age', 'age_bucket');

    const result = interpretPattern(binCommand, binWithAlias);

    expect(result.matched).toBe(true);
    expect(result.creates).toContainEqual({ fieldName: 'age_bucket', dependsOn: undefined });
  });

  it('handles optional group (?) when absent', () => {
    const binWithoutAlias = createBinAstNode('age');

    const result = interpretPattern(binCommand, binWithoutAlias);

    expect(result.matched).toBe(true);
    expect(result.creates).toHaveLength(0);
  });

  it('handles one-or-more (+) with single item', () => {
    const singleRename = createRenameAstNode([{ old: 'foo', new: 'bar' }]);

    const result = interpretPattern(renameCommand, singleRename);

    expect(result.matched).toBe(true);
    // rename uses drops (not consumes)
    expect(result.drops).toHaveLength(1);
    expect(result.creates).toHaveLength(1);
  });

  it('handles one-or-more (+) with multiple items', () => {
    const multiRename = createRenameAstNode([
      { old: 'a', new: 'b' },
      { old: 'c', new: 'd' },
      { old: 'e', new: 'f' },
    ]);

    const result = interpretPattern(renameCommand, multiRename);

    expect(result.matched).toBe(true);
    // rename uses drops (not consumes)
    expect(result.drops).toHaveLength(3);
    expect(result.creates).toHaveLength(3);
  });
});

// =============================================================================
// COMPLEX PATTERN TESTS
// =============================================================================

describe('Pattern Interpreter - complex patterns', () => {
  it('handles sequence patterns', () => {
    // Bin has a sequence: field, optional alias group
    const binNode = createBinAstNode('size', 'bucket');

    const result = interpretPattern(binCommand, binNode);

    expect(result.matched).toBe(true);
    expect(result.modifies).toContainEqual({ fieldName: 'size', dependsOn: undefined });
    expect(result.creates).toContainEqual({ fieldName: 'bucket', dependsOn: undefined });
  });

  it('handles nested groups', () => {
    // Rename has a group with + quantifier containing a sequence
    const renameNode = createRenameAstNode([
      { old: 'old1', new: 'new1' },
      { old: 'old2', new: 'new2' },
    ]);

    const result = interpretPattern(renameCommand, renameNode);

    expect(result.matched).toBe(true);
    // rename uses drops (not consumes)
    expect(result.drops).toHaveLength(2);
    expect(result.creates).toHaveLength(2);
  });

  it('handles multiple optional parameters', () => {
    // Fillnull has optional value and optional field list
    const fillnullNode1 = createFillnullAstNode('0', ['field1']);
    const fillnullNode2 = createFillnullAstNode(null, ['field2']);
    const fillnullNode3 = createFillnullAstNode('NULL', []);

    const result1 = interpretPattern(fillnullCommand, fillnullNode1);
    const result2 = interpretPattern(fillnullCommand, fillnullNode2);
    const result3 = interpretPattern(fillnullCommand, fillnullNode3);

    expect(result1.matched).toBe(true);
    expect(result2.matched).toBe(true);
    expect(result3.matched).toBe(true);
  });
});

// =============================================================================
// CUSTOM PATTERN TESTS
// =============================================================================

describe('Pattern Interpreter - custom patterns', () => {
  it('interprets custom pattern with alternation', () => {
    const customCommand: CommandSyntax = {
      grammarSupport: 'generic',
      command: 'test',
      syntax: {
        kind: 'alternation',
        options: [
          {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'mode' },
              { kind: 'literal', value: '=' },
              { kind: 'literal', value: 'fast' },
            ],
          },
          {
            kind: 'sequence',
            patterns: [
              { kind: 'literal', value: 'mode' },
              { kind: 'literal', value: '=' },
              { kind: 'literal', value: 'slow' },
            ],
          },
        ],
      },
    };

    const astNode = {
      type: 'TestCommand',
      mode: 'fast',
      location: mockLocation(),
    };

    const result = interpretPattern(customCommand, astNode);

    expect(result.matched).toBe(true);
  });

  it('interprets custom pattern with field effects', () => {
    const evalCommand: CommandSyntax = {
      grammarSupport: 'generic',
      command: 'eval',
      syntax: {
        kind: 'sequence',
        patterns: [
          {
            kind: 'param',
            type: 'field',
            name: 'targetField',
            effect: 'creates',
          },
          { kind: 'literal', value: '=' },
          {
            kind: 'param',
            type: 'evaled-field',
            name: 'expression',
            effect: 'consumes',
          },
        ],
      },
    };

    const astNode = {
      type: 'EvalCommand',
      targetField: 'total',
      expression: 'price + tax',
      location: mockLocation(),
    };

    const result = interpretPattern(evalCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.creates).toContainEqual({ fieldName: 'total', dependsOn: undefined });
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe('Pattern Interpreter - error handling', () => {
  it('detects type mismatch', () => {
    const binNode = createBinAstNode('size');
    const result = interpretPattern(renameCommand, binNode);

    expect(result.matched).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('does not match');
  });

  it('handles missing required parameter', () => {
    const customCommand: CommandSyntax = {
      grammarSupport: 'generic',
      command: 'test',
      syntax: {
        kind: 'param',
        type: 'field',
        name: 'requiredField',
        effect: 'creates',
        quantifier: '1', // Required
      },
    };

    const astNode = {
      type: 'TestCommand',
      location: mockLocation(),
      // requiredField missing
    };

    const result = interpretPattern(customCommand, astNode);

    expect(result.matched).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('handles optional parameter gracefully', () => {
    const customCommand: CommandSyntax = {
      grammarSupport: 'generic',
      command: 'test',
      syntax: {
        kind: 'param',
        type: 'field',
        name: 'optionalField',
        effect: 'creates',
        quantifier: '?', // Optional
      },
    };

    const astNode = {
      type: 'TestCommand',
      location: mockLocation(),
      // optionalField missing - should be OK
    };

    const result = interpretPattern(customCommand, astNode);

    expect(result.matched).toBe(true);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Pattern Interpreter - integration', () => {
  it('processes all registry commands successfully', () => {
    const commands = [
      { pattern: binCommand, node: createBinAstNode('field') },
      { pattern: renameCommand, node: createRenameAstNode([{ old: 'a', new: 'b' }]) },
      { pattern: fillnullCommand, node: createFillnullAstNode('0', ['field']) },
      { pattern: dedupCommand, node: createDedupAstNode(['field']) },
      { pattern: sortCommand, node: createSortAstNode(['field']) },
    ];

    commands.forEach(({ pattern, node }) => {
      const result = interpretPattern(pattern, node);
      expect(result.matched).toBe(true);
    });
  });

  it('extracts complete field lineage for complex command', () => {
    const renameNode = createRenameAstNode([
      { old: 'src_ip', new: 'source_ip' },
      { old: 'dst_ip', new: 'dest_ip' },
      { old: 'src_port', new: 'source_port' },
    ]);

    const result = interpretPattern(renameCommand, renameNode);

    expect(result.matched).toBe(true);
    // rename uses drops (not consumes) for old fields
    expect(result.drops).toEqual(['src_ip', 'dst_ip', 'src_port']);
    expect(result.creates).toEqual([
      { fieldName: 'source_ip', dependsOn: ['src_ip'] },
      { fieldName: 'dest_ip', dependsOn: ['dst_ip'] },
      { fieldName: 'source_port', dependsOn: ['src_port'] },
    ]);
  });
});

// =============================================================================
// STATS VARIANT SEMANTICS TESTS
// =============================================================================

describe('Pattern Interpreter - stats variant semantics', () => {
  it('applies dropsAllExcept semantics for stats variant', () => {
    const astNode = createStatsAstNode(
      'stats',
      [{ function: 'count', outputField: 'count' }],
      ['host']
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.semantics).toBeDefined();
    expect(result.semantics?.dropsAllExcept).toEqual(['byFields', 'creates']);
    expect(result.semantics?.preservesAll).toBeUndefined();
  });

  it('applies dropsAllExcept semantics for chart variant', () => {
    const astNode = createStatsAstNode(
      'chart',
      [{ function: 'avg', field: 'duration', outputField: 'avg_duration' }],
      ['service']
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.semantics).toBeDefined();
    expect(result.semantics?.dropsAllExcept).toEqual(['byFields', 'creates']);
    expect(result.semantics?.preservesAll).toBeUndefined();
  });

  it('applies dropsAllExcept semantics for timechart variant', () => {
    const astNode = createStatsAstNode(
      'timechart',
      [{ function: 'sum', field: 'bytes', outputField: 'total_bytes' }],
      []
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.semantics).toBeDefined();
    expect(result.semantics?.dropsAllExcept).toEqual(['byFields', 'creates']);
    expect(result.semantics?.preservesAll).toBeUndefined();
  });

  it('applies preservesAll semantics for eventstats variant', () => {
    const astNode = createStatsAstNode(
      'eventstats',
      [{ function: 'avg', field: 'response_time', outputField: 'avg_response' }],
      ['host']
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.semantics).toBeDefined();
    expect(result.semantics?.preservesAll).toBe(true);
    expect(result.semantics?.dropsAllExcept).toBeUndefined();
  });

  it('applies preservesAll semantics for streamstats variant', () => {
    const astNode = createStatsAstNode(
      'streamstats',
      [{ function: 'count', outputField: 'running_count' }],
      []
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.semantics).toBeDefined();
    expect(result.semantics?.preservesAll).toBe(true);
    expect(result.semantics?.dropsAllExcept).toBeUndefined();
  });

  it('extracts field effects for stats variant', () => {
    const astNode = createStatsAstNode(
      'stats',
      [
        { function: 'count', outputField: 'event_count' },
        { function: 'avg', field: 'duration', outputField: 'avg_duration' },
      ],
      ['host', 'service']
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    // BY fields are grouped by
    expect(result.groupsBy).toContain('host');
    expect(result.groupsBy).toContain('service');
    // Aggregations create new fields
    // Note: dependsOn is populated by pattern definition, interpreter extracts field names
    expect(result.creates).toContainEqual({ fieldName: 'event_count', dependsOn: undefined });
    expect(result.creates).toContainEqual({ fieldName: 'avg_duration', dependsOn: undefined });
  });

  it('extracts field effects for eventstats variant', () => {
    const astNode = createStatsAstNode(
      'eventstats',
      [{ function: 'max', field: 'cpu', outputField: 'max_cpu' }],
      ['host']
    );

    const result = interpretPattern(statsCommand, astNode);

    expect(result.matched).toBe(true);
    expect(result.groupsBy).toContain('host');
    // Note: dependsOn is populated by pattern definition, interpreter extracts field names
    expect(result.creates).toContainEqual({ fieldName: 'max_cpu', dependsOn: undefined });
    expect(result.semantics?.preservesAll).toBe(true);
  });
});
