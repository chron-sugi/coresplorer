/**
 * inputlookup Command Tests
 *
 * Tests for inputlookup command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('inputlookup command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('inputlookup');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('inputlookup');
  });

  it.skip('parses example 1: | inputlookup users.csv', () => {
    const result = parseSPL(`| inputlookup users.csv`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: | inputlookup usertogroup', () => {
    const result = parseSPL(`| inputlookup usertogroup`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 3: | inputlookup append=t usertogroup', () => {
    const result = parseSPL(`| inputlookup append=t usertogroup`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 4: | inputlookup usertogroup where foo>2 OR bar=5', () => {
    const result = parseSPL(`| inputlookup usertogroup where foo>2 OR bar=5`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 5: | inputlookup geo_us_states', () => {
    const result = parseSPL(`| inputlookup geo_us_states`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
