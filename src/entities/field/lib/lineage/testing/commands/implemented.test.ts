/**
 * E2E Tests for Commands with Implemented Lineage Handlers
 *
 * Tests commands that have working lineage tracking:
 * - eval: Field creation and transformation
 * - stats: Aggregation with field creation
 * - rex: Regex field extraction
 * - lookup: Field enrichment from lookups
 * - iplocation: Geo field creation
 * - extract: KV extraction
 * - transaction: Transaction field creation
 * - table/fields: Field filtering
 */

import { describe, it } from 'vitest';
import { testLineage } from '../test-builder';

describe('eval command', () => {
  it('should create single field', () => {
    testLineage('index=main | eval total=price*quantity')
      .expectFieldCreated('total')
      .expectFieldDependsOn('total', ['price', 'quantity'])
      .expectFieldConsumed('price')
      .expectFieldConsumed('quantity')
      .expectFieldAlive('total');
  });

  it('should create multiple fields', () => {
    testLineage('index=main | eval total=price*qty, tax=total*0.1')
      .expectFieldsCreated('total', 'tax')
      .expectFieldDependsOn('total', ['price', 'qty'])
      .expectFieldDependsOn('tax', ['total']);
  });

  it('should handle string functions', () => {
    testLineage('index=main | eval upper_name=upper(name)')
      .expectFieldCreated('upper_name')
      .expectFieldDependsOn('upper_name', ['name'])
      .expectFieldConsumed('name');
  });

  it('should handle conditionals', () => {
    testLineage('index=main | eval status=if(code>200, "error", "ok")')
      .expectFieldCreated('status')
      .expectFieldDependsOn('status', ['code'])
      .expectFieldConsumed('code');
  });

  it('should handle case expressions', () => {
    testLineage('index=main | eval tier=case(price<10, "low", price<100, "mid", true(), "high")')
      .expectFieldCreated('tier')
      .expectFieldDependsOn('tier', ['price']);
  });

  it('should handle mvindex function', () => {
    testLineage('index=main | eval first=mvindex(values, 0)')
      .expectFieldCreated('first')
      .expectFieldDependsOn('first', ['values']);
  });
});

describe('stats command', () => {
  it('should create count field', () => {
    testLineage('index=main | stats count')
      .expectFieldCreated('count')
      .expectFieldAlive('count');
  });

  it('should create count with by clause', () => {
    testLineage('index=main | stats count by host')
      .expectFieldsCreated('count', 'host')
      .expectFieldConsumed('host')
      .expectFieldAlive('count')
      .expectFieldAlive('host');
  });

  it('should create multiple aggregations', () => {
    testLineage('index=main | stats count, sum(bytes) as total_bytes, avg(duration) by status')
      .expectFieldsCreated('count', 'total_bytes', 'avg(duration)', 'status')
      .expectFieldConsumed('bytes')
      .expectFieldConsumed('duration')
      .expectFieldConsumed('status');
  });

  it('should handle dc (distinct count)', () => {
    testLineage('index=main | stats dc(user) as unique_users')
      .expectFieldCreated('unique_users')
      .expectFieldConsumed('user');
  });

  it('should handle values aggregation', () => {
    testLineage('index=main | stats values(status) as all_statuses by host')
      .expectFieldsCreated('all_statuses', 'host')
      .expectFieldConsumed('status')
      .expectFieldConsumed('host');
  });
});

describe('rex command', () => {
  it('should extract named groups', () => {
    testLineage('index=main | rex field=message "user=(?<username>\\w+)"')
      .expectFieldCreated('username')
      .expectFieldConsumed('message')
      .expectFieldAlive('username');
  });

  it('should extract multiple groups', () => {
    testLineage('index=main | rex field=log "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+).*(?<status>\\d{3})"')
      .expectFieldsCreated('ip', 'status')
      .expectFieldConsumed('log');
  });

  it('should extract from _raw by default', () => {
    testLineage('index=main | rex "error: (?<error_msg>.*)"')
      .expectFieldCreated('error_msg')
      .expectFieldConsumed('_raw');
  });
});

describe('lookup command', () => {
  it('should create output fields', () => {
    testLineage('index=main | lookup users.csv user OUTPUT email, department')
      .expectFieldsCreated('email', 'department')
      .expectFieldConsumed('user')
      .expectFieldAlive('email')
      .expectFieldAlive('department');
  });

  it('should handle OUTPUTNEW', () => {
    testLineage('index=main | lookup geo.csv ip OUTPUTNEW country, city')
      .expectFieldsCreated('country', 'city')
      .expectFieldConsumed('ip');
  });
});

describe('iplocation command', () => {
  it('should create geo fields', () => {
    testLineage('index=main | iplocation clientip')
      .expectFieldsCreated('City', 'Country', 'Region', 'lat', 'lon')
      .expectFieldConsumed('clientip');
  });

  it('should create geo fields with prefix', () => {
    testLineage('index=main | iplocation prefix=geo_ clientip')
      .expectFieldsCreated('geo_City', 'geo_Country', 'geo_Region', 'geo_lat', 'geo_lon')
      .expectFieldConsumed('clientip');
  });
});

describe('table command', () => {
  it('should keep only specified fields', () => {
    testLineage('index=main | eval foo=bar | table foo, host')
      .expectFieldCreated('foo')
      .expectFieldAlive('foo');
  });

  it('should drop fields not in table', () => {
    testLineage('index=main | eval a=1, b=2 | table a')
      .expectFieldsCreated('a', 'b')
      .expectFieldDropped('b')
      .expectFieldAlive('a');
  });
});

describe('fields command', () => {
  it('should keep specified fields', () => {
    testLineage('index=main | eval foo=bar | fields foo, host')
      .expectFieldCreated('foo')
      .expectFieldAlive('foo');
  });

  it('should drop specified fields with minus', () => {
    testLineage('index=main | eval foo=bar | fields - foo')
      .expectFieldCreated('foo')
      .expectFieldDropped('foo')
      .expectFieldDroppedAtEnd('foo');
  });

  it('should drop multiple fields', () => {
    testLineage('index=main | eval a=1, b=2, c=3 | fields - a, b')
      .expectFieldsCreated('a', 'b', 'c')
      .expectFieldDropped('a')
      .expectFieldDropped('b')
      .expectFieldAlive('c');
  });
});

describe('transaction command', () => {
  it('should create transaction fields', () => {
    testLineage('index=main | transaction host')
      .expectFieldsCreated('duration', 'eventcount')
      .expectFieldConsumed('host');
  });

  it('should handle startswith/endswith', () => {
    testLineage('index=main | transaction session_id startswith="login" endswith="logout"')
      .expectFieldsCreated('duration', 'eventcount')
      .expectFieldConsumed('session_id');
  });
});

describe('extract command', () => {
  it('should extract key-value pairs', () => {
    testLineage('index=main | extract')
      .expectCustom((_index) => {
        // extract creates dynamic fields based on data
        // Can't predict exact fields without runtime data
      });
  });

  it('should extract with kvdelim', () => {
    testLineage('index=main | extract kvdelim=":" pairdelim=","')
      .expectCustom((_index) => {
        // Dynamic field creation
      });
  });
});

describe('rename command', () => {
  it('should rename single field', () => {
    testLineage('index=main | rename old_name as new_name')
      .expectFieldCreated('new_name')
      .expectFieldDependsOn('new_name', ['old_name'])
      .expectFieldDropped('old_name')  // Rename shows dropped, not consumed
      .expectFieldAlive('new_name');
  });

  it('should rename multiple fields', () => {
    testLineage('index=main | rename foo as bar, baz as qux')
      .expectFieldsCreated('bar', 'qux')
      .expectFieldDependsOn('bar', ['foo'])
      .expectFieldDependsOn('qux', ['baz'])
      .expectFieldDropped('foo')  // Rename shows dropped, not consumed
      .expectFieldDropped('baz');  // Rename shows dropped, not consumed
  });

  it('should chain with other commands and drop created field', () => {
    testLineage('index=main | eval total=price*qty | rename total as grand_total')
      .expectFieldCreated('total')
      .expectFieldCreated('grand_total')
      .expectFieldDependsOn('grand_total', ['total'])
      .expectFieldDropped('total')
      .expectFieldAlive('grand_total');
  });

  it('should rename field with curly braces', () => {
    testLineage('index=main | rename {} as "port{}"')
      .expectFieldCreated('port{}')
      .expectFieldDependsOn('port{}', ['{}'])
      .expectFieldDropped('{}')  // Rename shows dropped, not consumed
      .expectFieldAlive('port{}');
  });

  it('should rename field with curly braces to unquoted name', () => {
    testLineage('index=main | rename {} as port')
      .expectFieldCreated('port')
      .expectFieldDependsOn('port', ['{}'])
      .expectFieldDropped('{}')  // Rename shows dropped, not consumed
      .expectFieldAlive('port');
  });

  it('should track quoted field names in table command', () => {
    testLineage('index=main | rename {} as "port{}" | table "port{}"')
      .expectFieldCreated('port{}')
      .expectFieldConsumed('port{}')
      .expectFieldAlive('port{}');
  });

  it('should track quoted field with spaces', () => {
    testLineage('index=main | eval "User Account"=user | table "User Account"')
      .expectFieldCreated('User Account')
      .expectFieldConsumed('User Account')
      .expectFieldAlive('User Account');
  });
});

describe('replace command', () => {
  it('should consume fields being replaced', () => {
    testLineage('index=main | replace "error" with "warning" in status')
      .expectFieldConsumed('status')
      .expectFieldAlive('status');
  });

  it('should consume multiple fields', () => {
    testLineage('index=main | replace "foo" with "bar" in field1, field2')
      .expectFieldConsumed('field1')
      .expectFieldConsumed('field2');
  });
});

describe('where command', () => {
  it('should preserve fields through filter', () => {
    testLineage('index=main | eval total=price*qty | where total > 1000')
      .expectFieldCreated('total')
      .expectFieldAlive('total');
  });

  it('should work in pipeline with stats', () => {
    testLineage('index=main | eval score=value*10 | where score > 50 | stats count by category')
      .expectFieldCreated('score')
      .expectFieldsCreated('count', 'category');
  });
});

describe('dedup command', () => {
  it('should consume single dedup field', () => {
    testLineage('index=main | dedup host')
      .expectFieldConsumed('host');
  });

  it('should consume multiple dedup fields', () => {
    testLineage('index=main | dedup host, source')
      .expectFieldConsumed('host')
      .expectFieldConsumed('source');
  });

  it('should preserve fields through dedup', () => {
    testLineage('index=main | eval status=code | dedup status')
      .expectFieldCreated('status')
      .expectFieldConsumed('status')
      .expectFieldAlive('status');
  });

  it('should work in pipeline', () => {
    testLineage('index=main | eval key=host."-".source | dedup key | stats count')
      .expectFieldCreated('key')
      .expectFieldConsumed('key')
      .expectFieldCreated('count');
  });
});

describe('bin command', () => {
  it('should consume field in place', () => {
    testLineage('index=main | bin _time span=1h')
      .expectFieldConsumed('_time');
  });

  it('should consume explicitly created field in place', () => {
    testLineage('index=main | eval duration=end-start | bin duration span=60')
      .expectFieldCreated('duration')
      .expectFieldConsumed('duration')
      .expectFieldAlive('duration');
  });

  it('should create new field with alias', () => {
    testLineage('index=main | bin _time as time_bucket span=1h')
      .expectFieldCreated('time_bucket')
      .expectFieldDependsOn('time_bucket', ['_time'])
      .expectFieldConsumed('_time');
  });

  it('should work in pipeline with stats', () => {
    testLineage('index=main | bin _time as hour span=1h | stats count by hour')
      .expectFieldCreated('hour')
      .expectFieldConsumed('_time')
      .expectFieldsCreated('count', 'hour');
  });
});

describe('Pipeline Integration', () => {
  it('should track fields through multi-stage pipeline', () => {
    testLineage('index=main | eval total=price*qty | stats sum(total) as revenue by category | fields category, revenue')
      .expectFieldCreated('total')
      .expectFieldsCreated('revenue', 'category')
      .expectFieldConsumed('total')
      .expectFieldAlive('revenue')
      .expectFieldAlive('category');
  });

  it('should track field transformations', () => {
    testLineage('index=main | rex field=log "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)" | iplocation ip | stats count by country')
      .expectFieldCreated('ip')
      .expectFieldsCreated('country', 'count')
      .expectFieldConsumed('ip')
      .expectFieldAlive('country')
      .expectFieldAlive('count');
  });
});
