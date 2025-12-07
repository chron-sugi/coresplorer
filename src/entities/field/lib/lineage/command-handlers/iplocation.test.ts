/**
 * Iplocation Command Handler Tests
 *
 * Tests for the iplocation command which creates geographic fields from IP addresses.
 *
 * @module entities/field/lib/lineage/command-handlers/iplocation.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldDependsOn,
  expectFieldDataType,
  expectFieldConfidence,
} from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

describe('iplocation command: basic functionality', () => {
  it('creates geographic fields from IP', () => {
    const index = testLineage('index=main | iplocation clientip');
    
    // Check all implicit geo fields are created
    expect(index.getFieldLineage('city')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
    expect(index.getFieldLineage('lat')).not.toBeNull();
    expect(index.getFieldLineage('lon')).not.toBeNull();
    expect(index.getFieldLineage('region')).not.toBeNull();
  });

  it('all geo fields depend on the IP field', () => {
    const index = testLineage('index=main | iplocation src_ip');
    
    expectFieldDependsOn(index, 'city', 'src_ip');
    expectFieldDependsOn(index, 'country', 'src_ip');
    expectFieldDependsOn(index, 'lat', 'src_ip');
    expectFieldDependsOn(index, 'lon', 'src_ip');
    expectFieldDependsOn(index, 'region', 'src_ip');
  });

  it('marks IP field as consumed', () => {
    const index = testLineage('index=main | iplocation clientip');
    const clientip = index.getFieldLineage('clientip');
    expect(clientip).not.toBeNull();
  });

  it('creates fields even if IP field does not exist yet', () => {
    const index = testLineage('index=main | iplocation nonexistent_ip');
    
    // Should still create geo fields (iplocation doesn't validate at parse time)
    expect(index.getFieldLineage('city')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
  });
});

// =============================================================================
// PREFIX HANDLING
// =============================================================================

describe('iplocation command: prefix handling', () => {
  it('applies prefix to all geo fields', () => {
    const index = testLineage('index=main | iplocation prefix=src_ clientip');
    
    expect(index.getFieldLineage('src_city')).not.toBeNull();
    expect(index.getFieldLineage('src_country')).not.toBeNull();
    expect(index.getFieldLineage('src_lat')).not.toBeNull();
    expect(index.getFieldLineage('src_lon')).not.toBeNull();
    expect(index.getFieldLineage('src_region')).not.toBeNull();
  });

  it('prefixed fields depend on IP field', () => {
    const index = testLineage('index=main | iplocation prefix=dest_ dest_ip');
    
    expectFieldDependsOn(index, 'dest_city', 'dest_ip');
    expectFieldDependsOn(index, 'dest_country', 'dest_ip');
    expectFieldDependsOn(index, 'dest_lat', 'dest_ip');
  });

  it('handles empty prefix (equivalent to no prefix)', () => {
    const index = testLineage('index=main | iplocation prefix= clientip');
    
    expect(index.getFieldLineage('city')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
  });

  it('handles multi-character prefix', () => {
    const index = testLineage('index=main | iplocation prefix=source_geo_ ip');
    
    expect(index.getFieldLineage('source_geo_city')).not.toBeNull();
    expect(index.getFieldLineage('source_geo_country')).not.toBeNull();
  });
});

// =============================================================================
// DATA TYPES
// =============================================================================

describe('iplocation command: data types', () => {
  it('infers string type for text geo fields', () => {
    const index = testLineage('index=main | iplocation clientip');
    
    expectFieldDataType(index, 'city', 'string');
    expectFieldDataType(index, 'country', 'string');
    expectFieldDataType(index, 'region', 'string');
  });

  it('infers number type for coordinate fields', () => {
    const index = testLineage('index=main | iplocation clientip');
    
    expectFieldDataType(index, 'lat', 'number');
    expectFieldDataType(index, 'lon', 'number');
  });

  it('maintains data types with prefix', () => {
    const index = testLineage('index=main | iplocation prefix=geo_ ip');
    
    expectFieldDataType(index, 'geo_city', 'string');
    expectFieldDataType(index, 'geo_lat', 'number');
    expectFieldDataType(index, 'geo_lon', 'number');
  });
});

// =============================================================================
// CONFIDENCE LEVELS
// =============================================================================

describe('iplocation command: confidence levels', () => {
  it('has certain confidence for created fields', () => {
    const index = testLineage('index=main | iplocation clientip');
    
    expectFieldConfidence(index, 'city', 'certain');
    expectFieldConfidence(index, 'country', 'certain');
    expectFieldConfidence(index, 'lat', 'certain');
  });

  it('maintains certain confidence with prefix', () => {
    const index = testLineage('index=main | iplocation prefix=src_ ip');
    
    expectFieldConfidence(index, 'src_city', 'certain');
    expectFieldConfidence(index, 'src_country', 'certain');
  });
});

// =============================================================================
// MULTIPLE IPLOCATION COMMANDS
// =============================================================================

describe('iplocation command: multiple calls', () => {
  it('handles two iplocation commands with different IPs', () => {
    const index = testLineage(`
      index=main
      | iplocation prefix=src_ src_ip
      | iplocation prefix=dest_ dest_ip
    `);
    
    expect(index.getFieldLineage('src_city')).not.toBeNull();
    expect(index.getFieldLineage('dest_city')).not.toBeNull();
    expectFieldDependsOn(index, 'src_city', 'src_ip');
    expectFieldDependsOn(index, 'dest_city', 'dest_ip');
  });

  it('handles iplocation on same IP with different prefixes', () => {
    const index = testLineage(`
      index=main
      | iplocation prefix=v1_ clientip
      | iplocation prefix=v2_ clientip
    `);
    
    expect(index.getFieldLineage('v1_city')).not.toBeNull();
    expect(index.getFieldLineage('v2_city')).not.toBeNull();
  });

  it('second iplocation without prefix overwrites unprefixed fields', () => {
    const index = testLineage(`
      index=main
      | iplocation ip1
      | iplocation ip2
    `);
    
    // Second call should create fields depending on ip2
    expectFieldDependsOn(index, 'city', 'ip2');
    expectFieldDependsOn(index, 'country', 'ip2');
  });
});

// =============================================================================
// INTEGRATION WITH OTHER COMMANDS
// =============================================================================

describe('iplocation command: integration', () => {
  it('works after eval that creates IP field', () => {
    const index = testLineage(`
      index=main
      | eval client_ip=coalesce(ip1, ip2)
      | iplocation client_ip
    `);
    
    expectFieldDependsOn(index, 'city', 'client_ip');
  });

  it('created fields can be used in subsequent eval', () => {
    const index = testLineage(`
      index=main
      | iplocation clientip
      | eval location=city + ", " + country
    `);
    
    expectFieldDependsOn(index, 'location', 'city', 'country');
  });

  it('works in stats aggregation', () => {
    const index = testLineage(`
      index=main
      | iplocation clientip
      | stats count by country
    `);
    
    expect(index.getFieldLineage('count')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
  });

  it('works with table to select specific geo fields', () => {
    const index = testLineage(`
      index=main
      | iplocation clientip
      | table clientip, city, country
    `);
    
    expect(index.getFieldLineage('city')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
  });

  it('handles rename of geo fields', () => {
    const index = testLineage(`
      index=main
      | iplocation clientip
      | rename city as client_city
    `);
    
    expect(index.getFieldLineage('client_city')).not.toBeNull();
    expectFieldDependsOn(index, 'client_city', 'city');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('iplocation command: edge cases', () => {
  it('handles IP field with underscores', () => {
    const index = testLineage('index=main | iplocation src_client_ip');
    
    expect(index.getFieldLineage('city')).not.toBeNull();
    expectFieldDependsOn(index, 'city', 'src_client_ip');
  });

  it('handles IP field with numbers', () => {
    const index = testLineage('index=main | iplocation ip4addr');
    
    expect(index.getFieldLineage('city')).not.toBeNull();
    expectFieldDependsOn(index, 'city', 'ip4addr');
  });

  it('handles prefix with special characters', () => {
    const index = testLineage('index=main | iplocation prefix=geo-loc_ ip');
    
    expect(index.getFieldLineage('geo-loc_city')).not.toBeNull();
  });

  it('handles very long prefix', () => {
    const longPrefix = 'a'.repeat(50) + '_';
    const index = testLineage(`index=main | iplocation prefix=${longPrefix} ip`);
    
    expect(index.getFieldLineage(`${longPrefix}city`)).not.toBeNull();
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('iplocation command: adversarial tests', () => {
  it('handles many iplocation commands in sequence (10)', () => {
    let query = 'index=main';
    for (let i = 0; i < 10; i++) {
      query += ` | iplocation prefix=ip${i}_ ip${i}`;
    }
    const index = testLineage(query);
    
    // Check first and last
    expect(index.getFieldLineage('ip0_city')).not.toBeNull();
    expect(index.getFieldLineage('ip9_city')).not.toBeNull();
  });

  it('handles iplocation in complex pipeline', () => {
    const index = testLineage(`
      index=web
      | eval src=if(isnull(src_ip), "unknown", src_ip)
      | iplocation prefix=source_ src
      | eval country_upper=upper(source_country)
      | stats count by country_upper, source_city
      | where count > 10
    `);
    
    expect(index.getFieldLineage('country_upper')).not.toBeNull();
    expectFieldDependsOn(index, 'country_upper', 'source_country');
  });

  it('handles iplocation with very long IP field name', () => {
    const longFieldName = 'ip_' + 'a'.repeat(200);
    const index = testLineage(`index=main | iplocation ${longFieldName}`);
    
    expect(index.getFieldLineage('city')).not.toBeNull();
    expectFieldDependsOn(index, 'city', longFieldName);
  });

  it('handles multiple iplocation calls on same field', () => {
    const index = testLineage(`
      index=main
      | iplocation clientip
      | eval temp=lat+lon
      | iplocation clientip
    `);
    
    // Second call should recreate the geo fields
    expect(index.getFieldLineage('city')).not.toBeNull();
    expect(index.getFieldLineage('lat')).not.toBeNull();
  });
});

// =============================================================================
// REAL-WORLD SCENARIOS
// =============================================================================

describe('iplocation command: real-world scenarios', () => {
  it('handles web server log analysis', () => {
    const index = testLineage(`
      index=web_logs
      | iplocation clientip
      | stats count by country, city
      | sort -count
    `);
    
    expect(index.getFieldLineage('count')).not.toBeNull();
    expect(index.getFieldLineage('country')).not.toBeNull();
    expect(index.getFieldLineage('city')).not.toBeNull();
  });

  it('handles network traffic analysis with src/dest', () => {
    const index = testLineage(`
      index=network
      | iplocation prefix=src_ src_ip
      | iplocation prefix=dest_ dest_ip
      | eval cross_country=if(src_country!=dest_country, 1, 0)
      | stats sum(cross_country) as international_traffic
    `);
    
    expect(index.getFieldLineage('international_traffic')).not.toBeNull();
    expectFieldDependsOn(index, 'cross_country', 'src_country', 'dest_country');
  });

  it('handles security threat analysis', () => {
    const index = testLineage(`
      index=firewall
      | iplocation src_ip
      | eval threat_level=case(
          country="CN", "high",
          country="RU", "high",
          1=1, "low"
        )
      | stats count by threat_level, country
    `);
    
    expect(index.getFieldLineage('threat_level')).not.toBeNull();
    expectFieldDependsOn(index, 'threat_level', 'country');
  });
});
