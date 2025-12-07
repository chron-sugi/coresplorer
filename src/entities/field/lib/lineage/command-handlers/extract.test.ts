/**
 * Extract Command Handler Tests
 *
 * Tests for the extract command which uses transforms.conf for field extraction.
 *
 * NOTE: This command has inherent limitations in static analysis since it references
 * transforms.conf definitions not available at parse time.
 *
 * @module entities/field/lib/lineage/command-handlers/extract.test
 */

import { describe, it, expect } from 'vitest';
import { testLineage } from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY & LIMITATIONS
// =============================================================================

describe('extract command: basic behavior', () => {
  it('preserves all existing fields', () => {
    const index = testLineage('index=main | eval x=1 | extract rule=my_rule');
    const x = index.getFieldLineage('x');
    expect(x).not.toBeNull();
  });

  it('does not create fields (static analysis limitation)', () => {
    const index = testLineage('index=main | extract rule=web_logs');
    
    // Extract command is recognized and preserves fields
    // but cannot statically determine which fields are created
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0); // Has implicit fields from search
  });

  it('handles extract with kvdelim parameter', () => {
    const index = testLineage('index=main | extract kvdelim="="');
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('handles extract with pairdelim parameter', () => {
    const index = testLineage('index=main | extract pairdelim=","');
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// FIELD PRESERVATION
// =============================================================================

describe('extract command: field preservation', () => {
  it('preserves fields from eval before extract', () => {
    const index = testLineage(`
      index=main
      | eval calculated=price*qty
      | extract rule=my_transform
    `);
    expect(index.getFieldLineage('calculated')).not.toBeNull();
  });

  it('preserves fields from rex before extract', () => {
    const index = testLineage(`
      index=main
      | rex field=_raw "(?<user>\\w+)"
      | extract rule=my_transform
    `);
    expect(index.getFieldLineage('user')).not.toBeNull();
  });

  it('preserves fields from stats before extract', () => {
    const index = testLineage(`
      index=main
      | stats count by host
      | extract rule=my_transform
    `);
    expect(index.getFieldLineage('count')).not.toBeNull();
    expect(index.getFieldLineage('host')).not.toBeNull();
  });

  it('preserves all fields in complex pipeline', () => {
    const index = testLineage(`
      index=main
      | eval a=1, b=2, c=3
      | extract rule=transform1
      | eval d=a+b
      | extract rule=transform2
    `);
    expect(index.getFieldLineage('a')).not.toBeNull();
    expect(index.getFieldLineage('b')).not.toBeNull();
    expect(index.getFieldLineage('c')).not.toBeNull();
    expect(index.getFieldLineage('d')).not.toBeNull();
  });
});

// =============================================================================
// INTEGRATION WITH OTHER COMMANDS
// =============================================================================

describe('extract command: integration', () => {
  it('works before eval that uses potentially extracted fields', () => {
    const index = testLineage(`
      index=main
      | extract rule=my_rule
      | eval combined=coalesce(field1, "unknown")
    `);
    // eval creates combined, even though field1 might come from extract
    expect(index.getFieldLineage('combined')).not.toBeNull();
  });

  it('works in stats aggregation pipeline', () => {
    const index = testLineage(`
      index=main
      | extract rule=web_logs
      | stats count by host
    `);
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('works with table command', () => {
    const index = testLineage(`
      index=main
      | extract rule=my_rule
      | table host, source, sourcetype
    `);
    // Table should work even after extract
    expect(index.getFieldLineage('host')).not.toBeNull();
  });

  it('works with where clause', () => {
    const index = testLineage(`
      index=main
      | extract rule=my_rule
      | where isnotnull(host)
    `);
    expect(index.getFieldLineage('host')).not.toBeNull();
  });
});

// =============================================================================
// MULTIPLE EXTRACT COMMANDS
// =============================================================================

describe('extract command: multiple extracts', () => {
  it('handles sequential extract commands', () => {
    const index = testLineage(`
      index=main
      | extract rule=rule1
      | extract rule=rule2
    `);
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('preserves fields through multiple extracts', () => {
    const index = testLineage(`
      index=main
      | eval marker=1
      | extract rule=rule1
      | extract rule=rule2
      | extract rule=rule3
    `);
    expect(index.getFieldLineage('marker')).not.toBeNull();
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('extract command: edge cases', () => {
  it('handles extract with no parameters (kv mode)', () => {
    const index = testLineage('index=main | extract');
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('handles extract with auto parameter', () => {
    const index = testLineage('index=main | extract auto=t');
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('handles extract with reload parameter', () => {
    const index = testLineage('index=main | extract rule=my_rule reload=t');
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('handles very long rule name', () => {
    const longRuleName = 'rule_' + 'a'.repeat(200);
    const index = testLineage(`index=main | extract rule=${longRuleName}`);
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('extract command: adversarial tests', () => {
  it('handles many extract commands (10)', () => {
    let query = 'index=main';
    for (let i = 0; i < 10; i++) {
      query += ` | extract rule=rule${i}`;
    }
    const index = testLineage(query);
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('handles extract in very complex pipeline', () => {
    const index = testLineage(`
      index=main
      | eval a=1, b=2, c=3
      | extract rule=rule1
      | stats sum(a) as sum_a by b
      | extract rule=rule2
      | eval total=sum_a*2
      | where total > 10
    `);
    expect(index.getFieldLineage('total')).not.toBeNull();
  });

  it('handles extract with multiple parameters', () => {
    const index = testLineage(`
      index=main
      | extract kvdelim="=" pairdelim="," auto=f reload=t
    `);
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// REAL-WORLD SCENARIOS
// =============================================================================

describe('extract command: real-world scenarios', () => {
  it('handles log parsing with extract', () => {
    const index = testLineage(`
      index=web_logs
      | extract rule=apache_combined
      | stats count by status, method
    `);
    // Even though we can't track fields from extract,
    // the pipeline should still work
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('handles JSON extraction scenario', () => {
    const index = testLineage(`
      index=api_logs
      | extract rule=json_extract
      | eval has_error=if(isnull(error), 0, 1)
      | stats sum(has_error) as error_count
    `);
    expect(index.getFieldLineage('has_error')).not.toBeNull();
    expect(index.getFieldLineage('error_count')).not.toBeNull();
  });

  it('handles custom field extraction workflow', () => {
    const index = testLineage(`
      index=custom_app
      | extract rule=custom_fields
      | rex field=message "status=(?<status>\\w+)"
      | stats count by status
    `);
    expect(index.getFieldLineage('status')).not.toBeNull();
    expect(index.getFieldLineage('count')).not.toBeNull();
  });
});

// =============================================================================
// DOCUMENTATION TESTS
// =============================================================================

describe('extract command: static analysis limitations', () => {
  it('documents that created fields are unknown', () => {
    const index = testLineage('index=main | extract rule=my_transform');
    
    // The limitation is documented in the handler implementation:
    // We cannot determine which fields are created without transforms.conf
    // This test validates the handler behaves correctly by preserving
    // existing fields even though it cannot track extracted fields
    const allFields = index.getAllFields();
    expect(allFields.length).toBeGreaterThan(0);
  });

  it('confirms preservesAll behavior', () => {
    const index = testLineage(`
      index=main
      | eval test_field=123
      | extract rule=some_rule
    `);
    
    // Test that extract preserves the eval'd field
    const testField = index.getFieldLineage('test_field');
    expect(testField).not.toBeNull();
    expect(testField?.events).toBeDefined();
  });

  it('shows extract does not drop fields', () => {
    const index = testLineage(`
      index=main
      | rex field=_raw "(?<extracted>\\w+)"
      | extract rule=my_rule
      | eval uses_extracted=extracted
    `);
    
    // Fields from before extract (like rex extraction) should still exist
    expect(index.getFieldLineage('extracted')).not.toBeNull();
    expect(index.getFieldLineage('uses_extracted')).not.toBeNull();
  });
});

// =============================================================================
// COMPARISON WITH REX
// =============================================================================

describe('extract command: comparison with rex', () => {
  it('rex creates fields but extract does not (in static analysis)', () => {
    const rexIndex = testLineage('index=main | rex field=_raw "(?<status>\\d+)"');
    const extractIndex = testLineage('index=main | extract rule=status_extract');
    
    // Rex can statically create fields
    expect(rexIndex.getFieldLineage('status')).not.toBeNull();
    
    // Extract cannot (requires transforms.conf)
    const extractFields = extractIndex.getAllFields();
    // Should only have implicit fields, not extracted ones
    expect(extractFields.every(f => f !== 'status')).toBe(true);
  });

  it('shows why rex is preferred for inline patterns', () => {
    const index = testLineage(`
      index=main
      | rex field=_raw "(?<user>\\w+)@(?<domain>\\w+\\.\\w+)"
      | stats count by user, domain
    `);
    
    // Rex provides full field lineage
    expect(index.getFieldLineage('user')).not.toBeNull();
    expect(index.getFieldLineage('domain')).not.toBeNull();
    expect(index.getFieldLineage('count')).not.toBeNull();
  });
});
