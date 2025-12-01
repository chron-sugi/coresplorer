/**
 * tail Command Tests
 *
 * Tests for tail command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('tail command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('tail');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('tail');
  });

  // No examples available
});
