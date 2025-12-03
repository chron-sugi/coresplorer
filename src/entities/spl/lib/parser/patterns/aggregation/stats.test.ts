/**
 * stats Command Tests
 *
 * Tests for stats command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('stats command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('stats');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('stats');
  });

  it('parses stats avg by field', () => {
    const result = parseSPL(`sourcetype=access* | stats avg(kbps) by host`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses top followed by stats sum', () => {
    const result = parseSPL(`sourcetype=access* | top host | stats sum(count)`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses stats with multiple aggregations', () => {
    const result = parseSPL(`index=main | stats count, sum(bytes), avg(duration) by host`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
