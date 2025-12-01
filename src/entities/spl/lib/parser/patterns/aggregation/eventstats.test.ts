/**
 * eventstats Command Tests
 *
 * Tests for eventstats command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('eventstats command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('eventstats');
    expect(pattern).toBeDefined();
    // Command is 'stats' (shared pattern for stats family)
  });

  it.skip('parses example 1: ... | eventstats avg(duration) as avgdur', () => {
    const result = parseSPL(`... | eventstats avg(duration) as avgdur`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: ... | eventstats avg(duration) as avgdur by date_hour', () => {
    const result = parseSPL(`... | eventstats avg(duration) as avgdur by date_hour`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
