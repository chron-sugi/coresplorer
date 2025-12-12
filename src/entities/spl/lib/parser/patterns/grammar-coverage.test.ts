/**
 * Grammar Support Tests
 *
 * Validates that grammarSupport property on patterns is correctly set.
 * This test ensures patterns stay in sync with grammar rules.
 *
 * grammarSupport values:
 * - 'dedicated': Has grammar rule in pipeline.ts (produces typed AST)
 * - 'needed': Would benefit from grammar rule (priority for future work)
 * - 'generic': genericCommand is sufficient (simple syntax)
 */

import { describe, it, expect } from 'vitest';
import { COMMAND_PATTERNS } from './registry';

/**
 * Commands that have dedicated grammar rules in pipeline.ts
 * (not using genericCommand fallback)
 *
 * This list is derived from grammar/rules/pipeline.ts command dispatch.
 * Keep this in sync when adding new grammar rules.
 */
const GRAMMAR_SUPPORTED_COMMANDS = new Set([
  // Tier 1: Field creators/modifiers
  'eval',
  'stats',
  'eventstats',
  'streamstats',
  'chart',
  'timechart',
  'rename',
  'rex',
  'lookup',
  'inputlookup',
  'outputlookup',
  'iplocation',
  'spath',
  'extract',
  'addtotals',
  'convert',
  'makemv',
  'replace',
  'addinfo',
  'fieldformat',
  'collect',

  // Tier 1A: Aggregation commands
  'top',
  'sitop',
  'rare',
  'tstats',

  // Tier 1B: Additional field creators
  'strcat',
  'accum',
  'delta',
  'autoregress',
  'rangemap',
  'filldown',
  'mvcombine',
  'union',

  // Tier 2: Field filters
  'search',
  'table',
  'fields',
  'dedup',
  'sort',
  'head',
  'tail',
  'reverse',
  'regex',

  // Tier 3: Pipeline splitters
  'append',
  'join',
  'foreach',
  'map',
  'makeresults',
  'gentimes',
  'return',

  // Tier 4: Structural
  'where',
  'bin',
  'bucket', // alias for bin
  'fillnull',
  'mvexpand',
  'transaction',

  // Tier 5: Extraction
  'xpath',
  'xmlkv',
  'xmlunescape',
  'multikv',
  'erex',
  // Note: 'kv' has grammar but no pattern in registry yet

  // Tier 6: Statistical/ML
  'predict',
  'trendline',
  'anomalies',
  'cluster',
  'kmeans',
  'correlate',
  'contingency',
  'xyseries',
  'timewrap',

  // Tier 7: System/Utility
  'rest',
  'metadata',
  'datamodel',
  'loadjob',
  'savedsearch',
  'outputcsv',
  'sendemail',

  // Additional commands
  'appendcols',
  'appendpipe',
  'multisearch',
  'set',
  'format',
  'transpose',
  'untable',
  'setfields',
  'tags',

  // Summary indexing commands
  'sichart',
  'sirare',
  'sistats',
  'sitimechart',

  // Metrics commands
  'mstats',
  'mcollect',
  'meventcollect',

  // Other needed commands (now implemented)
  'geostats',
  'kvform',
  'pivot',
  'selfjoin',

  // Field-affecting commands (Phase 5)
  'inputcsv',
  'fieldsummary',
  'addcoltotals',
  'bucketdir',
  'geom',
  'geomfilter',
  'concurrency',
  'typer',
  'nomv',
  'makecontinuous',
  'reltime',
]);

describe('Grammar Support', () => {
  it("patterns with grammarSupport='dedicated' should be in GRAMMAR_SUPPORTED_COMMANDS", () => {
    const mismatches: string[] = [];

    for (const [command, pattern] of Object.entries(COMMAND_PATTERNS)) {
      if (
        pattern.grammarSupport === 'dedicated' &&
        !GRAMMAR_SUPPORTED_COMMANDS.has(command)
      ) {
        mismatches.push(
          `${command}: has grammarSupport='dedicated' but not in GRAMMAR_SUPPORTED_COMMANDS`
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it("commands in GRAMMAR_SUPPORTED_COMMANDS should have grammarSupport='dedicated'", () => {
    const mismatches: string[] = [];

    for (const command of GRAMMAR_SUPPORTED_COMMANDS) {
      const pattern = COMMAND_PATTERNS[command];
      if (!pattern) {
        mismatches.push(
          `${command}: in GRAMMAR_SUPPORTED_COMMANDS but no pattern exists`
        );
      } else if (pattern.grammarSupport !== 'dedicated') {
        mismatches.push(
          `${command}: in GRAMMAR_SUPPORTED_COMMANDS but grammarSupport='${pattern.grammarSupport}'`
        );
      }
    }

    expect(mismatches).toEqual([]);
  });

  it('all patterns should have grammarSupport property set', () => {
    const missing: string[] = [];

    for (const [command, pattern] of Object.entries(COMMAND_PATTERNS)) {
      if (!pattern.grammarSupport) {
        missing.push(command);
      }
    }

    expect(missing).toEqual([]);
  });

  it('should have expected distribution of grammar support', () => {
    const counts = {
      dedicated: 0,
      needed: 0,
      generic: 0,
    };

    for (const pattern of Object.values(COMMAND_PATTERNS)) {
      if (pattern.grammarSupport) {
        counts[pattern.grammarSupport]++;
      }
    }

    console.log(`Grammar support distribution:`);
    console.log(`  dedicated: ${counts.dedicated} (has grammar rule)`);
    console.log(`  needed: ${counts.needed} (should add grammar rule)`);
    console.log(`  generic: ${counts.generic} (generic sufficient)`);

    // Verify expected counts
    expect(counts.dedicated).toBeGreaterThanOrEqual(107); // Current grammar rules (96 + 11 field-affecting)
    expect(counts.needed).toBeGreaterThanOrEqual(0); // May have work items
    expect(counts.generic).toBeGreaterThan(0); // Should have simple commands

    // Total should match pattern count
    const total = counts.dedicated + counts.needed + counts.generic;
    expect(total).toBe(Object.keys(COMMAND_PATTERNS).length);
  });

  it('should report grammar coverage percentage', () => {
    const totalPatterns = Object.keys(COMMAND_PATTERNS).length;
    const dedicatedPatterns = Object.values(COMMAND_PATTERNS).filter(
      (pattern) => pattern.grammarSupport === 'dedicated'
    ).length;
    const neededPatterns = Object.values(COMMAND_PATTERNS).filter(
      (pattern) => pattern.grammarSupport === 'needed'
    ).length;

    const currentCoverage = Math.round((dedicatedPatterns / totalPatterns) * 100);
    const potentialCoverage = Math.round(
      ((dedicatedPatterns + neededPatterns) / totalPatterns) * 100
    );

    console.log(
      `Grammar coverage: ${dedicatedPatterns}/${totalPatterns} (${currentCoverage}%)`
    );
    console.log(
      `Potential coverage if 'needed' implemented: ${dedicatedPatterns + neededPatterns}/${totalPatterns} (${potentialCoverage}%)`
    );

    // Current coverage should not regress
    expect(currentCoverage).toBeGreaterThanOrEqual(30);
  });
});
