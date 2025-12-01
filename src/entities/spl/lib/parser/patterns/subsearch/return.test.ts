/**
 * return Command Tests
 *
 * Tests for return command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('return command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('return');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('return');
  });

  it.skip('parses example 1: error [ search user=amrit | return ip]', () => {
    const result = parseSPL(`error [ search user=amrit | return ip]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: error [ search login | return 2 user, ip]', () => {
    const result = parseSPL(`error [ search login | return 2 user, ip]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
