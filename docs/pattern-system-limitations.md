# Pattern System Limitations & Solutions

**Status**: Phase 3 Complete - Integration Successful (84% test pass rate)
**Date**: 2025-11-30

This document details the limitations discovered when integrating the pattern-based interpreter with the field lineage analyzer, and proposes solutions for each.

---

## 1. Missing "Drops" Semantics

### Problem
**Severity**: High
**Affects**: rename, fields, table commands

The pattern system can express that a field is:
- Created (`effect: 'creates'`)
- Consumed/Read (`effect: 'consumes'`)
- Modified (`effect: 'modifies'`)
- Grouped by (`effect: 'groups-by'`)

But it **cannot express** that a field is **dropped/removed** from the pipeline.

### Example: `rename` Command
```spl
| eval foo=1
| rename foo as bar
```

**Expected behavior**:
- `foo` is consumed (read)
- `bar` is created
- `foo` is **dropped** (no longer available after this command)

**Current pattern behavior**:
```typescript
{
  creates: ['bar'],
  consumes: ['foo'],
  modifies: [],
  drops: []  // ❌ Missing!
}
```

**Custom handler behavior** (correct):
```typescript
{
  creates: [{ fieldName: 'bar', ... }],
  consumes: ['foo'],
  modifies: [],
  drops: [{ fieldName: 'foo', reason: 'explicit' }]  // ✅ Correct
}
```

### Impact
- **7 failing tests** in `analyzer.test.ts` due to incorrect field availability tracking
- Rename chains fail: `rename a as b | rename b as c` doesn't track that `a` is gone
- Field existence queries return wrong results

### Solution Options

#### Option A: Add `drops` field effect
**Difficulty**: Medium
**Breaking change**: No

Add a new field effect type:
```typescript
type FieldEffect =
  | 'creates'
  | 'consumes'
  | 'modifies'
  | 'groups-by'
  | 'drops';      // NEW
```

Update `rename` pattern:
```typescript
{
  kind: 'sequence',
  patterns: [
    { kind: 'param', type: 'wc-field', name: 'oldField', effect: 'consumes' },
    { kind: 'literal', value: 'as' },
    { kind: 'param', type: 'wc-field', name: 'newField', effect: 'creates' },
    { kind: 'param', type: 'wc-field', name: 'oldField', effect: 'drops' }, // NEW - same param twice with different effects
  ],
}
```

**Pros**: Explicit, declarative
**Cons**: Same parameter appears twice in pattern (oldField)

#### Option B: Add semantic rules to CommandSyntax
**Difficulty**: Medium
**Breaking change**: No

Add optional semantic rules that describe side effects:
```typescript
interface CommandSyntax {
  command: string;
  syntax: SyntaxPattern;
  semantics?: {
    dropsConsumed?: boolean;     // If true, consumed fields are also dropped
    dropsAllExcept?: ParamName[]; // All fields except these are dropped
  };
}
```

Then `rename` pattern:
```typescript
export const renameCommand: CommandSyntax = {
  command: 'rename',
  syntax: { /* existing pattern */ },
  semantics: {
    dropsConsumed: true,  // Old field is dropped
  },
};
```

**Pros**: Cleaner pattern definition, handles common cases
**Cons**: Less flexible for complex dropping logic

#### Option C: Custom post-processing hook
**Difficulty**: Low
**Breaking change**: No

Allow patterns to specify a post-processing function:
```typescript
interface CommandSyntax {
  command: string;
  syntax: SyntaxPattern;
  postProcess?: (result: PatternMatchResult, astNode: any) => PatternMatchResult;
}
```

**Pros**: Maximum flexibility
**Cons**: Defeats the purpose of declarative patterns

#### ✅ Recommended: Option B + Option A for complex cases
Start with Option B for common patterns, add Option A later for commands with complex dropping logic.

---

## 2. Missing Dependency Tracking

### Problem
**Severity**: Medium
**Affects**: All field-creating commands (eval, stats, rename, etc.)

The pattern interpreter extracts **which fields are created** but not **what they depend on**.

### Example: `eval` Command
```spl
| eval total = price + tax
```

**Expected**:
```typescript
{
  creates: [{
    fieldName: 'total',
    dependsOn: ['price', 'tax'],  // ✅ Knows dependencies
    expression: 'price + tax',
  }]
}
```

**Current pattern result**:
```typescript
{
  creates: ['total'],  // ❌ No dependency info
  consumes: [],        // ❌ Should include price, tax
}
```

### Why This Matters
1. **Field lineage visualization**: Can't draw dependency arrows
2. **Impact analysis**: Can't answer "what breaks if I remove field X?"
3. **Optimization**: Can't detect unused fields

### Root Cause
Patterns describe **syntax structure** (field positions), not **semantic relationships** (what depends on what).

For `eval`, the dependency is in the **expression** (AST subtree), not in a simple field reference.

### Solution Options

#### Option A: Expression analysis in interpreter
**Difficulty**: High
**Breaking change**: No

Enhance the pattern interpreter to recursively walk expression AST nodes and extract field references:

```typescript
function extractDependencies(expression: Expression): string[] {
  switch (expression.type) {
    case 'FieldReference':
      return [expression.fieldName];
    case 'BinaryExpression':
      return [
        ...extractDependencies(expression.left),
        ...extractDependencies(expression.right),
      ];
    case 'FunctionCall':
      return expression.arguments.flatMap(extractDependencies);
    // ... handle all expression types
  }
}
```

**Pros**: Works automatically for all expression types
**Cons**: Complex, interpreter becomes AST-aware

#### Option B: AST node hints in pattern
**Difficulty**: Medium
**Breaking change**: No

Add metadata to patterns indicating where to find dependencies:

```typescript
{
  kind: 'param',
  type: 'evaled-field',
  name: 'expression',
  effect: 'creates',
  dependenciesFrom: 'expression',  // NEW: Extract deps from this AST property
}
```

**Pros**: Declarative, keeps interpreter simple
**Cons**: Requires per-command configuration

#### Option C: Hybrid approach
**Difficulty**: Medium
**Breaking change**: No

Pattern specifies the **created field** and **expression field**, interpreter analyzes expression:

```typescript
{
  kind: 'param',
  type: 'field',
  name: 'targetField',
  effect: 'creates',
  analyzeExpression: 'expression',  // NEW: Analyze this property for dependencies
}
```

Interpreter enhancement:
```typescript
if (pattern.analyzeExpression) {
  const exprNode = astNode[pattern.analyzeExpression];
  const deps = analyzeExpressionDependencies(exprNode);
  // Add deps to result
}
```

**Pros**: Balances declarative patterns with smart analysis
**Cons**: Couples interpreter to expression analysis

#### ✅ Recommended: Option C (Hybrid)
Patterns remain declarative, but interpreter can perform intelligent analysis when instructed.

---

## 3. Field List Ambiguity

### Problem
**Severity**: Low
**Affects**: fillnull, mvexpand, and commands with optional field lists

When a field-list parameter is optional and not specified, the command affects **all fields**, but the pattern can't distinguish between:
- "No fields specified" (affects all fields)
- "Empty field list" (affects nothing)

### Example: `fillnull`
```spl
| fillnull         # Fills ALL null fields
| fillnull foo bar  # Fills only foo and bar
```

**Pattern**:
```typescript
{
  kind: 'param',
  type: 'field-list',
  quantifier: '?',  // Optional
  effect: 'modifies',
}
```

**Interpreter behavior**:
- `fillnull` → extracts `[]` (empty array)
- `fillnull foo bar` → extracts `['foo', 'bar']`

Both look the same to the caller!

### Impact
- Cannot distinguish "no fields specified" from "empty list"
- Affects semantic analysis for commands like `fillnull`, `mvexpand`

### Solution Options

#### Option A: Special sentinel value
**Difficulty**: Low
**Breaking change**: No

Use a special value to indicate "all fields":
```typescript
{
  modifies: ['*'],  // Sentinel: all fields
}
```

**Pros**: Simple, clear
**Cons**: Requires convention, could clash with wildcards

#### Option B: Add metadata to result
**Difficulty**: Low
**Breaking change**: No

Add metadata to PatternMatchResult:
```typescript
interface PatternMatchResult {
  creates: string[];
  consumes: string[];
  modifies: string[];
  groupsBy: string[];
  matched: boolean;
  error?: string;

  // NEW: Metadata
  metadata?: {
    affectsAllFields?: boolean;
    isWildcard?: boolean;
  };
}
```

**Pros**: Explicit, doesn't pollute field arrays
**Cons**: More complex result type

#### ✅ Recommended: Option B
Clearer semantics, doesn't overload field name arrays.

---

## 4. Complex Command Semantics

### Problem
**Severity**: Medium
**Affects**: stats, eventstats, streamstats, table, fields

Some commands have complex semantics that go beyond simple field effects:

#### `stats` command
- **Drops all fields** except aggregations and BY fields
- Creates new fields from aggregations
- Preserves BY fields
- Different behavior for variants (eventstats, streamstats)

**Pattern cannot express**:
```typescript
dropsAllExcept: [...byFields, ...createdFields]
```

#### `eventstats` vs `stats`
- Same syntax pattern
- Different field retention semantics
- Pattern alone can't distinguish behavior

### Current Workaround
Custom handlers still used for these commands.

### Solution Options

#### Option A: Enhance CommandSyntax with semantic rules
**Difficulty**: Medium
**Breaking change**: No

```typescript
interface CommandSyntax {
  command: string;
  syntax: SyntaxPattern;
  semantics?: {
    dropsAllExcept?: 'creates' | 'consumes' | 'groups-by' | ParamName[];
    preservesAllFields?: boolean;  // For eventstats
    implicitConsumes?: string[];    // For timechart (consumes _time)
  };
}
```

Example:
```typescript
export const statsCommand: CommandSyntax = {
  command: 'stats',
  syntax: { /* pattern */ },
  semantics: {
    dropsAllExcept: ['creates', 'groups-by'],  // Keep only these
  },
};
```

**Pros**: Declarative, handles most cases
**Cons**: Semantics object could grow complex

#### Option B: Command variants
**Difficulty**: Low
**Breaking change**: No

Define separate patterns for each variant:
```typescript
export const statsCommand: CommandSyntax = { /* drops all */ };
export const eventstatsCommand: CommandSyntax = { /* preserves all */ };
export const streamstatsCommand: CommandSyntax = { /* preserves all */ };
```

**Pros**: Simple, explicit
**Cons**: Duplicates syntax patterns

#### ✅ Recommended: Option A for stats family
The variants share syntax but differ in semantics - perfect use case for semantic rules.

---

## 5. Multiline/Formatting Independence

### Problem
**Severity**: Very Low
**Affects**: All commands (minor)

Patterns describe logical syntax, but AST nodes are already parsed and don't preserve formatting.

This is actually **not a problem** - patterns work correctly regardless of formatting.

### Example
```spl
| stats
    count(status) as total
    by host
```

vs

```spl
| stats count(status) as total by host
```

Both produce identical AST → Same pattern match ✅

---

## 6. Wildcard Field Handling

### Problem
**Severity**: Low
**Affects**: rename, fields commands

Wildcard fields (`foo*`) need special handling but patterns treat them like regular fields.

### Example
```spl
| rename foo* as bar*
```

**Pattern extracts**:
```typescript
{
  consumes: ['foo*'],
  creates: ['bar*'],
}
```

But semantically:
- `foo*` matches multiple fields: `foo_a`, `foo_b`, `foo_c`
- Each needs to be renamed individually
- Pattern doesn't expand wildcards

### Solution
This is actually **correct behavior** - the pattern extracts the wildcard pattern, and the **field tracker** (not the interpreter) should expand it based on available fields.

**No change needed** - this is a field tracker responsibility.

---

## Summary of Limitations

| # | Limitation | Severity | Recommended Solution | Effort |
|---|------------|----------|---------------------|--------|
| 1 | Missing "drops" semantics | **High** | Semantic rules + drops effect | Medium |
| 2 | Missing dependency tracking | Medium | Hybrid: Pattern hints + expression analysis | Medium |
| 3 | Field list ambiguity | Low | Metadata in result | Low |
| 4 | Complex command semantics | Medium | Semantic rules in CommandSyntax | Medium |
| 5 | Multiline independence | Very Low | None needed ✅ | N/A |
| 6 | Wildcard handling | Low | None needed ✅ (tracker's job) | N/A |

---

## Next Steps

### Phase 3.5: Pattern System Refinement (Optional)
1. **Add semantic rules to CommandSyntax** (solves #1, #4)
   - `dropsAllExcept`, `dropsConsumed`, `preservesAllFields`
2. **Add dependency tracking** (solves #2)
   - `analyzeExpression` hint in patterns
   - Expression analyzer in interpreter
3. **Add result metadata** (solves #3)
   - `affectsAllFields` flag

### Current State
- ✅ Pattern system **works** for simple commands
- ✅ Integration **successful** (84% test pass)
- ✅ Fallback strategy **validated** (custom handlers still work)
- ⚠️ **Not production-ready** for complex commands yet

### Production Readiness Checklist
- [ ] Implement semantic rules (2-3 days)
- [ ] Add dependency tracking (2-3 days)
- [ ] Update all 5 command patterns with semantics (1 day)
- [ ] Achieve 100% test pass rate (1 day)
- [ ] Document pattern authoring guide (1 day)

**Total effort to production**: ~1-2 weeks

---

## References
- Pattern types: `entities/spl/lib/parser/patterns/types.ts`
- Interpreter: `entities/spl/lib/parser/patterns/interpreter.ts`
- Integration: `features/field-lineage/lib/command-handlers/pattern-based.ts`
