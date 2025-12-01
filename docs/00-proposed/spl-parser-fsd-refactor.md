Refactoring Proposal: Move spl-parser to shared/lib
Status: DEFERRED Priority: Low Effort: ~2 hours
Current State
The spl-parser feature at src/features/spl-parser/ is a pure parsing utility that transforms SPL text into an AST. It has:
Zero forbidden imports (no app/pages/widgets)
Zero cross-feature dependencies
No React, no HTTP calls, no side effects
Custom segments: ast/, grammar/, testing/
Current Assessment: Functionally excellent, but misplaced in the FSD layer hierarchy.
Problem
In FSD, features/ should contain user-facing capabilities (auth, export, search). The SPL parser is an infrastructure utility—it doesn't represent a user action, it's consumed by other features (splinter, field-lineage). Keeping it in features/ conflates domain capabilities with technical utilities.
Proposed Structure
Move to shared/lib/spl-parser/:
shared/
  lib/
    spl-parser/
      ast/
        transformer.ts
        types.ts
      grammar/
        index.ts
        types.ts
        rules/
          commands/
          expressions.ts
          helpers.ts
          pipeline.ts
          search.ts
      lib/
        tokens.ts        # moved from root
        grammar.ts       # moved from root
      testing/
        index.ts
      index.ts           # public API (unchanged)
Migration Steps
Create target directory: shared/lib/spl-parser/
Move files preserving structure:
ast/ → shared/lib/spl-parser/ast/
grammar/ → shared/lib/spl-parser/grammar/
testing/ → shared/lib/spl-parser/testing/
tokens.ts, grammar.ts → shared/lib/spl-parser/lib/
index.ts → shared/lib/spl-parser/index.ts
Update internal imports: Fix relative paths within the parser
Update consumers: Change imports in:
features/splinter/
features/field-lineage/
Any other files importing from features/spl-parser
Update barrel export: Add to shared/lib/index.ts:
export * from './spl-parser';
Delete old location: Remove features/spl-parser/
Run tests: Verify all parser tests pass
Files to Update (Consumers)
Search for: from '@/features/spl-parser' or from 'features/spl-parser' Replace with: from '@/shared/lib/spl-parser'
Risk Assessment
Risk	Mitigation
Broken imports	TypeScript will catch at compile time
Test failures	Run full test suite after migration
Merge conflicts	Do in single PR, coordinate with team
Benefits
FSD compliance: Utilities in shared/, features in features/
Clearer architecture: Parser is infrastructure, not a user capability
Reusability signal: shared/lib communicates "use anywhere"
No functional changes: Pure file reorganization
Decision
Defer - Current placement works. Refactor when:
Doing broader FSD cleanup
Adding new shared parsing utilities
Onboarding new developers who need clear architecture
User approved the plan
Assessment complete. The refactoring proposal is saved and deferred for future implementation. Key findings:
spl-parser is functionally excellent (zero layering violations)
Should be moved to shared/lib/ for strict FSD compliance
Low priority since current placement works fine
