/**
 * timechart Command Tests
 *
 * Tests for timechart command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('timechart command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('timechart');
    expect(pattern).toBeDefined();
    // Command is 'stats' (shared pattern for stats family)
  });

  it('parses timechart with aggregation', () => {
    const result = parseSPL(`index=main | timechart avg(bytes)`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses timechart with by clause', () => {
    const result = parseSPL(`index=main | timechart count by host`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses basic timechart count', () => {
    const result = parseSPL(`index=main | timechart count`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
