# Field Tracking Architecture

**How fields are tracked from creation through usage to modification**

## Overview

Field tracking is a **3-layer architecture** where the **pattern system is just one layer**:

```
┌─────────────────────────────────────────────────────────────┐
│                    1. PATTERN SYSTEM                         │
│                     (What we built)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Interprets command syntax patterns                  │   │
│  │ • Extracts field effects: creates/consumes/modifies   │   │
│  │ • Returns: { creates: [], consumes: [], modifies: [] }│   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  2. COMMAND HANDLERS                         │
│              (Orchestration layer - existing)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Calls pattern interpreter (new) OR custom logic     │   │
│  │ • Adds command-specific semantics (drops, etc.)       │   │
│  │ • Returns CommandFieldEffect                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   3. FIELD TRACKER                           │
│                  (State manager - existing)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ • Maintains field state throughout pipeline           │   │
│  │ • Tracks: creation, consumption, modification, drops  │   │
│  │ • Builds dependency graph                             │   │
│  │ • Stores full lineage history                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Pattern System (NEW)

**Purpose**: Extract field effects from command syntax declaratively

**Location**: `entities/spl/lib/parser/patterns/`

### What It Does
- Takes a **pattern definition** and **AST node**
- Walks both structures simultaneously
- Extracts fields based on their **effects** (creates/consumes/modifies/groups-by)

### Example: `rename` Command
```typescript
// INPUT: Pattern definition
const renamePattern = {
  kind: 'group',
  quantifier: '+',
  pattern: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'wc-field', name: 'oldField', effect: 'consumes' },
      { kind: 'literal', value: 'as' },
      { kind: 'param', type: 'wc-field', name: 'newField', effect: 'creates' },
    ],
  },
};

// INPUT: AST node
const astNode = {
  type: 'RenameCommand',
  renamings: [
    { oldField: { fieldName: 'foo' }, newField: { fieldName: 'bar' } }
  ],
};

// OUTPUT: Pattern match result
interpretPattern(renamePattern, astNode)
// Returns:
{
  creates: ['bar'],
  consumes: ['foo'],
  modifies: [],
  groupsBy: [],
  matched: true,
}
```

### What It DOESN'T Do
❌ Doesn't track field state
❌ Doesn't know if a field exists
❌ Doesn't build dependency graphs
❌ Doesn't handle "drops" semantics (yet)

**It's stateless** - just extracts what the command declares.

---

## Layer 2: Command Handlers (EXISTING + NEW INTEGRATION)

**Purpose**: Translate command semantics into field effects

**Location**: `features/field-lineage/lib/command-handlers/`

### What It Does
1. **Calls pattern interpreter** (if pattern exists) OR **custom logic** (if no pattern)
2. **Adds command-specific semantics** (e.g., rename drops the old field)
3. **Returns CommandFieldEffect** with all information needed

### Example Flow

```typescript
// 1. Analyzer calls handler
const handler = getCommandHandler(stage, trackedCommands);
const effect = handler.getFieldEffect(stage, tracker);

// 2. Handler checks for pattern first
if (hasCommandPattern(stage)) {
  // NEW: Use pattern interpreter
  const patternResult = interpretPattern(pattern, stage);

  // Convert to CommandFieldEffect
  return {
    creates: patternResult.creates.map(f => ({
      fieldName: f,
      dependsOn: [],  // Pattern doesn't track this yet
      confidence: 'certain',
    })),
    consumes: patternResult.consumes,
    modifies: patternResult.modifies,
    drops: [],  // Pattern doesn't handle this yet
  };
}

// 3. Fall back to custom handler
return handleRenameCommand(stage, tracker);
```

### Custom Handler Example (OLD WAY)
```typescript
function handleRenameCommand(stage: RenameCommand, tracker: FieldTracker) {
  const creates = [];
  const consumes = [];
  const drops = [];

  for (const mapping of stage.renamings) {
    consumes.push(mapping.oldField.fieldName);
    creates.push({
      fieldName: mapping.newField.fieldName,
      dependsOn: [mapping.oldField.fieldName],  // ✅ Tracks dependency
      confidence: 'certain',
    });
    drops.push({
      fieldName: mapping.oldField.fieldName,  // ✅ Handles drops
      reason: 'explicit',
    });
  }

  return { creates, consumes, modifies: [], drops };
}
```

### CommandFieldEffect Interface
```typescript
interface CommandFieldEffect {
  creates: Array<{
    fieldName: string;
    dependsOn?: string[];      // What this field depends on
    expression?: string;        // Source expression (for eval)
    dataType?: FieldDataType;   // Inferred type
    confidence?: ConfidenceLevel;
    line?: number;
    column?: number;
  }>;

  modifies: Array<{
    fieldName: string;
    dependsOn?: string[];
    expression?: string;
  }>;

  consumes: string[];  // Fields read by the command

  drops: Array<{
    fieldName: string;
    reason: 'explicit' | 'implicit' | 'aggregation';
  }>;

  dropsAllExcept?: string[];  // For stats: drops all except these
}
```

---

## Layer 3: Field Tracker (EXISTING)

**Purpose**: Maintain field state throughout the entire pipeline

**Location**: `features/field-lineage/lib/field-tracker.ts`

### What It Does
- **Maintains state** of every field at every point in the pipeline
- **Tracks history** of all field events (created, consumed, modified, dropped)
- **Builds dependency graph** (which fields depend on which)
- **Provides queries**: "Does field X exist?", "What created field Y?", "What depends on Z?"

### State Management

```typescript
class FieldTracker {
  // All fields ever seen
  private fields: Map<string, FieldLineage> = new Map();

  // Current state (which fields exist right now)
  private currentState: Map<string, FieldState> = new Map();

  // Dependency graph
  private dependencyGraph: Map<string, Set<string>> = new Map();

  // Methods
  addField(fieldName, event, options)     // Create new field
  modifyField(fieldName, event)           // Modify existing field
  consumeField(fieldName, event)          // Mark field as used
  dropField(fieldName, event)             // Remove field from pipeline

  // Queries
  hasField(fieldName): boolean
  getField(fieldName): FieldLineage | null
  getAllFields(): string[]
  getDependencies(fieldName): string[]
}
```

### FieldLineage Structure

```typescript
interface FieldLineage {
  fieldName: string;

  // Full event history
  events: FieldEvent[];  // [ {kind: 'created', line: 1}, {kind: 'consumed', line: 2}, ... ]

  // First event (creation or first seen)
  origin: FieldEvent;

  // Dependencies
  dependsOn: string[];      // Fields this field depends on
  dependedOnBy: string[];   // Fields that depend on this field

  // Metadata
  dataType: FieldDataType;
  isMultivalue: boolean;
  confidence: ConfidenceLevel;
}
```

### Example: Tracking Through Pipeline

```spl
| eval foo=1
| rename foo as bar
| eval baz=bar+1
```

**After `| eval foo=1`**:
```typescript
tracker.fields = {
  'foo': {
    fieldName: 'foo',
    events: [{ kind: 'created', line: 1, command: 'eval' }],
    origin: { kind: 'created', line: 1 },
    dependsOn: [],
    dependedOnBy: [],
  }
}

tracker.currentState = {
  'foo': { exists: true, lastEvent: {...} }
}
```

**After `| rename foo as bar`**:
```typescript
tracker.fields = {
  'foo': {
    events: [
      { kind: 'created', line: 1, command: 'eval' },
      { kind: 'consumed', line: 1, command: 'rename' },
      { kind: 'dropped', line: 1, command: 'rename' },  // ✅ Dropped!
    ],
    dependedOnBy: ['bar'],  // bar depends on foo
  },
  'bar': {
    events: [{ kind: 'created', line: 1, command: 'rename' }],
    dependsOn: ['foo'],  // ✅ Dependency tracked
  }
}

tracker.currentState = {
  'foo': { exists: false },  // ❌ No longer exists!
  'bar': { exists: true },   // ✅ New field
}
```

**After `| eval baz=bar+1`**:
```typescript
tracker.fields = {
  'foo': { /* same as before */ },
  'bar': {
    events: [
      { kind: 'created', line: 1, command: 'rename' },
      { kind: 'consumed', line: 1, command: 'eval' },  // ✅ Used by eval
    ],
    dependedOnBy: ['baz'],  // baz depends on bar
  },
  'baz': {
    events: [{ kind: 'created', line: 1, command: 'eval' }],
    dependsOn: ['bar'],  // ✅ Dependency on bar
  }
}
```

---

## Complete Flow: SPL → Field Lineage

```
┌─────────────────────────────────────────────────────────────┐
│ SPL Query: | eval foo=1 | rename foo as bar | eval baz=bar+1│
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                      PARSER                                  │
│  Converts SPL text → AST (Pipeline with stages)              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   LINEAGE ANALYZER                           │
│  for each stage in pipeline:                                 │
│    1. Get command handler                                    │
│    2. Extract field effects (via pattern or custom)          │
│    3. Apply effects to tracker                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: | eval foo=1                                        │
│                                                               │
│ Handler: EvalCommand (custom)                                │
│   → Analyzes expression "1"                                  │
│   → Returns: { creates: [{fieldName:'foo', dependsOn:[]}] }  │
│                                                               │
│ Tracker:                                                     │
│   → tracker.addField('foo', {kind:'created', line:1})        │
│   → State: { foo: exists ✅ }                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: | rename foo as bar                                 │
│                                                               │
│ Handler: RenameCommand (pattern-based!)                      │
│   → interpretPattern(renamePattern, astNode)                 │
│   → Returns: { creates:['bar'], consumes:['foo'] }           │
│   → Custom handler adds: { drops:[{fieldName:'foo'}] }       │
│                                                               │
│ Tracker:                                                     │
│   → tracker.consumeField('foo', {kind:'consumed', line:1})   │
│   → tracker.addField('bar', {kind:'created', dependsOn:['foo']})│
│   → tracker.dropField('foo', {kind:'dropped', line:1})       │
│   → State: { foo: exists ❌, bar: exists ✅ }                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Stage 3: | eval baz=bar+1                                    │
│                                                               │
│ Handler: EvalCommand (custom)                                │
│   → Analyzes expression "bar+1"                              │
│   → Extracts field reference: bar                            │
│   → Returns: { creates:[{fieldName:'baz', dependsOn:['bar']}],│
│                consumes:['bar'] }                            │
│                                                               │
│ Tracker:                                                     │
│   → tracker.consumeField('bar', {kind:'consumed', line:1})   │
│   → tracker.addField('baz', {kind:'created', dependsOn:['bar']})│
│   → State: { bar: exists ✅, baz: exists ✅ }                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     LINEAGE INDEX                            │
│  Final data structure with full lineage for all fields       │
│                                                               │
│  fields: {                                                   │
│    foo: { created at line 1, consumed at line 1, dropped }  │
│    bar: { created at line 1, depends on: [foo] }            │
│    baz: { created at line 1, depends on: [bar] }            │
│  }                                                           │
│                                                               │
│  Dependency graph: foo → bar → baz                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

### ✅ Pattern System Role
- **Declarative**: Describes command syntax and field effects
- **Stateless**: Just extracts, doesn't track
- **First-class**: Used before custom handlers

### ✅ Command Handler Role
- **Orchestration**: Calls pattern OR custom logic
- **Semantic enrichment**: Adds drops, dependencies, etc.
- **Bridge**: Converts pattern results → CommandFieldEffect

### ✅ Field Tracker Role
- **Stateful**: Maintains current field state
- **Historical**: Stores full event history
- **Query engine**: Answers "what exists?", "who depends on who?"

### The Pattern System is ONE INPUT to the tracker, not the tracker itself!

---

## What Happens When a Command Runs

```typescript
// STEP 1: Handler extracts effects (via pattern or custom logic)
const effect = handler.getFieldEffect(stage, tracker);
// effect = {
//   creates: [{fieldName: 'bar', dependsOn: ['foo']}],
//   consumes: ['foo'],
//   drops: [{fieldName: 'foo', reason: 'explicit'}],
// }

// STEP 2: Analyzer applies effects to tracker (in order!)

// 2a. Handle drops first
for (const drop of effect.drops) {
  tracker.dropField(drop.fieldName, {
    kind: 'dropped',
    line,
    column,
    command,
  });
}

// 2b. Record consumption
for (const field of effect.consumes) {
  tracker.consumeField(field, {
    kind: 'consumed',
    line,
    column,
    command,
  });
}

// 2c. Handle modifications
for (const mod of effect.modifies) {
  tracker.modifyField(mod.fieldName, {
    kind: 'modified',
    line,
    column,
    command,
    dependsOn: mod.dependsOn,
  });
}

// 2d. Handle creations
for (const creation of effect.creates) {
  tracker.addField(creation.fieldName, {
    kind: 'created',
    line,
    column,
    command,
    dependsOn: creation.dependsOn,
  }, {
    dataType: creation.dataType,
    confidence: creation.confidence,
  });
}
```

---

## Summary

| Layer | Purpose | State | Pattern System Role |
|-------|---------|-------|---------------------|
| **Pattern System** | Extract field effects from syntax | ❌ Stateless | THIS IS IT |
| **Command Handlers** | Translate semantics | ❌ Stateless | Uses patterns as input |
| **Field Tracker** | Maintain field state | ✅ Stateful | Receives handler output |

**The pattern system extracts WHAT happens. The tracker maintains WHEN and WHERE it happened.**
