# Failing Tests Summary

**Total**: 25 test files failing (144/1056 tests)
**Status**: 86.4% of tests passing (912 passing)

## Failing Test Files by Category

### 1. SPL Parser Tests (2 files)

#### [src/features/spl-parser/grammar/adversarial.test.ts](coresplorer/src/features/spl-parser/grammar/adversarial.test.ts)
- **Failing**: 29 tests
- **Issues**:
  - Incomplete commands (14 tests)
  - Invalid operator sequences (5 tests)
  - Unbalanced delimiters (5 tests)
  - Unterminated strings (5 tests)
- **Likely cause**: Grammar changes or parser updates not reflected in tests

#### [src/features/spl-parser/grammar/rules/expressions.test.ts](coresplorer/src/features/spl-parser/grammar/rules/expressions.test.ts)
- **Failing**: 1 test - "parses function with no args"
- **Likely cause**: Function parsing syntax change

#### [src/features/spl-parser/tokens.test.ts](coresplorer/src/features/spl-parser/tokens.test.ts)
- **Failing**: 1 test - "tokenizes time modifiers"
- **Likely cause**: TimeModifier token recently added/changed

---

### 2. Entities/SPL Tests (1 file)

#### [src/entities/spl/lib/parser/patterns/registry.test.ts](coresplorer/src/entities/spl/lib/parser/patterns/registry.test.ts)
- **Failing**: 3 tests
  - "has exactly 5 commands"
  - "returns exactly 5 command names"
  - "returns false for non-existent commands"
- **Likely cause**: Number of commands changed (expected 5, actual different)

---

### 3. Field Lineage Tests (6 files)

#### [src/features/field-lineage/lib/analyzer.test.ts](coresplorer/src/features/field-lineage/lib/analyzer.test.ts)
- **Failing**: 8 tests
  - Integration tests for complex dependency graphs
  - Implicit fields handling
  - Line number tracking
  - Multiline commands
- **Likely cause**: Analyzer changes or AST structure changes

#### [src/features/field-lineage/lib/command-handlers/eval.test.ts](coresplorer/src/features/field-lineage/lib/command-handlers/eval.test.ts)
- **Failing**: 24 tests
  - String functions (8 tests)
  - Multivalue functions (4 tests)
  - Null handling functions (3 tests)
  - Numeric functions (2 tests)
  - Time functions (2 tests)
  - Type conversion functions (2 tests)
  - Data type inference (1 test)
  - Nested function calls (2 tests)
- **Likely cause**: Function parsing or expression handling changes

#### [src/features/field-lineage/lib/command-handlers/stats.test.ts](coresplorer/src/features/field-lineage/lib/command-handlers/stats.test.ts)
- **Failing**: 37 tests
  - Aggregation functions (23 tests)
  - Basic functionality (3 tests)
  - Variants (timechart, chart, eventstats) (4 tests)
  - Confidence and data types (3 tests)
  - Field dropping, multiline, edge cases (4 tests)
- **Likely cause**: Stats command parsing changes

#### [src/features/field-lineage/lib/command-handlers/lookup.test.ts](coresplorer/src/features/field-lineage/lib/command-handlers/lookup.test.ts)
- **Failing**: 4 tests
  - Input mappings (3 tests)
  - Adversarial tests (1 test)

#### [src/features/field-lineage/lib/command-handlers/rename.test.ts](coresplorer/src/features/field-lineage/lib/command-handlers/rename.test.ts)
- **Failing**: 4 tests
  - Chains, edge cases, expression tracking, interactions

#### [src/features/field-lineage/lib/command-handlers/rex.test.ts](coresplorer/src/features/field-lineage/lib/command-handlers/rex.test.ts)
- **Failing**: 1 test - "works with rename after rex"

---

### 4. Diagram Feature Tests (10 files)

#### [src/features/diagram/model/hooks/useNodeDetails.test.ts](coresplorer/src/features/diagram/model/hooks/useNodeDetails.test.ts)
- **Failing**: 3 tests
  - "should fetch node details successfully"
  - "should handle fetch error"
  - "should cache results and not refetch"
- **Likely cause**: Hook implementation or query changes

#### [src/features/diagram/model/store/diagram.store.test.ts](coresplorer/src/features/diagram/model/store/diagram.store.test.ts)
- **Failing**: 2 tests
  - "should have default coreId of 'node-1'"
  - "should reset all state to initial values"
- **Likely cause**: Store default values changed

#### [src/features/diagram/ui/Canvas/Canvas.test.tsx](coresplorer/src/features/diagram/ui/Canvas/Canvas.test.tsx)
- **Failing**: 3 tests
  - "renders diagram with nodes and edges (happy path)"
  - "displays core node label"
  - "opens search overlay when search button is clicked"
- **Likely cause**: Component props or rendering changes

#### [src/features/diagram/ui/Canvas/SplunkNode.test.tsx](coresplorer/src/features/diagram/ui/Canvas/SplunkNode.test.tsx)
- **Failing**: 4 tests (ALL tests in file)
  - "renders node label"
  - "renders object type"
  - "renders handles (source and target)"
  - "handles unknown object type gracefully"
- **Likely cause**: Component interface changes

#### [src/features/diagram/ui/Canvas/Toolbar.test.tsx](coresplorer/src/features/diagram/ui/Canvas/Toolbar.test.tsx)
- **Failing**: 3 tests
  - "renders correctly"
  - "toggles autoImpactMode when clicked"
  - "shows correct active state"
- **Likely cause**: Component props or state changes

#### [src/features/diagram/ui/ContextPanel/ContextPanel.test.tsx](coresplorer/src/features/diagram/ui/ContextPanel/ContextPanel.test.tsx)
- **Failing**: 1 test - "switches between tabs"

#### [src/features/diagram/ui/ContextPanel/NodeFilterSection.test.tsx](coresplorer/src/features/diagram/ui/ContextPanel/NodeFilterSection.test.tsx)
- **Failing**: 3 tests
  - "renders all node types"
  - "toggles type visibility when clicked"
  - "applies correct styling for hidden types"
- **Error**: `Unable to find an element with the text: savedsearch`
- **Likely cause**: Object type name changed from "savedsearch" to "saved_search"

#### [src/features/diagram/ui/ContextPanel/Tabs/SplTab.test.tsx](coresplorer/src/features/diagram/ui/ContextPanel/Tabs/SplTab.test.tsx)
- **Failing**: 1 test - "renders SPL code"

---

### 5. Splinter Feature Tests (6 files)

#### [src/features/splinter/lib/spl/analyzeSpl.test.ts](coresplorer/src/features/splinter/lib/spl/analyzeSpl.test.ts)
- **Failing**: 3 tests
  - "should correctly analyze basic SPL"
  - "treats stats aliases as fields (not commands)"
  - "handles weird spacing and multi-line commands"

#### [src/features/splinter/lib/spl/searchSpl.test.ts](coresplorer/src/features/splinter/lib/spl/searchSpl.test.ts)
- **Failing**: 1 test - "finds matches case-insensitively"

#### [src/features/splinter/ui/components/SplAnalysisEditor.test.tsx](coresplorer/src/features/splinter/ui/components/SplAnalysisEditor.test.tsx)
- **Failing**: File-level failure (all tests)

#### [src/features/splinter/ui/components/SplStats.test.tsx](coresplorer/src/features/splinter/ui/components/SplStats.test.tsx)
- **Failing**: 2 tests
  - "command pill click triggers callback with correct lines"
  - "field pill click triggers callback with correct lines"

#### [src/features/splinter/ui/components/SplStats.integration.test.tsx](coresplorer/src/features/splinter/ui/components/SplStats.integration.test.tsx)
- **Failing**: 3 tests
  - "calculates and displays stats using real domain logic"
  - "highlights the active command"
  - "triggers onFieldClick with correct line numbers when a field is clicked"

#### [src/features/splinter/ui/tools/KnowledgeObjectInspector/KnowledgeObjectInspector.test.tsx](coresplorer/src/features/splinter/ui/tools/KnowledgeObjectInspector/KnowledgeObjectInspector.test.tsx)
- **Failing**: 6 tests (ALL tests in file)
  - Rendering lookups, macros
  - Handling missing fields, empty arrays
  - Handling extremely long strings

#### [src/features/splinter/ui/tools/PerfLinter/PerfLinterPanel.integration.test.tsx](coresplorer/src/features/splinter/ui/tools/PerfLinter/PerfLinterPanel.integration.test.tsx)
- **Failing**: 2 tests
  - "displays warnings for problematic SPL commands using real domain logic"
  - "highlights the relevant line when a warning is clicked"
- **Error**: `Unable to find an element with the text: /Avoid using "join"/i`
- **Likely cause**: Warning message text changed

#### [src/features/splinter/ui/tools/SchemaMocker/SchemaEditor.test.tsx](coresplorer/src/features/splinter/ui/tools/SchemaMocker/SchemaEditor.test.tsx)
- **Failing**: 7 tests (ALL tests in file)
- **Error**: `useSchemaStore.mockReturnValue is not a function`
- **Likely cause**: Mock setup incorrect for Zustand store

---

## Common Failure Patterns

### 1. **Parser/Grammar Changes** (31 tests)
- Recent changes to SPL parser affecting:
  - Time modifier tokens
  - Function expression parsing
  - Adversarial input handling

### 2. **AST Structure Changes** (69 tests)
- Field lineage analyzer and command handlers expecting different AST structure
- Affects: eval, stats, lookup, rename, rex commands

### 3. **UI Text Changes** (3 tests)
- NodeFilterSection: "savedsearch" → "saved_search"
- PerfLinterPanel: Warning message text changed

### 4. **Mock Setup Issues** (7 tests)
- SchemaEditor: Zustand store mocking incorrect

### 5. **Component Interface Changes** (20+ tests)
- Diagram components: Props or rendering logic changed
- Splinter components: Event handlers or data flow changed

---

## Recommended Fix Priority

### 🔴 **Critical** (Blocks coverage generation)
1. Fix parser/grammar tests (31 tests) - Core functionality
2. Fix field lineage tests (69 tests) - Core business logic

### 🟡 **High**
3. Fix diagram UI tests (20 tests) - User-facing features
4. Fix splinter component tests (14 tests) - User-facing features

### 🟢 **Medium**
5. Fix entity/registry tests (3 tests) - Configuration
6. Fix store/hook tests (5 tests) - State management

---

## Next Steps

1. **Investigate Recent Changes**
   - Check git history for recent parser/AST changes
   - Review any TimeModifier or token changes

2. **Fix By Category**
   - Start with parser tests (foundational)
   - Then field lineage (depends on parser)
   - Then UI tests (depends on both)

3. **Update Test Data**
   - Check if test fixtures need updating
   - Verify mock data matches new schemas

4. **Run Coverage**
   - Once all tests pass, generate coverage report
   - Identify additional gaps
