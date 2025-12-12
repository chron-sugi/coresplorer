/**
 * Test Builder - Fluent API for Field Lineage Testing
 *
 * Provides a clean, declarative way to write E2E tests for SPL field lineage.
 * Makes it easy to test all 61+ commands with minimal boilerplate.
 *
 * @module entities/field/lib/lineage/testing/test-builder
 * @example
 * ```typescript
 * testLineage('index=main | eval total=price*quantity')
 *   .expectFieldCreated('total')
 *   .expectFieldDependsOn('total', ['price', 'quantity'])
 *   .expectFieldConsumed('price')
 *   .expectFieldConsumed('quantity');
 * ```
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'vitest';
import { parseSPL } from '@/entities/spl';
import { analyzeLineage } from '../analyzer';
import type { LineageIndex, FieldLineage, FieldEventKind } from '../../../model/lineage.types';

// =============================================================================
// CORE TEST BUILDER
// =============================================================================

/**
 * Fluent test builder for field lineage assertions.
 *
 * Provides chainable methods to verify field behavior in SPL queries.
 */
export class LineageTestBuilder {
  private index: LineageIndex;
  private spl: string;

  constructor(spl: string) {
    this.spl = spl;
    const parseResult = parseSPL(spl);
    if (!parseResult.ast) {
      const errors = [...parseResult.lexErrors, ...parseResult.parseErrors];
      throw new Error(`Failed to parse SPL: ${spl}\nErrors: ${JSON.stringify(errors)}`);
    }
    this.index = analyzeLineage(parseResult.ast);
  }

  /**
   * Get the lineage index for custom assertions.
   */
  getIndex(): LineageIndex {
    return this.index;
  }

  /**
   * Get lineage for a specific field.
   */
  getFieldLineage(fieldName: string): FieldLineage | null {
    return this.index.getFieldLineage(fieldName);
  }

  /**
   * Get all field names tracked in the pipeline.
   */
  getAllFields(): string[] {
    return this.index.getAllFields();
  }

  // ===========================================================================
  // FIELD EXISTENCE ASSERTIONS
  // ===========================================================================

  /**
   * Assert that a field was created (has lineage tracking).
   */
  expectFieldCreated(fieldName: string): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Expected field '${fieldName}' to be created in: ${this.spl}`).not.toBeNull();
    return this;
  }

  /**
   * Assert that a field was NOT created (no lineage tracking).
   */
  expectFieldNotCreated(fieldName: string): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Expected field '${fieldName}' to NOT be created in: ${this.spl}`).toBeNull();
    return this;
  }

  /**
   * Assert that multiple fields were created.
   */
  expectFieldsCreated(...fieldNames: string[]): this {
    fieldNames.forEach(field => this.expectFieldCreated(field));
    return this;
  }

  /**
   * Assert that exactly these fields (and no others) were created.
   */
  expectOnlyFieldsCreated(...fieldNames: string[]): this {
    const actualFields = this.index.getAllFields();
    const expectedSet = new Set(fieldNames);
    const actualSet = new Set(actualFields);

    // Check for missing fields
    const missing = fieldNames.filter(f => !actualSet.has(f));
    expect(missing, `Missing expected fields in: ${this.spl}`).toEqual([]);

    // Check for unexpected fields
    const unexpected = actualFields.filter(f => !expectedSet.has(f));
    expect(unexpected, `Unexpected fields created in: ${this.spl}`).toEqual([]);

    return this;
  }

  // ===========================================================================
  // FIELD DEPENDENCIES
  // ===========================================================================

  /**
   * Assert that a field depends on specific source fields.
   */
  expectFieldDependsOn(fieldName: string, dependencies: string[]): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    const actualDeps = lineage?.dependsOn ?? [];
    dependencies.forEach(dep => {
      expect(actualDeps, `Expected '${fieldName}' to depend on '${dep}' in: ${this.spl}`).toContain(dep);
    });

    return this;
  }

  /**
   * Assert that a field has exactly these dependencies (no more, no less).
   */
  expectFieldDependsOnExactly(fieldName: string, dependencies: string[]): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    const actualDeps = new Set(lineage?.dependsOn ?? []);
    const expectedDeps = new Set(dependencies);

    expect(
      actualDeps,
      `Expected '${fieldName}' to depend on exactly ${JSON.stringify(dependencies)} in: ${this.spl}`
    ).toEqual(expectedDeps);

    return this;
  }

  /**
   * Assert that a field does NOT depend on specific fields.
   */
  expectFieldNotDependsOn(fieldName: string, nonDependencies: string[]): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    const actualDeps = lineage?.dependsOn ?? [];
    nonDependencies.forEach(nonDep => {
      expect(actualDeps, `Expected '${fieldName}' to NOT depend on '${nonDep}' in: ${this.spl}`).not.toContain(nonDep);
    });

    return this;
  }

  // ===========================================================================
  // FIELD EVENTS (created, modified, consumed, dropped)
  // ===========================================================================

  /**
   * Assert that a field has an event of a specific kind.
   */
  expectFieldHasEvent(fieldName: string, eventKind: FieldEventKind): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    const hasEvent = lineage?.events.some(e => e.kind === eventKind) ?? false;
    expect(hasEvent, `Expected '${fieldName}' to have '${eventKind}' event in: ${this.spl}`).toBe(true);

    return this;
  }

  /**
   * Assert that a field was consumed (used as input).
   */
  expectFieldConsumed(fieldName: string): this {
    return this.expectFieldHasEvent(fieldName, 'consumed');
  }

  /**
   * Assert that a field was modified.
   */
  expectFieldModified(fieldName: string): this {
    return this.expectFieldHasEvent(fieldName, 'modified');
  }

  /**
   * Assert that a field was dropped.
   */
  expectFieldDropped(fieldName: string): this {
    return this.expectFieldHasEvent(fieldName, 'dropped');
  }

  /**
   * Assert that a field has a specific number of events of a given kind.
   */
  expectFieldEventCount(fieldName: string, eventKind: FieldEventKind, count: number): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    const actualCount = lineage?.events.filter(e => e.kind === eventKind).length ?? 0;
    expect(
      actualCount,
      `Expected '${fieldName}' to have ${count} '${eventKind}' events, got ${actualCount} in: ${this.spl}`
    ).toBe(count);

    return this;
  }

  // ===========================================================================
  // FIELD STATE (alive, dropped, etc.)
  // ===========================================================================

  /**
   * Assert that a field is alive at the end of the pipeline.
   * A field is alive if it exists and was not dropped.
   */
  expectFieldAlive(fieldName: string): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    // Field is alive if its last event is not 'dropped'
    const events = lineage?.events ?? [];
    const lastEvent = events[events.length - 1];
    const isDropped = lastEvent?.kind === 'dropped';

    expect(
      isDropped,
      `Expected '${fieldName}' to be alive at end of pipeline in: ${this.spl}`
    ).toBe(false);

    return this;
  }

  /**
   * Assert that a field is dropped at the end of the pipeline.
   */
  expectFieldDroppedAtEnd(fieldName: string): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();

    // Field is dropped if its last event is 'dropped'
    const events = lineage?.events ?? [];
    const lastEvent = events[events.length - 1];
    const isDropped = lastEvent?.kind === 'dropped';

    expect(
      isDropped,
      `Expected '${fieldName}' to be dropped at end of pipeline in: ${this.spl}`
    ).toBe(true);

    return this;
  }

  // ===========================================================================
  // CUSTOM ASSERTIONS
  // ===========================================================================

  /**
   * Run a custom assertion function against the lineage index.
   */
  expectCustom(assertion: (index: LineageIndex) => void): this {
    assertion(this.index);
    return this;
  }

  /**
   * Run a custom assertion function against a specific field's lineage.
   */
  expectFieldCustom(fieldName: string, assertion: (lineage: FieldLineage) => void): this {
    const lineage = this.index.getFieldLineage(fieldName);
    expect(lineage, `Field '${fieldName}' not found in: ${this.spl}`).not.toBeNull();
    assertion(lineage!);
    return this;
  }

  // ===========================================================================
  // SNAPSHOT TESTING
  // ===========================================================================

  /**
   * Create a snapshot of the entire lineage index.
   * Useful for comprehensive regression testing.
   */
  expectMatchesSnapshot(): this {
    const allFields = this.index.getAllFields();
    const snapshot = {
      fields: allFields.sort(),
      lineages: allFields.reduce((acc, fieldName) => {
        const lineage = this.index.getFieldLineage(fieldName);
        if (lineage) {
          const events = lineage.events;
          const lastEvent = events[events.length - 1];
          acc[fieldName] = {
            dependsOn: lineage.dependsOn.sort(),
            events: events.map(e => ({ kind: e.kind, line: e.line })),
            finalState: lastEvent?.kind === 'dropped' ? 'dropped' : 'alive',
          };
        }
        return acc;
      }, {} as Record<string, any>),
    };
    expect(snapshot).toMatchSnapshot();
    return this;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new lineage test builder for the given SPL query.
 *
 * @param spl - The SPL query to test
 * @returns A fluent test builder with chainable assertions
 *
 * @example
 * ```typescript
 * testLineage('index=main | eval total=price*quantity')
 *   .expectFieldCreated('total')
 *   .expectFieldDependsOn('total', ['price', 'quantity']);
 * ```
 */
export function testLineage(spl: string): LineageTestBuilder {
  return new LineageTestBuilder(spl);
}

// =============================================================================
// BATCH TESTING UTILITIES
// =============================================================================

/**
 * Test multiple SPL queries with the same assertions.
 *
 * @example
 * ```typescript
 * testMultiple([
 *   'index=main | eval foo=bar',
 *   'index=main | eval foo = bar',
 *   'index=main|eval foo=bar'
 * ], (test) => {
 *   test.expectFieldCreated('foo').expectFieldDependsOn('foo', ['bar']);
 * });
 * ```
 */
export function testMultiple(
  queries: string[],
  assertions: (builder: LineageTestBuilder) => void
): void {
  queries.forEach(query => {
    assertions(testLineage(query));
  });
}

/**
 * Test a command with various field combinations.
 *
 * @example
 * ```typescript
 * testCommandVariations('eval', [
 *   { spl: 'eval foo=bar', expectFields: ['foo'], expectDeps: { foo: ['bar'] } },
 *   { spl: 'eval foo=bar+baz', expectFields: ['foo'], expectDeps: { foo: ['bar', 'baz'] } },
 * ]);
 * ```
 */
export function testCommandVariations(
  commandName: string,
  variations: Array<{
    spl: string;
    expectFields?: string[];
    expectDeps?: Record<string, string[]>;
    expectConsumed?: string[];
    expectDropped?: string[];
  }>
): void {
  variations.forEach(({ spl, expectFields, expectDeps, expectConsumed, expectDropped }) => {
    const fullSpl = spl.includes('|') ? `index=main | ${spl}` : `index=main | ${commandName} ${spl}`;
    const test = testLineage(fullSpl);

    if (expectFields) {
      test.expectFieldsCreated(...expectFields);
    }

    if (expectDeps) {
      Object.entries(expectDeps).forEach(([field, deps]) => {
        test.expectFieldDependsOn(field, deps);
      });
    }

    if (expectConsumed) {
      expectConsumed.forEach(field => test.expectFieldConsumed(field));
    }

    if (expectDropped) {
      expectDropped.forEach(field => test.expectFieldDropped(field));
    }
  });
}
