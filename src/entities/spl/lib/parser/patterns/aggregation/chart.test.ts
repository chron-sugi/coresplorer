/**
 * chart Command Tests
 *
 * Tests for chart command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('chart command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('chart');
    expect(pattern).toBeDefined();
    // Command is 'stats' (shared pattern for stats family)
  });

  // No examples available
});
