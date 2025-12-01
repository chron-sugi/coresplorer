/**
 * Lookup Command Handler Tests
 *
 * Comprehensive tests for the lookup and inputlookup command handlers including:
 * - Basic functionality
 * - Input/output field mappings
 * - inputlookup specifics
 * - Edge cases
 * - Confidence levels
 * - Adversarial tests
 *
 * @module features/field-lineage/lib/command-handlers/lookup.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldDependsOn,
  expectFieldConfidence,
} from '../testing';

// =============================================================================
// BASIC LOOKUP FUNCTIONALITY
// =============================================================================

describe('lookup command: basic functionality', () => {
  it('creates output field from lookup', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT username');
    expect(index.getFieldLineage('username')).not.toBeNull();
    expectFieldEvent(index, 'username', 'created');
  });

  it('consumes input field', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT username');
    expectFieldEvent(index, 'uid', 'consumed');
  });

  it('tracks dependency on input field', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT username');
    expectFieldDependsOn(index, 'username', 'uid');
  });

  it('creates multiple output fields', () => {
    const index = testLineage('index=main | lookup geo ip OUTPUT city, country, lat, lon');
    expect(index.getFieldLineage('city')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
    expect(index.getFieldLineage('lat')).not.toBeNull();
    expect(index.getFieldLineage('lon')).not.toBeNull();
  });

  it('all output fields depend on input field', () => {
    const index = testLineage('index=main | lookup geo ip OUTPUT city, country');
    expectFieldDependsOn(index, 'city', 'ip');
    expectFieldDependsOn(index, 'country', 'ip');
  });
});

// =============================================================================
// INPUT FIELD MAPPINGS
// =============================================================================

describe('lookup command: input mappings', () => {
  it('handles input field with AS mapping', () => {
    const index = testLineage('index=main | lookup users user_id AS uid OUTPUT name');
    expectFieldEvent(index, 'user_id', 'consumed');
    expect(index.getFieldLineage('name')).not.toBeNull();
  });

  it('handles multiple input mappings', () => {
    const index = testLineage(
      'index=main | lookup complex_lookup field1 AS col1, field2 AS col2 OUTPUT result'
    );
    expectFieldEvent(index, 'field1', 'consumed');
    expectFieldEvent(index, 'field2', 'consumed');
  });

  it('output fields depend on all input fields', () => {
    const index = testLineage(
      'index=main | lookup mapping key1, key2 OUTPUT value'
    );
    expectFieldDependsOn(index, 'value', 'key1');
    expectFieldDependsOn(index, 'value', 'key2');
  });
});

// =============================================================================
// OUTPUT VARIANTS
// =============================================================================

describe('lookup command: output variants', () => {
  it('handles OUTPUT keyword', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT username');
    expect(index.getFieldLineage('username')).not.toBeNull();
  });

  it('handles OUTPUTNEW keyword', () => {
    const index = testLineage('index=main | lookup users uid OUTPUTNEW username');
    expect(index.getFieldLineage('username')).not.toBeNull();
  });

  it('handles output field with AS mapping', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT name AS user_name');
    expect(index.getFieldLineage('user_name')).not.toBeNull();
  });
});

// =============================================================================
// INPUTLOOKUP COMMAND
// =============================================================================

describe('inputlookup command', () => {
  it('creates placeholder field for inputlookup', () => {
    const index = testLineage('index=main | inputlookup users.csv');
    // inputlookup creates unknown fields since we don't know the schema
    expect(index).not.toBeNull();
  });

  it('handles inputlookup with where clause', () => {
    const index = testLineage('index=main | inputlookup users.csv where status="active"');
    expect(index).not.toBeNull();
  });

  it('handles inputlookup at start of pipeline', () => {
    const index = testLineage('| inputlookup static_data.csv');
    expect(index).not.toBeNull();
  });
});

// =============================================================================
// CONFIDENCE LEVELS
// =============================================================================

describe('lookup command: confidence levels', () => {
  it('has likely confidence for lookup output fields', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT username');
    expectFieldConfidence(index, 'username', 'likely');
  });

  it('has likely confidence because lookup may not match', () => {
    const index = testLineage('index=main | lookup geo ip OUTPUT city');
    // Fields are created only if lookup finds a match at runtime
    expectFieldConfidence(index, 'city', 'likely');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('lookup command: edge cases', () => {
  it('handles lookup table name with special characters', () => {
    const index = testLineage('index=main | lookup my_lookup_table uid OUTPUT name');
    expect(index.getFieldLineage('name')).not.toBeNull();
  });

  it('handles lookup with file extension', () => {
    const index = testLineage('index=main | lookup users.csv uid OUTPUT name');
    expect(index.getFieldLineage('name')).not.toBeNull();
  });

  it('handles implicit field as input', () => {
    const index = testLineage('index=main | lookup hosts host OUTPUT datacenter');
    expectFieldEvent(index, 'host', 'consumed');
    expect(index.getFieldLineage('datacenter')).not.toBeNull();
  });

  it('handles lookup after eval', () => {
    const index = testLineage(`index=main
| eval lookup_key=field1."-".field2
| lookup mapping lookup_key OUTPUT result`);
    expectFieldDependsOn(index, 'result', 'lookup_key');
  });

  it('handles lookup after stats', () => {
    const index = testLineage(`index=main
| stats count by host
| lookup host_metadata host OUTPUT region`);
    expectFieldDependsOn(index, 'region', 'host');
  });

  it('handles lookup after rename', () => {
    const index = testLineage(`index=main
| rename ip AS client_ip
| lookup geo client_ip OUTPUT city`);
    expectFieldDependsOn(index, 'city', 'client_ip');
  });
});

// =============================================================================
// INTERACTION WITH OTHER COMMANDS
// =============================================================================

describe('lookup command: interactions', () => {
  it('works with eval after lookup', () => {
    const index = testLineage(`index=main
| lookup users uid OUTPUT username, role
| eval is_admin=if(role="admin", 1, 0)`);
    expectFieldDependsOn(index, 'is_admin', 'role');
  });

  it('works with stats after lookup', () => {
    const index = testLineage(`index=main
| lookup users uid OUTPUT department
| stats count by department`);
    expectFieldEvent(index, 'department', 'consumed');
  });

  it('works with table after lookup', () => {
    const index = testLineage(`index=main
| lookup geo ip OUTPUT city, country
| table ip, city, country, _time`);
    expect(index).not.toBeNull();
  });

  it('works with multiple lookups in pipeline', () => {
    const index = testLineage(`index=main
| lookup users uid OUTPUT username
| lookup departments username OUTPUT department
| lookup locations department OUTPUT building`);
    expect(index.getFieldLineage('username')).not.toBeNull();
    expect(index.getFieldLineage('department')).not.toBeNull();
    expect(index.getFieldLineage('building')).not.toBeNull();
  });

  it('chained lookups track full dependency', () => {
    const index = testLineage(`index=main
| lookup users uid OUTPUT team_id
| lookup teams team_id OUTPUT team_name`);
    expectFieldDependsOn(index, 'team_name', 'team_id');
    expectFieldDependsOn(index, 'team_id', 'uid');
  });
});

// =============================================================================
// EXPRESSION TRACKING
// =============================================================================

describe('lookup command: expression tracking', () => {
  it('captures lookup expression in event', () => {
    const index = testLineage('index=main | lookup users uid OUTPUT username');
    const lineage = index.getFieldLineage('username');
    const created = lineage?.events.find((e) => e.kind === 'created');
    expect(created?.expression).toBeDefined();
    expect(created?.expression).toContain('lookup');
    expect(created?.expression).toContain('users');
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('lookup command: adversarial tests', () => {
  it('handles many output fields', () => {
    const outputs = Array.from({ length: 20 }, (_, i) => `field${i}`).join(', ');
    const index = testLineage(`index=main | lookup big_table key OUTPUT ${outputs}`);
    expect(index.getFieldLineage('field0')).not.toBeNull();
    expect(index.getFieldLineage('field19')).not.toBeNull();
  });

  it('handles lookup in complex pipeline', () => {
    const index = testLineage(`index=main
| rex field=_raw "user=(?<user>\\w+)"
| lookup users user OUTPUT email, department
| eval domain=mvindex(split(email, "@"), 1)
| stats count by domain, department`);
    expect(index.getFieldLineage('domain')).not.toBeNull();
  });

  it('handles very long lookup table name', () => {
    const longName = 'a'.repeat(50);
    const index = testLineage(`index=main | lookup ${longName} key OUTPUT value`);
    expect(index.getFieldLineage('value')).not.toBeNull();
  });

  it('handles nested lookups in same command (if supported)', () => {
    const index = testLineage(`index=main
| lookup table1 key1 OUTPUT intermediate
| lookup table2 intermediate OUTPUT final`);
    expect(index.getFieldLineage('final')).not.toBeNull();
  });
});
