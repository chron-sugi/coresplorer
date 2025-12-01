/**
 * transaction Command Tests
 *
 * Tests for transaction command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('transaction command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('transaction');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('transaction');
  });

  it.skip('parses example 1: ... | transaction host,cookie maxspan=30s maxpause=5s', () => {
    const result = parseSPL(`... | transaction host,cookie maxspan=30s maxpause=5s`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: ... | transaction from maxspan=30s maxpause=5s', () => {
    const result = parseSPL(`... | transaction from maxspan=30s maxpause=5s`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
