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
    it('string concatenation', () => assertParses('index=main | eval msg=host."-".source'));
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
    it('with window', () => assertParses('index=main | streamstats window=10 avg(value) AS moving_avg'));
    it('with reset', () => assertParses('index=main | streamstats reset_on_change=true count by host'));
  });

  describe('chart', () => {
    it('basic', () => assertParses('index=main | chart count by host'));
    it('over field', () => assertParses('index=main | chart count over host'));
    it('by two fields', () => assertParses('index=main | chart count by host, status'));
    it('with span', () => assertParses('index=main | chart span=1h count by _time'));
  });

  describe('timechart', () => {
    it('basic', () => assertParses('index=main | timechart count'));
    it('with span', () => assertParses('index=main | timechart span=1h count'));
    it('by field', () => assertParses('index=main | timechart count by host'));
    it('multiple aggregations', () => assertParses('index=main | timechart avg(bytes), max(bytes) by host'));
  });

  describe('rename', () => {
    it('single field', () => assertParses('index=main | rename host AS hostname'));
    it('multiple fields', () => assertParses('index=main | rename host AS hostname, source AS src'));
    it('with underscore', () => assertParses('index=main | rename _time AS event_time'));
  });

  describe('rex', () => {
    it('basic pattern', () => assertParses('index=main | rex field=_raw "user=(?<username>\\w+)"'));
    it('multiple groups', () => assertParses('index=main | rex "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+):(?<port>\\d+)"'));
    it('mode=sed', () => assertParses('index=main | rex mode=sed "s/foo/bar/g"'));
    it('max_match', () => assertParses('index=main | rex max_match=5 "(?<word>\\w+)"'));
  });

  describe('lookup', () => {
    it('basic', () => assertParses('index=main | lookup users user'));
    it('with output', () => assertParses('index=main | lookup users user OUTPUT name, email'));
    it('with AS', () => assertParses('index=main | lookup users user AS username OUTPUT name'));
    it('outputnew', () => assertParses('index=main | lookup users user OUTPUTNEW department'));
  });

  describe('inputlookup', () => {
    it('basic', () => assertParses('| inputlookup users.csv'));
    it('with where', () => assertParses('| inputlookup users.csv where status="active"'));
    it('with max', () => assertParses('| inputlookup max=1000 users.csv'));
    it('append mode', () => assertParses('index=main | inputlookup append=true users.csv'));
  });

  describe('spath', () => {
    it('basic', () => assertParses('index=main | spath'));
    it('with path', () => assertParses('index=main | spath path=user.name'));
    it('with output', () => assertParses('index=main | spath path=user.name output=username'));
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
    it('with limit', () => assertParses('index=main | top limit=10 host'));
    it('by field', () => assertParses('index=main | top host by sourcetype'));
    it('multiple fields', () => assertParses('index=main | top host, source'));
  });

  describe('rare', () => {
    it('basic', () => assertParses('index=main | rare host'));
    it('with limit', () => assertParses('index=main | rare limit=10 host'));
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
    it('multiple subsearches', () => assertParses('index=main | union [search index=a], [search index=b]'));
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
    it('with keepevents', () => assertParses('index=main | dedup keepevents=true host'));
    it('with consecutive', () => assertParses('index=main | dedup consecutive=true host'));
    it('with sortby', () => assertParses('index=main | dedup host sortby -_time'));
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
    it('with limit', () => assertParses('index=main | head limit=100'));
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
    it('simple', () => assertParses('index=main | foreach * [search index=other]'));
    it('basic', () => assertParses('index=main | foreach * [eval <<FIELD>>=<<FIELD>>+1]'));
    it('with pattern', () => assertParses('index=main | foreach count_* [eval <<FIELD>>=<<FIELD>>*100]'));
  });

  describe('map', () => {
    it('basic', () => assertParses('index=main | map search="search index=other host=$host$"'));
    it('with maxsearches', () => assertParses('index=main | map maxsearches=10 search="search index=$index$"'));
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
    it('bin time', () => assertParses('index=main | bin _time span=1h'));
    it('bin field', () => assertParses('index=main | bin count bins=10'));
    it('bucket alias', () => assertParses('index=main | bucket _time span=1d'));
    it('with AS', () => assertParses('index=main | bin _time span=1h AS time_bucket'));
  });

  describe('fillnull', () => {
    it('basic', () => assertParses('index=main | fillnull'));
    it('with value', () => assertParses('index=main | fillnull value=0'));
    it('specific fields', () => assertParses('index=main | fillnull value="N/A" host, source'));
  });

  describe('filldown', () => {
    it('basic', () => assertParses('index=main | filldown'));
    it('specific field', () => assertParses('index=main | filldown host'));
    it('multiple fields', () => assertParses('index=main | filldown host, source'));
  });

  describe('mvexpand', () => {
    it('basic', () => assertParses('index=main | mvexpand values'));
    it('with limit', () => assertParses('index=main | mvexpand limit=100 values'));
  });

  describe('makemv', () => {
    it('with delim', () => assertParses('index=main | makemv delim="," values'));
    it('with tokenizer', () => assertParses('index=main | makemv tokenizer="(\\w+)" field'));
  });

  describe('mvcombine', () => {
    it('basic', () => assertParses('index=main | mvcombine values'));
    it('with delim', () => assertParses('index=main | mvcombine delim="," values'));
  });

  describe('transaction', () => {
    it('basic', () => assertParses('index=main | transaction host'));
    it('with maxspan', () => assertParses('index=main | transaction host maxspan=5m'));
    it('with startswith', () => assertParses('index=main | transaction host startswith="start" endswith="end"'));
    it('multiple fields', () => assertParses('index=main | transaction host, session_id'));
  });

  describe('tstats', () => {
    it('basic', () => assertParses('| tstats count where index=main'));
    it('with by', () => assertParses('| tstats count where index=main by host'));
    it('with prestats', () => assertParses('| tstats prestats=true count where index=main by host'));
    it('sum indexed field', () => assertParses('| tstats sum(bytes) where index=main by host'));
  });

  describe('collect', () => {
    it('basic', () => assertParses('index=main | collect index=summary'));
    it('with marker', () => assertParses('index=main | collect index=summary marker="report_type=daily"'));
  });

  describe('outputlookup', () => {
    it('basic', () => assertParses('index=main | outputlookup results.csv'));
    it('with createinapp', () => assertParses('index=main | outputlookup createinapp=true results.csv'));
    it('append mode', () => assertParses('index=main | outputlookup append=true results.csv'));
  });

  describe('appendcols', () => {
    it('basic', () => assertParses('index=main | appendcols [search index=other | stats count]'));
    it('with override', () => assertParses('index=main | appendcols override=true [search index=other | stats count]'));
  });

  describe('appendpipe', () => {
    it('basic', () => assertParses('index=main | appendpipe [| stats count by host]'));
    it('with option', () => assertParses('index=main | appendpipe run_in_preview=true [| stats count]'));
  });

  describe('multisearch', () => {
    it('two searches', () => assertParses('| multisearch [search index=main] [search index=other]'));
    it('three searches', () => assertParses('| multisearch [search index=a] [search index=b] [search index=c]'));
  });

  describe('set', () => {
    it('union', () => assertParses('index=main | set union [search index=other]'));
    it('intersect', () => assertParses('index=main | set intersect [search index=other]'));
    it('diff', () => assertParses('index=main | set diff [search index=other]'));
  });

  describe('format', () => {
    it('basic', () => assertParses('index=main | format'));
    it('with options', () => assertParses('index=main | format maxresults=100'));
  });

  describe('transpose', () => {
    it('basic', () => assertParses('index=main | transpose'));
    it('with row count', () => assertParses('index=main | transpose 5'));
    it('with options', () => assertParses('index=main | transpose column_name=metric header_field=host'));
  });

  describe('untable', () => {
    it('basic', () => assertParses('index=main | untable _time metric value'));
  });
});

// =============================================================================
// EXTRACTION COMMANDS
// =============================================================================

describe('Extraction Commands', () => {
  describe('xpath', () => {
    it('basic', () => assertParses('index=main | xpath "//item/name"'));
    it('with field', () => assertParses('index=main | xpath field=xmldata "//item/name"'));
    it('with outfield', () => assertParses('index=main | xpath outfield=itemname "//item/name"'));
    it('with default', () => assertParses('index=main | xpath default="N/A" "//item/name"'));
    it('full options', () => assertParses('index=main | xpath field=xmldata outfield=name default="unknown" "//root/item/@id"'));
  });

  describe('xmlkv', () => {
    it('basic', () => assertParses('index=main | xmlkv'));
    it('with field', () => assertParses('index=main | xmlkv field=xmldata'));
    it('with maxinputs', () => assertParses('index=main | xmlkv maxinputs=100'));
  });

  describe('xmlunescape', () => {
    it('basic', () => assertParses('index=main | xmlunescape'));
    it('with field', () => assertParses('index=main | xmlunescape field=xmldata'));
  });

  describe('multikv', () => {
    it('basic', () => assertParses('index=main | multikv'));
    it('with conf', () => assertParses('index=main | multikv conf=myconfig'));
    it('with filter', () => assertParses('index=main | multikv filter="header"'));
    it('with forceheader', () => assertParses('index=main | multikv forceheader=1'));
    it('with noheader', () => assertParses('index=main | multikv noheader=true'));
    it('with rmorig', () => assertParses('index=main | multikv rmorig=false'));
  });

  describe('erex', () => {
    it('basic', () => assertParses('index=main | erex username'));
    it('with fromfield', () => assertParses('index=main | erex username fromfield=_raw'));
    it('with examples', () => assertParses('index=main | erex username examples="john,jane"'));
    it('with counterexamples', () => assertParses('index=main | erex username counterexamples="admin"'));
    it('with maxtrainers', () => assertParses('index=main | erex username maxtrainers=100'));
  });

  describe('kv', () => {
    it('basic', () => assertParses('index=main | kv'));
    it('with field', () => assertParses('index=main | kv field=_raw'));
    it('with pairdelim', () => assertParses('index=main | kv pairdelim=";"'));
    it('with kvdelim', () => assertParses('index=main | kv kvdelim=":"'));
    it('full options', () => assertParses('index=main | kv field=data pairdelim="&" kvdelim="="'));
  });
});

// =============================================================================
// STATISTICAL/ML COMMANDS
// =============================================================================

describe('Statistical/ML Commands', () => {
  describe('predict', () => {
    it('basic', () => assertParses('index=main | predict count'));
    it('with algorithm', () => assertParses('index=main | predict count algorithm=LLP5'));
    it('with future_timespan', () => assertParses('index=main | predict count future_timespan=24'));
    it('with holdback', () => assertParses('index=main | predict count holdback=10'));
    it('full options', () => assertParses('index=main | predict count algorithm=LLP5 future_timespan=24 holdback=10'));
  });

  describe('trendline', () => {
    it('simple moving average', () => assertParses('index=main | trendline sma5(price)'));
    it('with alias', () => assertParses('index=main | trendline sma5(price) AS trend'));
    it('exponential moving average', () => assertParses('index=main | trendline ema10(value) AS trend'));
    it('weighted moving average', () => assertParses('index=main | trendline wma3(count) AS weighted'));
  });

  describe('anomalies', () => {
    it('basic', () => assertParses('index=main | anomalies'));
    it('with field', () => assertParses('index=main | anomalies count'));
    it('with threshold', () => assertParses('index=main | anomalies threshold=3'));
    it('with action', () => assertParses('index=main | anomalies action=annotate'));
    it('full options', () => assertParses('index=main | anomalies count threshold=2.5 action=filter'));
  });

  describe('cluster', () => {
    it('basic', () => assertParses('index=main | cluster'));
    it('with t', () => assertParses('index=main | cluster t=0.9'));
    it('with showcount', () => assertParses('index=main | cluster showcount=true'));
    it('with field', () => assertParses('index=main | cluster field=message'));
    it('with labelfield', () => assertParses('index=main | cluster labelfield=cluster_label'));
    it('full options', () => assertParses('index=main | cluster t=0.8 showcount=true countfield=cluster_count'));
  });

  describe('kmeans', () => {
    it('basic', () => assertParses('index=main | kmeans'));
    it('with k', () => assertParses('index=main | kmeans k=5'));
    it('with maxiters', () => assertParses('index=main | kmeans maxiters=100'));
    it('with fields', () => assertParses('index=main | kmeans cpu memory disk'));
    it('full options', () => assertParses('index=main | kmeans k=3 maxiters=50 cpu memory'));
  });

  describe('correlate', () => {
    it('basic', () => assertParses('index=main | correlate'));
    it('with type', () => assertParses('index=main | correlate type=pearson'));
    it('with fields', () => assertParses('index=main | correlate price volume'));
    it('full options', () => assertParses('index=main | correlate type=spearman field1 field2'));
  });
});

// =============================================================================
// SYSTEM/UTILITY COMMANDS
// =============================================================================

describe('System/Utility Commands', () => {
  describe('rest', () => {
    it('basic endpoint', () => assertParses('| rest /services/server/info'));
    it('string endpoint', () => assertParses('| rest "/services/server/info"'));
    it('with count', () => assertParses('| rest /services/saved/searches count=10'));
    it('with splunk_server', () => assertParses('| rest /services/server/info splunk_server=local'));
  });

  describe('metadata', () => {
    it('type sourcetypes', () => assertParses('| metadata type=sourcetypes'));
    it('type hosts', () => assertParses('| metadata type=hosts'));
    it('with index', () => assertParses('| metadata type=sourcetypes index=main'));
  });

  describe('datamodel', () => {
    it('basic', () => assertParses('| datamodel Authentication'));
    it('with object', () => assertParses('| datamodel Authentication Successful_Authentication'));
    it('string name', () => assertParses('| datamodel "Web" "Web_Traffic"'));
    it('with options', () => assertParses('| datamodel Authentication summariesonly=true'));
  });

  describe('loadjob', () => {
    it('basic sid', () => assertParses('| loadjob 1234567890.123'));
    it('string sid', () => assertParses('| loadjob "scheduler__admin__search__RMD5abc123"'));
    it('with events', () => assertParses('| loadjob 1234567890.123 events=true'));
    it('with artifact_offset', () => assertParses('| loadjob mysearchid artifact_offset=100'));
  });

  describe('savedsearch', () => {
    it('basic', () => assertParses('| savedsearch "My Saved Search"'));
    it('identifier name', () => assertParses('| savedsearch daily_report'));
    it('with app', () => assertParses('| savedsearch "My Search" app=search'));
    it('with owner', () => assertParses('| savedsearch mysearch owner=admin'));
  });

  describe('outputcsv', () => {
    it('basic', () => assertParses('index=main | outputcsv results.csv'));
    it('string filename', () => assertParses('index=main | outputcsv "my results.csv"'));
    it('with append', () => assertParses('index=main | outputcsv append=true results.csv'));
    it('with createinapp', () => assertParses('index=main | outputcsv createinapp=true output.csv'));
  });

  describe('sendemail', () => {
    it('basic', () => assertParses('index=main | sendemail to="admin@example.com"'));
    it('with subject', () => assertParses('index=main | sendemail to="user@example.com" subject="Alert"'));
    it('with message', () => assertParses('index=main | sendemail to="user@example.com" message="Results attached"'));
    it('full options', () => assertParses('index=main | sendemail to="user@example.com" subject="Report" sendresults=true format=csv'));
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
    it('eval creates type field', () => assertParses('index=main | eval type="error"'));
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
    it('eval field AS alias', () => assertParses('index=main | eval foo=bar+1 AS result'));
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

  it('spath -> mvexpand -> stats', () => {
    assertParses(`
      index=main sourcetype=json
      | spath path=items{}
      | mvexpand items
      | stats count by items.type
    `);
  });

  it('transaction -> stats -> sort', () => {
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
