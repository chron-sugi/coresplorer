/**
 * map Command Tests
 *
 * Tests for map command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('map command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('map');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('map');
  });

  // Note: map command's search= option uses 'search' keyword which requires special handling
  // These tests verify basic map command parsing works
  it('parses map with maxsearches option', () => {
    const result = parseSPL(`index=main | map maxsearches=10`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
