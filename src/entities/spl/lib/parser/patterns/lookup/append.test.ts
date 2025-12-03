/**
 * append Command Tests
 *
 * Tests for append command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('append command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('append');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('append');
  });

  it('parses chart with append subsearch', () => {
    const result = parseSPL(`index=main | chart count by category1 | append [search index=errors | chart count by category2]`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses basic append', () => {
    const result = parseSPL(`index=main | append [search index=other]`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
