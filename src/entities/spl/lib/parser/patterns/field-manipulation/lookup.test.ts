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

  it('parses lookup with AS aliases and OUTPUT', () => {
    const result = parseSPL(`index=main | lookup usertogroup user AS local_user OUTPUT group AS user_group`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses basic lookup', () => {
    const result = parseSPL(`index=main | lookup users user OUTPUT name, email`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
