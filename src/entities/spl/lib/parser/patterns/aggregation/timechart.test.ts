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

  it.skip('parses example 1: ... | timechart span=5m avg(delay) by host', () => {
    const result = parseSPL(`... | timechart span=5m avg(delay) by host`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: sourcetype=access_combined | timechart span=1m count(_raw) by product_id usenull=f', () => {
    const result = parseSPL(`sourcetype=access_combined | timechart span=1m count(_raw) by product_id usenull=f`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 3: sshd failed OR failure | timechart span=1m count(eventtype) by source_ip usenull=f where count>10', () => {
    const result = parseSPL(`sshd failed OR failure | timechart span=1m count(eventtype) by source_ip usenull=f where count>10`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
