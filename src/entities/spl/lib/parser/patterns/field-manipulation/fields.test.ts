/**
 * fields Command Tests
 *
 * Tests for fields command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('fields command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('fields');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('fields');
  });

  it.skip('parses example 1: ... | fields source, sourcetype, host, error*', () => {
    const result = parseSPL(`... | fields source, sourcetype, host, error*`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
