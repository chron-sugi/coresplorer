/**
 * Field Lineage Test Utilities
 *
 * Shared test utilities and fixtures for field-lineage testing.
 *
 * @module features/field-lineage/lib/testing
 */

import { parseSPL } from '@/entities/spl/lib/parser';
import { analyzeLineage } from '../analyzer';
import type {
  LineageIndex,
  FieldEventKind,
  FieldLineage,
  FieldDataType,
  ConfidenceLevel,
} from '../../model/field-lineage.types';

// =============================================================================
// CORE TEST HELPERS
// =============================================================================

/**
 * Parse SPL and return lineage index. Throws on parse failure.
 */
export function testLineage(spl: string): LineageIndex {
  const { ast } = parseSPL(spl);
  if (!ast) throw new Error(`Failed to parse SPL: ${spl}`);
  return analyzeLineage(ast, { source: spl });
}

/**
 * Parse SPL and return both AST and lineage index. Throws on parse failure.
 */
export function testParsedLineage(spl: string) {
  const parseResult = parseSPL(spl);
  if (!parseResult.ast) throw new Error(`Failed to parse SPL: ${spl}`);
  const index = analyzeLineage(parseResult.ast);
  return { ast: parseResult.ast, index, parseResult };
}

// =============================================================================
// FIELD EXISTENCE ASSERTIONS
// =============================================================================

/**
 * Assert field exists at given line number.
 */
export function expectFieldAt(index: LineageIndex, field: string, line: number): void {
  const exists = index.fieldExistsAt(field, line);
  if (!exists) {
    const fieldsAtLine = index.getFieldsAtLine(line);
    throw new Error(
      `Expected field '${field}' to exist at line ${line}, but it doesn't. ` +
        `Fields at line ${line}: [${fieldsAtLine.join(', ')}]`
    );
  }
}

/**
 * Assert field does NOT exist at given line number.
 */
export function expectNoFieldAt(index: LineageIndex, field: string, line: number): void {
  const exists = index.fieldExistsAt(field, line);
  if (exists) {
    throw new Error(
      `Expected field '${field}' NOT to exist at line ${line}, but it does.`
    );
  }
}

/**
 * Assert multiple fields exist at a line.
 */
export function expectFieldsAt(index: LineageIndex, fields: string[], line: number): void {
  for (const field of fields) {
    expectFieldAt(index, field, line);
  }
}

/**
 * Assert only these fields exist at a line (exact match).
 */
export function expectOnlyFieldsAt(
  index: LineageIndex,
  expectedFields: string[],
  line: number
): void {
  const actualFields = index.getFieldsAtLine(line);
  const expectedSet = new Set(expectedFields);
  const actualSet = new Set(actualFields);

  const missing = expectedFields.filter((f) => !actualSet.has(f));
  const extra = actualFields.filter((f) => !expectedSet.has(f));

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `Field mismatch at line ${line}. ` +
        `Missing: [${missing.join(', ')}], Extra: [${extra.join(', ')}]`
    );
  }
}

// =============================================================================
// FIELD EVENT ASSERTIONS
// =============================================================================

/**
 * Assert field has an event of the given kind.
 */
export function expectFieldEvent(
  index: LineageIndex,
  field: string,
  kind: FieldEventKind
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) {
    throw new Error(`Field '${field}' has no lineage.`);
  }
  const hasEvent = lineage.events.some((e) => e.kind === kind);
  if (!hasEvent) {
    const eventKinds = lineage.events.map((e) => e.kind).join(', ');
    throw new Error(
      `Expected field '${field}' to have '${kind}' event, but found: [${eventKinds}]`
    );
  }
}

/**
 * Assert field has NO event of the given kind.
 */
export function expectNoFieldEvent(
  index: LineageIndex,
  field: string,
  kind: FieldEventKind
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) return; // No lineage = no events
  const hasEvent = lineage.events.some((e) => e.kind === kind);
  if (hasEvent) {
    throw new Error(`Expected field '${field}' NOT to have '${kind}' event.`);
  }
}

/**
 * Get the 'created' event for a field.
 */
export function getCreatedEvent(lineage: FieldLineage | null) {
  return lineage?.events.find((e) => e.kind === 'created');
}

/**
 * Get all events of a specific kind for a field.
 */
export function getEventsOfKind(lineage: FieldLineage | null, kind: FieldEventKind) {
  return lineage?.events.filter((e) => e.kind === kind) ?? [];
}

// =============================================================================
// DEPENDENCY ASSERTIONS
// =============================================================================

/**
 * Assert field was created with specific dependencies.
 */
export function expectFieldDependsOn(
  index: LineageIndex,
  field: string,
  ...deps: string[]
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) {
    throw new Error(`Field '${field}' has no lineage.`);
  }
  for (const dep of deps) {
    if (!lineage.dependsOn.includes(dep)) {
      throw new Error(
        `Expected field '${field}' to depend on '${dep}', ` +
          `but dependsOn is: [${lineage.dependsOn.join(', ')}]`
      );
    }
  }
}

/**
 * Assert field does NOT depend on specific fields.
 */
export function expectFieldNotDependsOn(
  index: LineageIndex,
  field: string,
  ...notDeps: string[]
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) return; // No lineage = no dependencies
  for (const notDep of notDeps) {
    if (lineage.dependsOn.includes(notDep)) {
      throw new Error(
        `Expected field '${field}' NOT to depend on '${notDep}', ` +
          `but dependsOn is: [${lineage.dependsOn.join(', ')}]`
      );
    }
  }
}

/**
 * Assert field has exactly these dependencies (no more, no less).
 */
export function expectExactDependencies(
  index: LineageIndex,
  field: string,
  deps: string[]
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) {
    throw new Error(`Field '${field}' has no lineage.`);
  }
  const expected = new Set(deps);
  const actual = new Set(lineage.dependsOn);

  const missing = deps.filter((d) => !actual.has(d));
  const extra = lineage.dependsOn.filter((d) => !expected.has(d));

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `Dependency mismatch for '${field}'. ` +
        `Missing: [${missing.join(', ')}], Extra: [${extra.join(', ')}]`
    );
  }
}

// =============================================================================
// DATA TYPE AND CONFIDENCE ASSERTIONS
// =============================================================================

/**
 * Assert field has specific data type.
 */
export function expectFieldDataType(
  index: LineageIndex,
  field: string,
  expectedType: FieldDataType
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) {
    throw new Error(`Field '${field}' has no lineage.`);
  }
  if (lineage.dataType !== expectedType) {
    throw new Error(
      `Expected field '${field}' to have type '${expectedType}', ` +
        `but got '${lineage.dataType}'`
    );
  }
}

/**
 * Assert field has specific confidence level.
 */
export function expectFieldConfidence(
  index: LineageIndex,
  field: string,
  expectedConfidence: ConfidenceLevel
): void {
  const lineage = index.getFieldLineage(field);
  if (!lineage) {
    throw new Error(`Field '${field}' has no lineage.`);
  }
  if (lineage.confidence !== expectedConfidence) {
    throw new Error(
      `Expected field '${field}' to have confidence '${expectedConfidence}', ` +
        `but got '${lineage.confidence}'`
    );
  }
}

// =============================================================================
// LINE/COLUMN ASSERTIONS
// =============================================================================

/**
 * Assert field was created at specific line.
 */
export function expectFieldCreatedAtLine(
  index: LineageIndex,
  field: string,
  expectedLine: number
): void {
  const lineage = index.getFieldLineage(field);
  const created = getCreatedEvent(lineage);
  if (!created) {
    throw new Error(`Field '${field}' has no 'created' event.`);
  }
  if (created.line !== expectedLine) {
    throw new Error(
      `Expected field '${field}' to be created at line ${expectedLine}, ` +
        `but got line ${created.line}`
    );
  }
}

// =============================================================================
// SPL FIXTURES
// =============================================================================

/**
 * Common SPL fixtures for testing.
 */
export const SPL_FIXTURES = {
  // Simple patterns
  simpleEval: 'index=main | eval foo=bar+1',
  simpleStats: 'index=main | stats count by host',
  simpleRename: 'index=main | rename old AS new',
  simpleRex: 'index=main | rex field=_raw "(?<status>\\d+)"',
  simpleLookup: 'index=main | lookup users uid OUTPUT username',
  simpleTable: 'index=main | table host, source, _time',
  simpleFields: 'index=main | fields - _raw, _bkt',

  // Multi-stage pipelines
  etlPipeline: `index=main
| eval duration_ms=duration*1000
| rex field=message "status=(?<status>\\d+)"
| stats avg(duration_ms) as avg_duration by status
| rename avg_duration AS response_time`,

  // Complex dependencies
  diamondDependency: `index=main
| eval a=raw
| eval b=a+1, c=a+2
| eval d=b+c`,

  longDependencyChain: `index=main
| eval a=x
| eval b=a+1
| eval c=b+1
| eval d=c+1
| eval e=d+1
| eval f=e+1`,

  // Field filtering
  tableAfterStats: `index=main
| stats count, sum(bytes) as total by host
| table host, count`,

  // Eventstats (preserves fields)
  eventstatsPreserve: `index=main
| eval x=1
| eventstats count by host
| eval y=x+count`,

  // Streamstats (preserves fields)
  streamstatsPreserve: `index=main
| eval x=1
| streamstats count by host
| eval y=x+count`,

  // Rename chain
  renameChain: `index=main
| eval original=1
| rename original AS first
| rename first AS second
| rename second AS final`,

  // Multiple eval in pipeline
  multipleEval: `index=main
| eval a=1, b=2
| eval c=a+b
| eval d=c*2, e=c*3
| eval f=d+e`,

  // Complex stats
  complexStats: `index=main
| stats count AS total_count,
        sum(bytes) AS total_bytes,
        avg(duration) AS avg_duration,
        max(duration) AS max_duration,
        dc(host) AS unique_hosts
    by sourcetype, index`,

  // Timechart (adds _time as implicit by)
  timechartExample: `index=main
| timechart span=1h avg(response_time) by status`,

  // Lookup with output
  lookupWithOutput: `index=main
| lookup geo_lookup ip AS client_ip OUTPUT city, country, lat, lon`,

  // Rex with multiple captures
  rexMultiCapture: `index=main
| rex field=_raw "(?<method>\\w+)\\s+(?<path>\\S+)\\s+HTTP/(?<version>[\\d.]+)"`,

  // Mixed pipeline
  realWorldPipeline: `index=web
| rex field=_raw "(?<method>\\w+)\\s+(?<url>\\S+)\\s+HTTP"
| eval is_error=if(status>=400, 1, 0)
| eval duration_bucket=case(duration<0.1, "fast", duration<1, "normal", true(), "slow")
| stats count AS requests,
        sum(is_error) AS errors,
        avg(duration) AS avg_duration
    by method, duration_bucket
| eval error_rate=round(errors/requests*100, 2)
| table method, duration_bucket, requests, errors, error_rate, avg_duration`,
} as const;

// =============================================================================
// STRESS TEST GENERATORS
// =============================================================================

/**
 * Generate an eval with N assignments.
 */
export function generateLargeEval(count: number): string {
  const assignments = Array.from(
    { length: count },
    (_, i) => `field${i}=${i}`
  ).join(', ');
  return `index=main | eval ${assignments}`;
}

/**
 * Generate a pipeline with N stages.
 */
export function generateLargePipeline(stageCount: number): string {
  const stages = Array.from(
    { length: stageCount },
    (_, i) => `| eval field${i}=${i}`
  ).join('\n');
  return `index=main\n${stages}`;
}

/**
 * Generate a stats command with N BY fields.
 */
export function generateLargeByClause(count: number): string {
  const byFields = Array.from({ length: count }, (_, i) => `field${i}`).join(', ');
  return `index=main | stats count by ${byFields}`;
}

/**
 * Generate deeply nested expression.
 */
export function generateNestedExpression(depth: number): string {
  let expr = 'x';
  for (let i = 0; i < depth; i++) {
    expr = `(${expr}+1)`;
  }
  return `index=main | eval result=${expr}`;
}

/**
 * Generate a dependency chain of length N.
 */
export function generateDependencyChain(length: number): string {
  const evals = ['| eval a0=x'];
  for (let i = 1; i < length; i++) {
    evals.push(`| eval a${i}=a${i - 1}+1`);
  }
  return `index=main\n${evals.join('\n')}`;
}
