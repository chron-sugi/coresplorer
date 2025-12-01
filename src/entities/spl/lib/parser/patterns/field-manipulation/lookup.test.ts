/**
 * lookup Command Tests
 *
 * Tests for lookup command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('lookup command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('lookup');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('lookup');
  });

  it.skip('parses example 1: ... | lookup usertogroup user as local_user OUTPUT group as user_group', () => {
    const result = parseSPL(`... | lookup usertogroup user as local_user OUTPUT group as user_group`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
