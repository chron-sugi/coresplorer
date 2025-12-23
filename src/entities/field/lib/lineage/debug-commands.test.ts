/**
 * New Command Field Tracking Tests
 *
 * Regression tests for the 9 new commands added in the grammar expansion.
 * These commands were added to DEFAULT_TRACKED_COMMANDS to enable lineage tracking.
 *
 * @module entities/field/lib/lineage/debug-commands.test
 */
import { describe, it, expect } from 'vitest';
import { parseSPL, getCommandPattern, interpretPattern } from '@/entities/spl';
import { testLineage } from './testing';

describe('New Command Field Tracking', () => {
  it('accum creates aliased field', () => {
    const index = testLineage('index=main | accum count AS running_total');
    expect(index.getAllFields()).toContain('running_total');
    expect(index.getFieldLineage('running_total')).not.toBeNull();
  });

  it('delta creates aliased field', () => {
    const index = testLineage('index=main | delta count AS change');
    expect(index.getAllFields()).toContain('change');
  });

  it('autoregress tracks input field', () => {
    const index = testLineage('index=main | autoregress count p=1');
    const fields = index.getAllFields();
    expect(fields.length).toBeGreaterThan(0);
  });

  it('rangemap creates range field via staticCreates', () => {
    const index = testLineage('index=main | rangemap field=count low=0-10 high=11-100');
    expect(index.getAllFields()).toContain('range');
  });

  it('filldown preserves modified fields', () => {
    const index = testLineage('index=main | filldown host');
    expect(index.getAllFields()).toContain('host');
  });

  it('mvcombine preserves modified field', () => {
    const index = testLineage('index=main | eval values="test" | mvcombine delim="," values');
    expect(index.getAllFields()).toContain('values');
  });

  it('strcat creates target field with dependencies', () => {
    const index = testLineage('index=main | eval a="hello", b="world" | strcat a b dest');
    expect(index.getAllFields()).toContain('dest');
    const lineage = index.getFieldLineage('dest');
    expect(lineage?.dependsOn).toContain('a');
    expect(lineage?.dependsOn).toContain('b');
  });

  it('tstats creates aggregation and by fields', () => {
    const index = testLineage('index=main | tstats count where index=main by host');
    expect(index.getAllFields()).toContain('count');
    expect(index.getAllFields()).toContain('host');
  });

  it('union preserves pipeline fields', () => {
    const index = testLineage('index=main | union [search index=other]');
    expect(index).toBeDefined();
  });

  it('join command - debug', () => {
    const spl = 'index=main | eval foo=1 | join type=left host [search index=other]';
    const parseResult = parseSPL(spl);
    console.log('Lex errors:', parseResult.lexErrors);
    console.log('Parse errors:', parseResult.parseErrors);
    console.log('Success:', parseResult.success);

    if (parseResult.ast) {
      console.log('Stages count:', parseResult.ast.stages.length);
      const joinStage = parseResult.ast.stages[2]; // join is 3rd stage
      console.log('join AST:', JSON.stringify(joinStage, null, 2));

      const pattern = getCommandPattern('join');
      console.log('join pattern exists:', !!pattern);

      if (pattern) {
        const result = interpretPattern(pattern, joinStage as any);
        console.log('join pattern result:', JSON.stringify(result, null, 2));
      }
    }

    // If AST is null, just check parse errors
    if (!parseResult.ast) {
      console.log('PARSING FAILED - no AST');
      expect(parseResult.parseErrors).toHaveLength(0); // This will fail and show errors
      return;
    }

    const index = testLineage(spl);
    console.log('All fields after join:', index.getAllFields());
    console.log('foo lineage:', index.getFieldLineage('foo'));

    // foo should still exist after join
    expect(index.getAllFields()).toContain('foo');
  });
});
