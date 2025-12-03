/**
 * sort Command Tests
 *
 * Tests for sort command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('sort command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('sort');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('sort');
  });

  it('parses sort with multiple fields', () => {
    const result = parseSPL(`index=main | sort _time, -host`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses sort with count and direction', () => {
    const result = parseSPL(`index=main | sort 100 -count, +source`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
