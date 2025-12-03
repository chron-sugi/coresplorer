/**
 * transaction Command Tests
 *
 * Tests for transaction command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('transaction command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('transaction');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('transaction');
  });

  it('parses transaction with fields and options', () => {
    const result = parseSPL(`index=main | transaction host maxspan=5m`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses transaction with multiple fields', () => {
    const result = parseSPL(`index=main | transaction host, session_id maxspan=30m`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
