/**
 * gentimes Command Tests
 *
 * Tests for gentimes command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('gentimes command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('gentimes');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('gentimes');
  });

  it('parses gentimes with start and end', () => {
    const result = parseSPL(`| gentimes start=-7d end=now`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses gentimes with increment', () => {
    const result = parseSPL(`| gentimes start=-7d end=now increment=1d`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
