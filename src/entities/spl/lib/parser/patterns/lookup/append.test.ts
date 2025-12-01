/**
 * append Command Tests
 *
 * Tests for append command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('append command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('append');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('append');
  });

  it.skip('parses example 1: ... | chart count by category1 | append [search error | chart count by category2]', () => {
    const result = parseSPL(`... | chart count by category1 | append [search error | chart count by category2]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
