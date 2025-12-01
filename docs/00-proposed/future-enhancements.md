
## App Filter
Token matching
Split both the query and target into tokens, then check if all query tokens appear somewhere in the target tokens. "my search" becomes ["my", "search"] and matches "my_awesome_search" because both tokens are present.
Pros: Handles partial matches and different orderings. Cons: Can over-match ("my search" matching "search_my_files").
Fuzzy scoring (Levenshtein, Jaro-Winkler, etc.)
Calculate edit distance or similarity score and show results above a threshold. Libraries like Fuse.js handle this well.
Pros: Catches typos, abbreviations, close-enough matches. Cons: Can feel unpredictable, more computational overhead, needs tuning.
My recommendation:
Start with normalization—it solves the most common case (separator variation) with minimal complexity. You can layer on fuzzy scoring later if users are still struggling to find things.

## SPLinter 
Unify state: Wire splinter to @/entities/spl editor store (or mirror code changes both ways) so code, parseResult, cursor, and lineage stay in sync. Expose a selector to avoid duplication.
Smarter search: Replace searchSpl with token/AST-aware search (commands, fields, props), add ranking and filter chips (commands vs fields vs text).
Linter UX: Group warnings by severity, add “jump to line” and inline badge support; show rule IDs and quick tips; allow suppressing rules per line.
Structure & folding: Generate fold ranges from AST/subsearch/macro boundaries; show a minimap or outline of commands with counts from SplStats.
Perf & coverage: Fix failing tests by stabilizing store mocks, and add coverage for the new command metadata so panels stay in sync with @/entities/spl.
KO/Schema panels: Harden hooks to handle missing data gracefully; add loading/error states; consider caching KO lookups.
Metrics: Track panel performance on large SPLs; consider debouncing lint/search and lazy-rendering warning lists.