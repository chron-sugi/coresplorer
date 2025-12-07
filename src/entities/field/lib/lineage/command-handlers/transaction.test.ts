/**
 * Transaction Command Handler Tests
 *
 * Tests for the transaction command which groups events and creates implicit fields.
 *
 * @module entities/field/lib/lineage/command-handlers/transaction.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldDataType,
  expectFieldConfidence,
} from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

describe('transaction command: basic functionality', () => {
  it('creates duration implicit field', () => {
    const index = testLineage('index=main | transaction sessionid');
    const duration = index.getFieldLineage('duration');
    expect(duration).not.toBeNull();
    expectFieldEvent(index, 'duration', 'created');
  });

  it('creates eventcount implicit field', () => {
    const index = testLineage('index=main | transaction sessionid');
    const eventcount = index.getFieldLineage('eventcount');
    expect(eventcount).not.toBeNull();
    expectFieldEvent(index, 'eventcount', 'created');
  });

  it('consumes grouping field', () => {
    const index = testLineage('index=main | transaction user');
    const user = index.getFieldLineage('user');
    expect(user).not.toBeNull();
  });

  it('preserves all existing fields', () => {
    const index = testLineage('index=main | eval x=1 | transaction sessionid');
    const x = index.getFieldLineage('x');
    expect(x).not.toBeNull();
  });
});

// =============================================================================
// MULTIPLE GROUPING FIELDS
// =============================================================================

describe('transaction command: multiple grouping fields', () => {
  it('handles two grouping fields', () => {
    const index = testLineage('index=main | transaction user, host');
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('eventcount')).not.toBeNull();
    expect(index.getFieldLineage('user')).not.toBeNull();
    expect(index.getFieldLineage('host')).not.toBeNull();
  });

  it('handles three grouping fields', () => {
    const index = testLineage('index=main | transaction src_ip, dest_ip, port');
    const duration = index.getFieldLineage('duration');
    expect(duration).not.toBeNull();
  });

  it('handles many grouping fields (10)', () => {
    const fields = Array.from({ length: 10 }, (_, i) => `field${i}`).join(', ');
    const index = testLineage(`index=main | transaction ${fields}`);
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('eventcount')).not.toBeNull();
  });
});

// =============================================================================
// DATA TYPES
// =============================================================================

describe('transaction command: data types', () => {
  it('infers number type for duration', () => {
    const index = testLineage('index=main | transaction sessionid');
    expectFieldDataType(index, 'duration', 'number');
  });

  it('infers number type for eventcount', () => {
    const index = testLineage('index=main | transaction sessionid');
    expectFieldDataType(index, 'eventcount', 'number');
  });
});

// =============================================================================
// CONFIDENCE LEVELS
// =============================================================================

describe('transaction command: confidence levels', () => {
  it('has certain confidence for duration', () => {
    const index = testLineage('index=main | transaction user');
    expectFieldConfidence(index, 'duration', 'certain');
  });

  it('has certain confidence for eventcount', () => {
    const index = testLineage('index=main | transaction user');
    expectFieldConfidence(index, 'eventcount', 'certain');
  });
});

// =============================================================================
// INTEGRATION WITH OTHER COMMANDS
// =============================================================================

describe('transaction command: integration', () => {
  it('works after eval creates grouping field', () => {
    const index = testLineage(`
      index=main
      | eval session=user + "_" + host
      | transaction session
    `);
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('session')).not.toBeNull();
  });

  it('created fields can be used in subsequent eval', () => {
    const index = testLineage(`
      index=main
      | transaction sessionid
      | eval avg_per_event=duration/eventcount
    `);
    const avgPerEvent = index.getFieldLineage('avg_per_event');
    expect(avgPerEvent).not.toBeNull();
  });

  it('works in stats aggregation', () => {
    const index = testLineage(`
      index=main
      | transaction user
      | stats avg(duration) as avg_duration by user
    `);
    expect(index.getFieldLineage('avg_duration')).not.toBeNull();
  });

  it('works with where to filter transactions', () => {
    const index = testLineage(`
      index=main
      | transaction sessionid
      | where duration > 60
    `);
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });

  it('works with table to select specific fields', () => {
    const index = testLineage(`
      index=main
      | transaction user
      | table user, duration, eventcount
    `);
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('eventcount')).not.toBeNull();
  });
});

// =============================================================================
// CHAINED TRANSACTIONS
// =============================================================================

describe('transaction command: chained transactions', () => {
  it('handles sequential transactions on different fields', () => {
    const index = testLineage(`
      index=main
      | transaction user
      | transaction host
    `);
    // Second transaction should create new duration/eventcount
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('eventcount')).not.toBeNull();
  });

  it('preserves fields through multiple transactions', () => {
    const index = testLineage(`
      index=main
      | eval flag=1
      | transaction user
      | transaction sessionid
    `);
    expect(index.getFieldLineage('flag')).not.toBeNull();
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('transaction command: edge cases', () => {
  it('handles field with underscores', () => {
    const index = testLineage('index=main | transaction session_id');
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });

  it('handles field with numbers', () => {
    const index = testLineage('index=main | transaction user123');
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });

  it('handles very long field name', () => {
    const longFieldName = 'field_' + 'a'.repeat(200);
    const index = testLineage(`index=main | transaction ${longFieldName}`);
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });

  it('handles single-character field name', () => {
    const index = testLineage('index=main | transaction x');
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('transaction command: adversarial tests', () => {
  it('handles transaction in complex pipeline', () => {
    const index = testLineage(`
      index=web
      | eval user=coalesce(username, "guest")
      | transaction user startswith="login" endswith="logout"
      | eval session_minutes=duration/60
      | stats avg(session_minutes) as avg_session by user
      | where avg_session > 5
    `);
    expect(index.getFieldLineage('session_minutes')).not.toBeNull();
    expect(index.getFieldLineage('avg_session')).not.toBeNull();
  });

  it('handles very large grouping field list (20 fields)', () => {
    const fields = Array.from({ length: 20 }, (_, i) => `f${i}`).join(', ');
    const index = testLineage(`index=main | transaction ${fields}`);
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('eventcount')).not.toBeNull();
  });

  it('handles transaction with field names containing special patterns', () => {
    const index = testLineage('index=main | transaction field_with_underscores');
    expect(index.getFieldLineage('duration')).not.toBeNull();
  });

  it('handles multiple transactions in deeply nested pipeline', () => {
    const index = testLineage(`
      index=main
      | eval a=1
      | transaction user
      | eval b=duration*2
      | transaction host
      | eval c=eventcount+1
    `);
    expect(index.getFieldLineage('c')).not.toBeNull();
  });
});

// =============================================================================
// REAL-WORLD SCENARIOS
// =============================================================================

describe('transaction command: real-world scenarios', () => {
  it('handles user session analysis', () => {
    const index = testLineage(`
      index=web_logs
      | transaction sessionid maxspan=30m
      | eval long_session=if(duration>1800, 1, 0)
      | stats sum(long_session) as long_sessions, avg(duration) as avg_duration
    `);
    expect(index.getFieldLineage('long_session')).not.toBeNull();
    expect(index.getFieldLineage('long_sessions')).not.toBeNull();
  });

  it('handles application transaction tracking', () => {
    const index = testLineage(`
      index=app
      | transaction request_id startswith="START" endswith="END"
      | eval error=if(searchmatch("ERROR"), 1, 0)
      | stats sum(error) as errors, avg(eventcount) as avg_events by app
    `);
    expect(index.getFieldLineage('error')).not.toBeNull();
    expect(index.getFieldLineage('errors')).not.toBeNull();
    expect(index.getFieldLineage('avg_events')).not.toBeNull();
  });

  it('handles security event correlation', () => {
    const index = testLineage(`
      index=security
      | transaction src_ip, dest_ip maxspan=1h
      | eval suspicious=if(eventcount>100 OR duration>3600, 1, 0)
      | where suspicious=1
      | stats count by src_ip, dest_ip
    `);
    expect(index.getFieldLineage('suspicious')).not.toBeNull();
  });

  it('handles network flow analysis', () => {
    const index = testLineage(`
      index=network
      | transaction flow_id
      | eval bytes_per_second=bytes/duration
      | eval events_per_second=eventcount/duration
      | stats avg(bytes_per_second) as avg_bps, avg(events_per_second) as avg_eps
    `);
    expect(index.getFieldLineage('bytes_per_second')).not.toBeNull();
    expect(index.getFieldLineage('events_per_second')).not.toBeNull();
  });

  it('handles e-commerce transaction analysis', () => {
    const index = testLineage(`
      index=ecommerce
      | transaction cart_id startswith="cart_created" endswith="purchase"
      | eval abandoned=if(searchmatch("purchase"), 0, 1)
      | stats sum(abandoned) as abandoned_carts, avg(duration) as avg_time_to_purchase
    `);
    expect(index.getFieldLineage('abandoned')).not.toBeNull();
    expect(index.getFieldLineage('abandoned_carts')).not.toBeNull();
  });
});

// =============================================================================
// IMPLICIT FIELD INDEPENDENCE
// =============================================================================

describe('transaction command: implicit field properties', () => {
  it('duration and eventcount have no field dependencies', () => {
    const index = testLineage('index=main | transaction sessionid');
    const duration = index.getFieldLineage('duration');
    const eventcount = index.getFieldLineage('eventcount');
    
    expect(duration).not.toBeNull();
    expect(eventcount).not.toBeNull();
    
    // These are implicit fields calculated by transaction, not derived from other fields
    if (duration?.events?.[0]) {
      expect(duration.events[0].dependsOn || []).toHaveLength(0);
    }
    if (eventcount?.events?.[0]) {
      expect(eventcount.events[0].dependsOn || []).toHaveLength(0);
    }
  });

  it('implicit fields exist even with no explicit grouping', () => {
    const index = testLineage('index=main | transaction');
    // Transaction without fields still creates implicit fields
    expect(index.getFieldLineage('duration')).not.toBeNull();
    expect(index.getFieldLineage('eventcount')).not.toBeNull();
  });
});
