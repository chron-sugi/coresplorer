/**
 * table Command Tests
 *
 * Tests for table command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('table command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('table');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('table');
  });

  it('parses table with multiple fields and wildcard', () => {
    const result = parseSPL(`index=main | table foo, bar, baz*`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses table with comma-separated fields', () => {
    const result = parseSPL(`index=main | table host, source, sourcetype`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
