/**
 * Field Filter Command Handler Tests
 *
 * Comprehensive tests for table and fields command handlers including:
 * - Basic functionality
 * - Keep/remove modes
 * - Field dropping behavior
 * - Edge cases
 * - Wildcards
 * - Adversarial tests
 *
 * @module features/field-lineage/lib/command-handlers/field-filters.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldAt,
  expectNoFieldAt,
} from '../testing';

// =============================================================================
// TABLE COMMAND: BASIC FUNCTIONALITY
// =============================================================================

describe('table command: basic functionality', () => {
  it('keeps specified fields', () => {
    const index = testLineage('index=main | table host, source, _time');
    expectFieldAt(index, 'host', 2);
    expectFieldAt(index, 'source', 2);
    expectFieldAt(index, '_time', 2);
  });

  it('drops fields not in table list', () => {
    const index = testLineage('index=main | eval foo=1, bar=2 | table foo');
    expectFieldAt(index, 'foo', 3);
    expectNoFieldAt(index, 'bar', 3);
  });

  it('consumes specified fields', () => {
    const index = testLineage('index=main | table host, source');
    expectFieldEvent(index, 'host', 'consumed');
    expectFieldEvent(index, 'source', 'consumed');
  });

  it('handles single field', () => {
    const index = testLineage('index=main | table host');
    expectFieldAt(index, 'host', 2);
    expectNoFieldAt(index, 'source', 2);
    expectNoFieldAt(index, '_raw', 2);
  });

  it('handles implicit fields in table', () => {
    const index = testLineage('index=main | table _time, _raw, host');
    expectFieldAt(index, '_time', 2);
    expectFieldAt(index, '_raw', 2);
    expectFieldAt(index, 'host', 2);
  });
});

// =============================================================================
// TABLE COMMAND: WITH OTHER COMMANDS
// =============================================================================

describe('table command: interactions', () => {
  it('works after eval', () => {
    const index = testLineage(`index=main
| eval total=price*qty, discount=total*0.1
| table total, discount`);
    expectFieldAt(index, 'total', 3);
    expectFieldAt(index, 'discount', 3);
    expectNoFieldAt(index, 'price', 3);
    expectNoFieldAt(index, 'qty', 3);
  });

  it('works after stats', () => {
    const index = testLineage(`index=main
| stats count, sum(bytes) as total by host
| table host, count`);
    expectFieldAt(index, 'host', 3);
    expectFieldAt(index, 'count', 3);
    expectNoFieldAt(index, 'total', 3);
  });

  it('works after rename', () => {
    const index = testLineage(`index=main
| rename host AS hostname
| table hostname, _time`);
    expectFieldAt(index, 'hostname', 3);
    expectNoFieldAt(index, 'host', 3);
  });

  it('works after rex', () => {
    const index = testLineage(`index=main
| rex field=_raw "(?<method>\\w+)\\s+(?<url>\\S+)"
| table method, url, _time`);
    expectFieldAt(index, 'method', 3);
    expectFieldAt(index, 'url', 3);
  });

  it('works after lookup', () => {
    const index = testLineage(`index=main
| lookup users uid OUTPUT username, email
| table uid, username`);
    expectFieldAt(index, 'uid', 3);
    expectFieldAt(index, 'username', 3);
    expectNoFieldAt(index, 'email', 3);
  });
});

// =============================================================================
// FIELDS COMMAND: REMOVE MODE
// =============================================================================

describe('fields command: remove mode', () => {
  it('removes specified fields with - prefix', () => {
    const index = testLineage('index=main | fields - _raw, _bkt');
    expectNoFieldAt(index, '_raw', 2);
    expectNoFieldAt(index, '_bkt', 2);
  });

  it('keeps unspecified fields in remove mode', () => {
    const index = testLineage('index=main | fields - _raw');
    expectFieldAt(index, 'host', 2);
    expectFieldAt(index, '_time', 2);
    expectFieldAt(index, 'source', 2);
  });

  it('marks removed fields as dropped', () => {
    const index = testLineage('index=main | eval foo=1 | fields - foo');
    expectFieldEvent(index, 'foo', 'dropped');
  });

  it('handles removing single field', () => {
    const index = testLineage('index=main | fields - _raw');
    expectNoFieldAt(index, '_raw', 2);
    expectFieldAt(index, 'host', 2);
  });

  it('handles removing multiple fields', () => {
    const index = testLineage('index=main | fields - _raw, _bkt, _cd, _si');
    expectNoFieldAt(index, '_raw', 2);
    expectNoFieldAt(index, '_bkt', 2);
  });
});

// =============================================================================
// FIELDS COMMAND: KEEP MODE
// =============================================================================

describe('fields command: keep mode', () => {
  it('keeps only specified fields with + prefix', () => {
    const index = testLineage('index=main | fields + host, source');
    expectFieldAt(index, 'host', 2);
    expectFieldAt(index, 'source', 2);
    expectNoFieldAt(index, '_raw', 2);
    expectNoFieldAt(index, '_time', 2);
  });

  it('consumes kept fields', () => {
    const index = testLineage('index=main | fields + host, source');
    expectFieldEvent(index, 'host', 'consumed');
    expectFieldEvent(index, 'source', 'consumed');
  });

  it('drops all fields not in keep list', () => {
    const index = testLineage('index=main | eval a=1, b=2, c=3 | fields + a');
    expectFieldAt(index, 'a', 3);
    expectNoFieldAt(index, 'b', 3);
    expectNoFieldAt(index, 'c', 3);
  });

  it('handles keeping single field', () => {
    const index = testLineage('index=main | fields + host');
    expectFieldAt(index, 'host', 2);
    expectNoFieldAt(index, 'source', 2);
  });
});

// =============================================================================
// FIELDS COMMAND: DEFAULT MODE
// =============================================================================

describe('fields command: default mode', () => {
  it('default mode without prefix keeps fields', () => {
    // fields without + or - typically defaults to keep
    const index = testLineage('index=main | fields host, source');
    // Behavior depends on implementation - typically acts like keep
    expectFieldAt(index, 'host', 2);
    expectFieldAt(index, 'source', 2);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('field filters: edge cases', () => {
  it('handles table with eval-created fields', () => {
    const index = testLineage(`index=main
| eval computed=a+b
| table computed, host`);
    expectFieldAt(index, 'computed', 3);
    expectFieldAt(index, 'host', 3);
  });

  it('handles table with renamed fields', () => {
    const index = testLineage(`index=main
| rename host AS hostname
| table hostname, _time`);
    expectFieldAt(index, 'hostname', 3);
    expectNoFieldAt(index, 'host', 3);
  });

  it('handles table with rex-extracted fields', () => {
    const index = testLineage(`index=main
| rex field=_raw "(?<status>\\d+)"
| table status, _time`);
    expectFieldAt(index, 'status', 3);
  });

  it('handles table with stats output fields', () => {
    const index = testLineage(`index=main
| stats count, avg(duration) as avg_dur by host
| table host, count`);
    expectFieldAt(index, 'host', 3);
    expectFieldAt(index, 'count', 3);
    expectNoFieldAt(index, 'avg_dur', 3);
  });

  it('handles repeated fields in table list', () => {
    const index = testLineage('index=main | table host, host, host');
    expectFieldAt(index, 'host', 2);
  });

  it('handles fields - with implicit fields', () => {
    const index = testLineage('index=main | fields - _time');
    expectNoFieldAt(index, '_time', 2);
    expectFieldAt(index, 'host', 2);
  });

  it('handles chained field filters', () => {
    const index = testLineage(`index=main
| fields + host, source, _time, _raw
| fields - _raw`);
    expectFieldAt(index, 'host', 3);
    expectFieldAt(index, 'source', 3);
    expectFieldAt(index, '_time', 3);
    expectNoFieldAt(index, '_raw', 3);
  });

  it('handles table after fields', () => {
    const index = testLineage(`index=main
| fields + host, source, _time
| table host, _time`);
    expectFieldAt(index, 'host', 3);
    expectFieldAt(index, '_time', 3);
    expectNoFieldAt(index, 'source', 3);
  });
});

// =============================================================================
// WILDCARDS
// =============================================================================

describe('field filters: wildcards', () => {
  // Note: Wildcard handling has limited static analysis capability

  it('handles wildcard in table (limited analysis)', () => {
    const index = testLineage('index=main | table host, error*');
    // Wildcard patterns can't be fully analyzed statically
    expectFieldAt(index, 'host', 2);
  });

  it('handles wildcard in fields - (limited analysis)', () => {
    const index = testLineage('index=main | fields - internal_*');
    // Wildcard removal - we don't know which fields match
    expect(index).not.toBeNull();
  });

  it('handles wildcard in fields + (limited analysis)', () => {
    const index = testLineage('index=main | fields + host, req_*');
    expectFieldAt(index, 'host', 2);
  });
});

// =============================================================================
// COMPLEX PIPELINES
// =============================================================================

describe('field filters: complex pipelines', () => {
  it('handles full ETL pipeline with table', () => {
    const index = testLineage(`index=main
| rex field=_raw "method=(?<method>\\w+)"
| rex field=_raw "status=(?<status>\\d+)"
| eval is_error=if(status>=400, 1, 0)
| stats count, sum(is_error) as errors by method
| eval error_rate=errors/count*100
| table method, count, error_rate`);
    expectFieldAt(index, 'method', 7);
    expectFieldAt(index, 'count', 7);
    expectFieldAt(index, 'error_rate', 7);
    expectNoFieldAt(index, 'errors', 7);
  });

  it('handles pipeline with multiple field filters', () => {
    const index = testLineage(`index=main
| eval a=1, b=2, c=3, d=4
| fields + a, b, c, d
| fields - d
| table a, b`);
    expectFieldAt(index, 'a', 5);
    expectFieldAt(index, 'b', 5);
    expectNoFieldAt(index, 'c', 5);
    expectNoFieldAt(index, 'd', 5);
  });

  it('handles table after complex transformations', () => {
    const index = testLineage(`index=main
| eval temp1=a+b
| rename temp1 AS step1
| eval temp2=step1*2
| stats sum(temp2) as total by host
| table host, total`);
    expectFieldAt(index, 'host', 6);
    expectFieldAt(index, 'total', 6);
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('field filters: adversarial tests', () => {
  it('handles large field list in table', () => {
    const fields = Array.from({ length: 50 }, (_, i) => `field${i}`).join(', ');
    const evals = Array.from({ length: 50 }, (_, i) => `field${i}=${i}`).join(', ');
    const index = testLineage(`index=main | eval ${evals} | table ${fields}`);
    expectFieldAt(index, 'field0', 3);
    expectFieldAt(index, 'field49', 3);
  });

  it('handles large field list in fields -', () => {
    const fields = Array.from({ length: 50 }, (_, i) => `field${i}`).join(', ');
    const evals = Array.from({ length: 50 }, (_, i) => `field${i}=${i}`).join(', ');
    const index = testLineage(`index=main | eval ${evals} | fields - ${fields}`);
    // All specified fields should be dropped
    expectNoFieldAt(index, 'field0', 3);
    expectNoFieldAt(index, 'field49', 3);
  });

  it('handles very long field names in table', () => {
    const longName = 'a'.repeat(100);
    const index = testLineage(`index=main | eval ${longName}=1 | table ${longName}`);
    expectFieldAt(index, longName, 3);
  });

  it('handles fields with special formatting', () => {
    const index = testLineage('index=main | table host, source, sourcetype, index');
    expectFieldAt(index, 'host', 2);
    expectFieldAt(index, 'source', 2);
    expectFieldAt(index, 'sourcetype', 2);
    expectFieldAt(index, 'index', 2);
  });

  it('handles empty table effectively dropping all fields', () => {
    // This is an edge case - may or may not be valid SPL
    // The test verifies the handler doesn't crash
    expect(() => testLineage('index=main | table')).not.toThrow();
  });

  it('handles fields - effectively removing specific internal fields', () => {
    const index = testLineage('index=main | fields - _bkt, _cd, _si, _serial');
    // These internal fields should be dropped
    expectNoFieldAt(index, '_bkt', 2);
    expectNoFieldAt(index, '_cd', 2);
  });
});
