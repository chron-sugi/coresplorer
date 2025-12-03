/**
 * makeresults Command Tests
 *
 * Tests for makeresults command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('makeresults command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('makeresults');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('makeresults');
  });

  it('parses makeresults with eval', () => {
    const result = parseSPL(`| makeresults | eval foo="foo"`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses makeresults with count option', () => {
    const result = parseSPL(`| makeresults count=10`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
