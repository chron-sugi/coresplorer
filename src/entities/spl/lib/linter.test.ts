import { describe, it, expect } from 'vitest';
import { lintSpl, getCommandsWithPerformanceRisk } from '@/entities/spl/lib';

describe('lintSpl', () => {
  describe('command-based performance warnings', () => {
    describe('join detection', () => {
      it('detects join command (lowercase)', () => {
        const code = 'search index=main | join host';
        const warnings = lintSpl(code);

        const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
        expect(joinWarning).toBeDefined();
        expect(joinWarning?.severity).toBe('high');
        expect(joinWarning?.suggestion).toContain('stats');
      });

      it('detects join command (uppercase)', () => {
        const code = 'search index=main | JOIN host';
        const warnings = lintSpl(code);

        const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
        expect(joinWarning).toBeDefined();
        expect(joinWarning?.severity).toBe('high');
      });

      it('detects join command (mixed case)', () => {
        const code = 'search index=main | JoIn host';
        const warnings = lintSpl(code);

        const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
        expect(joinWarning).toBeDefined();
      });

      it('detects join on different line', () => {
        const code = `search index=main
| stats count by host
| join type=left host`;
        const warnings = lintSpl(code);

        const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
        expect(joinWarning?.line).toBe(3);
      });
    });

    describe('transaction detection', () => {
      it('detects transaction command', () => {
        const code = 'search index=main | transaction session_id';
        const warnings = lintSpl(code);

        const txWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('transaction'));
        expect(txWarning).toBeDefined();
        expect(txWarning?.severity).toBe('high');
        expect(txWarning?.suggestion).toContain('stats');
      });

      it('detects transaction with case insensitivity', () => {
        const code = 'search index=main | TRANSACTION user';
        const warnings = lintSpl(code);

        const txWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('transaction'));
        expect(txWarning).toBeDefined();
      });
    });

    describe('append/union detection', () => {
      it('detects append command', () => {
        const code = 'search index=main | append [search index=errors]';
        const warnings = lintSpl(code);

        const appendWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('append'));
        expect(appendWarning).toBeDefined();
        expect(appendWarning?.severity).toBe('medium');
      });

      it('detects union command', () => {
        const code = 'search index=main | union [search index=errors]';
        const warnings = lintSpl(code);

        const unionWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('union'));
        expect(unionWarning).toBeDefined();
        expect(unionWarning?.severity).toBe('medium');
      });
    });

    describe('mvexpand detection', () => {
      it('detects mvexpand command', () => {
        const code = 'search index=main | mvexpand categories';
        const warnings = lintSpl(code);

        const mvWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('mvexpand'));
        expect(mvWarning).toBeDefined();
        expect(mvWarning?.severity).toBe('medium');
      });
    });
  });

  describe('static pattern rules', () => {
    describe('real-time search detection', () => {
      it('detects earliest=rt', () => {
        const code = 'search index=main earliest=rt';
        const warnings = lintSpl(code);

        const rtWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('Real-time'));
        expect(rtWarning).toBeDefined();
        expect(rtWarning?.severity).toBe('high');
        expect(rtWarning?.suggestion).toContain('scheduled');
      });

      it('detects latest=rt', () => {
        const code = 'search index=main latest=rt';
        const warnings = lintSpl(code);

        const rtWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('Real-time'));
        expect(rtWarning).toBeDefined();
        expect(rtWarning?.severity).toBe('high');
      });

      it('detects both earliest and latest rt', () => {
        const code = 'search index=main earliest=rt latest=rt';
        const warnings = lintSpl(code);

        const rtWarnings = warnings.filter((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('Real-time'));
        expect(rtWarnings.length).toBeGreaterThanOrEqual(1);
        expect(rtWarnings[0].line).toBe(1);
      });
    });

    describe('leading wildcard detection', () => {
      it('detects leading wildcards in search', () => {
        const code = 'search index=main *error';
        const warnings = lintSpl(code);

        const wildcardWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('wildcard'));
        expect(wildcardWarning).toBeDefined();
        expect(wildcardWarning?.severity).toBe('medium');
      });

      it('ignores wildcards after pipe', () => {
        const code = '| search *error';
        const warnings = lintSpl(code);

        const wildcardWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('wildcard'));
        expect(wildcardWarning).toBeUndefined();
      });

      it('ignores wildcards in middle of word', () => {
        const code = 'search index=main error*';
        const warnings = lintSpl(code);

        const wildcardWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('wildcard'));
        expect(wildcardWarning).toBeUndefined();
      });
    });

    describe('sort 0 detection', () => {
      it('detects sort 0', () => {
        const code = 'search index=main | sort 0 _time';
        const warnings = lintSpl(code);

        const sortWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('sort 0'));
        expect(sortWarning).toBeDefined();
        expect(sortWarning?.severity).toBe('high');
      });
    });

    describe('broad time range detection', () => {
      it('detects 30+ day range', () => {
        const code = 'search index=main earliest=-30d';
        const warnings = lintSpl(code);

        const timeWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('time range'));
        expect(timeWarning).toBeDefined();
        expect(timeWarning?.severity).toBe('medium');
      });

      it('detects year-based range', () => {
        const code = 'search index=main earliest=-1y';
        const warnings = lintSpl(code);

        const timeWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('time range'));
        expect(timeWarning).toBeDefined();
      });
    });
  });

  describe('base search analysis', () => {
    it('warns when no index specified', () => {
      const code = 'search host=server1';
      const warnings = lintSpl(code);

      const indexWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('index'));
      expect(indexWarning).toBeDefined();
      expect(indexWarning?.severity).toBe('high');
    });

    it('warns on wildcard index', () => {
      const code = 'search index=* host=server1';
      const warnings = lintSpl(code);

      const indexWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('wildcard index'));
      expect(indexWarning).toBeDefined();
    });

    it('does not warn when index specified', () => {
      const code = 'search index=main host=server1';
      const warnings = lintSpl(code);

      const indexWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('does not specify'));
      expect(indexWarning).toBeUndefined();
    });

    it('skips base search check for generating commands', () => {
      const code = '| inputlookup users.csv';
      const warnings = lintSpl(code);

      const indexWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('index'));
      expect(indexWarning).toBeUndefined();
    });
  });

  describe('lint options', () => {
    it('respects checkBaseSearch option', () => {
      const code = 'search host=server1';
      const warnings = lintSpl(code, { checkBaseSearch: false });

      const indexWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('index'));
      expect(indexWarning).toBeUndefined();
    });

    it('respects checkCommands option', () => {
      const code = 'search index=main | join host';
      const warnings = lintSpl(code, { checkCommands: false });

      const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
      expect(joinWarning).toBeUndefined();
    });

    it('respects checkPatterns option', () => {
      const code = 'search index=main earliest=rt';
      const warnings = lintSpl(code, { checkPatterns: false });

      const rtWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('Real-time'));
      expect(rtWarning).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles empty code', () => {
      const warnings = lintSpl('');
      expect(warnings).toEqual([]);
    });

    it('handles code with no issues', () => {
      const code = 'search index=main | stats count by host';
      const warnings = lintSpl(code);

      expect(warnings).toEqual([]);
    });

    it('handles multiple issues on same line', () => {
      const code = 'search *error earliest=rt | join host';
      const warnings = lintSpl(code);

      // Expected: missing index, leading wildcard, realtime, join
      expect(warnings.length).toBe(4);
      expect(warnings.every((w: ReturnType<typeof lintSpl>[number]) => w.line === 1)).toBe(true);
    });

    it('handles very long lines', () => {
      const longLine =
        'search index=main ' + 'host=server '.repeat(100) + '| join host';
      const warnings = lintSpl(longLine);

      const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
      expect(joinWarning?.line).toBe(1);
    });

    it('handles multiline SPL', () => {
      const code = `search index=main
| stats count by host
| join type=left host
| transaction session_id`;
      const warnings = lintSpl(code);

      const joinWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('join'));
      const txWarning = warnings.find((w: ReturnType<typeof lintSpl>[number]) => w.message.includes('transaction'));

      expect(joinWarning?.line).toBe(3);
      expect(txWarning?.line).toBe(4);
    });
  });
});

describe('getCommandsWithPerformanceRisk', () => {
  it('returns commands with performance risk', () => {
    const risky = getCommandsWithPerformanceRisk();

    expect(risky.length).toBeGreaterThan(0);
    expect(risky.some((c: { name: string }) => c.name === 'join')).toBe(true);
    expect(risky.some((c: { name: string }) => c.name === 'transaction')).toBe(true);
  });

  it('includes risk level and note', () => {
    const risky = getCommandsWithPerformanceRisk();
    const join = risky.find((c: { name: string; risk: string; note: string }) => c.name === 'join');

    expect(join?.risk).toBe('high');
    expect(join?.note).toContain('resource intensive');
  });
});
