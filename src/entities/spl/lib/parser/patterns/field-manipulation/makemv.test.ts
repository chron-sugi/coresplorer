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

  it('parses makemv with delim and field', () => {
    const result = parseSPL(`index=main | makemv delim="," values`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });

  it('parses makemv in pipeline with top', () => {
    const result = parseSPL(`index=main | makemv delim="," senders | top senders`);
    expect(result.success).toBe(true);
    expect(result.parseErrors).toHaveLength(0);
    expect(result.ast).toBeDefined();
  });
});
