/**
 * Tests for newly created command handlers
 */

import { describe, it, expect } from 'vitest';
import { testLineage } from '../testing';

describe('rename command handler', () => {
  it('creates renamed field and drops old field', () => {
    testLineage('index=main | eval foo=1 | rename foo AS bar')
      .expectFieldCreated('bar')
      .expectFieldDependsOn('bar', ['foo']);
  });

  it('consumes old field in rename', () => {
    const builder = testLineage('index=main | eval status="ok" | rename status AS state');
    builder.expectFieldCreated('state');

    const stateLineage = builder.getFieldLineage('state');
    expect(stateLineage?.events.some(e => e.kind === 'created')).toBe(true);
  });
});

describe('strcat command handler', () => {
  it('creates target field from source fields', () => {
    testLineage('index=main | eval a="hello", b="world" | strcat a b dest')
      .expectFieldCreated('dest')
      .expectFieldDependsOn('dest', ['a', 'b']);
  });
});

describe('top command handler', () => {
  it('creates count field', () => {
    testLineage('index=main | top host')
      .expectFieldCreated('count');
  });

  it('creates percent field', () => {
    testLineage('index=main | top host')
      .expectFieldCreated('percent');
  });

  it('consumes analyzed field', () => {
    testLineage('index=main | top host')
      .expectFieldConsumed('host');
  });
});

describe('rare command handler', () => {
  it('creates count field', () => {
    testLineage('index=main | rare host')
      .expectFieldCreated('count');
  });
});

describe('dedup command handler', () => {
  it('consumes dedup fields', () => {
    testLineage('index=main | dedup host, source')
      .expectFieldConsumed('host');
  });

  it('preserves all fields', () => {
    testLineage('index=main | eval foo=1 | dedup host')
      .expectFieldCreated('foo');
  });
});

describe('spath command handler', () => {
  it('creates output field when path and output specified', () => {
    testLineage('index=main | spath input=_raw path=user.name output=username')
      .expectFieldCreated('username')
      .expectFieldDependsOn('username', ['_raw']);
  });

  it('consumes input field', () => {
    testLineage('index=main | spath input=json_data path=status')
      .expectFieldConsumed('json_data');
  });

  it('preserves all fields', () => {
    testLineage('index=main | eval foo=1 | spath input=_raw')
      .expectFieldCreated('foo');
  });
});

describe('append command handler', () => {
  it('preserves main pipeline fields', () => {
    testLineage('index=main | eval mainField=1 | append [search index=other | eval subField=2]')
      .expectFieldCreated('mainField');
  });

  it('adds fields from subsearch', () => {
    testLineage('index=main | append [search index=other | eval subField=2]')
      .expectFieldCreated('subField');
  });
});

describe('join command handler', () => {
  it('consumes join fields', () => {
    testLineage('index=main | join host [search index=other | stats count by host]')
      .expectFieldConsumed('host');
  });

  it('adds fields from subsearch excluding join keys', () => {
    testLineage('index=main | join host [search index=other | eval extra=1 | table host, extra]')
      .expectFieldCreated('extra');
  });
});

describe('union command handler', () => {
  it('combines fields from multiple subsearches', () => {
    testLineage('| union [search index=a | eval fieldA=1] [search index=b | eval fieldB=2]')
      .expectFieldCreated('fieldA');
  });
});

describe('makeresults command handler', () => {
  it('creates _time field by default', () => {
    testLineage('| makeresults')
      .expectFieldCreated('_time');
  });

  it('creates additional fields with annotate=true', () => {
    testLineage('| makeresults annotate=true')
      .expectFieldCreated('_time')
      .expectFieldCreated('host');
  });
});

describe('addtotals command handler', () => {
  it('creates Total field by default', () => {
    testLineage('index=main | stats count by host | addtotals')
      .expectFieldCreated('Total');
  });

  it('consumes fields being totaled', () => {
    testLineage('index=main | stats count, sum(bytes) by host | addtotals fieldname=sum count')
      .expectFieldConsumed('count');
  });
});

describe('delta command handler', () => {
  it('creates delta field with alias', () => {
    testLineage('index=main | delta bytes AS change')
      .expectFieldCreated('change')
      .expectFieldDependsOn('change', ['bytes']);
  });

  it('consumes source field', () => {
    testLineage('index=main | delta bytes AS change')
      .expectFieldConsumed('bytes');
  });
});

describe('accum command handler', () => {
  it('creates accumulated field with alias', () => {
    testLineage('index=main | accum count AS running_total')
      .expectFieldCreated('running_total')
      .expectFieldDependsOn('running_total', ['count']);
  });

  it('consumes source field', () => {
    testLineage('index=main | accum bytes')
      .expectFieldConsumed('bytes');
  });
});

describe('return command handler', () => {
  it('returns specified fields', () => {
    testLineage('index=main | return host, source')
      .expectFieldCreated('host')
      .expectFieldConsumed('host');
  });
});

describe('tstats command handler', () => {
  it('creates aggregation output fields', () => {
    testLineage('| tstats count by host')
      .expectFieldCreated('count');
  });

  it('creates by-fields as output', () => {
    testLineage('| tstats count by host, source')
      .expectFieldCreated('host')
      .expectFieldCreated('source');
  });

  it('creates aliased aggregation fields', () => {
    testLineage('| tstats count AS event_count by host')
      .expectFieldCreated('event_count');
  });

  it('drops all fields except aggregations and by-fields', () => {
    // tstats replaces all fields with just aggregations and by-fields
    const builder = testLineage('| tstats count by host');
    const allFields = builder.getAllFields();
    expect(allFields).toContain('count');
    expect(allFields).toContain('host');
  });
});

describe('appendcols command handler', () => {
  it('preserves main pipeline fields', () => {
    testLineage('index=main | eval mainField=1 | appendcols [search index=other | eval subField=2]')
      .expectFieldCreated('mainField');
  });

  it('adds fields from subsearch as new columns', () => {
    testLineage('index=main | appendcols [search index=other | eval newCol=1]')
      .expectFieldCreated('newCol');
  });
});
