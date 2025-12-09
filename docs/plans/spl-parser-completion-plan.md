# SPL Parser Incomplete Features - Implementation Plan

## Summary

**38 skipped tests** in `src/entities/spl/lib/parser/grammar/commands.test.ts` representing incomplete parser support.

---

## Inventory by Category

### Category 1: Command Options/Parameters (17 tests)

| # | Command | Missing Feature | SPL Syntax | Size |
|---|---------|----------------|------------|------|
| 1 | streamstats | window parameter | `streamstats window=10 avg(value)` | S |
| 2 | streamstats | reset_on_change | `streamstats reset_on_change=true count by host` | S |
| 3 | chart | over clause | `chart count over host` | M |
| 4 | chart | span parameter | `chart span=1h count by _time` | S |
| 5 | timechart | span parameter | `timechart span=1h count` | S |
| 6 | top | limit parameter | `top limit=10 host` | S |
| 7 | rare | limit parameter | `rare limit=10 host` | S |
| 8 | dedup | keepevents option | `dedup keepevents=true host` | M |
| 9 | dedup | consecutive option | `dedup consecutive=true host` | M |
| 10 | dedup | sortby clause | `dedup host sortby -_time` | M |
| 11 | head | limit parameter | `head limit=100` | S |
| 12 | inputlookup | where clause | `inputlookup users.csv where status="active"` | L |
| 13 | inputlookup | max parameter | `inputlookup max=1000 users.csv` | S |
| 14 | spath | output parameter | `spath path=user.name output=username` | S |
| 15 | mvexpand | limit parameter | `mvexpand limit=100 values` | M |
| 16 | transaction | maxspan option | `transaction host maxspan=5m` | S |
| 17 | collect | index/marker options | `collect index=summary marker="..."` | M |

### Category 2: Syntax Variations (8 tests)

| # | Command | Missing Feature | SPL Syntax | Size |
|---|---------|----------------|------------|------|
| 18 | rename | multiple comma-separated | `rename host AS hostname, source AS src` | S |
| 19 | lookup | OUTPUT clause with fields | `lookup users user OUTPUT name, email` | M |
| 20 | union | multiple subsearches | `union [search index=a], [search index=b]` | M |
| 21 | transaction | multiple fields | `transaction host, session_id` | S |
| 22 | fillnull | fields after value | `fillnull value="N/A" host, source` | M |
| 23 | makemv | delim parameter | `makemv delim="," values` | M |
| 24 | makemv | tokenizer parameter | `makemv tokenizer="(\\w+)" field` | M |
| 25 | outputlookup | append mode | `outputlookup append=true results.csv` | S |

### Category 3: Mode Variations (2 tests)

| # | Command | Missing Feature | SPL Syntax | Size |
|---|---------|----------------|------------|------|
| 26 | rex | mode=sed | `rex mode=sed "s/foo/bar/g"` | M |
| 27 | bin | bins parameter | `bin count bins=10` | S |

### Category 4: Expression/Evaluation Features (3 tests)

| # | Command | Missing Feature | SPL Syntax | Size |
|---|---------|----------------|------------|------|
| 28 | eval | string concatenation with . | `eval msg=host."-".source` | M |
| 29 | eval | AS alias syntax | `eval foo=bar+1 AS result` | M |
| 30 | eval | type as field name | `eval type="error"` | M |

### Category 5: Complex Command Syntax (6 tests)

| # | Command | Missing Feature | SPL Syntax | Size |
|---|---------|----------------|------------|------|
| 31 | foreach | template variables | `foreach * [eval <<FIELD>>=<<FIELD>>+1]` | XL |
| 32 | foreach | pattern matching | `foreach count_* [eval <<FIELD>>...]` | XL |
| 33 | map | search parameter | `map search="search index=other host=$host$"` | L |
| 34 | map | maxsearches | `map maxsearches=10 search="..."` | M |
| 35 | bin | span with time field | `bin _time span=1h` | S |
| 36 | collect | basic functionality | `collect index=summary` | M |

### Category 6: Complex Pipeline Tests (2 tests)

| # | Test | Missing Feature | Size |
|---|------|-----------------|------|
| 37 | spath -> mvexpand -> stats | spath path with {} | L |
| 38 | transaction -> stats -> sort | transaction with maxspan | M |

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/entities/spl/lib/parser/grammar/rules/commands/field-creators.ts` | statsCommand, evalCommand, rexCommand, lookupCommand, inputlookupCommand, topCommand, rareCommand |
| `src/entities/spl/lib/parser/grammar/rules/commands/field-filters.ts` | dedupCommand, headCommand, sortCommand |
| `src/entities/spl/lib/parser/grammar/rules/commands/structural.ts` | binCommand, fillnullCommand, mvexpandCommand, transactionCommand |
| `src/entities/spl/lib/parser/grammar/rules/commands/splitters.ts` | foreachCommand, mapCommand, unionCommand |
| `src/entities/spl/lib/parser/ast/transformer.ts` | All visitor methods for CST→AST |
| `src/entities/spl/model/types.ts` | AST type interfaces |
| `src/entities/spl/lib/parser/lexer/tokens.ts` | New tokens (TemplateVariable for foreach) |

---

## Implementation Phases

### Phase 1: Quick Wins (12 tests)
Simple parameter additions to existing commands.

| Feature | File | Change |
|---------|------|--------|
| streamstats window | field-creators.ts | Add `window=<int>` option |
| streamstats reset_on_change | field-creators.ts | Add `reset_on_change=<bool>` option |
| chart/timechart span | field-creators.ts | Add `span=<time>` option |
| top/rare limit | field-creators.ts | Add `limit=<int>` option |
| head limit | field-filters.ts | Add `limit=<int>` option |
| bin bins/span | structural.ts | Add `bins=<int>`, fix span order |
| transaction maxspan | structural.ts | Add `maxspan=<time>` option |
| rename multiple | field-creators.ts | Verify comma-separated works |
| transaction multiple fields | structural.ts | Verify fieldList works |

### Phase 2: Command Options (8 tests)
Options that require grammar restructuring.

| Feature | File | Change |
|---------|------|--------|
| dedup keepevents/consecutive | field-filters.ts | Add boolean options with GATE |
| dedup sortby | field-filters.ts | Add `sortby [+\|-]<field>` clause |
| mvexpand limit | structural.ts | Reorder parameter position |
| inputlookup max | field-creators.ts | Add `max=<int>` before filename |
| spath output | field-creators.ts | Add `output=<field>` option |
| outputlookup append | field-creators.ts | Verify append option |

### Phase 3: Expression & Syntax (8 tests)
Expression parser and keyword handling.

| Feature | File | Change |
|---------|------|--------|
| eval type as field | field-creators.ts | Allow Type token as targetField |
| eval string concat . | expressions.ts | Verify . operator precedence |
| eval AS alias | field-creators.ts | Add `AS <field>` after assignment |
| chart OVER clause | field-creators.ts | Add `OVER <field>` before BY |
| lookup OUTPUT fields | field-creators.ts | Fix field list after OUTPUT |
| makemv delim/tokenizer | structural.ts | Add option parameters |

### Phase 4: Complex Commands (8 tests)
Commands requiring significant grammar changes.

| Feature | File | Change |
|---------|------|--------|
| inputlookup where | field-creators.ts | Add `WHERE <expr>` clause |
| rex mode=sed | field-creators.ts | Handle sed replacement syntax |
| collect full | structural.ts | Implement index/source/marker options |
| map command | splitters.ts | Parse search string with $var$ |
| union multiple | splitters.ts | Allow comma-separated subsearches |
| fillnull field order | structural.ts | Allow fields after value= |

### Phase 5: foreach Templates (2 tests)
Requires new lexer token.

| Feature | File | Change |
|---------|------|--------|
| TemplateVariable token | tokens.ts | Add `<<IDENTIFIER>>` pattern |
| foreach body | splitters.ts | Template-aware expression parsing |
| Expression templates | expressions.ts | Handle TemplateVariable in primary |

---

## Example Implementation: dedup options

### Grammar Change (field-filters.ts)
```typescript
parser.dedupCommand = parser.RULE('dedupCommand', () => {
  parser.CONSUME(t.Dedup);

  // Options before fields
  parser.MANY(() => {
    parser.OR([
      {
        GATE: () => parser.LA(2).tokenType === t.Equals,
        ALT: () => {
          parser.OR2([
            { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
          ]);
          parser.CONSUME(t.Equals);
          parser.OR3([
            { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
            { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
            { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
          ]);
        }
      }
    ]);
  });

  // Fields
  parser.AT_LEAST_ONE(() => {
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' });
  });

  // Optional sortby
  parser.OPTION(() => {
    parser.CONSUME2(t.Identifier, { LABEL: 'sortby' }); // "sortby"
    parser.OPTION2(() => parser.OR4([
      { ALT: () => parser.CONSUME(t.Plus, { LABEL: 'sortDir' }) },
      { ALT: () => parser.CONSUME(t.Minus, { LABEL: 'sortDir' }) },
    ]));
    parser.SUBRULE2(parser.fieldOrWildcard, { LABEL: 'sortField' });
  });
});
```

### AST Type (types.ts)
```typescript
export interface DedupCommand extends ASTNode {
  type: 'DedupCommand';
  fields: FieldReference[];
  keepevents?: boolean;
  consecutive?: boolean;
  sortField?: { field: FieldReference; direction: 'asc' | 'desc' };
}
```

### Transformer (transformer.ts)
```typescript
private visitDedupCommand(ctx: any): AST.DedupCommand {
  const children = ctx.children;
  const fields = children.fields?.map((f: any) => this.visitFieldOrWildcard(f)) ?? [];

  let keepevents: boolean | undefined;
  let consecutive: boolean | undefined;

  if (children.optionName) {
    children.optionName.forEach((opt: any, i: number) => {
      const name = opt.image.toLowerCase();
      const value = children.optionValue[i].image.toLowerCase() === 'true';
      if (name === 'keepevents') keepevents = value;
      if (name === 'consecutive') consecutive = value;
    });
  }

  let sortField: { field: AST.FieldReference; direction: 'asc' | 'desc' } | undefined;
  if (children.sortField) {
    sortField = {
      field: this.visitFieldOrWildcard(children.sortField[0]),
      direction: children.sortDir?.[0]?.image === '-' ? 'desc' : 'asc',
    };
  }

  return {
    type: 'DedupCommand',
    fields,
    keepevents,
    consecutive,
    sortField,
    location: this.getLocation(ctx),
  };
}
```

---

## Dependencies

```
No Dependencies (can parallelize):
├── streamstats options
├── chart/timechart span
├── top/rare/head limit
├── bin bins/span
├── transaction maxspan
├── rename/transaction multiple fields
└── outputlookup append

Depends on Expression Parser:
├── eval string concat (.)
├── eval AS alias
├── eval type field
└── inputlookup where

Depends on New Token:
└── foreach template variables (requires TemplateVariable token)
```

---

## Testing Strategy

1. Remove `.skip` from corresponding test after implementing
2. Run `npm test -- --grep "command-name"` to verify
3. Add edge case tests as needed
4. Update pattern registry if field lineage affected
