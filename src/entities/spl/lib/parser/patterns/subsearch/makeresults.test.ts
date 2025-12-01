/**
 * makeresults Command Tests
 *
 * Tests for makeresults command pattern and grammar
 */

import { describe, it, expect } from 'vitest';
import { getCommandPattern } from '../registry';
import { parseSPL } from '../../index';

describe('makeresults command', () => {
  it('has pattern defined', () => {
    const pattern = getCommandPattern('makeresults');
    expect(pattern).toBeDefined();
    expect(pattern?.command).toBe('makeresults');
  });

  it.skip('parses example 1: makeresults | eval foo="foo"', () => {
    const result = parseSPL(`makeresults | eval foo="foo"`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });

  it.skip('parses example 2: index=_internal _indextime > [makeresults | eval it=now()-60 | return $it]', () => {
    const result = parseSPL(`index=_internal _indextime > [makeresults | eval it=now()-60 | return $it]`);
    expect(result.success).toBe(true);
    expect(result.ast).toBeDefined();
  });
});
