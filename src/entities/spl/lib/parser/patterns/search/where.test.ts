/**
 * where Command Tests
 *
 * Tests for where command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('where command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('where');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('where');
  });

  it.skip('parses example 1: sourcetype=physicsobjs | where distance/time > 100', () => {
    const result = parseSPL(`sourcetype=physicsobjs | where distance/time > 100`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: host="CheckPoint" | where (src LIKE "10.9.165.%") OR cidrmatch("10.9.165.0/25", dst)', () => {
    const result = parseSPL(`host="CheckPoint" | where (src LIKE "10.9.165.%") OR cidrmatch("10.9.165.0/25", dst)`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
