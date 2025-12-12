/**
 * Demonstration Tests for LineageTestBuilder
 *
 * Shows how to use the fluent API to write clean, readable E2E tests
 * for field lineage analysis across all SPL commands.
 */

import { describe, it } from 'vitest';
import { testLineage, testMultiple, testCommandVariations } from './test-builder';

describe('LineageTestBuilder - Basic Usage', () => {
  it('should test simple eval command', () => {
    testLineage('index=main | eval total=price*quantity')
      .expectFieldCreated('total')
      .expectFieldDependsOn('total', ['price', 'quantity'])
      .expectFieldConsumed('price')
      .expectFieldConsumed('quantity')
      .expectFieldAlive('total');
  });

  it('should test multiple field creation', () => {
    testLineage('index=main | eval total=price*qty, discount=price*0.1')
      .expectFieldsCreated('total', 'discount')
      .expectFieldDependsOn('total', ['price', 'qty'])
      .expectFieldDependsOn('discount', ['price']);
  });

  it('should test field dropping with fields command', () => {
    testLineage('index=main | eval foo=bar | fields - foo')
      .expectFieldCreated('foo')
      .expectFieldDropped('foo')
      .expectFieldDroppedAtEnd('foo');
  });

  it('should test stats aggregation', () => {
    testLineage('index=main | stats count by host')
      .expectFieldCreated('count')
      .expectFieldConsumed('host')
      .expectFieldAlive('count')
      .expectFieldAlive('host');
  });
});

describe('LineageTestBuilder - Batch Testing', () => {
  it('should test whitespace variations', () => {
    testMultiple(
      [
        'index=main | eval foo=bar',
        'index=main|eval foo=bar',
        'index=main | eval foo = bar',
        'index=main|eval foo = bar',
      ],
      (test) => {
        test
          .expectFieldCreated('foo')
          .expectFieldDependsOn('foo', ['bar'])
          .expectFieldConsumed('bar');
      }
    );
  });
});

describe('LineageTestBuilder - Command Variations', () => {
  it('should test eval variations', () => {
    testCommandVariations('eval', [
      {
        spl: 'foo=bar',
        expectFields: ['foo'],
        expectDeps: { foo: ['bar'] },
        expectConsumed: ['bar'],
      },
      {
        spl: 'foo=bar+baz',
        expectFields: ['foo'],
        expectDeps: { foo: ['bar', 'baz'] },
        expectConsumed: ['bar', 'baz'],
      },
      {
        spl: 'foo=1+2',
        expectFields: ['foo'],
        expectDeps: { foo: [] },
      },
    ]);
  });
});

describe('LineageTestBuilder - Snapshot Testing', () => {
  it('should create snapshot of complex pipeline', () => {
    testLineage('index=main | eval total=price*qty | stats sum(total) as revenue by category')
      .expectMatchesSnapshot();
  });
});
