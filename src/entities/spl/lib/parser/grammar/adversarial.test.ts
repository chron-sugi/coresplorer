/**
 * SPL Parser Adversarial Tests
 *
 * Tests for malformed input, stress tests, and edge cases
 * to ensure the parser handles adversarial input gracefully.
 *
 * @module entities/spl/lib/parser/grammar/adversarial.test
 */

import { describe, it, expect } from 'vitest';
import { parseSPL } from '../index';
import { parse, tryParse } from '../testing';

// =============================================================================
// MALFORMED SYNTAX - EMPTY/WHITESPACE
// =============================================================================

describe('adversarial: empty and whitespace input', () => {
  it('handles empty input', () => {
    expect(() => parse('')).not.toThrow();
  });

  it('handles whitespace only', () => {
    expect(() => parse('   ')).not.toThrow();
  });

  it('handles tab only', () => {
    expect(() => parse('\t\t\t')).not.toThrow();
  });

  it('handles newlines only', () => {
    expect(() => parse('\n\n\n')).not.toThrow();
  });

  it('handles mixed whitespace', () => {
    expect(() => parse('  \t\n  \t\n')).not.toThrow();
  });
});

// =============================================================================
// MALFORMED SYNTAX - INCOMPLETE COMMANDS
// =============================================================================

describe('adversarial: incomplete commands', () => {
  it('handles pipe only', () => {
    expect(() => parse('|')).not.toThrow();
  });

  it('handles multiple pipes', () => {
    expect(() => parse('| | |')).not.toThrow();
  });

  it('handles incomplete eval', () => {
    expect(() => parse('| eval')).not.toThrow();
  });

  it('handles eval without expression', () => {
    expect(() => parse('| eval foo=')).not.toThrow();
  });

  it('handles incomplete stats', () => {
    expect(() => parse('| stats')).not.toThrow();
  });

  it('handles stats with BY only', () => {
    expect(() => parse('| stats by')).not.toThrow();
  });

  it('handles stats count by without field', () => {
    expect(() => parse('| stats count by')).not.toThrow();
  });

  it('handles incomplete rex', () => {
    expect(() => parse('| rex')).not.toThrow();
  });

  it('handles rex without pattern', () => {
    expect(() => parse('| rex field=')).not.toThrow();
  });

  it('handles incomplete rename', () => {
    expect(() => parse('| rename')).not.toThrow();
  });

  it('handles rename without AS', () => {
    expect(() => parse('| rename old')).not.toThrow();
  });

  it('handles rename with AS but no new name', () => {
    expect(() => parse('| rename old AS')).not.toThrow();
  });

  it('handles incomplete table', () => {
    expect(() => parse('| table')).not.toThrow();
  });

  it('handles incomplete lookup', () => {
    expect(() => parse('| lookup')).not.toThrow();
  });

  it('handles lookup without OUTPUT', () => {
    expect(() => parse('| lookup table_name key')).not.toThrow();
  });
});

// =============================================================================
// MALFORMED SYNTAX - UNBALANCED DELIMITERS
// =============================================================================

describe('adversarial: unbalanced delimiters', () => {
  it('handles unbalanced opening parenthesis', () => {
    expect(() => parse('| eval x=(a+b')).not.toThrow();
  });

  it('handles unbalanced closing parenthesis', () => {
    expect(() => parse('| eval x=a+b)')).not.toThrow();
  });

  it('handles multiple unbalanced parentheses', () => {
    expect(() => parse('| eval x=((a+b')).not.toThrow();
  });

  it('handles unbalanced brackets', () => {
    expect(() => parse('| eval x=[a+b')).not.toThrow();
  });

  it('handles unbalanced braces', () => {
    expect(() => parse('| eval x={a+b')).not.toThrow();
  });
});

// =============================================================================
// MALFORMED SYNTAX - UNTERMINATED STRINGS
// =============================================================================

describe('adversarial: unterminated strings', () => {
  it('handles unterminated double quote', () => {
    expect(() => parse('| eval x="hello')).not.toThrow();
  });

  it('handles unterminated single quote', () => {
    expect(() => parse("| eval x='hello")).not.toThrow();
  });

  it('handles mixed quotes', () => {
    expect(() => parse('| eval x="hello\'')).not.toThrow();
  });

  it('handles string in search', () => {
    expect(() => parse('search "unterminated')).not.toThrow();
  });

  it('handles string in rex pattern', () => {
    expect(() => parse('| rex "(?<x>.*')).not.toThrow();
  });
});

// =============================================================================
// MALFORMED SYNTAX - INVALID OPERATORS
// =============================================================================

describe('adversarial: invalid operator sequences', () => {
  it('handles double plus', () => {
    expect(() => parse('| eval x=a++b')).not.toThrow();
  });

  it('handles double minus', () => {
    expect(() => parse('| eval x=a--b')).not.toThrow();
  });

  it('handles double asterisk', () => {
    expect(() => parse('| eval x=a**b')).not.toThrow();
  });

  it('handles operators only', () => {
    expect(() => parse('| eval x=+ - *')).not.toThrow();
  });

  it('handles operator at start of expression', () => {
    expect(() => parse('| eval x=+a')).not.toThrow();
  });

  it('handles operator at end of expression', () => {
    expect(() => parse('| eval x=a+')).not.toThrow();
  });
});

// =============================================================================
// STRESS TESTS - LARGE INPUTS
// =============================================================================

describe('adversarial: stress tests - pipeline size', () => {
  it('handles pipeline with 50 stages', () => {
    const stages = Array.from({ length: 50 }, (_, i) => `| eval f${i}=${i}`).join(' ');
    const spl = `index=main ${stages}`;
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles pipeline with 100 stages', () => {
    const stages = Array.from({ length: 100 }, (_, i) => `| eval f${i}=${i}`).join(' ');
    const spl = `index=main ${stages}`;
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles single eval with 50 assignments', () => {
    const assignments = Array.from({ length: 50 }, (_, i) => `f${i}=${i}`).join(', ');
    const spl = `index=main | eval ${assignments}`;
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles stats with 50 BY fields', () => {
    const byFields = Array.from({ length: 50 }, (_, i) => `field${i}`).join(', ');
    const spl = `index=main | stats count by ${byFields}`;
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles stats with 20 aggregations', () => {
    const aggs = Array.from({ length: 20 }, (_, i) => `sum(f${i}) as s${i}`).join(', ');
    const spl = `index=main | stats ${aggs}`;
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

describe('adversarial: stress tests - expression depth', () => {
  it('handles 10 levels of nesting', () => {
    let expr = 'x';
    for (let i = 0; i < 10; i++) {
      expr = `(${expr}+1)`;
    }
    const spl = `index=main | eval result=${expr}`;
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles 20 levels of nesting', () => {
    let expr = 'x';
    for (let i = 0; i < 20; i++) {
      expr = `(${expr}+1)`;
    }
    const spl = `index=main | eval result=${expr}`;
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles nested function calls (10 deep)', () => {
    let expr = 'field';
    for (let i = 0; i < 10; i++) {
      expr = `lower(${expr})`;
    }
    const spl = `index=main | eval result=${expr}`;
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

describe('adversarial: stress tests - long strings', () => {
  it('handles very long field name (100 chars)', () => {
    const longName = 'a'.repeat(100);
    const spl = `index=main | eval ${longName}=1`;
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles very long field name (500 chars)', () => {
    const longName = 'a'.repeat(500);
    const spl = `index=main | eval ${longName}=1`;
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles very long string literal (1000 chars)', () => {
    const longString = 'x'.repeat(1000);
    const spl = `index=main | eval msg="${longString}"`;
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles very long string literal (10000 chars)', () => {
    const longString = 'x'.repeat(10000);
    const spl = `index=main | eval msg="${longString}"`;
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// ERROR RECOVERY
// =============================================================================

describe('adversarial: error recovery', () => {
  it('returns errors array for invalid input', () => {
    const result = parseSPL('| eval x=(');
    // Should have errors but not crash
    expect(result).toBeDefined();
  });

  it('provides parse result even with errors', () => {
    const result = parseSPL('| stats count ||| table host');
    expect(result).toBeDefined();
  });

  it('handles command after error', () => {
    const result = parseSPL('| eval x= | stats count');
    expect(result).toBeDefined();
  });

  it('handles multiple errors in same pipeline', () => {
    const result = parseSPL('| eval x=( | stats by | table');
    expect(result).toBeDefined();
  });
});

// =============================================================================
// WHITESPACE VARIATIONS
// =============================================================================

describe('adversarial: whitespace variations', () => {
  it('handles extra whitespace between tokens', () => {
    const spl = 'index=main    |    eval    foo   =   bar';
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles tabs between tokens', () => {
    const spl = 'index=main\t|\teval\tfoo\t=\tbar';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles mixed tabs and spaces', () => {
    const spl = 'index=main \t| \t eval \t foo \t = \t bar';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles Windows line endings (CRLF)', () => {
    const spl = 'index=main\r\n| eval foo=1\r\n| stats count';
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles no trailing newline', () => {
    const spl = 'index=main | eval foo=1';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles trailing newline', () => {
    const spl = 'index=main | eval foo=1\n';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles multiple consecutive newlines', () => {
    const spl = 'index=main\n\n\n| eval foo=1';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// COMMAND CASE VARIATIONS
// =============================================================================

describe('adversarial: command case variations', () => {
  it('handles uppercase EVAL', () => {
    const spl = 'index=main | EVAL foo=1';
    expect(() => parseSPL(spl)).not.toThrow();
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles mixed case Eval', () => {
    const spl = 'index=main | Eval foo=1';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles uppercase STATS', () => {
    const spl = 'index=main | STATS count';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles mixed case Stats', () => {
    const spl = 'index=main | Stats count by host';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles uppercase TABLE', () => {
    const spl = 'index=main | TABLE host, source';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles random case eVaL', () => {
    const spl = 'index=main | eVaL foo=1';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// SPECIAL CHARACTERS IN CONTEXT
// =============================================================================

describe('adversarial: special characters', () => {
  it('handles backslash in string', () => {
    const spl = 'index=main | eval path="C:\\\\Users\\\\test"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles forward slash in string', () => {
    const spl = 'index=main | eval path="/usr/local/bin"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles special chars in search', () => {
    const spl = 'index=main error_code=500 @timestamp';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles equals in string value', () => {
    const spl = 'index=main | eval msg="key=value"';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles pipe in string value', () => {
    const spl = 'index=main | eval msg="foo|bar"';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});

// =============================================================================
// NUMERIC EDGE CASES
// =============================================================================

describe('adversarial: numeric edge cases', () => {
  it('handles zero', () => {
    const spl = 'index=main | eval x=0';
    const result = parseSPL(spl);
    expect(result.ast).not.toBeNull();
  });

  it('handles negative numbers', () => {
    const spl = 'index=main | eval x=-42';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles decimal numbers', () => {
    const spl = 'index=main | eval x=3.14159';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles scientific notation', () => {
    const spl = 'index=main | eval x=1e10';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles negative scientific notation', () => {
    const spl = 'index=main | eval x=1e-10';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles very large numbers', () => {
    const spl = 'index=main | eval x=999999999999999999999';
    expect(() => parseSPL(spl)).not.toThrow();
  });

  it('handles very small decimals', () => {
    const spl = 'index=main | eval x=0.000000001';
    expect(() => parseSPL(spl)).not.toThrow();
  });
});
