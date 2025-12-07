/**
 * Pattern-Based Command Handler Tests
 *
 * Tests for the generic pattern-based handler that uses the pattern interpreter
 * to extract field lineage from commands with registered patterns.
 *
 * @module entities/field/lib/lineage/command-handlers/pattern-based.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldDependsOn,
  expectFieldConfidence,
} from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

describe('pattern-based handler: basic functionality', () => {
  it('handles rename command with pattern', () => {
    const index = testLineage('index=main | rename old_name as new_name');
    const newName = index.getFieldLineage('new_name');
    expect(newName).not.toBeNull();
    expectFieldEvent(index, 'new_name', 'created');
    expectFieldDependsOn(index, 'new_name', 'old_name');
  });

  it('handles multiple rename operations', () => {
    const index = testLineage('index=main | rename a as x, b as y, c as z');
    expect(index.getFieldLineage('x')).not.toBeNull();
    expect(index.getFieldLineage('y')).not.toBeNull();
    expect(index.getFieldLineage('z')).not.toBeNull();
    expectFieldDependsOn(index, 'x', 'a');
    expectFieldDependsOn(index, 'y', 'b');
    expectFieldDependsOn(index, 'z', 'c');
  });

  it('handles replace command with pattern', () => {
    const index = testLineage('index=main | replace "old" with "new" in status');
    const status = index.getFieldLineage('status');
    expect(status).not.toBeNull();
  });

  it('returns empty effects for command without pattern', () => {
    // Use a generic command that has no pattern defined
    const index = testLineage('index=main | someunknowncommand');
    const allFields = index.getAllFields();
    // Should still have implicit fields from search
    expect(allFields.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// SEMANTIC RULES
// =============================================================================

describe('pattern-based handler: semantic rules', () => {
  it('handles staticCreates from semantics', () => {
    // fillnull creates _fillnull_* fields
    const index = testLineage('index=main | fillnull value=0 field1');
    const fields = index.getAllFields();
    expect(fields.length).toBeGreaterThan(0);
  });

  it('handles preservesAll semantic', () => {
    // Commands with preservesAll should not drop any fields
    const index = testLineage('index=main | rename old as new | fields *');
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('handles dropsAllExcept with byFields', () => {
    // Stats command drops all fields except BY fields and aggregations
    const index = testLineage('index=main | stats count by host');
    const count = index.getFieldLineage('count');
    const host = index.getFieldLineage('host');
    expect(count).not.toBeNull();
    expect(host).not.toBeNull();
  });

  it('handles dropsAllExcept with creates', () => {
    // Table command drops all fields except specified ones
    const index = testLineage('index=main | eval x=1 | table x');
    const x = index.getFieldLineage('x');
    expect(x).not.toBeNull();
  });
});

// =============================================================================
// MULTIPLE PATTERN COMMANDS
// =============================================================================

describe('pattern-based handler: chained pattern commands', () => {
  it('handles multiple rename commands in sequence', () => {
    const index = testLineage('index=main | rename a as b | rename b as c');
    const c = index.getFieldLineage('c');
    expect(c).not.toBeNull();
    expectFieldDependsOn(index, 'c', 'b');
  });

  it('handles rename followed by eval', () => {
    const index = testLineage('index=main | rename price as cost | eval total=cost*qty');
    expectFieldDependsOn(index, 'total', 'cost', 'qty');
  });

  it('handles complex pipeline with multiple pattern commands', () => {
    const index = testLineage(`
      index=main
      | rename src_ip as source
      | eval duration=end-start
      | replace "unknown" with "N/A" in status
    `);
    const source = index.getFieldLineage('source');
    const duration = index.getFieldLineage('duration');
    expect(source).not.toBeNull();
    expect(duration).not.toBeNull();
  });
});

// =============================================================================
// FIELD DEPENDENCY TRACKING
// =============================================================================

describe('pattern-based handler: dependency tracking', () => {
  it('tracks field consumption correctly', () => {
    const index = testLineage('index=main | rename old_field as new_field');
    expectFieldDependsOn(index, 'new_field', 'old_field');
  });

  it('tracks grouping fields as consumed', () => {
    const index = testLineage('index=main | stats count by host, source');
    const count = index.getFieldLineage('count');
    expect(count).not.toBeNull();
    // host and source should be preserved as grouping fields
    expect(index.getFieldLineage('host')).not.toBeNull();
    expect(index.getFieldLineage('source')).not.toBeNull();
  });

  it('handles dependencies in aggregation functions', () => {
    const index = testLineage('index=main | stats sum(bytes) as total_bytes by host');
    const totalBytes = index.getFieldLineage('total_bytes');
    expect(totalBytes).not.toBeNull();
    expectFieldDependsOn(index, 'total_bytes', 'bytes');
  });
});

// =============================================================================
// CONFIDENCE LEVELS
// =============================================================================

describe('pattern-based handler: confidence levels', () => {
  it('has certain confidence for pattern-based creations', () => {
    const index = testLineage('index=main | rename old as new');
    expectFieldConfidence(index, 'new', 'certain');
  });

  it('maintains confidence through pattern pipeline', () => {
    const index = testLineage('index=main | rename a as b | rename b as c');
    expectFieldConfidence(index, 'c', 'certain');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('pattern-based handler: edge cases', () => {
  it('handles rename with wildcard pattern', () => {
    const index = testLineage('index=main | rename *_old as *_new');
    const fields = index.getAllFields();
    expect(fields.length).toBeGreaterThan(0);
  });

  it('handles rename with no effect (field already named)', () => {
    const index = testLineage('index=main | rename field as field');
    const field = index.getFieldLineage('field');
    expect(field).not.toBeNull();
  });

  it('handles empty replace (no matches)', () => {
    const index = testLineage('index=main | replace "notfound" with "x" in status');
    const status = index.getFieldLineage('status');
    expect(status).not.toBeNull();
  });

  it('handles command with no parameters', () => {
    const index = testLineage('index=main | dedup');
    const fields = index.getAllFields();
    expect(fields.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('pattern-based handler: adversarial tests', () => {
  it('handles many rename operations (50)', () => {
    const renames = Array.from({ length: 50 }, (_, i) => 
      `field${i} as renamed${i}`
    ).join(', ');
    const index = testLineage(`index=main | rename ${renames}`);
    
    // Check first and last
    expect(index.getFieldLineage('renamed0')).not.toBeNull();
    expect(index.getFieldLineage('renamed49')).not.toBeNull();
  });

  it('handles very long field names in rename', () => {
    const longName = 'a'.repeat(255);
    const index = testLineage(`index=main | rename field as ${longName}`);
    expect(index.getFieldLineage(longName)).not.toBeNull();
  });

  it('handles rename chain (10 deep)', () => {
    let query = 'index=main';
    for (let i = 0; i < 10; i++) {
      query += ` | rename field${i} as field${i + 1}`;
    }
    const index = testLineage(query);
    expect(index.getFieldLineage('field10')).not.toBeNull();
  });

  it('handles complex pattern command in large pipeline', () => {
    const index = testLineage(`
      index=main
      | eval a=1, b=2, c=3, d=4, e=5
      | rename a as x, b as y, c as z
      | stats count by x, y, z
      | eval total=count*10
    `);
    expect(index.getFieldLineage('total')).not.toBeNull();
    expectFieldDependsOn(index, 'total', 'count');
  });

  it('handles pattern command with special characters in values', () => {
    const index = testLineage('index=main | replace "\\t" with " " in field');
    const field = index.getFieldLineage('field');
    expect(field).not.toBeNull();
  });

  it('handles multiple replace operations on same field', () => {
    const index = testLineage(`
      index=main
      | replace "a" with "x" in status
      | replace "b" with "y" in status
      | replace "c" with "z" in status
    `);
    const status = index.getFieldLineage('status');
    expect(status).not.toBeNull();
  });
});

// =============================================================================
// INTEGRATION WITH OTHER HANDLERS
// =============================================================================

describe('pattern-based handler: integration', () => {
  it('works correctly before eval', () => {
    const index = testLineage('index=main | rename old as new | eval result=new*2');
    expectFieldDependsOn(index, 'result', 'new');
  });

  it('works correctly after eval', () => {
    const index = testLineage('index=main | eval temp=field*2 | rename temp as final');
    expectFieldDependsOn(index, 'final', 'temp');
    expectFieldDependsOn(index, 'temp', 'field');
  });

  it('works correctly with stats', () => {
    const index = testLineage('index=main | rename ip as source_ip | stats count by source_ip');
    expectFieldDependsOn(index, 'source_ip', 'ip');
  });

  it('works correctly in complete real-world pipeline', () => {
    const index = testLineage(`
      index=web
      | rename clientip as client, status as http_code
      | eval is_error=if(http_code>=400, 1, 0)
      | stats sum(is_error) as errors by client
      | rename errors as error_count
    `);
    expect(index.getFieldLineage('error_count')).not.toBeNull();
    expectFieldDependsOn(index, 'error_count', 'errors');
  });
});
