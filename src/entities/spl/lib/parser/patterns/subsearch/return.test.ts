/**
 * return Command Tests
 *
 * Tests for return command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('return command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('return');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('return');
  });

  it('parses return with field', () => {
    const result = parseSPL(`index=main | return host`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses return with count and multiple fields', () => {
    const result = parseSPL(`index=main | return 10 host, source`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
