/**
 * Eval Command Handler Tests
 *
 * Comprehensive tests for the eval command handler including:
 * - Basic functionality
 * - Edge cases
 * - Function coverage
 * - Adversarial tests
 * - Data type inference
 *
 * @module features/field-lineage/lib/command-handlers/eval.test
 */

import { describe, it, expect } from 'vitest';
import {
  testLineage,
  expectFieldEvent,
  expectFieldDependsOn,
  expectFieldNotDependsOn,
  expectFieldDataType,
  expectFieldConfidence,
  expectFieldCreatedAtLine,
  getCreatedEvent,
  generateNestedExpression,
  generateLargeEval,
} from '../testing';

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

describe('eval command: basic functionality', () => {
  it('creates field from simple literal assignment', () => {
    const index = testLineage('index=main | eval foo=1');
    const foo = index.getFieldLineage('foo');
    expect(foo).not.toBeNull();
    expectFieldEvent(index, 'foo', 'created');
  });

  it('creates field from string literal', () => {
    const index = testLineage('index=main | eval msg="hello world"');
    const msg = index.getFieldLineage('msg');
    expect(msg).not.toBeNull();
    expectFieldEvent(index, 'msg', 'created');
  });

  it('handles multiple comma-separated assignments', () => {
    const index = testLineage('index=main | eval foo=1, bar=2, baz=3');
    expect(index.getFieldLineage('foo')).not.toBeNull();
    expect(index.getFieldLineage('bar')).not.toBeNull();
    expect(index.getFieldLineage('baz')).not.toBeNull();
  });

  it('tracks dependencies from field references', () => {
    const index = testLineage('index=main | eval total=price*qty');
    expectFieldDependsOn(index, 'total', 'price', 'qty');
  });

  it('tracks dependencies in nested function calls', () => {
    const index = testLineage('index=main | eval x=lower(upper(trim(field)))');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('tracks dependencies from binary expressions', () => {
    const index = testLineage('index=main | eval sum=a+b+c+d');
    expectFieldDependsOn(index, 'sum', 'a', 'b', 'c', 'd');
  });

  it('creates multiple fields with inter-dependencies', () => {
    const index = testLineage('index=main | eval foo=bar, baz=foo+1');
    expectFieldDependsOn(index, 'foo', 'bar');
    expectFieldDependsOn(index, 'baz', 'foo');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('eval command: edge cases', () => {
  it('handles field that overwrites itself', () => {
    const index = testLineage('index=main | eval foo=foo+1');
    const foo = index.getFieldLineage('foo');
    expect(foo).not.toBeNull();
    expectFieldDependsOn(index, 'foo', 'foo');
  });

  it('handles circular-like reference in same eval', () => {
    const index = testLineage('index=main | eval foo=bar, bar=foo');
    // Both fields should be created
    expect(index.getFieldLineage('foo')).not.toBeNull();
    expect(index.getFieldLineage('bar')).not.toBeNull();
  });

  it('handles self-referencing counter pattern', () => {
    const index = testLineage('index=main | eval counter=counter+1');
    expectFieldDependsOn(index, 'counter', 'counter');
  });

  it('handles field name with numbers', () => {
    const index = testLineage('index=main | eval field123=456');
    expect(index.getFieldLineage('field123')).not.toBeNull();
  });

  it('handles reserved-word-like field names', () => {
    const index = testLineage('index=main | eval count=1, sum=2, avg=3');
    expect(index.getFieldLineage('count')).not.toBeNull();
    expect(index.getFieldLineage('sum')).not.toBeNull();
    expect(index.getFieldLineage('avg')).not.toBeNull();
  });

  it('handles underscore-prefixed fields', () => {
    const index = testLineage('index=main | eval _custom=1');
    expect(index.getFieldLineage('_custom')).not.toBeNull();
  });

  it('handles very long field names', () => {
    const longName = 'a'.repeat(100);
    const index = testLineage(`index=main | eval ${longName}=1`);
    expect(index.getFieldLineage(longName)).not.toBeNull();
  });

  it('handles multiline eval command', () => {
    const spl = `index=main
| eval
    foo=bar+1,
    baz=qux*2,
    combined=foo+baz`;
    const index = testLineage(spl);
    expect(index.getFieldLineage('foo')).not.toBeNull();
    expect(index.getFieldLineage('baz')).not.toBeNull();
    expect(index.getFieldLineage('combined')).not.toBeNull();
  });

  it('tracks correct line numbers for multiline eval', () => {
    const spl = `index=main
| eval
    foo=bar+1,
    baz=qux*2`;
    const index = testLineage(spl);

    // foo should be created on line 3, baz on line 4
    expectFieldCreatedAtLine(index, 'foo', 3);
    expectFieldCreatedAtLine(index, 'baz', 4);
  });
});

// =============================================================================
// FUNCTION COVERAGE
// =============================================================================

describe('eval command: string functions', () => {
  it('handles lower()', () => {
    const index = testLineage('index=main | eval x=lower(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'string');
  });

  it('handles upper()', () => {
    const index = testLineage('index=main | eval x=upper(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'string');
  });

  it('handles substr()', () => {
    const index = testLineage('index=main | eval x=substr(field, 0, 10)');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles len()', () => {
    const index = testLineage('index=main | eval x=len(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles replace()', () => {
    const index = testLineage('index=main | eval x=replace(field, "old", "new")');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles split()', () => {
    const index = testLineage('index=main | eval x=split(field, ",")');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles trim()', () => {
    const index = testLineage('index=main | eval x=trim(field)');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles ltrim() and rtrim()', () => {
    const index = testLineage('index=main | eval x=ltrim(rtrim(field))');
    expectFieldDependsOn(index, 'x', 'field');
  });
});

describe('eval command: numeric functions', () => {
  it('handles abs()', () => {
    const index = testLineage('index=main | eval x=abs(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles ceil()', () => {
    const index = testLineage('index=main | eval x=ceil(field)');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles floor()', () => {
    const index = testLineage('index=main | eval x=floor(field)');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles round()', () => {
    const index = testLineage('index=main | eval x=round(field, 2)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles sqrt()', () => {
    const index = testLineage('index=main | eval x=sqrt(field)');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles pow()', () => {
    const index = testLineage('index=main | eval x=pow(base, exponent)');
    expectFieldDependsOn(index, 'x', 'base', 'exponent');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles log()', () => {
    const index = testLineage('index=main | eval x=log(field)');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles exp()', () => {
    const index = testLineage('index=main | eval x=exp(field)');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles pi()', () => {
    const index = testLineage('index=main | eval x=pi()');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });

  it('handles random()', () => {
    const index = testLineage('index=main | eval x=random()');
    expectFieldDataType(index, 'x', 'number');
  });
});

describe('eval command: conditional functions', () => {
  it('handles if() with field references', () => {
    const index = testLineage('index=main | eval x=if(a>b, "yes", "no")');
    expectFieldDependsOn(index, 'x', 'a', 'b');
  });

  it('handles case() with multiple conditions', () => {
    const index = testLineage(
      'index=main | eval x=case(a>0, "pos", a<0, "neg", true(), "zero")'
    );
    expectFieldDependsOn(index, 'x', 'a');
    // Should NOT depend on "true" (it's a function)
    expectFieldNotDependsOn(index, 'x', 'true');
  });

  it('handles coalesce()', () => {
    const index = testLineage('index=main | eval x=coalesce(a, b, c)');
    expectFieldDependsOn(index, 'x', 'a', 'b', 'c');
  });

  it('handles nullif()', () => {
    const index = testLineage('index=main | eval x=nullif(a, b)');
    expectFieldDependsOn(index, 'x', 'a', 'b');
  });

  it('handles nested if()', () => {
    const index = testLineage(
      'index=main | eval x=if(a>0, if(a>10, "high", "medium"), "low")'
    );
    expectFieldDependsOn(index, 'x', 'a');
  });
});

describe('eval command: time functions', () => {
  it('handles now()', () => {
    const index = testLineage('index=main | eval x=now()');
    expectFieldDataType(index, 'x', 'time');
  });

  it('handles strftime()', () => {
    const index = testLineage('index=main | eval x=strftime(_time, "%Y-%m-%d")');
    expectFieldDependsOn(index, 'x', '_time');
    expectFieldDataType(index, 'x', 'time');
  });

  it('handles strptime()', () => {
    const index = testLineage('index=main | eval x=strptime(timestr, "%Y-%m-%d")');
    expectFieldDependsOn(index, 'x', 'timestr');
  });

  it('handles relative_time()', () => {
    const index = testLineage('index=main | eval x=relative_time(now(), "-1d@d")');
    expectFieldDataType(index, 'x', 'time');
  });
});

describe('eval command: type conversion functions', () => {
  it('handles tonumber()', () => {
    const index = testLineage('index=main | eval x=tonumber(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles tostring()', () => {
    const index = testLineage('index=main | eval x=tostring(field)');
    expectFieldDataType(index, 'x', 'string');
  });

  it('handles tostring() with format', () => {
    const index = testLineage('index=main | eval x=tostring(field, "commas")');
    expectFieldDataType(index, 'x', 'string');
  });
});

describe('eval command: multivalue functions', () => {
  it('handles mvcount()', () => {
    const index = testLineage('index=main | eval x=mvcount(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'number');
  });

  it('handles mvindex()', () => {
    const index = testLineage('index=main | eval x=mvindex(field, 0)');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles mvjoin()', () => {
    const index = testLineage('index=main | eval x=mvjoin(field, ",")');
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles mvfilter()', () => {
    const index = testLineage('index=main | eval x=mvfilter(match(field, "pattern"))');
    expectFieldDependsOn(index, 'x', 'field');
  });
});

describe('eval command: null handling functions', () => {
  it('handles isnull()', () => {
    const index = testLineage('index=main | eval x=isnull(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'boolean');
  });

  it('handles isnotnull()', () => {
    const index = testLineage('index=main | eval x=isnotnull(field)');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldDataType(index, 'x', 'boolean');
  });

  it('handles null() function', () => {
    const index = testLineage('index=main | eval x=if(isnotnull(field), field, null())');
    expectFieldDependsOn(index, 'x', 'field');
    // Should NOT depend on "null"
    expectFieldNotDependsOn(index, 'x', 'null');
  });
});

// =============================================================================
// DATA TYPE INFERENCE
// =============================================================================

describe('eval command: data type inference', () => {
  it('infers string type from string literal', () => {
    const index = testLineage('index=main | eval x="hello"');
    expectFieldDataType(index, 'x', 'string');
  });

  it('infers number type from number literal', () => {
    const index = testLineage('index=main | eval x=42');
    expectFieldDataType(index, 'x', 'number');
  });

  it('infers boolean type from comparison', () => {
    const index = testLineage('index=main | eval x=a>b');
    expectFieldDataType(index, 'x', 'boolean');
  });

  it('infers number type from arithmetic', () => {
    const index = testLineage('index=main | eval x=a+b');
    expectFieldDataType(index, 'x', 'number');
  });

  it('infers string type from concatenation (.)', () => {
    const index = testLineage('index=main | eval x=a.b');
    expectFieldDataType(index, 'x', 'string');
  });

  it('infers number type from subtraction', () => {
    const index = testLineage('index=main | eval x=a-b');
    expectFieldDataType(index, 'x', 'number');
  });

  it('infers number type from multiplication', () => {
    const index = testLineage('index=main | eval x=a*b');
    expectFieldDataType(index, 'x', 'number');
  });

  it('infers number type from division', () => {
    const index = testLineage('index=main | eval x=a/b');
    expectFieldDataType(index, 'x', 'number');
  });

  it('infers number type from modulo', () => {
    const index = testLineage('index=main | eval x=a%b');
    expectFieldDataType(index, 'x', 'number');
  });

  it('infers boolean type from equality comparison', () => {
    const index = testLineage('index=main | eval x=a=b');
    expectFieldDataType(index, 'x', 'boolean');
  });

  it('infers boolean type from inequality comparison', () => {
    const index = testLineage('index=main | eval x=a!=b');
    expectFieldDataType(index, 'x', 'boolean');
  });
});

// =============================================================================
// CONFIDENCE LEVEL
// =============================================================================

describe('eval command: confidence level', () => {
  it('has certain confidence for eval fields', () => {
    const index = testLineage('index=main | eval x=1');
    expectFieldConfidence(index, 'x', 'certain');
  });

  it('has certain confidence for computed fields', () => {
    const index = testLineage('index=main | eval x=a+b');
    expectFieldConfidence(index, 'x', 'certain');
  });

  it('has certain confidence for function-derived fields', () => {
    const index = testLineage('index=main | eval x=lower(field)');
    expectFieldConfidence(index, 'x', 'certain');
  });
});

// =============================================================================
// ADVERSARIAL TESTS
// =============================================================================

describe('eval command: adversarial tests', () => {
  it('handles deeply nested expressions (10 levels)', () => {
    const spl = generateNestedExpression(10);
    const index = testLineage(spl);
    expect(index.getFieldLineage('result')).not.toBeNull();
  });

  it('handles deeply nested expressions (20 levels)', () => {
    const spl = generateNestedExpression(20);
    const index = testLineage(spl);
    expect(index.getFieldLineage('result')).not.toBeNull();
  });

  it('handles large number of assignments (50)', () => {
    const spl = generateLargeEval(50);
    const index = testLineage(spl);
    expect(index.getFieldLineage('field0')).not.toBeNull();
    expect(index.getFieldLineage('field49')).not.toBeNull();
  });

  it('handles complex nested function calls', () => {
    const index = testLineage(
      'index=main | eval x=lower(trim(substr(upper(field), 0, 10)))'
    );
    expectFieldDependsOn(index, 'x', 'field');
  });

  it('handles multiple operators in expression', () => {
    const index = testLineage('index=main | eval x=a+b-c*d/e%f');
    expectFieldDependsOn(index, 'x', 'a', 'b', 'c', 'd', 'e', 'f');
  });

  it('handles parenthesized expressions', () => {
    const index = testLineage('index=main | eval x=(a+b)*(c-d)');
    expectFieldDependsOn(index, 'x', 'a', 'b', 'c', 'd');
  });

  it('handles negative numbers', () => {
    const index = testLineage('index=main | eval x=-5');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });

  it('handles decimal numbers', () => {
    const index = testLineage('index=main | eval x=3.14159');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });

  it('handles scientific notation', () => {
    const index = testLineage('index=main | eval x=1e10');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });

  it('handles empty string literal', () => {
    const index = testLineage('index=main | eval x=""');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });

  it('handles string with escaped quotes', () => {
    const index = testLineage('index=main | eval x="hello \\"world\\""');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });

  it('handles string with special characters', () => {
    const index = testLineage('index=main | eval x="line1\\nline2\\ttab"');
    expect(index.getFieldLineage('x')).not.toBeNull();
  });
});

// =============================================================================
// EXPRESSION STRING CONVERSION
// =============================================================================

describe('eval command: expression string conversion', () => {
  it('captures expression in event', () => {
    const index = testLineage('index=main | eval total=price*qty');
    const lineage = index.getFieldLineage('total');
    const created = getCreatedEvent(lineage);
    expect(created?.expression).toBeDefined();
    expect(created?.expression).toContain('price');
    expect(created?.expression).toContain('qty');
  });

  it('captures function call expression', () => {
    const index = testLineage('index=main | eval x=lower(field)');
    const lineage = index.getFieldLineage('x');
    const created = getCreatedEvent(lineage);
    expect(created?.expression).toContain('lower');
  });
});

// =============================================================================
// KEYWORD FUNCTIONS (true/false/null)
// =============================================================================

describe('eval command: keyword functions', () => {
  it('handles true() as condition in case()', () => {
    const index = testLineage(
      'index=main | eval status=case(code>0, "ok", true(), "error")'
    );
    expect(index.getFieldLineage('status')).not.toBeNull();
    expectFieldDependsOn(index, 'status', 'code');
    expectFieldNotDependsOn(index, 'status', 'true');
  });

  it('handles false() in expressions', () => {
    const index = testLineage('index=main | eval x=if(a>0, 1, false())');
    expectFieldDependsOn(index, 'x', 'a');
    expectFieldNotDependsOn(index, 'x', 'false');
  });

  it('handles null() in coalesce-like patterns', () => {
    const index = testLineage('index=main | eval x=if(isnotnull(field), field, null())');
    expectFieldDependsOn(index, 'x', 'field');
    expectFieldNotDependsOn(index, 'x', 'null');
  });
});
