/**
 * table Command Tests
 *
 * Tests for table command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('table command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('table');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('table');
  });

  it.skip('parses example 1: ... | table foo bar baz*', () => {
    const result = parseSPL(`... | table foo bar baz*`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
