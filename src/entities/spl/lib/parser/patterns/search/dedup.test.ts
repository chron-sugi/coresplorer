/**
 * dedup Command Tests
 *
 * Tests for dedup command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('dedup command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('dedup');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('dedup');
  });

  it.skip('parses example 1: ... | dedup 3 source', () => {
    const result = parseSPL(`... | dedup 3 source`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: ... | dedup source sortby +_time', () => {
    const result = parseSPL(`... | dedup source sortby +_time`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 3: ... | dedup group sortby -_size', () => {
    const result = parseSPL(`... | dedup group sortby -_size`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
