/**
 * head Command Tests
 *
 * Tests for head command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('head command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('head');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('head');
  });

  it.skip('parses example 1: ... | streamstats range(_time) as timerange | head (timerange<100)', () => {
    const result = parseSPL(`... | streamstats range(_time) as timerange | head (timerange<100)`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
