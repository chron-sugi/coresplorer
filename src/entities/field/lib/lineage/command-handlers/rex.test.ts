/**
 * Rex Command Handler Tests
 *
 * Comprehensive tests for the rex command handler including:
 * - Basic functionality
 * - Multiple capture groups
 * - Source field handling
 * - Edge cases
 * - Confidence levels
 * - Adversarial tests
 *
 * @module features/field-lineage/lib/command-handlers/rex.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldAt,
  expectFieldDependsOn,
  expectFieldDataType,
  expectFieldConfidence,
} from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

describe('rex command: basic functionality', () => {
  it('creates field from single capture group', () => {
    const index = testLineage('index=main | rex field=_raw "status=(?<status>\\d+)"');
    expect(index.getFieldLineage('status')).not.toBeNull();
    expectFieldEvent(index, 'status', 'created');
  });

  it('tracks dependency on source field', () => {
    const index = testLineage('index=main | rex field=_raw "(?<value>\\d+)"');
    expectFieldDependsOn(index, 'value', '_raw');
  });

  it('consumes the source field', () => {
    const index = testLineage('index=main | rex field=message "(?<code>\\w+)"');
    expectFieldEvent(index, 'message', 'consumed');
  });

  it('uses _raw as default source field', () => {
    const index = testLineage('index=main | rex "(?<field>\\w+)"');
    expectFieldDependsOn(index, 'field', '_raw');
  });

  it('infers string data type for extracted fields', () => {
    const index = testLineage('index=main | rex field=_raw "(?<value>.*)"');
    expectFieldDataType(index, 'value', 'string');
  });
});

// =============================================================================
// MULTIPLE CAPTURE GROUPS
// =============================================================================

describe('rex command: multiple capture groups', () => {
  it('creates fields for all named capture groups', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<method>\\w+)\\s+(?<path>\\S+)\\s+HTTP"'
    );
    expect(index.getFieldLineage('method')).not.toBeNull();
    expect(index.getFieldLineage('path')).not.toBeNull();
  });

  it('all extracted fields depend on source field', () => {
    const index = testLineage(
      'index=main | rex field=log "(?<timestamp>\\S+)\\s+(?<level>\\w+)\\s+(?<message>.*)"'
    );
    expectFieldDependsOn(index, 'timestamp', 'log');
    expectFieldDependsOn(index, 'level', 'log');
    expectFieldDependsOn(index, 'message', 'log');
  });

  it('handles HTTP log pattern', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<method>\\w+)\\s+(?<url>\\S+)\\s+HTTP/(?<version>[\\d.]+)"'
    );
    expect(index.getFieldLineage('method')).not.toBeNull();
    expect(index.getFieldLineage('url')).not.toBeNull();
    expect(index.getFieldLineage('version')).not.toBeNull();
  });

  it('handles key-value extraction pattern', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<key>\\w+)=(?<value>[^\\s]+)"'
    );
    expect(index.getFieldLineage('key')).not.toBeNull();
    expect(index.getFieldLineage('value')).not.toBeNull();
  });
});

// =============================================================================
// CUSTOM SOURCE FIELDS
// =============================================================================

describe('rex command: source field handling', () => {
  it('handles custom source field', () => {
    const index = testLineage('index=main | rex field=message "error: (?<error>.*)"');
    expectFieldDependsOn(index, 'error', 'message');
  });

  it('handles implicit field as source', () => {
    const index = testLineage('index=main | rex field=source "(?<path>[^/]+)$"');
    expectFieldDependsOn(index, 'path', 'source');
  });

  it('handles user-created field as source', () => {
    const index = testLineage(`index=main
| eval combined=host."-".sourcetype
| rex field=combined "(?<part1>\\w+)-(?<part2>\\w+)"`);
    expectFieldDependsOn(index, 'part1', 'combined');
    expectFieldDependsOn(index, 'part2', 'combined');
  });

  it('handles renamed field as source', () => {
    const index = testLineage(`index=main
| rename _raw AS raw_data
| rex field=raw_data "(?<extracted>\\d+)"`);
    expectFieldDependsOn(index, 'extracted', 'raw_data');
  });
});

// =============================================================================
// CONFIDENCE LEVELS
// =============================================================================

describe('rex command: confidence levels', () => {
  it('has likely confidence for rex-extracted fields', () => {
    const index = testLineage('index=main | rex field=_raw "(?<value>\\d+)"');
    expectFieldConfidence(index, 'value', 'likely');
  });

  it('has likely confidence because extraction depends on pattern match', () => {
    const index = testLineage(
      'index=main | rex field=log "(?<status>\\d{3})"'
    );
    // Fields are created only if pattern matches at runtime
    expectFieldConfidence(index, 'status', 'likely');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('rex command: edge cases', () => {
  it('handles pattern with no capture groups (no fields created)', () => {
    const index = testLineage('index=main | rex field=_raw "pattern"');
    // No named groups = no fields created
    // The command should still parse successfully
    expect(index).not.toBeNull();
  });

  it('handles complex regex with alternation', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<status>OK|ERROR|WARN)"'
    );
    expect(index.getFieldLineage('status')).not.toBeNull();
  });

  it('handles regex with quantifiers', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<digits>\\d+)"'
    );
    expect(index.getFieldLineage('digits')).not.toBeNull();
  });

  it('handles non-greedy quantifiers', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<content>.*?)"'
    );
    expect(index.getFieldLineage('content')).not.toBeNull();
  });

  it('handles regex with character classes', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<hex>[0-9a-fA-F]+)"'
    );
    expect(index.getFieldLineage('hex')).not.toBeNull();
  });

  it('handles regex with escaped characters', () => {
    const index = testLineage(
      'index=main | rex field=_raw "path=(?<path>[^\\"]+)"'
    );
    expect(index.getFieldLineage('path')).not.toBeNull();
  });

  it('handles field name with numbers', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<field123>\\d+)"'
    );
    expect(index.getFieldLineage('field123')).not.toBeNull();
  });

  it('handles underscore-prefixed capture group name', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<_custom>\\w+)"'
    );
    expect(index.getFieldLineage('_custom')).not.toBeNull();
  });
});

// =============================================================================
// INTERACTION WITH OTHER COMMANDS
// =============================================================================

describe('rex command: interactions', () => {
  it('works with eval after rex', () => {
    const index = testLineage(`index=main
| rex field=_raw "status=(?<status>\\d+)"
| eval status_num=tonumber(status)`);
    expectFieldDependsOn(index, 'status_num', 'status');
  });

  it('works with stats after rex', () => {
    const index = testLineage(`index=main
| rex field=_raw "status=(?<status>\\d+)"
| stats count by status`);
    expectFieldEvent(index, 'status', 'consumed');
  });

  it('works with table after rex', () => {
    const index = testLineage(`index=main
| rex field=_raw "(?<method>\\w+)\\s+(?<url>\\S+)"
| table method, url, _time`);
    expectFieldAt(index, 'method', 3);
    expectFieldAt(index, 'url', 3);
  });

  it('works with rename after rex', () => {
    const index = testLineage(`index=main
| rex field=_raw "(?<extracted>\\d+)"
| rename extracted AS value`);
    expectFieldAt(index, 'value', 3);
  });

  it('works with multiple rex commands in pipeline', () => {
    const index = testLineage(`index=main
| rex field=_raw "method=(?<method>\\w+)"
| rex field=_raw "status=(?<status>\\d+)"
| rex field=_raw "duration=(?<duration>[\\d.]+)"`);
    expect(index.getFieldLineage('method')).not.toBeNull();
    expect(index.getFieldLineage('status')).not.toBeNull();
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });

  it('rex on eval-created field', () => {
    const index = testLineage(`index=main
| eval combined=_raw."|".host
| rex field=combined "(?<part>\\w+)\\|"`);
    expectFieldDependsOn(index, 'part', 'combined');
  });
});

// =============================================================================
// EXPRESSION TRACKING
// =============================================================================

describe('rex command: expression tracking', () => {
  it('captures rex expression in event', () => {
    const index = testLineage('index=main | rex field=_raw "(?<value>\\d+)"');
    const lineage = index.getFieldLineage('value');
    const created = lineage?.events.find((e) => e.kind === 'created');
    expect(created?.expression).toBeDefined();
    expect(created?.expression).toContain('rex');
    expect(created?.expression).toContain('_raw');
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('rex command: adversarial tests', () => {
  it('handles many capture groups', () => {
    const groups = Array.from({ length: 10 }, (_, i) => `(?<field${i}>\\w+)`).join('\\s+');
    const index = testLineage(`index=main | rex field=_raw "${groups}"`);
    expect(index.getFieldLineage('field0')).not.toBeNull();
    expect(index.getFieldLineage('field9')).not.toBeNull();
  });

  it('handles very long pattern', () => {
    const longPattern = `(?<field>${'\\w+'.repeat(50)})`;
    const index = testLineage(`index=main | rex field=_raw "${longPattern}"`);
    expect(index.getFieldLineage('field')).not.toBeNull();
  });

  it('handles complex real-world log pattern', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z)\\s+\\[(?<level>\\w+)\\]\\s+(?<logger>[\\w.]+)\\s+-\\s+(?<message>.*)"'
    );
    expect(index.getFieldLineage('timestamp')).not.toBeNull();
    expect(index.getFieldLineage('level')).not.toBeNull();
    expect(index.getFieldLineage('logger')).not.toBeNull();
    expect(index.getFieldLineage('message')).not.toBeNull();
  });

  it('handles nested groups (only named ones should be extracted)', () => {
    const index = testLineage(
      'index=main | rex field=_raw "(?<outer>(?:\\w+)-(?<inner>\\d+))"'
    );
    // Both named groups should be extracted
    expect(index.getFieldLineage('outer')).not.toBeNull();
    expect(index.getFieldLineage('inner')).not.toBeNull();
  });

  it('handles rex in complex pipeline', () => {
    const index = testLineage(`index=main
| rex field=_raw "(?<method>\\w+)\\s+(?<url>\\S+)"
| eval is_get=if(method="GET", 1, 0)
| stats count, sum(is_get) as gets by url
| where count > 10`);
    expect(index.getFieldLineage('gets')).not.toBeNull();
  });
});
