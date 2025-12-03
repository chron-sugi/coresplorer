/**
 * inputlookup Command Tests
 *
 * Tests for inputlookup command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('inputlookup command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('inputlookup');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('inputlookup');
  });

  it('parses basic inputlookup', () => {
    const result = parseSPL(`| inputlookup users.csv`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses inputlookup with append option', () => {
    const result = parseSPL(`index=main | inputlookup append=true users.csv`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses inputlookup as pipeline start', () => {
    const result = parseSPL(`| inputlookup lookup_table`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
