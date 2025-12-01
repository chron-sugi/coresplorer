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

  it.skip('parses example 1: ... | sort _time, -host', () => {
    const result = parseSPL(`... | sort _time, -host`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: ... | sort 100 -size, +source', () => {
    const result = parseSPL(`... | sort 100 -size, +source`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
