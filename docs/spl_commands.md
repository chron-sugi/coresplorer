# SPL Commands Reference

Complete reference of Splunk Processing Language (SPL) commands for Splunk 9.x/10.x.


## Command Categories

| Category | Description |
|----------|-------------|
| **Aggregate** | Statistical aggregation and charting |
| **Eval** | Field calculation and extraction |
| **Format** | Output formatting and field selection |
| **Search** | Filtering and searching events |
| **Transform** | Data restructuring and manipulation |
| **Subsearch** | Pipeline operations and subsearches |
| **Lookup** | External data enrichment |
| **Multivalue** | Multivalue field operations |
| **Time** | Time-based operations |
| **Metrics** | Metrics index operations |
| **ML/Analytics** | Machine learning and analytics |
| **Admin** | Administrative and system commands |

---

## Complete Command List (A-Z)

### A

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `abstract` | Format | Produce summary of each event | preserves |
| `accum` | Transform | Compute running total over events | creates |
| `addcoltotals` | Transform | Add column totals as new row | creates |
| `addinfo` | Transform | Add search metadata fields | creates |
| `addtotals` | Transform | Add row/column totals to events | creates |
| `analyzefields` | Analytics | Analyze field values for patterns | creates |
| `anomalies` | ML | Find unusual patterns in data | creates |
| `anomalousvalue` | ML | Find unusual field values | creates |
| `anomalydetection` | ML | ML-based anomaly detection | creates |
| `append` | Subsearch | Append subsearch results as rows | creates, preserves |
| `appendcols` | Subsearch | Append subsearch results as columns | creates, preserves |
| `appendpipe` | Subsearch | Append subpipeline to results | creates |
| `arules` | ML | Find association rules | creates, drops |
| `associate` | Analytics | Find field associations | creates |
| `audit` | Admin | Return audit trail events | creates |
| `autoregress` | Transform | Copy previous event values to current | creates |

### B

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `bin` / `bucket` | Transform | Discretize continuous values into bins | modifies |
| `bucketdir` | Transform | Create buckets by directory path | creates |

### C

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `chart` | Aggregate | Create chart-ready aggregated data | creates, drops |
| `cluster` | ML | Cluster similar events together | creates |
| `cofilter` | Analytics | Find co-occurring field values | creates |
| `collect` | Subsearch | Write results to summary index | preserves |
| `concurrency` | Transform | Tag concurrent events | creates |
| `contingency` | Aggregate | Build contingency table | creates, drops |
| `convert` | Transform | Convert field values (memk, dur2sec, etc.) | modifies |
| `correlate` | Analytics | Calculate field correlations | creates |
| `crawl` | Admin | Crawl filesystem for data | creates |

### D

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `datamodel` | Search | Examine data model structure | creates |
| `dbinspect` | Admin | Inspect index bucket metadata | creates |
| `dedup` | Format | Remove duplicate events | preserves |
| `delete` | Admin | Mark events for deletion | preserves |
| `delta` | Transform | Calculate difference between events | creates |
| `diff` | Analytics | Diff two search results | creates |

### E

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `erex` | Eval | Extract fields using examples | creates |
| `eval` | Eval | Calculate expression and assign to field | creates, modifies |
| `eventcount` | Admin | Count events in indexes | creates |
| `eventstats` | Aggregate | Add aggregate stats to each event | creates |
| `extract` / `kv` | Eval | Extract key-value pairs | creates |

### F

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `fieldformat` | Format | Format field display without changing value | preserves |
| `fields` | Format | Keep (+) or remove (-) fields | drops |
| `fieldsummary` | Analytics | Summarize field statistics | creates, drops |
| `filldown` | Transform | Fill nulls with previous value | modifies |
| `fillnull` | Transform | Replace null values | modifies |
| `findtypes` | Analytics | Find matching event types | creates |
| `folderize` | Transform | Create folder hierarchy | creates |
| `foreach` | Transform | Apply expression over multiple fields | modifies |
| `format` | Format | Format results for subsearch use | creates |

### G

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `gauge` | Format | Display gauge visualization | preserves |
| `gentimes` | Search | Generate time range events | creates |
| `geom` | Transform | Add geographic features | creates |
| `geostats` | Aggregate | Geographic statistics | creates, drops |

### H

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `head` | Format | Return first N events | preserves |
| `highlight` | Format | Highlight search terms | preserves |
| `history` | Admin | Access search history | creates |

### I

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `iconify` | Format | Display icons in results | preserves |
| `input` | Admin | Add inputs to search | creates |
| `inputcsv` | Lookup | Read events from CSV file | creates |
| `inputlookup` | Lookup | Load events from lookup table | creates |
| `iplocation` | Eval | Add geographic data from IP | creates |

### J

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `join` | Subsearch | Join with subsearch results | creates, preserves |

### K

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `kmeans` | ML | K-means clustering | creates |
| `kvform` | Eval | Extract form-like key-value text | creates |

### L

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `loadjob` | Admin | Load saved job results | creates |
| `localize` | Time | Localize time spans | creates |
| `localop` | Admin | Run operation locally on search head | preserves |
| `lookup` | Lookup | Enrich events with lookup data | creates |

### M

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `makecontinuous` | Transform | Make field values continuous | modifies |
| `makemv` | Multivalue | Convert single value to multivalue | modifies |
| `makeresults` | Search | Generate synthetic events | creates |
| `map` | Subsearch | Run subsearch for each result | creates |
| `mcatalog` | Metrics | Return metrics catalog | creates |
| `mcollect` | Metrics | Write events as metric data points | preserves |
| `metadata` | Search | Return index metadata | creates, drops |
| `metasearch` | Search | Filter by metadata | preserves |
| `meventcollect` | Metrics | Write events as metrics | preserves |
| `mpreview` | Metrics | Preview metric data | creates |
| `mstats` | Metrics | Statistics over metrics indexes | creates, drops |
| `multikv` | Eval | Extract from multi-line tables | creates |
| `multisearch` | Subsearch | Run multiple searches in parallel | creates |
| `mvcombine` | Multivalue | Combine events into multivalue fields | modifies |
| `mvexpand` | Multivalue | Expand multivalue into separate events | modifies |

### N

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `nomv` | Multivalue | Flatten multivalue to single string | modifies |

### O

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `outlier` | ML | Remove statistical outliers | preserves |
| `outputcsv` | Format | Write results to CSV file | preserves |
| `outputlookup` | Lookup | Write results to lookup table | preserves |
| `outputtext` | Format | Output raw text | preserves |
| `overlap` | Analytics | Find overlapping time events | creates |

### P

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `pivot` | Aggregate | Run pivot on data model | creates, drops |
| `predict` | ML | Predict future values | creates |

### R

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `rangemap` | Transform | Map values to named ranges | creates |
| `rare` | Aggregate | Show least common values | creates, drops |
| `regex` | Search | Filter by regular expression | preserves |
| `relevancy` | Analytics | Calculate search relevancy | creates |
| `reltime` | Time | Convert to relative time format | modifies |
| `rename` | Transform | Rename fields | creates, drops |
| `replace` | Transform | Replace field values | modifies |
| `rest` | Admin | Access Splunk REST API | creates |
| `return` | Subsearch | Return values from subsearch | creates, drops |
| `reverse` | Format | Reverse event order | preserves |
| `rex` | Eval | Extract fields using regex | creates |
| `rtorder` | Time | Order real-time events by time | preserves |

### S

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `savedsearch` | Admin | Run a saved search | creates |
| `script` / `run` | Admin | Run external script | creates |
| `scrub` | Admin | Anonymize data | modifies |
| `search` | Search | Filter using search syntax | preserves |
| `searchtxn` | Search | Find related transactions | creates |
| `selfjoin` | Subsearch | Self-join results | creates |
| `sendemail` | Admin | Send email with results | preserves |
| `set` | Subsearch | Set operations (union/diff/intersect) | creates |
| `setfields` | Transform | Set field values explicitly | creates |
| `sichart` | Aggregate | Streaming chart | creates, drops |
| `sirare` | Aggregate | Streaming rare | creates, drops |
| `sistats` | Aggregate | Streaming stats | creates, drops |
| `sitimechart` | Aggregate | Streaming timechart | creates, drops |
| `sitop` | Aggregate | Streaming top | creates, drops |
| `sort` | Format | Sort events by field values | preserves |
| `spath` | Eval | Extract from JSON/XML | creates |
| `stats` | Aggregate | Calculate aggregate statistics | creates, drops |
| `strcat` | Eval | Concatenate string values | creates |
| `streamstats` | Aggregate | Calculate streaming statistics | creates |

### T

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `table` | Format | Display specified fields as table | drops |
| `tags` | Transform | Add tags to events | creates |
| `tail` | Format | Return last N events | preserves |
| `timechart` | Aggregate | Create time-series chart | creates, drops |
| `timewrap` | Aggregate | Overlay time periods | creates, drops |
| `top` | Aggregate | Show most common values | creates, drops |
| `transaction` | Transform | Group events into transactions | creates |
| `transpose` | Transform | Swap rows and columns | creates, drops |
| `trendline` | Analytics | Compute moving averages | creates |
| `tscollect` | Metrics | Collect time-series data | preserves |
| `tstats` | Aggregate | Accelerated stats over tsidx | creates, drops |
| `typeahead` | Admin | Typeahead suggestions | creates |
| `typelearner` | Analytics | Learn event types | creates |
| `typer` | Analytics | Calculate event type | creates |

### U

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `union` | Subsearch | Combine multiple searches | creates |
| `uniq` | Format | Remove consecutive duplicates | preserves |
| `untable` | Transform | Flatten table to key-value rows | creates |

### W

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `walklex` | Admin | Walk lexicon | creates |
| `where` | Search | Filter using eval expressions | preserves |

### X

| Command | Category | Description | Field Effects |
|---------|----------|-------------|---------------|
| `x11` | Analytics | Seasonal time-series adjustment | creates |
| `xmlkv` | Eval | Extract XML key-value pairs | creates |
| `xmlunescape` | Transform | Unescape XML entities | modifies |
| `xpath` | Eval | Extract using XPath expressions | creates |
| `xyseries` | Aggregate | Transform to x/y series columns | creates, drops |

---

## Field Effects Legend

| Effect | Description |
|--------|-------------|
| **creates** | Command can create new fields |
| **modifies** | Command can modify existing field values |
| **drops** | Command can remove fields from results |
| **preserves** | Command preserves fields not explicitly mentioned |

---

## Command Type Classifications

Splunk classifies commands into execution types:

| Type | Description | Example Commands |
|------|-------------|------------------|
| **Distributable Streaming** | Process events one at a time, can run on indexers | `eval`, `rex`, `where`, `rename` |
| **Centralized Streaming** | Process events one at a time, must run on search head | `head`, `dedup`, `streamstats` |
| **Transforming** | Transform results into statistics table | `stats`, `chart`, `timechart`, `top` |
| **Generating** | Generate events without input | `makeresults`, `inputlookup`, `metadata` |
| **Orchestrating** | Control search behavior | `localop`, `map`, `foreach` |
| **Dataset Processing** | Require entire dataset | `sort`, `eventstats`, `transaction` |

---

## Implementation Status

Commands implemented with dedicated handlers in this codebase:

### Fully Implemented (with lineage tracking)
- `eval`, `stats`, `eventstats`, `streamstats`, `chart`, `timechart`
- `rex`, `spath`, `extract`, `lookup`, `inputlookup`
- `table`, `fields`, `rename`, `dedup`, `where`, `bin`
- `top`, `rare`, `strcat`, `replace`, `transaction`, `iplocation`
- `append`, `appendcols`, `join`, `union`, `return`
- `makeresults`, `metadata`, `addtotals`, `delta`, `accum`, `autoregress`
- `tstats`

### Pending Implementation
See `docs/backlog.md` for commands needing handler implementation.

---

