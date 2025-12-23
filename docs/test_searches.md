# Field Lineage Handler Test Searches

Comprehensive SPL searches to test each command handler's field tracking capabilities.

## Table of Contents

1. [Field Creators](#field-creators)
2. [Field Extractors](#field-extractors)
3. [Lookup Commands](#lookup-commands)
4. [Field Filters](#field-filters)
5. [Stats Family](#stats-family)
6. [Implicit Field Creators](#implicit-field-creators)
7. [Field Modifiers](#field-modifiers)
8. [Aggregation Commands](#aggregation-commands)
9. [Filtering Commands](#filtering-commands)
10. [JSON/XML Extraction](#jsonxml-extraction)
11. [Subsearch Commands](#subsearch-commands)
12. [Data Generators](#data-generators)
13. [Streaming/Cumulative](#streamingcumulative)
14. [Transform Commands](#transform-commands)
15. [Extraction Commands](#extraction-commands)
16. [Field Operations](#field-operations)
17. [Field Affecting Commands](#field-affecting-commands)
18. [Metrics Commands](#metrics-commands)
19. [Subsearch Return](#subsearch-return)
20. [Accelerated Stats](#accelerated-stats)
21. [Other Commands](#other-commands)

---

## Field Creators

### eval - Basic Assignment
```spl
index=main
| eval new_field = "static value"
| eval calculated = bytes * 1024
| eval combined = host . ":" . source
```

### eval - Multiple Assignments
```spl
index=main
| eval field1 = if(status=200, "success", "failure"),
       field2 = round(response_time, 2),
       field3 = coalesce(user, "anonymous")
```

### eval - Complex Expressions
```spl
index=main
| eval severity = case(
    status >= 500, "critical",
    status >= 400, "error",
    status >= 300, "warning",
    1=1, "info"
  )
| eval duration_category = if(duration > 1000, "slow", if(duration > 100, "medium", "fast"))
```

### eval - Functions Creating Fields
```spl
index=main
| eval timestamp = strftime(_time, "%Y-%m-%d %H:%M:%S")
| eval parts = split(uri, "/")
| eval domain = mvindex(split(url, "/"), 2)
| eval json_data = json_object("host", host, "source", source)
```

### eval - Statistical Functions
```spl
index=main
| eval random_val = random()
| eval hash_val = md5(host)
| eval encoded = base64encode(message)
```

---

## Field Extractors

### rex - Named Capture Groups
```spl
index=main
| rex field=_raw "(?<ip_address>\d+\.\d+\.\d+\.\d+)"
| rex field=message "user=(?<username>\w+)"
| rex field=uri "^/(?<api_version>v\d+)/(?<endpoint>\w+)"
```

### rex - Multiple Captures in One Pattern
```spl
index=main
| rex field=_raw "(?<method>GET|POST|PUT|DELETE)\s+(?<path>/[^\s]+)\s+HTTP/(?<http_version>[\d.]+)"
```

### rex - Mode=sed Replacement
```spl
index=main
| rex field=email mode=sed "s/@.*/REDACTED/"
| rex field=ssn mode=sed "s/\d{3}-\d{2}-/XXX-XX-/"
```

### rex - max_match for Multiple Values
```spl
index=main
| rex field=_raw max_match=0 "error_code=(?<error_codes>\d+)"
```

---

## Lookup Commands

### lookup - Basic
```spl
index=main
| lookup user_info user_id OUTPUT full_name, department, email
```

### lookup - Multiple Output Fields
```spl
index=main
| lookup asset_inventory ip_address AS src_ip OUTPUT asset_name, asset_type, owner, location, criticality
```

### lookup - With Default Values
```spl
index=main
| lookup geo_lookup ip_address AS client_ip OUTPUT country, city, latitude, longitude
| fillnull country value="Unknown"
```

### inputlookup - Load Entire Lookup
```spl
| inputlookup user_database.csv
| fields user_id, username, email, created_date, status
```

### inputlookup - With Where Clause
```spl
| inputlookup append=t server_inventory.csv where status="active"
```

---

## Field Filters

### table - Select Specific Fields
```spl
index=main
| table _time, host, source, sourcetype, status, response_time
```

### table - With Wildcards
```spl
index=main
| table _time, host, *_id, user*, response_*
```

### fields - Keep Mode (Default)
```spl
index=main
| fields _time, host, source, status
```

### fields - Remove Mode
```spl
index=main
| fields - _raw, _indextime, _cd, _bkt, punct
```

### fields - Combined Keep and Wildcard
```spl
index=main
| fields _time, host, *error*, *count
```

---

## Stats Family

### stats - Basic Aggregations
```spl
index=main
| stats count, sum(bytes) AS total_bytes, avg(response_time) AS avg_response, max(duration) AS max_duration BY host
```

### stats - Multiple BY Clauses
```spl
index=main
| stats count AS request_count, dc(user) AS unique_users, values(status) AS statuses BY host, sourcetype, source
```

### stats - List and Values
```spl
index=main
| stats list(user) AS users, values(action) AS actions, first(timestamp) AS first_seen, last(timestamp) AS last_seen BY session_id
```

### eventstats - Add Stats Without Grouping
```spl
index=main
| eventstats count AS total_count, avg(response_time) AS overall_avg BY host
| eval deviation = response_time - overall_avg
```

### streamstats - Running Calculations
```spl
index=main
| sort _time
| streamstats count AS running_count, sum(bytes) AS cumulative_bytes, avg(response_time) AS running_avg BY host
```

### streamstats - Window Functions
```spl
index=main
| sort _time
| streamstats window=5 avg(response_time) AS moving_avg, stdev(response_time) AS moving_stdev
```

### chart - Time-based Visualization
```spl
index=main
| chart count BY status, host
```

### chart - Over and BY
```spl
index=main
| chart avg(response_time) AS avg_response OVER _time BY host span=1h
```

### timechart - Time Series
```spl
index=main
| timechart span=1h count AS requests, avg(response_time) AS avg_response BY host
```

### timechart - Multiple Aggregations
```spl
index=main
| timechart span=15m count AS total_events, dc(user) AS unique_users, sum(bytes) AS total_bytes
```

---

## Implicit Field Creators

### iplocation - Geographic Fields
```spl
index=main
| iplocation clientip
| table clientip, City, Country, Region, lat, lon
```

### iplocation - Custom Prefix
```spl
index=main
| iplocation prefix=geo_ allfields=true src_ip
| table src_ip, geo_City, geo_Country, geo_lat, geo_lon
```

### transaction - Group Events
```spl
index=main
| transaction session_id startswith="login" endswith="logout" maxspan=30m
| table session_id, duration, eventcount, _time
```

### transaction - Multiple Fields
```spl
index=main
| transaction user, host maxevents=100 maxpause=5m
| eval avg_duration = duration / eventcount
```

---

## Field Modifiers

### replace - Value Substitution
```spl
index=main
| replace "ERROR" WITH "error", "WARN" WITH "warning" IN severity
```

### replace - Wildcards
```spl
index=main
| replace "192.168.*" WITH "internal" IN src_ip
| replace "*@company.com" WITH "internal_user" IN email
```

### rename - Field Renaming
```spl
index=main
| rename src AS source_ip, dst AS destination_ip, _time AS timestamp
```

### rename - With Wildcards
```spl
index=main
| rename *_time AS *_timestamp, user_* AS usr_*
```

### strcat - String Concatenation
```spl
index=main
| strcat host ":" port full_address
| strcat "User: " user " accessed " resource access_log
```

### bin - Numeric Binning
```spl
index=main
| bin span=100 response_time AS response_bucket
| stats count BY response_bucket
```

### bin - Time Binning
```spl
index=main
| bin _time span=1h AS hour_bucket
| stats count BY hour_bucket
```

### bin - Custom Field Name
```spl
index=main
| bin bins=10 bytes AS byte_range
```

---

## Aggregation Commands

### top - Most Common Values
```spl
index=main
| top limit=10 host, sourcetype showperc=true countfield=occurrences percentfield=pct
```

### top - By Clause
```spl
index=main
| top user BY host limit=5 showcount=true
```

### rare - Least Common Values
```spl
index=main
| rare status_code limit=20 showperc=true
```

### rare - Multiple Fields
```spl
index=main
| rare user, action BY host countfield=cnt percentfield=percentage
```

### dedup - Remove Duplicates
```spl
index=main
| dedup host, source
| table _time, host, source, message
```

### dedup - Keep N
```spl
index=main
| dedup 3 user sortby -_time
```

### dedup - Consecutive
```spl
index=main
| dedup consecutive=true status BY host
```

---

## Filtering Commands

### where - Boolean Expressions
```spl
index=main
| where status >= 400 AND response_time > 1000
```

### where - Functions
```spl
index=main
| where like(host, "web%") AND cidrmatch("10.0.0.0/8", src_ip)
```

### where - Null Checks
```spl
index=main
| where isnotnull(user) AND isnull(error_code)
```

### where - String Functions
```spl
index=main
| where match(uri, "^/api/v\d+/") AND len(message) > 100
```

### search - Filter Events
```spl
index=main sourcetype=access_*
| search status=200 OR status=301
| search NOT host="internal*"
```

---

## JSON/XML Extraction

### spath - Auto Extract
```spl
index=main sourcetype=json
| spath
| table user.name, user.email, request.method, response.status
```

### spath - Specific Path
```spl
index=main sourcetype=json
| spath input=json_field path=data.items{}.name output=item_names
| spath input=json_field path=metadata.timestamp output=meta_time
```

### spath - Nested Arrays
```spl
index=main sourcetype=json
| spath path=results{}.score output=scores
| spath path=results{}.user.id output=user_ids
```

### xpath - XML Extraction
```spl
index=main sourcetype=xml
| xpath outfield=customer_name "//Customer/Name/text()"
| xpath outfield=order_id "//Order/@id"
```

### xmlkv - Key-Value from XML
```spl
index=main sourcetype=xml
| xmlkv
| table name, value, type
```

### xmlunescape - Decode XML Entities
```spl
index=main
| xmlunescape field=encoded_xml
```

---

## Subsearch Commands

### append - Combine Results
```spl
index=main host=web*
| stats count BY host
| append [search index=main host=db* | stats count BY host]
```

### appendcols - Add Columns
```spl
index=main
| stats count AS web_count BY _time span=1h
| appendcols [search index=database | stats count AS db_count BY _time span=1h]
```

### join - Inner Join
```spl
index=main sourcetype=access
| join type=inner user_id [search index=users | table user_id, username, department]
```

### join - Left Join
```spl
index=main
| join type=left max=0 host [search index=inventory | table host, location, owner]
```

### union - Combine Datasets
```spl
index=main sourcetype=syslog
| union [search index=main sourcetype=access_combined]
| stats count BY sourcetype
```

### union - Multiple Sources
```spl
| union
    [search index=web | eval source_system="web"]
    [search index=app | eval source_system="app"]
    [search index=db | eval source_system="database"]
| stats count BY source_system
```

---

## Data Generators

### makeresults - Generate Test Data
```spl
| makeresults count=100
| eval host = "host" . (random() % 10)
| eval status = if(random() % 10 > 2, 200, 500)
| eval response_time = random() % 1000
```

### makeresults - With Streaming
```spl
| makeresults count=1000 annotate=true
| eval _time = _time - (random() % 86400)
| eval user = "user" . (random() % 50)
```

### metadata - Index Metadata
```spl
| metadata type=hosts index=main
| table host, totalCount, firstTime, lastTime, recentTime
```

### metadata - Sourcetypes
```spl
| metadata type=sourcetypes index=*
| sort -totalCount
| head 20
```

---

## Streaming/Cumulative

### delta - Change Between Events
```spl
index=main
| sort _time
| delta bytes AS bytes_change
| delta response_time AS response_change p=3
```

### accum - Cumulative Sum
```spl
index=main
| sort _time
| accum bytes AS cumulative_bytes
| accum count AS running_total
```

### autoregress - Previous Values
```spl
index=main
| sort _time
| autoregress response_time AS prev_response p=1-3
| eval trend = response_time - prev_response_p1
```

### addtotals - Row/Column Totals
```spl
index=main
| stats count BY host, status
| addtotals fieldname=total row=true col=true labelfield=host label="Total"
```

### addtotals - Column Only
```spl
index=main
| chart sum(bytes) BY host OVER sourcetype
| addtotals col=true label="All Sources"
```

---

## Transform Commands

### contingency - Cross-Tabulation
```spl
index=main
| contingency host status usenull=true mincount=1
```

### xyseries - Pivot Data
```spl
index=main
| stats count BY _time, host
| xyseries _time host count
```

### timewrap - Compare Time Periods
```spl
index=main
| timechart span=1d count
| timewrap 1w
```

---

## Extraction Commands

### erex - Example-Based Extraction
```spl
index=main
| erex email fromfield=_raw examples="user@example.com, admin@company.org"
```

### kv - Auto Key-Value
```spl
index=main sourcetype=kvpairs
| kv
| table key1, key2, value1
```

### multikv - Multi-Line Key-Value
```spl
index=main sourcetype=config
| multikv fields name value
| table name, value
```

### kvform - Key-Value with Format
```spl
index=main
| kvform
```

---

## Field Operations

### convert - Type Conversion
```spl
index=main
| convert auto(response_time) dur2sec(duration) num(status_code) timeformat="%Y-%m-%d" ctime(timestamp)
```

### convert - Memory Size
```spl
index=main
| convert memk(memory_used) AS memory_kb
| convert rmunit(disk_space) AS disk_bytes
```

### makemv - Create Multivalue
```spl
index=main
| makemv delim="," tags
| makemv tokenizer="(\w+)" words
```

### mvcombine - Combine Multivalue
```spl
index=main
| mvcombine delim="; " user
```

### mvexpand - Expand Multivalue
```spl
index=main
| mvexpand tags
| stats count BY tags
```

---

## Field Affecting Commands

### fieldsummary - Field Statistics
```spl
index=main
| fieldsummary maxvals=10
| table field, count, distinct_count, is_exact, numeric_count, max, min, mean
```

### addcoltotals - Add Column Totals
```spl
index=main
| stats sum(bytes) AS total_bytes, count AS events BY host
| addcoltotals labelfield=host label="TOTAL"
```

### inputcsv - Load CSV
```spl
| inputcsv my_data.csv
| eval timestamp = strptime(date_field, "%Y-%m-%d")
```

### bucketdir - Directory Buckets
```spl
index=main
| bucketdir _bkt AS bucket_info pathfield=index maxcount=10
```

### geom - Geographic Shapes
```spl
index=main
| geom geo_us_states featureIdField=state
```

### concurrency - Concurrent Events
```spl
index=main
| concurrency start=start_time end=end_time
```

### typer - Type Events
```spl
index=main
| typer
| stats count BY punct
```

### nomv - Flatten Multivalue
```spl
index=main
| nomv tags
```

### makecontinuous - Fill Time Gaps
```spl
index=main
| timechart span=1h count
| makecontinuous _time span=1h
```

### reltime - Relative Time
```spl
index=main
| reltime
| table _time, reltime
```

---

## Metrics Commands

### mstats - Metrics Statistics
```spl
| mstats avg(cpu.percent) AS avg_cpu, max(memory.used) AS max_mem WHERE index=metrics BY host span=5m
```

### mcatalog - Metrics Catalog
```spl
| mcatalog values(metric_name) AS metrics WHERE index=metrics BY host
```

### mpreview - Preview Metrics
```spl
| mpreview index=metrics
| stats count BY metric_name
```

### findtypes - Find Field Types
```spl
index=main
| findtypes max=100
| table field, type, count
```

### searchtxn - Search Transactions
```spl
| searchtxn session_id
```

---

## Subsearch Return

### return - Return Values
```spl
index=main
| head 1
| return $host $source
```

### return - Multiple Values
```spl
index=main
| stats values(host) AS hosts
| return 10 $hosts
```

### return - With Rename
```spl
index=main
| dedup user
| return 5 user_list=$user
```

---

## Accelerated Stats

### tstats - Accelerated Statistics
```spl
| tstats count WHERE index=main BY host, sourcetype
```

### tstats - With Datamodel
```spl
| tstats count FROM datamodel=Network_Traffic WHERE nodename=All_Traffic BY All_Traffic.src, All_Traffic.dest
| rename All_Traffic.* AS *
```

### tstats - Summaries Only
```spl
| tstats prestats=true count WHERE index=main BY _time span=1h
| timechart span=1h count
```

---

## Other Commands

### setfields - Set Field Values
```spl
index=main
| setfields severity="info", processed=true, source_system="splunk"
```

### tags - Add Tags
```spl
index=main
| tags outputfield=tag host
| stats count BY tag
```

### format - Format for Subsearch
```spl
index=main
| stats values(host) AS hosts
| format maxresults=100
```

### transpose - Pivot Rows/Columns
```spl
index=main
| stats count BY host
| transpose 10 header_field=host column_name=metric
```

### sort - Order Results
```spl
index=main
| sort -_time, +host, num(status)
| head 100
```

### head/tail - Limit Results
```spl
index=main
| head 50
| tail 10
```

### fillnull - Replace Nulls
```spl
index=main
| fillnull value="N/A" user, department
| fillnull value=0 count, bytes
```

### filldown - Fill Empty Values
```spl
index=main
| filldown session_id, user
```

---

## Complex Multi-Handler Searches

### Search 1: Full ETL Pipeline
```spl
index=main sourcetype=access_combined
| rex field=_raw "(?<client_ip>\d+\.\d+\.\d+\.\d+)\s+-\s+(?<user>\S+)"
| iplocation client_ip
| eval response_category = case(status<300, "success", status<400, "redirect", status<500, "client_error", true(), "server_error")
| lookup user_info user OUTPUT department, manager
| where isnotnull(user) AND user!="-"
| bin _time span=1h AS hour
| stats count AS requests, avg(response_time) AS avg_response, dc(client_ip) AS unique_ips BY hour, host, response_category
| eventstats sum(requests) AS total_requests BY hour
| eval request_pct = round(requests/total_requests*100, 2)
| sort hour, -requests
| rename hour AS time_bucket, avg_response AS avg_response_ms
```

### Search 2: Transaction Analysis
```spl
index=main sourcetype=application
| transaction session_id startswith="session_start" endswith="session_end" maxspan=1h
| eval duration_min = duration/60
| spath input=payload path=user.id output=user_id
| lookup user_demographics user_id OUTPUT age_group, region
| where duration_min > 5
| stats count AS sessions, avg(duration_min) AS avg_duration, avg(eventcount) AS avg_events BY age_group, region
| addtotals col=true row=true labelfield=age_group label="Total"
```

### Search 3: Anomaly Detection Pipeline
```spl
index=main sourcetype=metrics
| bin _time span=5m
| stats avg(cpu_percent) AS avg_cpu, avg(memory_percent) AS avg_mem BY _time, host
| streamstats window=12 avg(avg_cpu) AS baseline_cpu, stdev(avg_cpu) AS stdev_cpu BY host
| eval cpu_zscore = (avg_cpu - baseline_cpu) / stdev_cpu
| where abs(cpu_zscore) > 3
| eval anomaly_type = if(cpu_zscore > 0, "high", "low")
| join type=left host [search index=inventory | table host, team, criticality]
| table _time, host, team, criticality, avg_cpu, baseline_cpu, cpu_zscore, anomaly_type
```

### Search 4: Multi-Source Correlation
```spl
index=main sourcetype=firewall action=blocked
| stats count AS block_count, values(dest_port) AS blocked_ports BY src_ip
| where block_count > 100
| append
    [search index=main sourcetype=authentication action=failed
    | stats count AS failed_logins BY src_ip
    | where failed_logins > 50]
| stats sum(block_count) AS total_blocks, sum(failed_logins) AS total_failures, values(blocked_ports) AS all_blocked_ports BY src_ip
| where isnotnull(total_blocks) AND isnotnull(total_failures)
| iplocation src_ip
| eval threat_score = (total_blocks/100) + (total_failures/50)
| sort -threat_score
| head 20
```

### Search 5: JSON Processing Pipeline
```spl
index=main sourcetype=json_events
| spath
| spath path=metadata.tags{} output=tags
| spath path=payload.items{}.price output=prices
| eval total_price = mvsum(prices)
| eval tag_count = mvcount(tags)
| mvexpand tags
| stats count AS events, sum(total_price) AS revenue, avg(tag_count) AS avg_tags BY tags, event_type
| xyseries tags event_type revenue
| addtotals row=true col=true
```
