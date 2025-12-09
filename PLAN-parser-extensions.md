# SPL Parser Extensions Plan

## Overview

Extend the SPL parser to support missing operators and additional commands. Work is organized into phases by priority and complexity.

---

## Phase 1: Expression Operators (High Priority)

These operators are commonly used in `eval` and `where` expressions.

### 1.1 LIKE Operator
Pattern matching in expressions: `field LIKE "pattern%"`

**Implementation:**
- Add `Like` keyword token in `tokens.ts`
- Add to `comparisonExpression` rule in `expressions.ts` as an alternative operator
- Pattern value is a string literal with `%` and `_` wildcards

**Example SPL:**
```spl
| where host LIKE "web%"
| eval is_error=if(message LIKE "%error%", 1, 0)
```

### 1.2 IN Operator
Membership testing: `field IN (value1, value2, value3)`

**Implementation:**
- Add `In` keyword token in `tokens.ts`
- Extend `comparisonExpression` to handle `IN (value-list)` syntax
- Value list is comma-separated literals/identifiers in parentheses

**Example SPL:**
```spl
| where status IN (200, 201, 204)
| where host IN ("web1", "web2", "web3")
```

### 1.3 NOT IN Operator
Negated membership: `field NOT IN (value1, value2)`

**Implementation:**
- Handled by combining existing `NOT` token with `IN`
- Lookahead in expression parser to detect `NOT IN` sequence

### 1.4 BETWEEN Operator (Optional)
Range testing: `field BETWEEN min AND max`

**Implementation:**
- Add `Between` keyword token
- Special handling in comparisonExpression for `BETWEEN x AND y` syntax
- Note: Less common in SPL, often done with `field>=min AND field<=max`

---

## Phase 2: Data Transformation Commands (Medium Priority)

Commands that transform data structure, useful for field lineage.

### 2.1 appendcols
Append columns from subsearch: `| appendcols [override=<bool>] [subsearch]`

**Implementation:**
- Add `Appendcols` token
- Create `appendcolsCommand` rule similar to `appendCommand`
- Add to pipeline command dispatch

### 2.2 appendpipe
Append results to itself: `| appendpipe [run_in_preview=<bool>] [subsearch]`

**Implementation:**
- Add `Appendpipe` token
- Create `appendpipeCommand` rule
- Handles self-referential pipeline append

### 2.3 multisearch
Multiple concurrent searches: `| multisearch [subsearch] [subsearch] ...`

**Implementation:**
- Add `Multisearch` token
- Create `multisearchCommand` rule with multiple subsearch children

### 2.4 set
Set operations: `| set union|intersect|diff [subsearch]`

**Implementation:**
- Add `Set`, `Intersect`, `Diff` tokens
- Create `setCommand` rule with operation type and subsearch

### 2.5 format
Format subsearch results: `| format [options]`

**Implementation:**
- Add `Format` token
- Create `formatCommand` rule with various formatting options

### 2.6 transpose
Transpose rows/columns: `| transpose [N] [column_name=<field>] [header_field=<field>]`

**Implementation:**
- Add `Transpose` token
- Create `transposeCommand` rule

### 2.7 untable
Reverse pivot/table: `| untable <row-field> <column-field> <value-field>`

**Implementation:**
- Add `Untable` token
- Create `untableCommand` rule with three field arguments

---

## Phase 3: Extraction & Analysis Commands (Medium Priority)

Commands for data extraction and analysis.

### 3.1 xpath
XPath extraction: `| xpath [field=<field>] [outfield=<field>] <xpath-expr>`

**Implementation:**
- Add `Xpath` token
- Create `xpathCommand` rule similar to `spathCommand`

### 3.2 xmlkv
XML key-value extraction: `| xmlkv [maxinputs=<int>]`

**Implementation:**
- Add `Xmlkv` token
- Create `xmlkvCommand` rule with options

### 3.3 xmlunescape
XML unescaping: `| xmlunescape`

**Implementation:**
- Add `Xmlunescape` token
- Create simple `xmlunescapeCommand` rule (no arguments)

### 3.4 multikv
Multi-value KV extraction: `| multikv [options]`

**Implementation:**
- Add `Multikv` token
- Create `multikvCommand` rule

### 3.5 erex
Example-based rex: `| erex <field> examples="example1,example2" [fromfield=<field>]`

**Implementation:**
- Add `Erex` token
- Create `erexCommand` rule with examples option

### 3.6 kv (dedicated rule)
Currently falls through to generic. Add dedicated: `| kv [pairdelim=<d>] [kvdelim=<d>]`

**Implementation:**
- Create `kvCommand` rule (token already exists)
- Similar to extractCommand

---

## Phase 4: Statistical & ML Commands (Lower Priority)

Advanced statistical and machine learning commands.

### 4.1 predict
Time series prediction: `| predict <field> [options]`

**Implementation:**
- Add `Predict` token
- Create `predictCommand` rule

### 4.2 trendline
Trend analysis: `| trendline <trendtype><period>(<field>) [AS <alias>]`

**Implementation:**
- Add `Trendline` token
- Create `trendlineCommand` rule

### 4.3 anomalies / anomalousvalue
Anomaly detection: `| anomalies [options]`

**Implementation:**
- Add `Anomalies`, `Anomalousvalue` tokens
- Create corresponding command rules

### 4.4 cluster
Event clustering: `| cluster [options]`

**Implementation:**
- Add `Cluster` token
- Create `clusterCommand` rule

### 4.5 kmeans
K-means clustering: `| kmeans [k=<int>] <field-list>`

**Implementation:**
- Add `Kmeans` token
- Create `kmeansCommand` rule

### 4.6 correlate
Correlation analysis: `| correlate [options]`

**Implementation:**
- Add `Correlate` token
- Create `correlateCommand` rule

---

## Phase 5: System & Utility Commands (Lower Priority)

System interaction and utility commands.

### 5.1 rest
REST API calls: `| rest <endpoint> [options]`

**Implementation:**
- Add `Rest` token
- Create `restCommand` rule

### 5.2 metadata
Index metadata: `| metadata type=<type> [index=<index>]`

**Implementation:**
- Add `Metadata` token
- Create `metadataCommand` rule

### 5.3 datamodel
Datamodel access: `| datamodel <model> <object> [options]`

**Implementation:**
- Expand existing `Datamodel` token usage
- Create `datamodelCommand` rule

### 5.4 loadjob
Load saved job: `| loadjob <sid> [options]`

**Implementation:**
- Add `Loadjob` token
- Create `loadjobCommand` rule

### 5.5 savedsearch
Run saved search: `| savedsearch <name>`

**Implementation:**
- Add `Savedsearch` token
- Create `savedsearchCommand` rule

### 5.6 outputcsv / outputtext
Output formatting: `| outputcsv <filename>`

**Implementation:**
- Add `Outputcsv`, `Outputtext` tokens
- Create corresponding command rules

### 5.7 sendemail
Email sending: `| sendemail to=<addr> [options]`

**Implementation:**
- Add `Sendemail` token
- Create `sendemailCommand` rule

---

## Phase 6: Visualization Commands (Lowest Priority)

Chart and visualization commands (less relevant for field lineage).

### 6.1 gauge
Gauge visualization: `| gauge <field> [options]`

### 6.2 highlight
Highlight terms: `| highlight <terms>`

### 6.3 iconify
Icon mapping: `| iconify <field>`

---

## Implementation Strategy

### File Changes Per Phase

**Phase 1 (Operators):**
- `tokens.ts` - Add Like, In, Between tokens
- `expressions.ts` - Extend comparisonExpression rule

**Phase 2-6 (Commands):**
- `tokens.ts` - Add command tokens
- `commands/` - Add to appropriate category file or create new file
- `pipeline.ts` - Add command dispatch entries
- `types.ts` - Add ParserMethod declarations

### Testing Strategy

1. Add test cases in corresponding `.test.ts` files
2. Test each new operator/command in isolation
3. Test in combination with existing features
4. Verify field lineage extraction works correctly

### Prioritization Rationale

- **Phase 1**: High impact - operators used in eval/where affect field lineage
- **Phase 2**: Medium impact - data transformation commands create/modify fields
- **Phase 3**: Medium impact - extraction commands create fields
- **Phase 4-6**: Lower impact - analysis/utility commands less relevant for lineage

---

## Estimated Effort

| Phase | Items | Complexity | Estimate |
|-------|-------|------------|----------|
| 1 | 4 operators | Medium | 2-3 hours |
| 2 | 7 commands | Low-Medium | 3-4 hours |
| 3 | 6 commands | Low | 2-3 hours |
| 4 | 6 commands | Low | 2-3 hours |
| 5 | 7 commands | Low | 2-3 hours |
| 6 | 3 commands | Low | 1 hour |

**Total: ~13-17 hours**

---

## Recommendation

Start with **Phase 1** (operators) as it has the highest impact on expression parsing accuracy. Then proceed with **Phase 2** (data transformation) which is most relevant for field lineage analysis.

Phases 3-6 can be implemented incrementally based on actual usage needs.
