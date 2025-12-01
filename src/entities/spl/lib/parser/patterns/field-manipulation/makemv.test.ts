/**
 * makemv Command Tests
 *
 * Tests for makemv command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('makemv command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('makemv');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('makemv');
  });

  it.skip('parses example 1: ... | makemv delim=":" allowempty=t foo', () => {
    const result = parseSPL(`... | makemv delim=":" allowempty=t foo`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: eventtype="sendmail" | makemv delim="," senders | top senders', () => {
    const result = parseSPL(`eventtype="sendmail" | makemv delim="," senders | top senders`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
