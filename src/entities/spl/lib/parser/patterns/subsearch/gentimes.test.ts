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

  it.skip('parses example 1: | gentimes start=10/25/07', () => {
    const result = parseSPL(`| gentimes start=10/25/07`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: | gentimes start=-30 end=-27', () => {
    const result = parseSPL(`| gentimes start=-30 end=-27`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 3: | gentimes start=10/1/07 end=10/5/07', () => {
    const result = parseSPL(`| gentimes start=10/1/07 end=10/5/07`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 4: | gentimes start=10/1/07 end=10/5/07 increment=1h', () => {
    const result = parseSPL(`| gentimes start=10/1/07 end=10/5/07 increment=1h`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
