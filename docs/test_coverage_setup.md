# Test Coverage Configuration

This document outlines the test coverage setup for the coresplorer project.

## Configuration Summary

### Coverage Tool
- **Provider**: V8 (via @vitest/coverage-v8)
- **Reporters**: text, json, html, lcov
- **Output Directory**: `./coverage`

### Coverage Thresholds

```typescript
{
  lines: 60,      // 60% line coverage required
  functions: 60,  // 60% function coverage required
  branches: 50,   // 50% branch coverage required
  statements: 60  // 60% statement coverage required
}
```

### Exclusions

The following files/patterns are excluded from coverage:
- `node_modules/`
- `src/test/` - Test utilities
- `**/*.test.{ts,tsx}` - Test files
- `**/*.spec.{ts,tsx}` - Spec files
- `**/*.config.{ts,js}` - Configuration files
- `**/index.ts` - Barrel exports
- `**/*.d.ts` - Type declarations
- `**/types.ts` - Type-only files
- `**/constants.ts` - Constants (consider testing if logic-heavy)
- `e2e/` - End-to-end tests
- `dist/` - Build output
- `docs/` - Documentation

### npm Scripts

```bash
# Run tests with coverage report
npm run test:coverage

# Run tests with coverage in UI mode
npm run test:coverage:ui

# Run tests in watch mode (no coverage)
npm run test:watch

# Run all tests once (no coverage)
npm run test
```

## Usage

### Generate Coverage Report

```bash
cd coresplorer
npm run test:coverage
```

This will:
1. Run all tests
2. Generate coverage data
3. Create reports in `./coverage` directory
4. Display text summary in terminal
5. Fail if coverage thresholds are not met

### View HTML Coverage Report

After running coverage, open the HTML report:

```bash
# Windows
start coverage/index.html

# Mac/Linux
open coverage/index.html
```

### Coverage Reports

The following reports are generated:

1. **Text** - Console output showing coverage summary
2. **HTML** - Interactive web-based report in `coverage/index.html`
3. **JSON** - Machine-readable data in `coverage/coverage-final.json`
4. **LCOV** - Standard format for CI/CD integration in `coverage/lcov.info`

## Current Status

### Known Issues

⚠️ **37 test files currently failing** (244/1421 tests)

Before coverage metrics are meaningful, the following test failures need to be addressed:

1. **Field Lineage Tests** - Command handler parity tests
2. **SPL Parser Tests** - Type mismatches after recent changes
3. **Diagram Component Tests** - SplunkNode rendering issues
4. **Splinter Component Tests** - SplStats interaction tests
5. **Search functionality** - searchSpl case sensitivity

### Recent Improvements

✅ **Shared UI Components** - Added comprehensive test coverage (**314 tests, 247 passing**):
- `button.test.tsx` - 21 tests (all passing) ✅
- `badge.test.tsx` - 26 tests (all passing) ✅
- `card.test.tsx` - 34 tests (all passing) ✅
- `checkbox.test.tsx` - 27 tests (18 passing, 9 with timing issues)
- `separator.test.tsx` - 23 tests (21 passing, 2 minor fixes needed)
- `tabs.test.tsx` - 31 tests (24 passing, 7 keyboard nav warnings)
- `toggle-group.test.tsx` - 32 tests (all passing) ✅
- `tooltip.test.tsx` - 18 tests (5 passing, 13 with Radix delay timing)
- `popover.test.tsx` - 20 tests (4 passing, 16 with portal timing)
- `dialog.test.tsx` - 27 tests (20 passing, 7 with portal timing)
- `command.test.tsx` - 24 tests (18 passing, 6 with filtering timing)
- `code-block/CodeBlock.test.tsx` - 31 tests (24 passing, 7 with Prism integration)
- **Total**: 314 tests added, **247 passing** (79% pass rate)

**Note**: Some tests have async timing issues with Radix UI portals and built-in delays. These can be fixed with proper `waitFor` timeouts and delay configurations.

### Next Steps

1. ✅ Coverage configuration added to `vite.config.ts`
2. ✅ npm scripts added for coverage commands
3. ✅ `.gitignore` updated to exclude coverage directory
4. ✅ All shared UI components have test coverage (314 tests, 247 passing)
5. ⏳ Fix async timing issues in Radix UI component tests (67 tests)
6. ⏳ Fix failing tests in other areas (37 files)
7. ⏳ Run full coverage report
8. ⏳ Review coverage gaps and add tests for critical paths

## Coverage Goals by Module

### High Priority (Target: 80%+)
- Core business logic (`entities/`, `features/*/lib/`)
- State management (`**/store/`, `**/hooks/`)
- Data transformations and utilities

### Medium Priority (Target: 60%+)
- UI components with complex logic
- API query functions
- Validation and error handling

### Lower Priority (Target: 40%+)
- Simple presentational components
- Configuration files with logic
- Type utilities

### Not Required
- Type-only files (`types.ts`, `*.d.ts`)
- Barrel exports (`index.ts`)
- Pure constants (unless complex)
- Mock/test utilities

## CI/CD Integration

To enforce coverage in your build pipeline:

```yaml
# Example: GitHub Actions
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Coverage not generating?

1. Ensure all tests pass: `npm test`
2. Check that `@vitest/coverage-v8` is installed
3. Verify `vite.config.ts` has coverage configuration

### Thresholds too strict?

Adjust in `vite.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 50,      // Lower if needed
    functions: 50,
    branches: 40,
    statements: 50
  }
}
```

### Want to exclude specific files?

Add patterns to `coverage.exclude` in `vite.config.ts`:

```typescript
exclude: [
  // ... existing patterns
  'src/features/experimental/**',
  'src/legacy/**'
]
```

## References

- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [V8 Coverage Provider](https://github.com/vitest-dev/vitest/tree/main/packages/coverage-v8)
- [LCOV Format Specification](http://ltp.sourceforge.net/coverage/lcov.php)
