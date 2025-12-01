/**
 * stats Command Tests
 *
 * Tests for stats command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('stats command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('stats');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('stats');
  });

  it.skip('parses example 1: sourcetype=access* | stats avg(kbps) by host', () => {
    const result = parseSPL(`sourcetype=access* | stats avg(kbps) by host`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: sourcetype=access* | top limit=100 referer_domain | stats sum(count)', () => {
    const result = parseSPL(`sourcetype=access* | top limit=100 referer_domain | stats sum(count)`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
