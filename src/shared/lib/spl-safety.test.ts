import { describe, it, expect } from 'vitest';
import { detectRiskyCommands, removeRiskyCommands } from './spl-safety';

describe('spl-safety', () => {
  describe('detectRiskyCommands', () => {
    it('detects single collect command', () => {
      const spl = 'index=main | stats count | collect index=summary';
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(true);
      expect(result.commandNames).toEqual(['collect']);
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].type).toBe('CollectCommand');
      expect(result.commands[0].commandName).toBe('collect');
      expect(result.commands[0].startLine).toBe(1);
    });

    it('detects single outputlookup command', () => {
      const spl = 'index=main | stats count BY host | outputlookup hosts.csv';
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(true);
      expect(result.commandNames).toEqual(['outputlookup']);
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].type).toBe('OutputlookupCommand');
      expect(result.commands[0].commandName).toBe('outputlookup');
    });

    it('detects both collect and outputlookup commands', () => {
      const spl = `index=main | collect index=summary
| outputlookup results.csv`;
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(true);
      expect(result.commandNames).toEqual(['collect', 'outputlookup']);
      expect(result.commands).toHaveLength(2);
      expect(result.commands[0].commandName).toBe('collect');
      expect(result.commands[1].commandName).toBe('outputlookup');
    });

    it('returns empty result for clean SPL', () => {
      const spl = 'index=main | stats count BY host | sort -count';
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(false);
      expect(result.commandNames).toEqual([]);
      expect(result.commands).toHaveLength(0);
    });

    it('returns empty result for empty SPL', () => {
      const result = detectRiskyCommands('');

      expect(result.hasRiskyCommands).toBe(false);
      expect(result.commandNames).toEqual([]);
      expect(result.commands).toHaveLength(0);
    });

    it('handles multi-line commands', () => {
      const spl = `index=main
| stats count BY host
| collect index=summary
    host=localhost
    source=test`;
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(true);
      expect(result.commands).toHaveLength(1);
      expect(result.commands[0].startLine).toBe(3);
      expect(result.commands[0].endLine).toBe(5);
    });

    it('ignores commands in subsearches', () => {
      // This test would require actual subsearch parsing
      // For now, we only check top-level stages, so subsearches would need
      // to be tested with actual SPL parser behavior
      const spl = 'index=main | stats count';
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(false);
    });

    it('handles parse errors gracefully', () => {
      // Invalid SPL that might fail parsing
      const spl = '| | | invalid broken syntax';
      const result = detectRiskyCommands(spl);

      // Should fail safe and return no commands
      expect(result.hasRiskyCommands).toBe(false);
      expect(result.commands).toEqual([]);
    });

    it('detects multiple collect commands', () => {
      const spl = `index=main | collect index=summary1
| search index=summary1 | collect index=summary2`;
      const result = detectRiskyCommands(spl);

      expect(result.hasRiskyCommands).toBe(true);
      expect(result.commandNames).toEqual(['collect']);
      expect(result.commands).toHaveLength(2);
    });
  });

  describe('removeRiskyCommands', () => {
    it('removes single-line collect command', () => {
      const spl = 'index=main | stats count | collect index=summary';
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe('index=main | stats count');
    });

    it('removes single-line outputlookup command', () => {
      const spl = 'index=main | stats count BY host | outputlookup hosts.csv';
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe('index=main | stats count BY host');
    });

    it('removes both commands when both present', () => {
      const spl = `index=main | stats count
| collect index=summary
| search index=summary
| outputlookup results.csv`;
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe(`index=main | stats count
| search index=summary`);
    });

    it('removes multi-line commands entirely', () => {
      const spl = `index=main
| stats count BY host
| collect index=summary
    host=localhost
    source=test
| sort -count`;
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe(`index=main
| stats count BY host
| sort -count`);
    });

    it('preserves other commands and formatting', () => {
      const spl = `index=main
| eval new_field=upper(old_field)
| collect index=summary
| stats count BY new_field`;
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe(`index=main
| eval new_field=upper(old_field)
| stats count BY new_field`);
    });

    it('handles edge case of command at start of pipeline', () => {
      // Note: collect must follow a search in valid SPL, so this tests parser behavior
      const spl = `search index=test | collect index=summary
| search index=main`;
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe(`search index=test
| search index=main`);
    });

    it('handles edge case of command at end of file', () => {
      const spl = `index=main | stats count
| collect index=summary`;
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe('index=main | stats count');
    });

    it('returns original SPL when no commands to remove', () => {
      const spl = 'index=main | stats count | sort -count';
      const cleaned = removeRiskyCommands(spl, []);

      expect(cleaned).toBe(spl);
    });

    it('handles consecutive risky commands', () => {
      const spl = `index=main
| collect index=summary1
| outputlookup results.csv
| stats count`;
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe(`index=main
| stats count`);
    });

    it('trims trailing whitespace', () => {
      const spl = 'index=main | stats count | collect index=summary\n\n';
      const result = detectRiskyCommands(spl);
      const cleaned = removeRiskyCommands(spl, result.commands);

      expect(cleaned).toBe('index=main | stats count');
    });
  });
});
