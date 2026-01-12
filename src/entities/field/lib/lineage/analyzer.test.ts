import { describe, it, expect } from 'vitest';
import { analyzeLineage, DEFAULT_TRACKED_COMMANDS } from './analyzer';
import { parseSPL } from '@/entities/spl';

const parse = (spl: string) => {
  const pr = parseSPL(spl);
  if (!pr.ast) throw new Error('Failed to parse SPL for test');
  return pr.ast;
};

describe('analyzeLineage', () => {
  it('tracks eval-created fields and dependencies', () => {
    const ast = parse(`index=main | eval foo=bar, baz=foo+1`);
    const index = analyzeLineage(ast);
    const foo = index.getFieldLineage('foo');
    const baz = index.getFieldLineage('baz');
    expect(foo).not.toBeNull();
    expect(baz?.dependsOn ?? []).toContain('foo');
  });

  it('includes stats aliases and drops other fields', () => {
    const ast = parse(`index=main | stats sum(bytes) as total by host`);
    const index = analyzeLineage(ast);
    expect(index.getFieldLineage('total')).not.toBeNull();
    // bytes is consumed by stats - verify it was tracked
    const bytesLineage = index.getFieldLineage('bytes');
    const consumedEvent = bytesLineage?.events.find(e => e.kind === 'consumed');
    expect(consumedEvent).toBeDefined();
  });

  it('propagates rename chains', () => {
    const ast = parse(`index=main | eval foo=1 | rename foo as bar | eval baz=bar+1`);
    const index = analyzeLineage(ast);
    const baz = index.getFieldLineage('baz');
    expect(baz?.dependsOn ?? []).toContain('bar');
    expect(baz?.dependsOn ?? []).not.toContain('foo'); // should depend on renamed field
  });

  it('renamed field shows dependency on original (E2E scenario 1)', () => {
    // E2E test: 'index=main | eval foo=1 | rename foo as bar'
    const ast = parse(`index=main | eval foo=1 | rename foo as bar`);
    const index = analyzeLineage(ast);
    const bar = index.getFieldLineage('bar');
    expect(bar).not.toBeNull();
    expect(bar?.dependsOn ?? []).toContain('foo');
  });

  it('binary expression tracks both operand fields (E2E scenario 2)', () => {
    // E2E test: 'index=main | eval total=price*quantity'
    const ast = parse(`index=main | eval total=price*quantity`);
    const index = analyzeLineage(ast);
    const total = index.getFieldLineage('total');
    expect(total).not.toBeNull();
    expect(total?.dependsOn ?? []).toContain('price');
    expect(total?.dependsOn ?? []).toContain('quantity');
  });
});

describe('multiline commands', () => {
  it('parses multiline stats command', () => {
    const spl = `index=main
| stats
    count AS total_requests,
    sum(is_error) AS error_count,
    sum(is_warning) AS warning_count,
    avg(duration) AS avg_duration,
    avg(bytes_kb) AS avg_kb
    BY day, user_id, response_bucket`;
    const ast = parse(spl);
    expect(ast.stages.length).toBe(2);
    expect(ast.stages[1].type).toBe('StatsCommand');
  });

  it('tracks fields from multiline stats aggregations', () => {
    const spl = `index=main
| stats
    count AS total_requests,
    sum(is_error) AS error_count,
    avg(duration) AS avg_duration
    BY day, user_id`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // Check aggregation aliases are created
    expect(index.getFieldLineage('total_requests')).not.toBeNull();
    expect(index.getFieldLineage('error_count')).not.toBeNull();
    expect(index.getFieldLineage('avg_duration')).not.toBeNull();

    // Check BY fields are preserved
    expect(index.getFieldLineage('day')).not.toBeNull();
    expect(index.getFieldLineage('user_id')).not.toBeNull();
  });

  it('handles multiline stats followed by where', () => {
    const spl = `index=main
| stats
    count AS total_requests,
    sum(is_error) AS error_count
    BY day, user_id
| where total_requests>5`;
    const ast = parse(spl);
    expect(ast.stages.length).toBe(3);
    expect(ast.stages[2].type).toBe('WhereCommand');

    const index = analyzeLineage(ast);
    expect(index.getFieldLineage('total_requests')).not.toBeNull();
  });

  it('parses multiline eval command', () => {
    const spl = `index=main
| eval
    foo=bar+1,
    baz=qux*2,
    combined=foo+baz`;
    const ast = parse(spl);
    expect(ast.stages.length).toBe(2);
    expect(ast.stages[1].type).toBe('EvalCommand');
  });

  it('tracks fields from multiline eval', () => {
    const spl = `index=main
| eval
    foo=bar+1,
    baz=qux*2,
    combined=foo+baz`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('foo')).not.toBeNull();
    expect(index.getFieldLineage('baz')).not.toBeNull();
    expect(index.getFieldLineage('combined')).not.toBeNull();

    // Check dependencies
    const combined = index.getFieldLineage('combined');
    expect(combined?.dependsOn ?? []).toContain('foo');
    expect(combined?.dependsOn ?? []).toContain('baz');
  });

  it('has correct line numbers for multiline stats aggregations', () => {
    const spl = `index=main
| stats
    count AS total_requests,
    sum(is_error) AS error_count
    BY day`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // Check the events have the correct line numbers
    const totalRequests = index.getFieldLineage('total_requests');
    expect(totalRequests).not.toBeNull();

    const createdEvent = totalRequests?.events.find(e => e.kind === 'created');
    expect(createdEvent).toBeDefined();
    // Aggregation line maps to actual field location (line 3) in multiline stats
    expect(createdEvent?.line).toBe(3);
  });

  it('has correct line numbers for BY fields', () => {
    const spl = `index=main
| stats
    count AS total_requests
    BY day, user_id`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // BY fields are consumed with per-field location tracking
    const dayLineage = index.getFieldLineage('day');
    const consumedEvent = dayLineage?.events.find(e => e.kind === 'consumed');
    expect(consumedEvent).toBeDefined();
    // BY fields now use their actual line location (line 4 where BY clause is)
    expect(consumedEvent?.line).toBe(4);
  });

  it('has correct line/column for fields in multiline eval', () => {
    const spl = `index=main
| eval
    foo=bar+1,
    baz=qux*2`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // Multiline eval reports actual assignment lines (foo on line 3, baz on line 4)
    const fooLineage = index.getFieldLineage('foo');
    const fooCreated = fooLineage?.events.find(e => e.kind === 'created');
    expect(fooCreated?.line).toBe(3);

    const bazLineage = index.getFieldLineage('baz');
    const bazCreated = bazLineage?.events.find(e => e.kind === 'created');
    expect(bazCreated?.line).toBe(4);
  });
});

describe('command filtering', () => {
  it('exports DEFAULT_TRACKED_COMMANDS with expected commands', () => {
    expect(DEFAULT_TRACKED_COMMANDS).toContain('eval');
    expect(DEFAULT_TRACKED_COMMANDS).toContain('stats');
    expect(DEFAULT_TRACKED_COMMANDS).toContain('rename');
    expect(DEFAULT_TRACKED_COMMANDS).toContain('table');
    expect(DEFAULT_TRACKED_COMMANDS).toContain('fields');
    expect(DEFAULT_TRACKED_COMMANDS.length).toBeGreaterThan(10);
  });

  it('uses default tracked commands when no config provided', () => {
    const ast = parse(`index=main | eval foo=1`);
    const index = analyzeLineage(ast);
    // eval is in default list, so foo should be created
    expect(index.getFieldLineage('foo')).not.toBeNull();
  });

  it('filters out commands not in custom trackedCommands list', () => {
    const ast = parse(`index=main | eval foo=1 | stats count`);
    // Only track stats, not eval
    const index = analyzeLineage(ast, { trackedCommands: ['stats'] });
    // foo should NOT be created because eval is filtered out
    const foo = index.getFieldLineage('foo');
    expect(foo?.events.filter(e => e.kind === 'created').length ?? 0).toBe(0);
    // But count from stats should be created
    expect(index.getFieldLineage('count')).not.toBeNull();
  });

  it('allows custom trackedCommands to override defaults', () => {
    const ast = parse(`index=main | eval foo=1`);
    // Empty list means nothing is tracked
    const index = analyzeLineage(ast, { trackedCommands: [] });
    const foo = index.getFieldLineage('foo');
    // foo should not have a 'created' event since eval is filtered
    expect(foo?.events.filter(e => e.kind === 'created').length ?? 0).toBe(0);
  });

  it('still tracks fields when command is in trackedCommands', () => {
    const ast = parse(`index=main | eval foo=bar+1`);
    const index = analyzeLineage(ast, { trackedCommands: ['eval'] });
    const foo = index.getFieldLineage('foo');
    expect(foo).not.toBeNull();
    expect(foo?.events.some(e => e.kind === 'created')).toBe(true);
  });
});

describe('keyword function calls (true/false/null)', () => {
  it('parses case() with true() as default condition', () => {
    const ast = parse(`index=main | eval status=case(code>0, "ok", true(), "error")`);
    expect(ast.stages.length).toBe(2);
    expect(ast.stages[1].type).toBe('EvalCommand');
  });

  it('tracks field dependencies in case() correctly, excluding true()', () => {
    const ast = parse(`index=main | eval result=case(x>0, field1, true(), field2)`);
    const index = analyzeLineage(ast);
    const result = index.getFieldLineage('result');
    expect(result).not.toBeNull();
    // Should depend on x, field1, field2 but NOT "true"
    expect(result?.dependsOn ?? []).toContain('x');
    expect(result?.dependsOn ?? []).toContain('field1');
    expect(result?.dependsOn ?? []).toContain('field2');
    expect(result?.dependsOn ?? []).not.toContain('true');
  });

  it('handles if() with false() as else value', () => {
    const ast = parse(`index=main | eval x=if(a>0, 1, false())`);
    expect(ast.stages[1].type).toBe('EvalCommand');
    const index = analyzeLineage(ast);
    const x = index.getFieldLineage('x');
    expect(x?.dependsOn ?? []).toContain('a');
    expect(x?.dependsOn ?? []).not.toContain('false');
  });

  it('handles null() function in expressions', () => {
    // Note: 'field' is a keyword token, so we use 'myfield' instead
    const ast = parse(`index=main | eval x=if(isnotnull(myfield), myfield, null())`);
    expect(ast.stages[1].type).toBe('EvalCommand');
    const index = analyzeLineage(ast);
    const x = index.getFieldLineage('x');
    expect(x?.dependsOn ?? []).toContain('myfield');
    expect(x?.dependsOn ?? []).not.toContain('null');
  });

  it('handles multiline case() with true() default', () => {
    const spl = `index=main
| eval response_bucket = case(
    duration<0.1, "fast",
    duration<0.5, "normal",
    true(), "slow"
)`;
    const ast = parse(spl);
    expect(ast.stages.length).toBe(2);
    expect(ast.stages[1].type).toBe('EvalCommand');
    const index = analyzeLineage(ast);
    const result = index.getFieldLineage('response_bucket');
    expect(result?.dependsOn ?? []).toContain('duration');
    expect(result?.dependsOn ?? []).not.toContain('true');
  });
});

// =============================================================================
// INTEGRATION TESTS: MULTI-STAGE PIPELINES
// =============================================================================

describe('integration: multi-stage pipelines', () => {
  it('tracks fields through full ETL pipeline', () => {
    const spl = `index=main
| eval duration_ms=duration*1000
| rex field=message "status=(?<status>\\d+)"
| stats avg(duration_ms) as avg_duration by status
| rename avg_duration AS response_time
| table status, response_time`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // response_time should exist at the end
    expect(index.fieldExistsAt('response_time', 6)).toBe(true);
    expect(index.fieldExistsAt('status', 6)).toBe(true);

    // Original fields should be dropped after stats
    expect(index.fieldExistsAt('duration', 5)).toBe(false);
    expect(index.fieldExistsAt('duration_ms', 5)).toBe(false);
  });

  it('tracks field survival through multiple transformations', () => {
    const spl = `index=main
| eval a=1, b=2, c=3
| rename a AS x
| eval d=x+b
| stats sum(d) as total by c`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // After stats: only 'c' (BY field) and 'total' should exist
    expect(index.fieldExistsAt('total', 5)).toBe(true);
    expect(index.fieldExistsAt('c', 5)).toBe(true);
    expect(index.fieldExistsAt('x', 5)).toBe(false);
    expect(index.fieldExistsAt('b', 5)).toBe(false);
    expect(index.fieldExistsAt('d', 5)).toBe(false);
  });

  it('tracks field created, consumed, and dropped in same pipeline', () => {
    const spl = `index=main
| eval temp=a*b
| stats sum(temp) as total
| eval result=total*2`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    const temp = index.getFieldLineage('temp');
    expect(temp).not.toBeNull();
    // temp should be created, used in stats, and removed after aggregation
    expect(temp?.events.some(e => e.kind === 'created')).toBe(true);
    expect(index.fieldExistsAt('temp', 3)).toBe(false);
  });

  it('handles 5+ command pipeline', () => {
    const spl = `index=main
| eval step1=raw+1
| eval step2=step1*2
| eval step3=step2-1
| eval step4=step3/2
| eval step5=step4+10`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('step1')).not.toBeNull();
    expect(index.getFieldLineage('step5')).not.toBeNull();
    expect(index.getFieldLineage('step5')?.dependsOn).toContain('step4');
  });
});

// =============================================================================
// INTEGRATION TESTS: COMPLEX DEPENDENCY GRAPHS
// =============================================================================

describe('integration: complex dependency graphs', () => {
  it('handles diamond dependency pattern', () => {
    const spl = `index=main
| eval a=raw
| eval b=a+1, c=a+2
| eval d=b+c`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    const d = index.getFieldLineage('d');
    expect(d?.dependsOn).toContain('b');
    expect(d?.dependsOn).toContain('c');

    const b = index.getFieldLineage('b');
    const c = index.getFieldLineage('c');
    expect(b?.dependsOn).toContain('a');
    expect(c?.dependsOn).toContain('a');
  });

  it('handles long dependency chain', () => {
    const spl = `index=main
| eval a=x
| eval b=a+1
| eval c=b+1
| eval d=c+1
| eval e=d+1
| eval f=e+1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('f')?.dependsOn).toContain('e');
    expect(index.getFieldLineage('e')?.dependsOn).toContain('d');
    expect(index.getFieldLineage('d')?.dependsOn).toContain('c');
    expect(index.getFieldLineage('c')?.dependsOn).toContain('b');
    expect(index.getFieldLineage('b')?.dependsOn).toContain('a');
    expect(index.getFieldLineage('a')?.dependsOn).toContain('x');
  });

  it('handles multiple fields depending on same source', () => {
    const spl = `index=main
| eval x=source+1, y=source*2, z=source-1`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('x')?.dependsOn).toContain('source');
    expect(index.getFieldLineage('y')?.dependsOn).toContain('source');
    expect(index.getFieldLineage('z')?.dependsOn).toContain('source');
  });

  it('handles field consumed by multiple commands', () => {
    const spl = `index=main
| eval derived=field*2
| stats sum(field) as total, avg(field) as average by host`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('derived')).not.toBeNull();
    expect(index.getFieldLineage('total')).not.toBeNull();
    expect(index.getFieldLineage('average')).not.toBeNull();
  });
});

// =============================================================================
// INTEGRATION TESTS: IMPLICIT FIELDS
// =============================================================================

describe('integration: implicit fields', () => {
  it('implicit fields available at start', () => {
    const spl = `index=main`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // Implicit fields should be registered in the lineage index
    const implicitFields = index.getAllFields();
    expect(Array.isArray(implicitFields)).toBe(true);
    expect(implicitFields.length).toBeGreaterThan(0);
  });

  it('implicit fields dropped by stats without BY clause', () => {
    const spl = `index=main | stats count`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // After stats, implicit fields should be dropped
    expect(index.fieldExistsAt('_time', 2)).toBe(false);
    expect(index.fieldExistsAt('_raw', 2)).toBe(false);
    expect(index.fieldExistsAt('host', 2)).toBe(false);
  });

  it('implicit fields preserved by eventstats', () => {
    const spl = `index=main | eventstats count by host`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // After eventstats, implicit fields should still be tracked
    const fields = index.getAllFields();
    expect(fields.length).toBeGreaterThan(0);
  });

  it('_time automatically consumed by timechart', () => {
    const spl = `index=main | timechart count`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // timechart should register implicit fields in lineage data
    expect(index.getAllFields()).toContain('_time');
  });
});

// =============================================================================
// INTEGRATION TESTS: REAL-WORLD PATTERNS
// =============================================================================

describe('integration: real-world patterns', () => {
  it('handles web access log analysis pattern', () => {
    const spl = `index=web
| rex field=_raw "(?<method>\\w+)\\s+(?<url>\\S+)\\s+HTTP"
| eval is_error=if(status>=400, 1, 0)
| stats count, sum(is_error) as errors by method
| eval error_rate=errors/count*100`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('error_rate')).not.toBeNull();
    expect(index.getFieldLineage('error_rate')?.dependsOn).toContain('errors');
    expect(index.getFieldLineage('error_rate')?.dependsOn).toContain('count');
  });

  it('handles data enrichment with lookup pattern', () => {
    const spl = `index=main
| lookup users uid OUTPUT username, department
| stats count by department`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // department should be consumed by stats
    expect(index.getFieldLineage('department')?.events.some(e => e.kind === 'consumed')).toBe(true);
    // username should be dropped by stats (not in BY clause)
    expect(index.fieldExistsAt('username', 3)).toBe(false);
  });

  it('handles time-series analysis with eventstats', () => {
    const spl = `index=main
| eval response_time=duration*1000
| eventstats avg(response_time) as baseline by host
| eval deviation=response_time-baseline`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // All fields should survive eventstats
    expect(index.fieldExistsAt('response_time', 4)).toBe(true);
    expect(index.fieldExistsAt('baseline', 4)).toBe(true);
    expect(index.fieldExistsAt('deviation', 4)).toBe(true);
  });
});

// =============================================================================
// INTEGRATION TESTS: LINE NUMBER TRACKING
// =============================================================================

describe('integration: line number tracking', () => {
  it('tracks field availability at specific lines', () => {
    const spl = `index=main
| eval a=1
| eval b=a+1
| stats sum(b) as total`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // a exists after line 2, not before
    expect(index.fieldExistsAt('a', 2)).toBe(true);
    expect(index.fieldExistsAt('a', 1)).toBe(false);

    // b exists after line 3
    expect(index.fieldExistsAt('b', 3)).toBe(true);

    // a and b dropped after stats, only total exists
    expect(index.fieldExistsAt('total', 4)).toBe(true);
    expect(index.fieldExistsAt('a', 4)).toBe(false);
    expect(index.fieldExistsAt('b', 4)).toBe(false);
  });

  it('handles tab-indented commands', () => {
    const spl = `index=main
\t| eval a=1
\t| eval b=2`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('a')).not.toBeNull();
    expect(index.getFieldLineage('b')).not.toBeNull();
  });
});

// =============================================================================
// INTEGRATION TESTS: STRESS TESTS
// =============================================================================

describe('integration: stress tests', () => {
  it('handles pipeline with 20+ stages', () => {
    const stages = Array.from({ length: 20 }, (_, i) => `| eval field${i}=${i}`).join('\n');
    const spl = `index=main\n${stages}`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('field0')).not.toBeNull();
    expect(index.getFieldLineage('field19')).not.toBeNull();
    expect(index.getStages().length).toBe(21); // search + 20 evals
  });

  it('handles single eval with many assignments', () => {
    const assignments = Array.from({ length: 30 }, (_, i) => `f${i}=${i}`).join(', ');
    const spl = `index=main | eval ${assignments}`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('f0')).not.toBeNull();
    expect(index.getFieldLineage('f29')).not.toBeNull();
  });

  it('handles deeply nested function calls', () => {
    const spl = `index=main | eval x=lower(upper(trim(substr(field, 0, 10))))`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    expect(index.getFieldLineage('x')).not.toBeNull();
    expect(index.getFieldLineage('x')?.dependsOn).toContain('field');
  });
});

// =============================================================================
// TABLE COMMAND ASTERISK HANDLING
// =============================================================================

describe('table command with asterisk', () => {
  it('table * preserves all fields', () => {
    const spl = `index=main | eval foo=1, bar=2 | table *`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // All fields should still exist after table *
    expect(index.fieldExistsAt('foo', 3)).toBe(true);
    expect(index.fieldExistsAt('bar', 3)).toBe(true);
    expect(index.fieldExistsAt('_time', 3)).toBe(true);
    expect(index.fieldExistsAt('host', 3)).toBe(true);
  });

  it('table host, * preserves all fields (asterisk takes precedence)', () => {
    const spl = `index=main | eval foo=1, bar=2 | table host, *`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // All fields should still exist after table host, *
    expect(index.fieldExistsAt('foo', 3)).toBe(true);
    expect(index.fieldExistsAt('bar', 3)).toBe(true);
    expect(index.fieldExistsAt('host', 3)).toBe(true);
    expect(index.fieldExistsAt('_time', 3)).toBe(true);
  });

  it('table host, source drops other fields', () => {
    const spl = `index=main | eval foo=1, bar=2 | table host, source`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // Only host and source should exist after table
    expect(index.fieldExistsAt('host', 3)).toBe(true);
    expect(index.fieldExistsAt('source', 3)).toBe(true);
    // Other fields should be dropped
    expect(index.fieldExistsAt('foo', 3)).toBe(false);
    expect(index.fieldExistsAt('bar', 3)).toBe(false);
    expect(index.fieldExistsAt('_time', 3)).toBe(false);
  });

  it('fields + * preserves all fields', () => {
    const spl = `index=main | eval foo=1, bar=2 | fields *`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // All fields should still exist after fields *
    expect(index.fieldExistsAt('foo', 3)).toBe(true);
    expect(index.fieldExistsAt('bar', 3)).toBe(true);
    expect(index.fieldExistsAt('_time', 3)).toBe(true);
  });

  it('fields - host removes specific field but keeps others', () => {
    const spl = `index=main | eval foo=1 | fields - host`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // host should be removed, others preserved
    expect(index.fieldExistsAt('host', 3)).toBe(false);
    expect(index.fieldExistsAt('foo', 3)).toBe(true);
    expect(index.fieldExistsAt('_time', 3)).toBe(true);
  });
});

// =============================================================================
// MAKEMV COMMAND FIELD LINEAGE
// =============================================================================

describe('makemv command', () => {
  it('makemv consumes the target field', () => {
    const spl = `index=main | eval mylist="a,b,c" | makemv delim="," mylist`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // mylist should be consumed by makemv
    const mylistLineage = index.getFieldLineage('mylist');
    const consumedEvent = mylistLineage?.events.find(e => e.kind === 'consumed' && e.command === 'makemv');
    expect(consumedEvent).toBeDefined();
    expect(consumedEvent?.command).toBe('makemv');
  });

  it('makemv field exists after command', () => {
    const spl = `index=main | eval mylist="a,b,c" | makemv delim="," mylist`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // mylist should still exist after makemv (it modifies, doesn't drop)
    expect(index.fieldExistsAt('mylist', 3)).toBe(true);
  });

  it('makemv with tokenizer option consumes field', () => {
    const spl = `index=main | eval myvals="x;y;z" | makemv tokenizer="([^;]+)" myvals`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // myvals should be consumed by makemv
    const myvalsLineage = index.getFieldLineage('myvals');
    const consumedEvent = myvalsLineage?.events.find(e => e.kind === 'consumed' && e.command === 'makemv');
    expect(consumedEvent).toBeDefined();
  });

  it('makemv on implicit field source consumes it', () => {
    const spl = `index=main | makemv delim="/" source`;
    const ast = parse(spl);
    const index = analyzeLineage(ast);

    // source is implicit and should be consumed by makemv
    const sourceLineage = index.getFieldLineage('source');
    const consumedEvent = sourceLineage?.events.find(e => e.kind === 'consumed' && e.command === 'makemv');
    expect(consumedEvent).toBeDefined();
  });
});
