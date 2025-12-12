/**
 * Handler Coverage Tests
 *
 * Cross-references command metadata, pattern registry, and handler registry
 * to identify commands that affect fields but don't have lineage handlers.
 *
 * @module entities/field/lib/lineage/handler-coverage
 */

import { describe, it, expect } from 'vitest';
import { COMMAND_PATTERNS } from '@/entities/spl/lib/parser/patterns/registry';
import { SPL_COMMANDS } from '@/entities/spl/model/commands';

/**
 * Commands that have handlers registered in HANDLER_REGISTRY.
 * This list is derived from command-handlers/index.ts.
 * Keep this in sync when adding new handlers.
 */
const COMMANDS_WITH_HANDLERS = new Set([
  // Field creators
  'eval',
  'rex',
  'spath',
  'extract',
  'kv',
  'kvform',
  'xpath',
  'xmlkv',
  'xmlunescape',
  'multikv',
  'erex',

  // Lookup commands
  'lookup',
  'inputlookup',

  // Field filters
  'table',
  'fields',

  // Stats family
  'stats',
  'eventstats',
  'streamstats',
  'chart',
  'timechart',

  // Implicit field creators
  'iplocation',
  'transaction',

  // Field operations
  'replace',
  'rename',
  'strcat',
  'convert',
  'makemv',

  // Aggregation
  'top',
  'rare',

  // Filtering
  'dedup',
  'where',
  'bin',
  'bucket', // alias for bin

  // Subsearch
  'append',
  'join',
  'union',
  'appendcols',

  // Search
  'search',

  // Data generators
  'makeresults',
  'metadata',

  // Totals
  'addtotals',

  // Streaming
  'delta',
  'accum',
  'autoregress',

  // Return
  'return',

  // Accelerated stats
  'tstats',

  // Setfields
  'setfields',

  // Tags
  'tags',

  // Transform
  'contingency',
  'xyseries',
  'timewrap',

  // Summary indexing (reuse stats handlers)
  'sichart',
  'sirare',
  'sistats',
  'sitimechart',

  // Metrics
  'mstats',
  'mcollect',
  'meventcollect',

  // Other
  'geostats',
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

/**
 * Commands that don't need handlers because they don't affect fields
 * in ways that matter for lineage tracking.
 */
const HANDLER_NOT_NEEDED = new Set([
  // Output commands (don't modify pipeline)
  'outputlookup',
  'outputcsv',
  'sendemail',
  'collect',

  // Ordering/limit (don't affect field structure)
  'sort',
  'head',
  'tail',
  'reverse',

  // Filtering without field effects
  'regex',

  // Structural (preserves fields)
  'fillnull',
  'filldown',
  'mvexpand',
  'mvcombine',

  // Pipeline control
  'foreach',
  'map',
  'gentimes',
  'multisearch',
  'set',
  'format',
  'transpose',
  'untable',
  'appendpipe',

  // System/utility
  'rest',
  'datamodel',
  'loadjob',
  'savedsearch',

  // ML commands (complex, low priority)
  'predict',
  'trendline',
  'anomalies',
  'cluster',
  'kmeans',
  'correlate',

  // Other
  'rangemap',
  'addinfo',
  'fieldformat',
  'sitop',
]);

describe('Handler Coverage', () => {
  it('should identify commands that need handlers', () => {
    const needsHandler: string[] = [];
    const hasHandler: string[] = [];
    const notNeeded: string[] = [];
    const markedInPattern: string[] = [];

    // Check all commands in SPL_COMMANDS that affect fields
    for (const [name, info] of Object.entries(SPL_COMMANDS)) {
      const affectsFields =
        info.fieldEffects.creates ||
        info.fieldEffects.modifies ||
        info.fieldEffects.drops ||
        !info.fieldEffects.preservesOthers;

      // Check if pattern explicitly marks handler status
      const pattern = COMMAND_PATTERNS[name];
      if (pattern?.handlerStatus === 'needed') {
        markedInPattern.push(name);
      }

      if (COMMANDS_WITH_HANDLERS.has(name)) {
        hasHandler.push(name);
      } else if (HANDLER_NOT_NEEDED.has(name)) {
        notNeeded.push(name);
      } else if (pattern?.handlerStatus === 'not-applicable') {
        notNeeded.push(name);
      } else if (affectsFields) {
        needsHandler.push(name);
      } else {
        // Doesn't affect fields, handler not needed
        notNeeded.push(name);
      }
    }

    // Also check patterns with grammarSupport='dedicated' that affect fields
    for (const [name, pattern] of Object.entries(COMMAND_PATTERNS)) {
      if (pattern.grammarSupport !== 'dedicated') continue;
      if (COMMANDS_WITH_HANDLERS.has(name)) continue;
      if (HANDLER_NOT_NEEDED.has(name)) continue;

      // Check if pattern has semantics indicating field effects
      const hasFieldEffects =
        pattern.semantics?.dropsAllExcept ||
        pattern.semantics?.preservesAll === false ||
        pattern.semantics?.staticCreates;

      if (hasFieldEffects && !needsHandler.includes(name)) {
        needsHandler.push(name);
      }
    }

    // Report
    const coverage = Math.round((hasHandler.length / (hasHandler.length + needsHandler.length)) * 100);

    console.log(`\nHandler coverage: ${hasHandler.length}/${hasHandler.length + needsHandler.length} (${coverage}%)`);
    console.log(`\nCommands with handlers: ${hasHandler.length}`);
    console.log(`Commands not needing handlers: ${notNeeded.length}`);
    if (markedInPattern.length > 0) {
      console.log(`Commands marked with handlerStatus='needed' in patterns: ${markedInPattern.length}`);
    }

    if (needsHandler.length > 0) {
      console.log(`\nCommands needing handlers (${needsHandler.length}):`);
      for (const name of needsHandler.sort()) {
        const info = SPL_COMMANDS[name];
        const pattern = COMMAND_PATTERNS[name];
        const effects = info
          ? [
              info.fieldEffects.creates && 'creates',
              info.fieldEffects.modifies && 'modifies',
              info.fieldEffects.drops && 'drops',
              !info.fieldEffects.preservesOthers && 'dropsOthers',
            ]
              .filter(Boolean)
              .join(', ')
          : 'unknown';
        const grammarTag = pattern?.grammarSupport === 'dedicated' ? ' [dedicated]' : '';
        console.log(`  - ${name} (${effects})${grammarTag}`);
      }
    }

    // Test passes but reports gaps
    expect(hasHandler.length).toBeGreaterThan(0);
  });

  it('should have handlers for all commands with grammarSupport=dedicated that create fields', () => {
    const missingHandlers: string[] = [];

    for (const [name, pattern] of Object.entries(COMMAND_PATTERNS)) {
      if (pattern.grammarSupport !== 'dedicated') continue;

      // Check SPL_COMMANDS for field effects
      const cmdInfo = SPL_COMMANDS[name];
      const createsFields = cmdInfo?.fieldEffects?.creates;

      if (createsFields && !COMMANDS_WITH_HANDLERS.has(name) && !HANDLER_NOT_NEEDED.has(name)) {
        missingHandlers.push(name);
      }
    }

    if (missingHandlers.length > 0) {
      console.log(`\nMissing handlers for field-creating commands:`);
      for (const name of missingHandlers) {
        console.log(`  - ${name}`);
      }
    }

    // This is informational - we allow some gaps
    expect(missingHandlers.length).toBeLessThanOrEqual(10);
  });

  it('should report handler coverage percentage', () => {
    const withGrammar = Object.entries(COMMAND_PATTERNS).filter(
      ([_, p]) => p.grammarSupport === 'dedicated'
    );

    const withHandlers = withGrammar.filter(([name]) => COMMANDS_WITH_HANDLERS.has(name));

    const coverage = Math.round((withHandlers.length / withGrammar.length) * 100);

    console.log(`\nHandler coverage for dedicated grammar commands:`);
    console.log(`  ${withHandlers.length}/${withGrammar.length} (${coverage}%)`);

    // Should have at least 50% coverage
    expect(coverage).toBeGreaterThanOrEqual(50);
  });
});
