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

  it('parses eventstats with alias', () => {
    const result = parseSPL(`index=main | eventstats avg(duration) as avgdur`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses eventstats with by clause', () => {
    const result = parseSPL(`index=main | eventstats avg(duration) as avgdur by date_hour`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
