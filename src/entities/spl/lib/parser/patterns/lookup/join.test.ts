/**
 * join Command Tests
 *
 * Tests for join command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('join command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('join');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('join');
  });

  it('parses example 1: index=main | join product_id [search index=vendors]', () => {
    const result = parseSPL(`index=main | join product_id [search index=vendors]`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses example 2: with subsearch containing rename', () => {
    const result = parseSPL(`index=main | join product_id [search index=vendors | rename pid AS product_id]`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses with type=left option', () => {
    const result = parseSPL(`index=main | join type=left host [search index=other]`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses with type=inner and max options', () => {
    const result = parseSPL(`index=main | join type=inner max=10 host [search index=other]`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
