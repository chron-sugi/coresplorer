/**
 * bin Command Tests
 *
 * Tests for bin command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('bin command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('bin');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('bin');
  });

  // No examples available
});
