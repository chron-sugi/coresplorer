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

  it.skip('parses example 1: ... | join product_id [search vendors]', () => {
    const result = parseSPL(`... | join product_id [search vendors]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: ... | join product_id [search vendors | rename pid AS product_id]', () => {
    const result = parseSPL(`... | join product_id [search vendors | rename pid AS product_id]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 3: ... | join left=L right=R WHERE L.product_id=R.pid [search vendors]', () => {
    const result = parseSPL(`... | join left=L right=R WHERE L.product_id=R.pid [search vendors]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 4: ... | join datamodel:"internal_server.splunkdaccess"', () => {
    const result = parseSPL(`... | join datamodel:"internal_server.splunkdaccess"`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
