/**
 * foreach Command Tests
 *
 * Tests for foreach command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('foreach command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('foreach');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('foreach');
  });

  // Note: foreach's <<FIELD>> template syntax requires special lexer handling
  // These tests verify basic foreach command parsing
  it('parses foreach with field list', () => {
    const result = parseSPL(`index=main | foreach foo, bar, baz`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
