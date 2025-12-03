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

  it('parses fields with multiple fields and wildcard', () => {
    const result = parseSPL(`index=main | fields source, sourcetype, host, error*`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses fields with minus to exclude', () => {
    const result = parseSPL(`index=main | fields - _raw, _time`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
