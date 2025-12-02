# Code Review: SPL Module (`src/entities/spl/`)

**Date**: December 2, 2025  
**Scope**: Comprehensive analysis of duplicate code, dead code, overlapping functions, and module location inconsistencies

---

## Executive Summary

The SPL module has significant technical debt from pattern system evolution. Key findings:

- **Duplicate pattern definitions** across `registry.ts` (5,417 lines) and `generated-patterns.ts` (9,261 lines)
- **Boilerplate-heavy visitor pattern** in AST transformer with 200+ repeated methods
- **Dead code** including obsolete grammar files and utility scripts
- **File organization** inconsistent with Sliced Feature Design (FSD) principles
- **Semantic layer** mixing pattern definitions with interpretation logic

**Overall Assessment**: Consolidating pattern sources and auto-generating visitor logic would dramatically improve maintainability.

---

## 1. DUPLICATE CODE

### 1.1 Duplicate Pattern Definitions (CRITICAL)

**Location**: `src/entities/spl/lib/parser/patterns/`
- `registry.ts` (5,417 lines) - manually curated patterns
- `generated-patterns.ts` (9,261 lines) - auto-generated patterns

**Issue**: Both files define the same command patterns:
- `binCommand`, `renameCommand`, `fillnullCommand`, `dedupCommand`, `sortCommand`
- `evalCommand`, `statsCommand`, `spathCommand`, `mvexpandCommand`, `addtotalsCommand`
- Plus 100+ additional commands (generated-patterns.ts only)

**Example of Duplication**:
```typescript
// registry.ts lines 16-100
export const binCommand: CommandSyntax = {
  command: 'bin',
  category: 'reporting',
  description: 'Puts continuous numerical values into discrete sets',
  // ... full definition
};

// generated-patterns.ts lines ~6000
export const binCommand: CommandSyntax = {
  "command": "bin",
  "syntax": { ... },
  "category": "reporting",
  "description": "...",
  // ... same definition in JSON format
};
```

**Impact**:
- Maintenance burden: Changes must be made in two places
- Risk of inconsistency: Patterns can drift apart
- Confusion about source of truth
- Wasted ~14k lines of duplicated content

**Recommendations**:
1. **Option A (Recommended)**: Keep `registry.ts` as source of truth
   - Delete `generated-patterns.ts`
   - Use code generation if additional commands needed
   
2. **Option B**: Consolidate in `generated-patterns.ts`
   - Import from `generated-patterns.ts` in `registry.ts`
   - Mark `registry.ts` as deprecated wrapper
   
3. **Option C**: Create unified pattern system
   - Single `patterns.ts` with all commands
   - Export subsets via views/filters for different use cases

---

### 1.2 Duplicate Parser Method Casting

**Location**: All 8 files in `src/entities/spl/lib/parser/grammar/rules/`
- `helpers.ts`
- `expressions.ts`
- `search.ts`
- `pipeline.ts`
- `commands/field-creators.ts`
- `commands/field-filters.ts`
- `commands/structural.ts`
- `commands/splitters.ts`
- `commands/generic.ts`

**Issue**: Each mixin function contains identical casting pattern:
```typescript
export function applyHelperRules(parser: SPLParser): void {
  const p = parser as any; // Access protected parser methods
  // ... rest of function uses p instead of parser
}
```

**Impact**:
- 8 identical lines of boilerplate
- Maintenance burden for type/pattern changes
- Unclear why this pattern is needed

**Recommendations**:
1. Extract to utility function:
```typescript
// src/entities/spl/lib/parser/grammar/rules/utils.ts
export function createParserProxy(parser: SPLParser): any {
  return parser as any;
}
```

2. Or create wrapper class:
```typescript
export class ParserRuleBuilder {
  constructor(private parser: any) {}
  
  rule(name: string, fn: () => void) {
    return this.parser.RULE(name, fn);
  }
  // ... other methods
}
```

3. Consider addressing root cause: Why is type casting needed?
   - `SPLParser` type doesn't expose protected methods
   - Alternative: Extend type or restructure inheritance

---

### 1.3 Duplicate Regex Patterns

**Location**: Multiple files
- `src/entities/spl/model/patterns.ts` - centralized regex patterns
- Inline patterns throughout linter, splinter, and other features

**Issue**: Pattern definitions scattered:
```typescript
// model/patterns.ts
export const SPL_PATTERNS = {
  COMMAND_EXTRACT: /^\|?\s*(\w+)/i,
  PIPE_START: /^\s*\|/,
  // ... etc
};

// But similar patterns may be redefined in:
// - features/spl-linter/lib/
// - features/splinter/lib/
// - other parser utilities
```

**Impact**:
- Inconsistent regex implementations
- Harder to maintain patterns
- Possible performance issues if patterns recompiled

**Recommendation**: 
- Audit all regex usage in codebase
- Consolidate missing patterns into `SPL_PATTERNS`
- Export organized pattern groups

---

### 1.4 Duplicate Grammar File Structure

**Location**: `src/entities/spl/lib/parser/patterns/` subdirectories
- `search/` → dedup-pattern.ts, dedup-grammar.ts, dedup.test.ts
- `aggregation/` → stats-pattern.ts, stats-grammar.ts, stats.test.ts
- `field-manipulation/` → rex-pattern.ts, rex-grammar.ts, rex.test.ts
- 35 total `-pattern.ts` files across subdirectories

**Issue**: Naming pattern unclear:
- `-pattern.ts` = BNF pattern definition (CommandSyntax)
- `-grammar.ts` = Chevrotain parser rule (?)
- Both exist for same command in some cases

**Concern**: 
- Relationship between pattern and grammar files unclear
- Possible redundancy or incomplete migration
- Grammar files may be dead code (see section 2)

**Recommendation**:
1. Document distinction between `-pattern.ts` and `-grammar.ts`
2. Consolidate if redundant
3. Move live grammar rules to `rules/commands/`
4. Archive or delete obsolete files

---

## 2. DEAD CODE

### 2.1 Obsolete Pattern Grammar Files

**Location**: `src/entities/spl/lib/parser/patterns/` subdirectories

**Files**:
- `search/dedup-grammar.ts`, `search/table-grammar.ts`, `search/where-grammar.ts`, `search/search-grammar.ts`
- `search/regex-grammar.ts`
- `results/append-grammar.ts`, `results/join-grammar.ts`, `results/sort-grammar.ts`
- `results/head-grammar.ts`, `results/tail-grammar.ts`, `results/transaction-grammar.ts`
- Plus others in aggregation/ and field-manipulation/

**Evidence of Dead Code**:

1. **Broken code in dedup-grammar.ts**:
```typescript
// lines 15-22
parser.OPTION(() => {
  parser.CONSUME(t.Identifier);
});
parser.OPTION(() => {
  parser.CONSUME(t.Identifier);
});
parser.OPTION(() => {
  parser.CONSUME(t.Identifier);
});
```
This is clearly incomplete/incorrect - three identical OPTION blocks

2. **Not imported anywhere**:
   - Not referenced in `grammar/index.ts`
   - Not referenced in `grammar/rules/index.ts`
   - Not imported by any test files
   - No import statements in codebase

3. **Appear to be WIP**:
   - Incomplete implementations
   - Basic structure, not fully developed
   - Inconsistent with main parser rules

**Impact**:
- Clutters codebase
- Creates confusion about which grammar files are authoritative
- Risk of accidental modifications to unused files
- Increases build time

**Recommendations**:
1. **Delete immediately** if truly dead
2. **Or move to archive folder**: `deprecated/patterns-old/`
3. **Or document purpose**: Add README explaining WIP status
4. **Test**: Run grep on entire codebase to verify no imports

---

### 2.2 Unused Utility Scripts

**Location**: `src/entities/spl/lib/tools/`

**Files**:
- `cleanup-patterns.ts` - removes unused properties from patterns
- `reorganize-patterns.ts` - reorganizes files by category

**Issue**: One-time utility scripts, not runtime code
- Not part of build pipeline
- Not imported by any production code
- Comments suggest they were for pattern migration

**Example** (cleanup-patterns.ts):
```typescript
/**
 * Script to remove unused properties from pattern files
 *
 * Removes: category, description, examples, related, tags
 * These properties are not used by the parser or field-lineage systems.
 */
async function cleanupPatterns() {
  // ... file processing logic
}

cleanupPatterns().catch(console.error);
```

**Impact**:
- Maintenance confusion
- Questions about whether cleanup was actually applied
- If needed again, may be outdated/broken

**Recommendations**:
1. **Move to proper location**: `tools/scripts/` or `scripts/`
2. **Add documentation**: README explaining when/why to use
3. **Or delete** if cleanup was already applied
4. **Consider**: Make into npm scripts in `package.json` if reusable

---

### 2.3 Commented-Out Debug File

**Location**: `src/entities/spl/lib/debug/parse.ts`

**Issue**: File is commented out from earlier fixes
```typescript
// Debug file - disabled due to missing dependencies
// import { parseSPL, tokenizeSPL } from './index';
/*
const spl = `...`;
// ... rest commented out
...
*/
```

**Impact**:
- Dead code taking up space
- Unclear why it exists
- May cause confusion in future maintenance

**Recommendation**:
1. **Delete** if not needed
2. **Or move to demo/ folder** if useful for testing
3. **Or create proper fixture/example** in test directory

---

### 2.4 Unused Pattern Properties

**Location**: Throughout `generated-patterns.ts` and some pattern files

**Issue**: Properties marked for removal by `cleanup-patterns.ts`:
- `category` - unused?
- `description` - unused?
- `examples` - unused?
- `related` - unused?
- `tags` - unused?

**Question**: Are these properties actually consumed?
- Pattern registry: Uses `command`, `syntax`, `semantics`
- Validator: May use `category`, `description` for errors
- UI/documentation: Might use `related`, `tags`
- Unknown consumers?

**Recommendation**:
1. **Audit usage**: Find all places these properties are read
2. **Document consumers**: If used, document which systems depend on them
3. **Clean up**: If truly unused, remove systematically
4. **Or expand**: If useful, ensure consistently populated across all commands

---

### 2.5 Generator vs Manual Patterns Discrepancy

**Location**: `patterns/registry.ts` and `patterns/generated-patterns.ts`

**Issue**: Pattern aliasing strategy unclear:
```typescript
// registry.ts lines ~5375-5383
export const COMMAND_PATTERNS: PatternRegistry = {
  // ...
  
  // Stats family - all variants share the same pattern
  // Variant-specific semantics are applied at runtime based on AST node's variant field
  stats: statsCommand,
  eventstats: statsCommand,    // Same pattern object
  streamstats: statsCommand,   // Shared reference
  chart: statsCommand,
  timechart: statsCommand,
  
  // Bucket is an alias for bin
  bucket: binCommand,
  
  // ...
};
```

**Concerns**:
1. **Aliasing logic unclear**: Why do different commands share patterns?
2. **Runtime variance**: Comment says "variant-specific semantics applied at runtime" but where?
3. **Completeness**: Not clear if all commands support this or just stats family
4. **Testing**: How is alias behavior tested?

**Recommendation**:
1. **Document**: Clearly explain aliasing strategy
2. **Formalize**: Create explicit alias map if pattern
3. **Test**: Add tests for each alias command
4. **Or reconsider**: If each command needs different semantics, use separate patterns

---

## 3. OVERLAPPING FUNCTIONS & INVARIANT ISSUES

### 3.1 Overlapping Pattern Registry Functions

**Location**: `src/entities/spl/lib/parser/patterns/registry.ts` lines 5389-5417

**Functions**:
```typescript
export function getCommandPattern(commandName: string): CommandSyntax | undefined {
  return COMMAND_PATTERNS[commandName.toLowerCase()];
}

export function hasPattern(commandName: string): boolean {
  return commandName.toLowerCase() in COMMAND_PATTERNS;
}

export function getAllCommandNames(): string[] {
  return Object.keys(COMMAND_PATTERNS);
}
```

**Overlaps**:
- `hasPattern(cmd)` ≡ `getCommandPattern(cmd) !== undefined`
  - Redundant function
  - Caller could check return value directly

- `getAllCommandNames()` ≡ `Object.keys(COMMAND_PATTERNS)`
  - Minor wrapper, little added value
  - Just adds one line of indirection

**Impact**:
- Maintenance burden: 3 functions to test and maintain
- Unclear which to use in different contexts
- Possible confusion about single source of truth

**Recommendations**:
1. **Inline simple wrappers**:
```typescript
// Instead of hasPattern(cmd), use:
getCommandPattern(cmd) !== undefined

// Instead of getAllCommandNames(), use:
Object.keys(COMMAND_PATTERNS)
```

2. **Or create unified query interface**:
```typescript
export class PatternRegistry {
  get(name: string): CommandSyntax | undefined { ... }
  has(name: string): boolean { ... }
  getAll(): CommandSyntax[] { ... }
  names(): string[] { ... }
}

export const patterns = new PatternRegistry(COMMAND_PATTERNS);
```

3. **Document intent** if wrappers provide semantic value

---

### 3.2 Duplicate Visitor Methods in Transformer

**Location**: `src/entities/spl/lib/parser/ast/transformer.ts` (1,536 lines)

**Issue**: 200+ visitor methods with repetitive structure
```typescript
// Pattern repeated ~90 times
private visitEvalCommand(ctx: any): AST.EvalCommand { ... }
private visitStatsCommand(ctx: any): AST.StatsCommand { ... }
private visitRenameCommand(ctx: any): AST.RenameCommand { ... }
private visitRexCommand(ctx: any): AST.RexCommand { ... }
private visitLookupCommand(ctx: any): AST.LookupCommand { ... }
// ... 85+ more visitor methods
```

**Common Pattern** (each ~20-40 lines):
```typescript
private visitXxxCommand(ctx: any): AST.XxxCommand {
  const children = ctx.children;
  
  // Extract properties from children
  const prop1 = children.prop1?.[0];
  const prop2 = this.extractField(children.prop2);
  // ... more property extraction
  
  return {
    type: 'XxxCommand',
    prop1,
    prop2,
    // ... all properties
    location: this.getLocation(ctx),
  };
}
```

**Impact**:
- **Maintenance burden**: ~1,500 lines of boilerplate
- **New command overhead**: ~30-40 lines per new command
- **Error-prone**: Easy to miss properties or copy wrong code
- **Inconsistency**: Similar properties handled differently across commands

**Recommendations**:

1. **Implement visitor factory pattern**:
```typescript
private createVisitorFor<T extends keyof AST.Commands>(
  commandType: T,
  extractor: (children: any) => Partial<AST.Commands[T]>
): (ctx: any) => AST.Commands[T] {
  return (ctx: any) => ({
    type: commandType,
    ...extractor(ctx.children),
    location: this.getLocation(ctx),
  });
}

// Usage:
private visitEvalCommand = this.createVisitorFor('EvalCommand', (children) => ({
  assignments: children.assignment?.map(a => this.visitAssignment(a)),
}));
```

2. **Generate visitors from CommandSyntax**:
```typescript
private generateVisitors() {
  for (const [name, pattern] of Object.entries(COMMAND_PATTERNS)) {
    this[`visit${name}Command`] = this.createVisitorFor(name, pattern);
  }
}
```

3. **Use reflection/metadata**:
```typescript
@Visitor('EvalCommand')
class EvalCommandVisitor implements ICommandVisitor { ... }

// Auto-register all visitor classes
```

---

### 3.3 Command Dispatch Duplication

**Location**: `src/entities/spl/lib/parser/ast/transformer.ts` lines 49-92

**Issue**: Giant if-else chain for command dispatch:
```typescript
private visitCommand(ctx: any): AST.Command {
  const children = ctx.children;

  if (children.evalCommand) return this.visitEvalCommand(children.evalCommand[0]);
  if (children.statsCommand) return this.visitStatsCommand(children.statsCommand[0]);
  if (children.renameCommand) return this.visitRenameCommand(children.renameCommand[0]);
  if (children.rexCommand) return this.visitRexCommand(children.rexCommand[0]);
  if (children.lookupCommand) return this.visitLookupCommand(children.lookupCommand[0]);
  // ... 25+ more if statements
  if (children.genericCommand) return this.visitGenericCommand(children.genericCommand[0]);

  return this.visitGenericCommand(ctx);
}
```

**Problems**:
1. **Fragile**: Must manually add new command each time
2. **Non-scalable**: Gets longer with each command
3. **Doesn't use registry**: Command dispatch logic separate from COMMAND_PATTERNS
4. **Error-prone**: Easy to forget a command or get name wrong
5. **Inefficient**: Linear search through conditions

**Impact**:
- Maintenance burden: ~30 lines per new command
- Tight coupling between grammar rules and transformer
- Risk of missing commands during development

**Recommendations**:

1. **Auto-generate dispatch from registry**:
```typescript
private visitCommand(ctx: any): AST.Command {
  const children = ctx.children;
  
  for (const [command, _] of Object.entries(COMMAND_PATTERNS)) {
    const key = `${command}Command`;
    if (children[key]) {
      const methodName = `visit${capitalize(command)}Command`;
      return this[methodName](children[key][0]);
    }
  }
  
  return this.visitGenericCommand(ctx);
}
```

2. **Use dynamic method lookup**:
```typescript
private visitCommand(ctx: any): AST.Command {
  const children = ctx.children;
  const childKey = Object.keys(children).find(k => k.endsWith('Command'));
  
  if (childKey) {
    const methodName = `visit${childKey[0].toUpperCase() + childKey.slice(1)}`;
    if (typeof this[methodName] === 'function') {
      return this[methodName](children[childKey][0]);
    }
  }
  
  return this.visitGenericCommand(ctx);
}
```

3. **Create visitor registry**:
```typescript
private visitorMap = new Map<string, (ctx: any) => AST.Command>();

constructor() {
  this.registerVisitors();
}

private registerVisitors() {
  for (const [cmd] of Object.entries(COMMAND_PATTERNS)) {
    const method = this[`visit${capitalize(cmd)}Command`];
    if (method) {
      this.visitorMap.set(`${cmd}Command`, method.bind(this));
    }
  }
}

private visitCommand(ctx: any): AST.Command {
  const children = ctx.children;
  const key = Object.keys(children).find(k => this.visitorMap.has(k));
  return key ? this.visitorMap.get(key)!(children[key][0]) : this.visitGenericCommand(ctx);
}
```

---

### 3.4 Validation Duplication

**Location**: `src/entities/spl/lib/parser/patterns/validator.ts` vs pattern definitions

**Issue**: Validation logic separate from pattern structure
- `CommandSyntax` defines structure but doesn't validate
- `validator.ts` contains validation rules
- Patterns already encode what's valid

**Example**:
```typescript
// Pattern defines structure:
export const binCommand: CommandSyntax = {
  syntax: {
    kind: 'sequence',
    patterns: [
      { kind: 'param', type: 'string', name: 'span' },
      // ...
    ]
  }
};

// Validator checks structure:
export function validatePattern(pattern: SyntaxPattern, ...): ValidationResult {
  // Validates that pattern matches expected structure
  // But this is already encoded in type definitions!
}
```

**Impact**:
- Validation rules duplicated in two places
- Risk of inconsistency
- Hard to maintain
- TypeScript types not leveraged

**Recommendations**:

1. **Use JSON Schema**:
```typescript
// Define patterns via JSON Schema
const commandSchema = {
  type: 'object',
  properties: {
    command: { type: 'string' },
    syntax: { $ref: '#/definitions/syntaxPattern' },
    // ...
  }
};

// Validate using ajv or similar
const validate = ajv.compile(commandSchema);
```

2. **Derive validation from types**:
```typescript
// Use TypeScript's type system
type CommandSyntax = {
  command: string;
  syntax: SyntaxPattern;
  // ...
};

// Generate validator from type
const validator = createValidator<CommandSyntax>();
```

3. **Embed validation in patterns**:
```typescript
export const binCommand: CommandSyntax = {
  command: 'bin',
  syntax: { ... },
  validate: (ctx) => {
    // Validation logic inline
    if (!ctx.children.span && !ctx.children.bins) {
      return { valid: false, error: 'Must specify span or bins' };
    }
    return { valid: true };
  }
};
```

---

## 4. INCONSISTENCIES WITH MODULE FILE LOCATION

### 4.1 Pattern Files in Wrong Directory

**Location**: `src/entities/spl/lib/parser/patterns/`

**Issue**: Directory contains mixed concerns:

```
patterns/
├── types.ts              # Type definitions ✓
├── registry.ts           # Pattern registry ✓
├── generated-patterns.ts # Generated patterns ✓
├── validator.ts          # Validation logic ✗ Should be in lib/
├── interpreter.ts        # Interpretation logic ✗ Should be in lib/
├── index.ts              # Barrel export ✓
├── *-grammar.ts          # Grammar files ✗ Should be in grammar/
├── *.test.ts             # Tests (mixed levels)
├── search/               # Category subfolder
│   ├── *-pattern.ts      # Pattern definitions ✓
│   ├── *-grammar.ts      # Grammar files ✗
│   └── *.test.ts         # Tests
├── aggregation/          # Category subfolder
│   └── ... (same structure)
└── field-manipulation/   # Category subfolder
    └── ... (same structure)
```

**Current Organizational Issues**:

1. **Validation logic** (`validator.ts`) mixed with patterns
   - Should be in `lib/validation/` or `shared/`
   
2. **Interpretation logic** (`interpreter.ts`) mixed with patterns
   - Arguably belongs in `semantics/` or `lib/`
   
3. **Grammar files** mixed with patterns
   - Should be in `grammar/rules/commands/` or archived
   
4. **Test files** mixed with implementation
   - Could be separated per FSD guidelines
   
5. **Scripts** (`reorganize-patterns.ts`, `cleanup-patterns.ts`)
   - Should be in `tools/` directory

**Recommended Structure**:
```
src/entities/spl/
├── lib/
│   ├── parser/
│   │   ├── grammar/       # Grammar rules & types
│   │   ├── ast/           # AST transformation
│   │   ├── lexer/         # Tokenization
│   │   └── patterns/      # Pattern definitions only
│   ├── validation/        # Moved from patterns/validator.ts
│   ├── semantics/         # Moved from patterns/interpreter.ts
│   ├── shared/            # Shared utilities
│   └── tools/             # Utility scripts
├── model/                 # Domain types
├── store/                 # State management
├── hooks/                 # React hooks
├── test/                  # Centralized tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── index.ts               # Barrel export
```

---

### 4.2 Semantic Layer Inconsistency

**Location**: `src/entities/spl/lib/parser/patterns/interpreter.ts`

**Issue**: Semantics interpretation separated from pattern definitions
- `CommandSyntax` has `semantics` property
- But logic to interpret semantics is in `interpreter.ts`
- Creates split between data and logic

**Current approach** (DATA scattered):
```typescript
// In pattern definition:
export const evalCommand: CommandSyntax = {
  command: 'eval',
  semantics: {
    creates: ['targetField'],
    consumes: [],
    modifies: [],
  }
};

// In interpreter.ts:
export function interpretPattern(pattern: CommandSyntax, ast: any) {
  // Logic to use pattern.semantics
  // ... complex interpretation
}
```

**Alternative approach** (LOGIC embedded):
```typescript
export const evalCommand: CommandSyntax = {
  command: 'eval',
  interpret: (ctx) => ({
    creates: ctx.targetFields,
    consumes: ctx.referencedFields,
  })
};
```

**Recommendation**:
1. **Document decision**: Clarify if data-driven or logic-driven
2. **If data-driven**: Keep patterns as data, generalize interpreter
3. **If logic-driven**: Embed logic in pattern definitions
4. **Create semantics layer**: Separate file/module for semantic analysis

---

### 4.3 Test Organization Mixing Levels

**Location**: `src/entities/spl/lib/parser/patterns/`

**Current structure**:
```
patterns/
├── validator.test.ts          # Unit test (in patterns/)
├── interpreter.test.ts        # Unit test (in patterns/)
├── registry.test.ts           # Unit test (in patterns/)
├── types.test.ts              # Unit test (in patterns/)
├── search/
│   └── dedup.test.ts          # Integration test (in subdirectory)
├── aggregation/
│   └── stats.test.ts          # Integration test (in subdirectory)
└── ... (tests mixed with implementation)
```

**Issue**: Three levels of tests mixed together:
1. **Unit tests** for core modules (`validator`, `interpreter`, `registry`)
2. **Integration tests** for patterns (verify pattern + parser)
3. **Pattern-specific tests** scattered in subdirectories

**FSD Best Practice**:
- Unit tests near implementation
- Integration tests in separate test folder
- Clear separation of concerns

**Recommended structure**:
```
src/entities/spl/
├── lib/parser/patterns/
│   ├── validator.ts          # Just code, no tests
│   ├── interpreter.ts        # Just code, no tests
│   ├── registry.ts           # Just code, no tests
│   └── types.ts              # Just code, no tests
├── test/
│   ├── unit/
│   │   ├── validator.test.ts
│   │   ├── interpreter.test.ts
│   │   ├── registry.test.ts
│   │   └── types.test.ts
│   ├── integration/
│   │   ├── patterns/
│   │   │   ├── bin.test.ts
│   │   │   ├── dedup.test.ts
│   │   │   └── stats.test.ts
│   │   └── parser.test.ts
│   └── fixtures/
│       └── sample-patterns.ts
```

**Exceptions**:
- Colocate complex test utilities near implementation
- Keep `.test.ts` files in same directory as code for tight coupling
- Just organize them better

---

### 4.4 Model vs Parser Layer Confusion

**Location**: Two separate "patterns" concepts:

1. **Regex patterns** in `src/entities/spl/model/patterns.ts`:
```typescript
export const SPL_PATTERNS = {
  COMMAND_EXTRACT: /^\|?\s*(\w+)/i,      // String matching
  PIPE_START: /^\s*\|/,
  EVAL_ASSIGNMENT: /eval\s+$/i,
  // ... ~15 regex patterns
};
```

2. **Syntax patterns** in `src/entities/spl/lib/parser/patterns/`:
```typescript
export const binCommand: CommandSyntax = {
  command: 'bin',
  syntax: { kind: 'sequence', patterns: [...] },  // BNF notation
  semantics: { creates: [...] },
};
```

**Confusion**:
- Both called "patterns"
- Serve different purposes
- Live in different locations
- Relationship unclear

**Example of confusion**:
```typescript
// Which patterns should be used where?
import { SPL_PATTERNS } from '@/entities/spl/model/patterns';  // regex patterns
import { COMMAND_PATTERNS } from '@/entities/spl/lib/parser/patterns';  // syntax patterns

// How do they work together?
```

**Recommendation**:

1. **Rename for clarity**:
```
model/patterns.ts          → model/regex-patterns.ts (or lexer-patterns.ts)
lib/parser/patterns/       → lib/parser/syntax-patterns/
```

2. **Document relationship**:
```typescript
/**
 * Regex Patterns (model/)
 * - Simple string matching for fast parsing
 * - Used for linting, quick validation
 * - Pattern: /regex/
 * 
 * Syntax Patterns (lib/parser/patterns/)
 * - Full BNF notation for Chevrotain parser
 * - Used for AST generation, semantic analysis
 * - Pattern: { kind: 'sequence', patterns: [...] }
 * 
 * Relationship:
 * - regex-patterns are low-level, fast, approximate
 * - syntax-patterns are high-level, accurate, complete
 * - Both can coexist; use regex for quick checks, syntax for parsing
 */
```

3. **Create clear imports**:
```typescript
// Clear distinction in exports
export { SPL_PATTERNS as LEXER_PATTERNS } from './regex-patterns';
export { COMMAND_PATTERNS as SYNTAX_PATTERNS } from './syntax-patterns';
```

---

## 5. RECOMMENDATIONS SUMMARY

### Priority Matrix

| Priority | Category | Item | Effort | Impact | Recommendation |
|----------|----------|------|--------|--------|-----------------|
| **P0** | Duplicate | Pattern definitions (registry vs generated) | High | Critical | Consolidate into single source; auto-generate for others |
| **P0** | Boilerplate | 200+ repeated visitor methods | High | Critical | Implement visitor factory pattern |
| **P0** | Dispatch | 30+ if-else command dispatch | Medium | High | Auto-generate from COMMAND_PATTERNS |
| **P1** | Dead Code | Obsolete grammar files (35 files) | Low | Medium | Delete or archive with clear documentation |
| **P1** | Duplication | Parser casting (`const p = parser as any`) | Low | Medium | Extract to utility function |
| **P2** | Structure | Pattern files in wrong directory | High | Medium | Reorganize per FSD (validator, interpreter to lib/) |
| **P2** | Tests | Mixed test levels and locations | Medium | Low | Centralize tests in test/ folder |
| **P2** | Clarity | Model patterns vs parser patterns | Low | Low | Rename and document distinction |
| **P3** | Scripts | Utility scripts (cleanup, reorganize) | Low | Low | Move to tools/ with documentation |

### Quick Wins (1-2 hours each)

1. ✅ Delete dead grammar files (`dedup-grammar.ts`, etc.)
2. ✅ Delete commented debug file (`debug/parse.ts`)
3. ✅ Move utility scripts to `tools/`
4. ✅ Extract parser casting to utility
5. ✅ Rename patterns for clarity (`regex-patterns`, `syntax-patterns`)

### Medium Effort (4-8 hours each)

1. 🔄 Consolidate pattern definitions (registry + generated)
2. 🔄 Auto-generate command dispatch
3. 🔄 Reorganize test files

### High Effort (2+ days each)

1. 🔧 Implement visitor factory pattern
2. 🔧 Integrate semantics layer
3. 🔧 Audit and consolidate validation logic

---

## Appendix: File Structure Reference

### Current SPL Module Structure
```
src/entities/spl/
├── index.ts
├── hooks/
│   └── useSPLParser.ts
├── lib/
│   ├── index.ts
│   ├── linter.ts
│   ├── linter.test.ts
│   ├── debug/
│   │   └── parse.ts                    ← Dead code
│   ├── parser/
│   │   ├── index.ts
│   │   ├── index.test.ts
│   │   ├── ast/
│   │   │   ├── index.ts
│   │   │   └── transformer.ts          ← 1,536 lines, 200+ visitor methods
│   │   ├── grammar/
│   │   │   ├── index.ts
│   │   │   ├── index.test.ts
│   │   │   ├── types.ts
│   │   │   ├── adversarial.test.ts
│   │   │   ├── unicode.test.ts
│   │   │   └── rules/
│   │   │       ├── helpers.ts          ← Mixin with `const p = parser`
│   │   │       ├── expressions.ts      ← Mixin with `const p = parser`
│   │   │       ├── search.ts           ← Mixin with `const p = parser`
│   │   │       ├── pipeline.ts         ← Mixin with `const p = parser`
│   │   │       ├── commands/
│   │   │       │   ├── field-creators.ts
│   │   │       │   ├── field-filters.ts
│   │   │       │   ├── structural.ts
│   │   │       │   ├── splitters.ts
│   │   │       │   └── generic.ts
│   │   │       └── [test files]
│   │   ├── lexer/
│   │   │   ├── index.ts
│   │   │   ├── tokens.ts
│   │   │   └── tokens.test.ts
│   │   └── patterns/
│   │       ├── index.ts
│   │       ├── types.ts                ← Type definitions
│   │       ├── registry.ts             ← 5,417 lines, curated patterns
│   │       ├── generated-patterns.ts   ← 9,261 lines, auto-generated ← DUPLICATE!
│   │       ├── validator.ts            ← Validation logic
│   │       ├── interpreter.ts          ← Semantic interpretation
│   │       ├── index.ts
│   │       ├── [multiple test files]
│   │       ├── search/
│   │       │   ├── dedup-pattern.ts
│   │       │   ├── dedup-grammar.ts    ← Dead code?
│   │       │   ├── dedup.test.ts
│   │       │   └── [others]
│   │       ├── aggregation/
│   │       │   ├── stats-pattern.ts
│   │       │   ├── stats-grammar.ts    ← Dead code?
│   │       │   └── [others]
│   │       └── field-manipulation/
│   │           └── [pattern files]
│   └── tools/
│       ├── cleanup-patterns.ts         ← Dead code?
│       ├── grammar-generator.ts        ← Generator utility
│       ├── grammar-generator.test.ts
│       └── reorganize-patterns.ts      ← Dead code?
├── model/
│   ├── commands.ts
│   ├── functions.ts
│   ├── index.ts
│   ├── patterns.ts                     ← Regex patterns (different concept!)
│   └── types.ts
├── store/
│   ├── editor-store.ts
│   └── index.ts
└── [other feature folders]
```

---

## End of Code Review

**Prepared**: December 2, 2025  
**Status**: Initial Analysis, No Changes Made  
**Next Steps**: Review recommendations with team, prioritize fixes, assign ownership

