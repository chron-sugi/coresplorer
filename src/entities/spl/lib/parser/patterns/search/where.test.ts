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

  it('parses where with division comparison', () => {
    const result = parseSPL(`sourcetype=physicsobjs | where distance/time > 100`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses where with like operator', () => {
    const result = parseSPL(`index=main | where like(host, "web%")`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses where with AND condition', () => {
    const result = parseSPL(`index=main | where count > 10 AND status != "error"`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
