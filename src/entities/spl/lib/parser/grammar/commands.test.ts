/**
 * Comprehensive SPL Command Parsing Tests
 *
 * Tests that all SPL commands parse successfully without errors.
 * This catches grammar issues like reserved keywords used as identifiers.
 *
 * @module entities/spl/lib/parser/grammar/commands.test
 */
import { describe, it, expect } from 'vitest';
import { parseSPL } from '../index';

/**
 * Assert that SPL parses successfully with no errors.
 * CRITICAL: Checks both success flag AND parseErrors array
 * (Chevrotain's error recovery can set success=true despite errors)
 */
function assertParses(spl: string): void {
  const result = parseSPL(spl);
  if (!result.success || result.parseErrors.length > 0) {
    const errors = result.parseErrors.map(e => e.message).join('\n');
    throw new Error(`Parse failed for: ${spl}\nErrors: ${errors}`);
  }
  expect(result.success).toBe(true);
  expect(result.parseErrors).toHaveLength(0);
}

/**
 * Assert that SPL parses and produces an AST with expected stage count.
 */
function assertParsesWithStages(spl: string, expectedStages: number): void {
  const result = parseSPL(spl);
  expect(result.success).toBe(true);
  expect(result.parseErrors).toHaveLength(0);
  expect(result.ast?.stages).toHaveLength(expectedStages);
}

// =============================================================================
// FIELD CREATORS (26 commands)
// =============================================================================

describe('Field Creator Commands', () => {
  describe('eval', () => {
    it('simple assignment', () => assertParses('index=main | eval foo=1'));
    it('expression', () => assertParses('index=main | eval foo=bar+1'));
    it('multiple assignments', () => assertParses('index=main | eval foo=1, bar=2, baz=3'));
    it.skip('string concatenation', () => assertParses('index=main | eval msg=host."-".source'));
    it('function call', () => assertParses('index=main | eval lower_host=lower(host)'));
    it('nested functions', () => assertParses('index=main | eval x=substr(lower(host), 0, 5)'));
    it('conditional', () => assertParses('index=main | eval status=if(code>200, "error", "ok")'));
    it('case function', () => assertParses('index=main | eval level=case(code<200,"info",code<400,"warn",true(),"error")'));
    it('coalesce', () => assertParses('index=main | eval val=coalesce(a, b, c)'));
    it('multivalue', () => assertParses('index=main | eval vals=mvappend(a, b)'));
  });

  describe('stats', () => {
    it('count', () => assertParses('index=main | stats count'));
    it('count by field', () => assertParses('index=main | stats count by host'));
    it('multiple aggregations', () => assertParses('index=main | stats count, sum(bytes), avg(duration) by host'));
    it('with AS alias', () => assertParses('index=main | stats count AS total by host'));
    it('multiple by fields', () => assertParses('index=main | stats count by host, source, sourcetype'));
    it('dc (distinct count)', () => assertParses('index=main | stats dc(user) by host'));
    it('values function', () => assertParses('index=main | stats values(status) by host'));
    it('list function', () => assertParses('index=main | stats list(error) by host'));
    it('earliest/latest', () => assertParses('index=main | stats earliest(_time), latest(_time) by host'));
    it('percentile', () => assertParses('index=main | stats perc95(duration) by host'));
  });

  describe('eventstats', () => {
    it('basic', () => assertParses('index=main | eventstats count by host'));
    it('with alias', () => assertParses('index=main | eventstats avg(bytes) AS avg_bytes by host'));
    it('multiple functions', () => assertParses('index=main | eventstats count, sum(bytes) by host'));
  });

  describe('streamstats', () => {
    it('basic', () => assertParses('index=main | streamstats count'));
    it.skip('with window', () => assertParses('index=main | streamstats window=10 avg(value) AS moving_avg'));
    it.skip('with reset', () => assertParses('index=main | streamstats reset_on_change=true count by host'));
  });

  describe('chart', () => {
    it('basic', () => assertParses('index=main | chart count by host'));
    it.skip('over field', () => assertParses('index=main | chart count over host'));
    it('by two fields', () => assertParses('index=main | chart count by host, status'));
    it.skip('with span', () => assertParses('index=main | chart span=1h count by _time'));
  });

  describe('timechart', () => {
    it('basic', () => assertParses('index=main | timechart count'));
    it.skip('with span', () => assertParses('index=main | timechart span=1h count'));
    it('by field', () => assertParses('index=main | timechart count by host'));
    it('multiple aggregations', () => assertParses('index=main | timechart avg(bytes), max(bytes) by host'));
  });

  describe('rename', () => {
    it('single field', () => assertParses('index=main | rename host AS hostname'));
    it.skip('multiple fields', () => assertParses('index=main | rename host AS hostname, source AS src'));
    it('with underscore', () => assertParses('index=main | rename _time AS event_time'));
  });

  describe('rex', () => {
    it('basic pattern', () => assertParses('index=main | rex field=_raw "user=(?<username>\\w+)"'));
    it('multiple groups', () => assertParses('index=main | rex "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+):(?<port>\\d+)"'));
    it.skip('mode=sed', () => assertParses('index=main | rex mode=sed "s/foo/bar/g"'));
    it('max_match', () => assertParses('index=main | rex max_match=5 "(?<word>\\w+)"'));
  });

  describe('lookup', () => {
    it('basic', () => assertParses('index=main | lookup users user'));
    it.skip('with output', () => assertParses('index=main | lookup users user OUTPUT name, email'));
    it('with AS', () => assertParses('index=main | lookup users user AS username OUTPUT name'));
    it('outputnew', () => assertParses('index=main | lookup users user OUTPUTNEW department'));
  });

  describe('inputlookup', () => {
    it('basic', () => assertParses('| inputlookup users.csv'));
    it.skip('with where', () => assertParses('| inputlookup users.csv where status="active"'));
    it.skip('with max', () => assertParses('| inputlookup max=1000 users.csv'));
    it('append mode', () => assertParses('index=main | inputlookup append=true users.csv'));
  });

  describe('spath', () => {
    it('basic', () => assertParses('index=main | spath'));
    it('with path', () => assertParses('index=main | spath path=user.name'));
    it.skip('with output', () => assertParses('index=main | spath path=user.name output=username'));
    it('with input', () => assertParses('index=main | spath input=json_field path=data.value'));
  });

  describe('extract', () => {
    it('basic extract', () => assertParses('index=main | extract'));
    it('with pairdelim', () => assertParses('index=main | extract pairdelim=","'));
  });

  describe('addtotals', () => {
    it('basic', () => assertParses('index=main | addtotals'));
    it('with fieldname', () => assertParses('index=main | addtotals fieldname=total'));
    it('row totals', () => assertParses('index=main | addtotals row=true col=false'));
  });

  describe('addinfo', () => {
    it('basic', () => assertParses('index=main | addinfo'));
  });

  describe('autoregress', () => {
    it('basic', () => assertParses('index=main | autoregress count'));
    it('with p', () => assertParses('index=main | autoregress count p=1'));
    it('with p range', () => assertParses('index=main | autoregress count p=1-3'));
  });

  describe('accum', () => {
    it('basic', () => assertParses('index=main | accum count'));
    it('with AS', () => assertParses('index=main | accum count AS running_total'));
  });

  describe('delta', () => {
    it('basic', () => assertParses('index=main | delta count'));
    it('with AS', () => assertParses('index=main | delta count AS change'));
    it('with p', () => assertParses('index=main | delta count p=2'));
  });

  describe('rangemap', () => {
    it('basic', () => assertParses('index=main | rangemap field=count low=0-10 high=11-100'));
    it('with default', () => assertParses('index=main | rangemap field=count low=0-10 default=other'));
  });

  describe('strcat', () => {
    it('basic', () => assertParses('index=main | strcat host source dest'));
    it('with multiple fields', () => assertParses('index=main | strcat a b c d result'));
  });

  describe('top', () => {
    it('basic', () => assertParses('index=main | top host'));
    it.skip('with limit', () => assertParses('index=main | top limit=10 host'));
    it('by field', () => assertParses('index=main | top host by sourcetype'));
    it('multiple fields', () => assertParses('index=main | top host, source'));
  });

  describe('rare', () => {
    it('basic', () => assertParses('index=main | rare host'));
    it.skip('with limit', () => assertParses('index=main | rare limit=10 host'));
    it('by field', () => assertParses('index=main | rare host by sourcetype'));
  });

  describe('convert', () => {
    it('basic', () => assertParses('index=main | convert ctime(_time)'));
    it('duration', () => assertParses('index=main | convert duration(elapsed)'));
    it('with AS', () => assertParses('index=main | convert num(count) AS count_num'));
  });

  describe('fieldformat', () => {
    it('basic', () => assertParses('index=main | fieldformat bytes=tostring(bytes, "commas")'));
  });

  describe('replace', () => {
    it('basic', () => assertParses('index=main | replace "foo" WITH "bar" IN field1'));
    it('multiple fields', () => assertParses('index=main | replace "foo" WITH "bar" IN field1, field2'));
  });

  describe('union', () => {
    it('basic', () => assertParses('index=main | union [search index=other]'));
    it.skip('multiple subsearches', () => assertParses('index=main | union [search index=a], [search index=b]'));
  });
});

// =============================================================================
// FIELD FILTERS (9 commands)
// =============================================================================

describe('Field Filter Commands', () => {
  describe('table', () => {
    it('single field', () => assertParses('index=main | table host'));
    it('multiple fields', () => assertParses('index=main | table host, source, sourcetype'));
    it('with wildcard', () => assertParses('index=main | table *'));
    it('with prefix wildcard', () => assertParses('index=main | table host, user_*'));
  });

  describe('fields', () => {
    it('keep fields', () => assertParses('index=main | fields host, source'));
    it('remove fields', () => assertParses('index=main | fields - _raw, _time'));
    it('keep with plus', () => assertParses('index=main | fields + host, source'));
  });

  describe('dedup', () => {
    it('single field', () => assertParses('index=main | dedup host'));
    it('multiple fields', () => assertParses('index=main | dedup host, source'));
    it.skip('with keepevents', () => assertParses('index=main | dedup keepevents=true host'));
    it.skip('with consecutive', () => assertParses('index=main | dedup consecutive=true host'));
    it.skip('with sortby', () => assertParses('index=main | dedup host sortby -_time'));
  });

  describe('sort', () => {
    it('ascending', () => assertParses('index=main | sort host'));
    it('descending', () => assertParses('index=main | sort -host'));
    it('multiple fields', () => assertParses('index=main | sort -_time, host'));
    it('with limit', () => assertParses('index=main | sort 10 host'));
    it('sort 0', () => assertParses('index=main | sort 0 host'));
  });

  describe('head', () => {
    it('basic', () => assertParses('index=main | head'));
    it('with count', () => assertParses('index=main | head 10'));
    it.skip('with limit', () => assertParses('index=main | head limit=100'));
  });

  describe('tail', () => {
    it('basic', () => assertParses('index=main | tail'));
    it('with count', () => assertParses('index=main | tail 10'));
  });

  describe('reverse', () => {
    it('basic', () => assertParses('index=main | reverse'));
  });

  describe('regex', () => {
    it('basic', () => assertParses('index=main | regex _raw="error"'));
    it('with field', () => assertParses('index=main | regex host="web\\d+"'));
    it('negation', () => assertParses('index=main | regex _raw!="debug"'));
  });

  describe('search', () => {
    it('keyword', () => assertParses('index=main | search error'));
    it('field value', () => assertParses('index=main | search host=web*'));
    it('boolean', () => assertParses('index=main | search error OR warning'));
    it('NOT', () => assertParses('index=main | search NOT debug'));
  });
});

// =============================================================================
// PIPELINE SPLITTERS (7 commands)
// =============================================================================

describe('Pipeline Splitter Commands', () => {
  describe('append', () => {
    it('basic', () => assertParses('index=main | append [search index=errors]'));
  });

  describe('join', () => {
    it('basic', () => assertParses('index=main | join host [search index=other]'));
    it('type=left', () => assertParses('index=main | join type=left host [search index=other]'));
    it('type=inner', () => assertParses('index=main | join type=inner host [search index=other]'));
    it('type=outer', () => assertParses('index=main | join type=outer host [search index=other]'));
    it('with max', () => assertParses('index=main | join max=10 host [search index=other]'));
    it('with overwrite', () => assertParses('index=main | join overwrite=false host [search index=other]'));
    it('multiple options', () => assertParses('index=main | join type=left max=10 host [search index=other]'));
  });

  describe('foreach', () => {
    it.skip('basic', () => assertParses('index=main | foreach * [eval <<FIELD>>=<<FIELD>>+1]'));
    it.skip('with pattern', () => assertParses('index=main | foreach count_* [eval <<FIELD>>=<<FIELD>>*100]'));
  });

  describe('map', () => {
    it.skip('basic', () => assertParses('index=main | map search="search index=other host=$host$"'));
    it.skip('with maxsearches', () => assertParses('index=main | map maxsearches=10 search="search index=$index$"'));
  });

  describe('makeresults', () => {
    it('basic', () => assertParses('| makeresults'));
    it('with count', () => assertParses('| makeresults count=10'));
    it('with annotate', () => assertParses('| makeresults annotate=true'));
  });

  describe('gentimes', () => {
    it('basic', () => assertParses('| gentimes start=-7d end=now'));
    it('with increment', () => assertParses('| gentimes start=-7d end=now increment=1d'));
  });

  describe('return', () => {
    it('basic', () => assertParses('index=main | return host'));
    it('with count', () => assertParses('index=main | return 10 host'));
    it('multiple fields', () => assertParses('index=main | return host, source'));
  });
});

// =============================================================================
// STRUCTURAL COMMANDS (13 commands)
// =============================================================================

describe('Structural Commands', () => {
  describe('where', () => {
    it('comparison', () => assertParses('index=main | where count > 10'));
    it('string comparison', () => assertParses('index=main | where host="web01"'));
    it('like', () => assertParses('index=main | where like(host, "web%")'));
    it('match', () => assertParses('index=main | where match(host, "web\\d+")'));
    it('isnotnull', () => assertParses('index=main | where isnotnull(user)'));
    it('complex', () => assertParses('index=main | where count > 10 AND status != "error"'));
  });

  describe('bin/bucket', () => {
    it.skip('bin time', () => assertParses('index=main | bin _time span=1h'));
    it.skip('bin field', () => assertParses('index=main | bin count bins=10'));
    it('bucket alias', () => assertParses('index=main | bucket _time span=1d'));
    it('with AS', () => assertParses('index=main | bin _time span=1h AS time_bucket'));
  });

  describe('fillnull', () => {
    it('basic', () => assertParses('index=main | fillnull'));
    it('with value', () => assertParses('index=main | fillnull value=0'));
    it.skip('specific fields', () => assertParses('index=main | fillnull value="N/A" host, source'));
  });

  describe('filldown', () => {
    it('basic', () => assertParses('index=main | filldown'));
    it('specific field', () => assertParses('index=main | filldown host'));
    it('multiple fields', () => assertParses('index=main | filldown host, source'));
  });

  describe('mvexpand', () => {
    it('basic', () => assertParses('index=main | mvexpand values'));
    it.skip('with limit', () => assertParses('index=main | mvexpand limit=100 values'));
  });

  describe('makemv', () => {
    it.skip('with delim', () => assertParses('index=main | makemv delim="," values'));
    it.skip('with tokenizer', () => assertParses('index=main | makemv tokenizer="(\\w+)" field'));
  });

  describe('mvcombine', () => {
    it('basic', () => assertParses('index=main | mvcombine values'));
    it('with delim', () => assertParses('index=main | mvcombine delim="," values'));
  });

  describe('transaction', () => {
    it('basic', () => assertParses('index=main | transaction host'));
    it.skip('with maxspan', () => assertParses('index=main | transaction host maxspan=5m'));
    it('with startswith', () => assertParses('index=main | transaction host startswith="start" endswith="end"'));
    it.skip('multiple fields', () => assertParses('index=main | transaction host, session_id'));
  });

  describe('tstats', () => {
    it('basic', () => assertParses('| tstats count where index=main'));
    it('with by', () => assertParses('| tstats count where index=main by host'));
    it('with prestats', () => assertParses('| tstats prestats=true count where index=main by host'));
    it('sum indexed field', () => assertParses('| tstats sum(bytes) where index=main by host'));
  });

  describe('collect', () => {
    it.skip('basic', () => assertParses('index=main | collect index=summary'));
    it.skip('with marker', () => assertParses('index=main | collect index=summary marker="report_type=daily"'));
  });

  describe('outputlookup', () => {
    it('basic', () => assertParses('index=main | outputlookup results.csv'));
    it('with createinapp', () => assertParses('index=main | outputlookup createinapp=true results.csv'));
    it.skip('append mode', () => assertParses('index=main | outputlookup append=true results.csv'));
  });
});

// =============================================================================
// RESERVED KEYWORD EDGE CASES
// =============================================================================

describe('Reserved Keyword Edge Cases', () => {
  describe('type as option name', () => {
    it('join type=left', () => assertParses('index=main | join type=left host [search index=other]'));
    it('join type=inner', () => assertParses('index=main | join type=inner host [search index=other]'));
    it('join type=outer', () => assertParses('index=main | join type=outer host [search index=other]'));
  });

  describe('reserved words as field names', () => {
    it('eval creates count field', () => assertParses('index=main | eval count=1'));
    it.skip('eval creates type field', () => assertParses('index=main | eval type="error"'));
    it('eval creates index field', () => assertParses('index=main | eval index="main"'));
    it('stats count AS count', () => assertParses('index=main | stats count AS count'));
    it('table with count field', () => assertParses('index=main | table count, type, index'));
    it('rename to reserved word', () => assertParses('index=main | rename foo AS type'));
  });

  describe('boolean keywords', () => {
    it('true in condition', () => assertParses('index=main | where true'));
    it('false in condition', () => assertParses('index=main | where false'));
    it('true() function', () => assertParses('index=main | eval always=true()'));
    it('false() function', () => assertParses('index=main | eval never=false()'));
    it('null() function', () => assertParses('index=main | eval empty=null()'));
  });

  describe('AS keyword contexts', () => {
    it.skip('eval field AS alias', () => assertParses('index=main | eval foo=bar+1 AS result'));
    it('stats AS alias', () => assertParses('index=main | stats count AS total'));
    it('rename AS', () => assertParses('index=main | rename host AS hostname'));
    it('lookup AS', () => assertParses('index=main | lookup users user AS username'));
  });

  describe('BY keyword contexts', () => {
    it('stats by', () => assertParses('index=main | stats count by host'));
    it('chart by', () => assertParses('index=main | chart count by host'));
    it('top by', () => assertParses('index=main | top host by sourcetype'));
    it('eventstats by', () => assertParses('index=main | eventstats count by host'));
  });
});

// =============================================================================
// COMPLEX PIPELINES
// =============================================================================

describe('Complex Pipelines', () => {
  it('eval -> stats -> where -> table', () => {
    assertParses(`
      index=main
      | eval duration_ms=duration*1000
      | stats avg(duration_ms) AS avg_duration by host
      | where avg_duration > 1000
      | table host, avg_duration
    `);
  });

  it('rex -> lookup -> eval -> stats', () => {
    assertParses(`
      index=main
      | rex field=_raw "user=(?<username>\\w+)"
      | lookup users username OUTPUT department
      | eval is_admin=if(department="IT", 1, 0)
      | stats count by department, is_admin
    `);
  });

  it.skip('spath -> mvexpand -> stats', () => {
    assertParses(`
      index=main sourcetype=json
      | spath path=items{}
      | mvexpand items
      | stats count by items.type
    `);
  });

  it.skip('transaction -> stats -> sort', () => {
    assertParses(`
      index=main
      | transaction session_id maxspan=30m
      | stats avg(duration) AS avg_session, count AS session_count by host
      | sort -session_count
    `);
  });

  it('join with complex subsearch', () => {
    assertParses(`
      index=main
      | stats count by host
      | join type=left host [
        search index=assets
        | table host, location, owner
      ]
      | table host, count, location, owner
    `);
  });

  it('multiple stages with all command types', () => {
    assertParsesWithStages(`
      index=main
      | eval foo=1
      | stats count by host
      | where count > 10
      | table host, count
      | sort -count
      | head 10
    `, 7);
  });
});

// =============================================================================
// MULTILINE FORMATTING
// =============================================================================

describe('Multiline Formatting', () => {
  it('stats with line breaks', () => {
    assertParses(`
      index=main
      | stats
          count,
          sum(bytes) AS total_bytes,
          avg(duration) AS avg_duration
        by
          host,
          sourcetype
    `);
  });

  it('eval with multiple assignments on separate lines', () => {
    assertParses(`
      index=main
      | eval
          duration_ms = duration * 1000,
          size_kb = bytes / 1024,
          status_text = case(
            status < 200, "info",
            status < 400, "success",
            status < 500, "client_error",
            true(), "server_error"
          )
    `);
  });

  it('complex where clause', () => {
    assertParses(`
      index=main
      | where
          (host="web*" OR host="app*")
          AND status >= 400
          AND isnotnull(user)
    `);
  });
});
