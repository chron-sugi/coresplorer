/**
 * Field Creator Commands Tests
 * 
 * Tests for eval, stats, rex, rename, lookup commands.
 */

import { describe, it, expect } from 'vitest';
import { parse, hasChild } from '../../../testing';

describe('Field Creator Commands', () => {
  describe('eval command', () => {
    it('parses simple assignment', () => {
      const cst = parse('| eval x = 1');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses expression assignment', () => {
      const cst = parse('| eval total = price * quantity');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiple assignments', () => {
      const cst = parse('| eval x = 1, y = 2, z = x + y');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses function in eval', () => {
      const cst = parse('| eval host = lower(HOSTNAME)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses if function', () => {
      const cst = parse('| eval status_text = if(status=200, "ok", "error")');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses coalesce function with field args', () => {
      const cst = parse('| eval result = coalesce(field1, field2, "default")');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses nested functions with field args', () => {
      const cst = parse('| eval x = upper(trim(fieldname))');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses function with complex expression args', () => {
      const cst = parse('| eval result = if(len(name) > 10, substr(name, 0, 10), name)');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('stats command', () => {
    it('parses simple count', () => {
      const cst = parse('| stats count');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses count with field', () => {
      const cst = parse('| stats count(host)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses count with wildcard', () => {
      const cst = parse('| stats count(*)');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses aggregation with alias', () => {
      const cst = parse('| stats count as total');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses stats with by clause', () => {
      const cst = parse('| stats count by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiple aggregations', () => {
      const cst = parse('| stats count, sum(bytes), avg(duration) by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiple by fields', () => {
      const cst = parse('| stats count by host, source');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses aggregation with multiple args', () => {
      const cst = parse('| stats percentile(latency, 95) by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses aggregation with quoted string alias', () => {
      const cst = parse('| stats count AS "Total Count", dc(user) AS "Unique Users" by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses aggregation with single-quoted string alias', () => {
      const cst = parse("| stats count AS 'Total Count' by host");
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('stats variants', () => {
    it('parses eventstats', () => {
      const cst = parse('| eventstats count by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses streamstats', () => {
      const cst = parse('| streamstats count by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses chart', () => {
      const cst = parse('| chart count by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses timechart', () => {
      const cst = parse('| timechart count by host');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('rename command', () => {
    it('parses single rename', () => {
      const cst = parse('| rename old as new');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses multiple renames', () => {
      const cst = parse('| rename a as b, c as d');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses simple rename', () => {
      // Simple field rename without wildcards
      const cst = parse('| rename old_field as new_field');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('rex command', () => {
    it('parses rex with pattern', () => {
      const cst = parse('| rex "(?<user>\\w+)"');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses rex with field option', () => {
      const cst = parse('| rex field=message "(?<code>\\d+)"');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses rex with max_match option', () => {
      const cst = parse('| rex max_match=0 "(?<word>\\w+)"');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses rex with multiple options', () => {
      const cst = parse('| rex field=_raw max_match=5 "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)"');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('lookup command', () => {
    it('parses simple lookup', () => {
      const cst = parse('| lookup users uid');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses lookup with output', () => {
      const cst = parse('| lookup users uid OUTPUT username');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses lookup with outputnew', () => {
      const cst = parse('| lookup users uid OUTPUTNEW username');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses lookup with field alias', () => {
      const cst = parse('| lookup users user_id as uid OUTPUT name');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('inputlookup command', () => {
    it('parses simple inputlookup', () => {
      const cst = parse('| inputlookup users.csv');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses inputlookup with table name', () => {
      const cst = parse('| inputlookup my_lookup_table');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses inputlookup with append option', () => {
      const cst = parse('| inputlookup append=true users.csv');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });

  describe('spath command', () => {
    it('parses simple spath', () => {
      const cst = parse('| spath');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses spath with input', () => {
      const cst = parse('| spath input=json_field');
      expect(hasChild(cst, 'command')).toBe(true);
    });

    it('parses spath with path', () => {
      const cst = parse('| spath path="user.name"');
      expect(hasChild(cst, 'command')).toBe(true);
    });
  });
});
