/**
 * map Command Tests
 *
 * Tests for map command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('map command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('map');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('map');
  });

  it.skip('parses example 1: error | localize | map mytimebased_savedsearch', () => {
    const result = parseSPL(`error | localize | map mytimebased_savedsearch`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
