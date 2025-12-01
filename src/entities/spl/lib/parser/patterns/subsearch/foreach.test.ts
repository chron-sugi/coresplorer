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

  it.skip('parses example 1: ... | eval total=0 | eval test1=1 | eval test2=2 | eval test3=3 | foreach test* [eval total=total + <<FIELD>>]', () => {
    const result = parseSPL(`... | eval total=0 | eval test1=1 | eval test2=2 | eval test3=3 | foreach test* [eval total=total + <<FIELD>>]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: ... | foreach foo* [eval new_<<MATCHSTR>> = <<FIELD>> + bar<<MATCHSTR>>]', () => {
    const result = parseSPL(`... | foreach foo* [eval new_<<MATCHSTR>> = <<FIELD>> + bar<<MATCHSTR>>]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 3: ... | foreach foo bar baz [eval <<FIELD>> = "<<FIELD>>"]', () => {
    const result = parseSPL(`... | foreach foo bar baz [eval <<FIELD>> = "<<FIELD>>"]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 4: ... | foreach foo*bar* fieldstr="#field#" matchseg2="#matchseg2#" [eval #field# = "#matchseg2#"]', () => {
    const result = parseSPL(`... | foreach foo*bar* fieldstr="#field#" matchseg2="#matchseg2#" [eval #field# = "#matchseg2#"]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
