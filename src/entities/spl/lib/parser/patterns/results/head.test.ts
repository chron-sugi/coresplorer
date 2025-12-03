/**
 * head Command Tests
 *
 * Tests for head command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('head command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('head');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('head');
  });

  it('parses head with count', () => {
    const result = parseSPL(`index=main | head 10`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses head without arguments', () => {
    const result = parseSPL(`index=main | head`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
