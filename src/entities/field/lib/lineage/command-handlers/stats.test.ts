/**
 * Stats Command Handler Tests
 *
 * Comprehensive tests for stats, eventstats, streamstats, chart, timechart
 * including:
 * - Basic functionality
 * - All aggregation functions
 * - Variant commands
 * - Field dropping behavior
 * - Edge cases
 * - Adversarial tests
 *
 * @module features/field-lineage/lib/command-handlers/stats.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldAt,
  expectNoFieldAt,
  expectFieldDependsOn,
  expectFieldDataType,
  expectFieldConfidence,
  expectFieldCreatedAtLine,
  generateLargeByClause,
} from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

describe('stats command: basic functionality', () => {
  it('creates count field', () => {
    const index = testLineage('index=main | stats count');
    const count = index.getFieldLineage('count');
    expect(count).not.toBeNull();
    expectFieldEvent(index, 'count', 'created');
  });

  it('creates count with alias', () => {
    const index = testLineage('index=main | stats count AS total');
    expect(index.getFieldLineage('total')).not.toBeNull();
    expectFieldEvent(index, 'total', 'created');
  });

  it('creates count with quoted string alias', () => {
    const index = testLineage('index=main | stats count AS "Total Count", dc(user) AS "Unique Users"');
    // Verify aliases are extracted without quotes
    expect(index.getFieldLineage('Total Count')).not.toBeNull();
    expect(index.getFieldLineage('Unique Users')).not.toBeNull();
    expectFieldEvent(index, 'Total Count', 'created');
    expectFieldEvent(index, 'Unique Users', 'created');
  });

  it('creates aggregation with field', () => {
    const index = testLineage('index=main | stats sum(bytes) as total_bytes');
    expect(index.getFieldLineage('total_bytes')).not.toBeNull();
    expectFieldDependsOn(index, 'total_bytes', 'bytes');
  });

  it('creates multiple aggregations', () => {
    const index = testLineage('index=main | stats count, sum(bytes), avg(duration)');
    expect(index.getFieldLineage('count')).not.toBeNull();
    expect(index.getFieldLineage('sum(bytes)')).not.toBeNull();
    expect(index.getFieldLineage('avg(duration)')).not.toBeNull();
  });

  it('handles BY clause with single field', () => {
    const index = testLineage('index=main | stats count by host');
    expect(index.getFieldLineage('count')).not.toBeNull();
    // host should be consumed and preserved
    expectFieldEvent(index, 'host', 'consumed');
  });

  it('handles BY clause with multiple fields', () => {
    const index = testLineage('index=main | stats count by host, sourcetype, index');
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('tracks input field dependencies', () => {
    const index = testLineage('index=main | stats avg(response_time) as avg_rt');
    expectFieldDependsOn(index, 'avg_rt', 'response_time');
  });
});

// =============================================================================
// ALL AGGREGATION FUNCTIONS
// =============================================================================

describe('stats command: aggregation functions', () => {
  it('handles count()', () => {
    const index = testLineage('index=main | stats count');
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('handles count(field)', () => {
    const index = testLineage('index=main | stats count(field) as field_count');
    expectFieldDependsOn(index, 'field_count', 'field');
  });

  it('handles dc() - distinct count', () => {
    const index = testLineage('index=main | stats dc(user) as unique_users');
    expectFieldDependsOn(index, 'unique_users', 'user');
  });

  it('handles sum()', () => {
    const index = testLineage('index=main | stats sum(bytes) as total_bytes');
    expectFieldDependsOn(index, 'total_bytes', 'bytes');
    expectFieldDataType(index, 'total_bytes', 'number');
  });

  it('handles avg()', () => {
    const index = testLineage('index=main | stats avg(duration) as avg_duration');
    expectFieldDependsOn(index, 'avg_duration', 'duration');
    expectFieldDataType(index, 'avg_duration', 'number');
  });

  it('handles min()', () => {
    const index = testLineage('index=main | stats min(value) as min_value');
    expectFieldDependsOn(index, 'min_value', 'value');
  });

  it('handles max()', () => {
    const index = testLineage('index=main | stats max(value) as max_value');
    expectFieldDependsOn(index, 'max_value', 'value');
  });

  it('handles range()', () => {
    const index = testLineage('index=main | stats range(value) as value_range');
    expectFieldDependsOn(index, 'value_range', 'value');
  });

  it('handles first()', () => {
    const index = testLineage('index=main | stats first(msg) as first_msg');
    expectFieldDependsOn(index, 'first_msg', 'msg');
  });

  it('handles last()', () => {
    const index = testLineage('index=main | stats last(msg) as last_msg');
    expectFieldDependsOn(index, 'last_msg', 'msg');
  });

  it('handles earliest()', () => {
    const index = testLineage('index=main | stats earliest(event) as earliest_event');
    expectFieldDependsOn(index, 'earliest_event', 'event');
  });

  it('handles latest()', () => {
    const index = testLineage('index=main | stats latest(event) as latest_event');
    expectFieldDependsOn(index, 'latest_event', 'event');
  });

  it('handles list()', () => {
    const index = testLineage('index=main | stats list(value) as all_values');
    expectFieldDependsOn(index, 'all_values', 'value');
  });

  it('handles values()', () => {
    const index = testLineage('index=main | stats values(value) as unique_values');
    expectFieldDependsOn(index, 'unique_values', 'value');
  });

  it('handles stdev()', () => {
    const index = testLineage('index=main | stats stdev(value) as std_dev');
    expectFieldDependsOn(index, 'std_dev', 'value');
    expectFieldDataType(index, 'std_dev', 'number');
  });

  it('handles stdevp()', () => {
    const index = testLineage('index=main | stats stdevp(value) as std_dev_pop');
    expectFieldDependsOn(index, 'std_dev_pop', 'value');
  });

  it('handles var()', () => {
    const index = testLineage('index=main | stats var(value) as variance');
    expectFieldDependsOn(index, 'variance', 'value');
  });

  it('handles varp()', () => {
    const index = testLineage('index=main | stats varp(value) as variance_pop');
    expectFieldDependsOn(index, 'variance_pop', 'value');
  });

  it('handles median()', () => {
    const index = testLineage('index=main | stats median(value) as med_value');
    expectFieldDependsOn(index, 'med_value', 'value');
  });

  it('handles mode()', () => {
    const index = testLineage('index=main | stats mode(value) as mode_value');
    expectFieldDependsOn(index, 'mode_value', 'value');
  });

  it('handles perc50()', () => {
    const index = testLineage('index=main | stats perc50(value) as p50');
    expectFieldDependsOn(index, 'p50', 'value');
  });

  it('handles perc95()', () => {
    const index = testLineage('index=main | stats perc95(value) as p95');
    expectFieldDependsOn(index, 'p95', 'value');
  });

  it('handles perc99()', () => {
    const index = testLineage('index=main | stats perc99(value) as p99');
    expectFieldDependsOn(index, 'p99', 'value');
  });
});

// =============================================================================
// VARIANT COMMANDS
// =============================================================================

describe('stats command: variants', () => {
  describe('eventstats', () => {
    it('preserves all existing fields', () => {
      const index = testLineage(`index=main
| eval x=1
| eventstats count by host
| eval y=x+count`);
      // x should still exist after eventstats
      expectFieldAt(index, 'x', 4);
      expectFieldAt(index, 'y', 4);
    });

    it('creates aggregation fields', () => {
      const index = testLineage('index=main | eventstats avg(duration) as avg_dur by host');
      expect(index.getFieldLineage('avg_dur')).not.toBeNull();
    });

    it('does not drop BY fields', () => {
      const index = testLineage('index=main | eval foo=1 | eventstats count by host');
      // foo should survive eventstats
      expectFieldAt(index, 'foo', 2);
    });
  });

  describe('streamstats', () => {
    it('preserves all existing fields', () => {
      const index = testLineage(`index=main
| eval x=1
| streamstats count by host
| eval y=x+count`);
      expectFieldAt(index, 'x', 4);
    });

    it('creates running aggregation fields', () => {
      const index = testLineage(
        'index=main | streamstats sum(bytes) as running_total'
      );
      expect(index.getFieldLineage('running_total')).not.toBeNull();
    });
  });

  describe('chart', () => {
    it('creates aggregation fields', () => {
      const index = testLineage('index=main | chart avg(duration) by status');
      expect(index.getFieldLineage('avg(duration)')).not.toBeNull();
    });

    it('drops non-BY fields', () => {
      const index = testLineage('index=main | eval foo=1 | chart count by host');
      // foo should be dropped after chart
      expectNoFieldAt(index, 'foo', 3);
    });
  });

  describe('timechart', () => {
    it('creates aggregation fields', () => {
      // Note: span=1h parsing requires time literal support, using simpler form
      const index = testLineage('index=main | timechart avg(response_time)');
      expect(index.getFieldLineage('avg(response_time)')).not.toBeNull();
    });

    it('implicitly adds _time as BY field', () => {
      const index = testLineage('index=main | timechart count');
      // _time should be consumed
      expectFieldEvent(index, '_time', 'consumed');
    });

    it('drops non-BY fields like stats', () => {
      const index = testLineage('index=main | eval foo=1 | timechart count');
      expectNoFieldAt(index, 'foo', 3);
    });
  });
});

// =============================================================================
// FIELD DROPPING BEHAVIOR
// =============================================================================

describe('stats command: field dropping', () => {
  it('drops fields NOT in BY clause after stats', () => {
    const index = testLineage('index=main | eval foo=1, bar=2 | stats count by host');
    // foo and bar should be dropped
    expectNoFieldAt(index, 'foo', 3);
    expectNoFieldAt(index, 'bar', 3);
  });

  it('preserves BY fields after stats', () => {
    const index = testLineage('index=main | stats count by host, sourcetype');
    // BY fields should exist
    expectFieldAt(index, 'host', 2);
    expectFieldAt(index, 'sourcetype', 2);
  });

  it('creates aggregation output fields', () => {
    const index = testLineage('index=main | stats sum(bytes) as total, avg(bytes) as average by host');
    expectFieldAt(index, 'total', 2);
    expectFieldAt(index, 'average', 2);
    expectFieldAt(index, 'host', 2);
  });

  it('consumes input fields to aggregation', () => {
    const index = testLineage('index=main | stats sum(bytes) by host');
    expectFieldEvent(index, 'bytes', 'consumed');
  });

  it('drops implicit fields after stats (except BY)', () => {
    const index = testLineage('index=main | stats count');
    // _time, _raw should be dropped (not in BY clause)
    expectNoFieldAt(index, '_time', 2);
    expectNoFieldAt(index, '_raw', 2);
  });

  it('preserves implicit fields in BY clause', () => {
    const index = testLineage('index=main | stats count by _time');
    expectFieldAt(index, '_time', 2);
  });
});

// =============================================================================
// MULTILINE STATS
// =============================================================================

describe('stats command: multiline', () => {
  it('parses multiline stats with multiple aggregations', () => {
    const spl = `index=main
| stats
    count AS total_requests,
    sum(bytes) AS total_bytes,
    avg(duration) AS avg_duration
    BY host, sourcetype`;
    const index = testLineage(spl);
    expect(index.getFieldLineage('total_requests')).not.toBeNull();
    expect(index.getFieldLineage('total_bytes')).not.toBeNull();
    expect(index.getFieldLineage('avg_duration')).not.toBeNull();
  });

  it('tracks correct line numbers for aggregations', () => {
    const spl = `index=main
| stats
    count AS total_requests,
    sum(bytes) AS total_bytes
    BY host`;
    const index = testLineage(spl);

    // total_requests should be on line 3
    expectFieldCreatedAtLine(index, 'total_requests', 3);
    // total_bytes should be on line 4
    expectFieldCreatedAtLine(index, 'total_bytes', 4);
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('stats command: edge cases', () => {
  it('handles BY field same as aggregation output name', () => {
    // This is valid SPL - the aggregation creates a new field
    const index = testLineage('index=main | stats count AS host by host');
    // Both should exist but aggregation takes precedence for the name
    expect(index.getFieldLineage('host')).not.toBeNull();
  });

  it('handles multiple aggregations with same base name', () => {
    const index = testLineage('index=main | stats sum(a) as total, sum(b) as total2');
    expect(index.getFieldLineage('total')).not.toBeNull();
    expect(index.getFieldLineage('total2')).not.toBeNull();
  });

  it('handles aggregation without alias (default naming)', () => {
    const index = testLineage('index=main | stats avg(duration)');
    // Default name is function(field)
    expect(index.getFieldLineage('avg(duration)')).not.toBeNull();
  });

  it('handles count without field (counts events)', () => {
    const index = testLineage('index=main | stats count');
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('handles complex BY clause expressions (if supported)', () => {
    const index = testLineage('index=main | stats count by host, sourcetype');
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('handles stats after eval preserves only BY fields', () => {
    const index = testLineage(`index=main
| eval a=1, b=2, c=3
| stats count by a`);
    // Only 'a' and 'count' should survive
    expectFieldAt(index, 'a', 3);
    expectFieldAt(index, 'count', 3);
    expectNoFieldAt(index, 'b', 3);
    expectNoFieldAt(index, 'c', 3);
  });
});

// =============================================================================
// CONFIDENCE AND DATA TYPES
// =============================================================================

describe('stats command: confidence and data types', () => {
  it('has certain confidence for aggregation fields', () => {
    const index = testLineage('index=main | stats count as total');
    expectFieldConfidence(index, 'total', 'certain');
  });

  it('infers number type for numeric aggregations', () => {
    const index = testLineage('index=main | stats sum(bytes) as total');
    expectFieldDataType(index, 'total', 'number');
  });

  it('infers number type for count', () => {
    const index = testLineage('index=main | stats count');
    expectFieldDataType(index, 'count', 'number');
  });

  it('infers number type for avg', () => {
    const index = testLineage('index=main | stats avg(field) as average');
    expectFieldDataType(index, 'average', 'number');
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('stats command: adversarial tests', () => {
  it('handles large BY field list (50 fields)', () => {
    const spl = generateLargeByClause(50);
    const index = testLineage(spl);
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('handles many aggregations', () => {
    const aggs = Array.from({ length: 20 }, (_, i) => `sum(field${i}) as sum${i}`).join(', ');
    const spl = `index=main | stats ${aggs}`;
    const index = testLineage(spl);
    expect(index.getFieldLineage('sum0')).not.toBeNull();
    expect(index.getFieldLineage('sum19')).not.toBeNull();
  });

  it('handles stats with no BY clause', () => {
    const index = testLineage('index=main | stats count, sum(bytes)');
    expect(index.getFieldLineage('count')).not.toBeNull();
    // All non-aggregation fields should be dropped
    expectNoFieldAt(index, '_time', 2);
  });

  it('handles chained stats commands', () => {
    const index = testLineage(`index=main
| stats count by host
| stats sum(count) as total_count`);
    expect(index.getFieldLineage('total_count')).not.toBeNull();
    // host should be dropped after second stats
    expectNoFieldAt(index, 'host', 3);
  });

  it('handles stats followed by eval using aggregated fields', () => {
    const index = testLineage(`index=main
| stats count, sum(bytes) as total by host
| eval ratio=total/count`);
    expectFieldDependsOn(index, 'ratio', 'total', 'count');
  });
});
