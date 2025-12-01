/**
 * search Command Tests
 *
 * Tests for search command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('search command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('search');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('search');
  });

  it.skip('parses example 1: 404 host="webserver1"', () => {
    const result = parseSPL(`404 host="webserver1"`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: (code=10 OR code=29) host!="localhost" xqp>5', () => {
    const result = parseSPL(`(code=10 OR code=29) host!="localhost" xqp>5`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
