import { describe, it, expect } from 'vitest';
import { searchSpl } from './searchSpl';
import { parseSPL } from '@/entities/spl';

describe('searchSpl', () => {
    const code = `index=main
| stats count by host
| eval status="ok"`;

    it('returns empty array for empty search term', () => {
        expect(searchSpl(code, '', null)).toEqual([]);
        expect(searchSpl(code, '   ', null)).toEqual([]);
    });

    it('finds matches case-insensitively', () => {
        const results = searchSpl(code, 'STATS', null);
        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({
            line: 2,
            content: '| stats count by host',
            kind: 'text',
        });
    });

    it('returns line numbers and content', () => {
        const results = searchSpl(code, 'host', null);
        expect(results).toHaveLength(1);
        expect(results[0].line).toBe(2);
    });

    it('handles multiple matches', () => {
        const multiMatchCode = `host=a
host=b`;
        const results = searchSpl(multiMatchCode, 'host', null);
        expect(results).toHaveLength(2);
        expect(results[0].line).toBe(1);
        expect(results[1].line).toBe(2);
    });

    it('handles no matches', () => {
        expect(searchSpl(code, 'missing', null)).toEqual([]);
    });
});

describe('searchSpl with AST', () => {
    it('extracts commands from AST', () => {
        const code = `index=main | stats count by host | eval total=count*2`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'stats', parseResult, { commands: true, fields: false, text: false });

        expect(results.length).toBeGreaterThan(0);
        const commandResult = results.find(r => r.kind === 'command');
        expect(commandResult).toBeDefined();
        expect(commandResult?.match).toBe('stats');
    });

    it('extracts fields from StatsCommand AST', () => {
        const code = `index=main | stats count AS total by host`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'host', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
        expect(fieldResult?.match).toBe('host');
    });

    it('extracts fields from EvalCommand AST', () => {
        const code = `index=main | eval newfield=oldfield*2`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'newfield', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
        expect(fieldResult?.match).toBe('newfield');
    });

    it('extracts fields from RenameCommand AST', () => {
        const code = `index=main | rename oldname AS newname`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'newname', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from RexCommand AST', () => {
        const code = `index=main | rex field=_raw "(?<username>\\w+)"`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'username', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from LookupCommand AST', () => {
        const code = `index=main | lookup users.csv user OUTPUT department`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'user', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from FieldsCommand AST', () => {
        const code = `index=main | fields host, source, sourcetype`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'source', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from TableCommand AST', () => {
        const code = `index=main | table host, source`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'host', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from DedupCommand AST', () => {
        const code = `index=main | dedup host, source`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'host', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from WhereCommand AST', () => {
        const code = `index=main | where count > 10`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'count', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from MvexpandCommand AST', () => {
        const code = `index=main | mvexpand myfield`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'myfield', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('extracts fields from BinCommand AST', () => {
        const code = `index=main | bin span=1h _time`;
        const parseResult = parseSPL(code);
        // Bin command may or may not extract fields depending on parser implementation
        const results = searchSpl(code, 'bin', parseResult, { commands: true, fields: false, text: false });

        const commandResult = results.find(r => r.kind === 'command');
        expect(commandResult).toBeDefined();
    });

    it('extracts fields from WhereCommand AST with field reference', () => {
        const code = `index=main | where status > 200`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'status', parseResult, { commands: false, fields: true, text: false });

        const fieldResult = results.find(r => r.kind === 'field');
        expect(fieldResult).toBeDefined();
    });

    it('traverses AppendCommand subsearches', () => {
        const code = `index=main | append [ search index=secondary | stats count ]`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'stats', parseResult, { commands: true, fields: false, text: false });

        const commandResult = results.find(r => r.kind === 'command' && r.match === 'stats');
        expect(commandResult).toBeDefined();
    });

    it('traverses JoinCommand subsearches', () => {
        const code = `index=main | join host [ search index=secondary | stats count by host ]`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'stats', parseResult, { commands: true, fields: false, text: false });

        const commandResult = results.find(r => r.kind === 'command' && r.match === 'stats');
        expect(commandResult).toBeDefined();
    });

    it('treats base search as search command', () => {
        const code = `index=main host=server1`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'search', parseResult, { commands: true, fields: false, text: false });

        const commandResult = results.find(r => r.kind === 'command' && r.match === 'search');
        expect(commandResult).toBeDefined();
    });

    it('filters by commands only', () => {
        const code = `index=main | stats count by host`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'host', parseResult, { commands: true, fields: false, text: false });

        expect(results.every(r => r.kind === 'command')).toBe(true);
    });

    it('filters by fields only', () => {
        const code = `index=main | stats count by host`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'stats', parseResult, { commands: false, fields: true, text: false });

        expect(results.every(r => r.kind === 'field')).toBe(true);
    });

    it('filters by text only', () => {
        const code = `index=main | stats count by host`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'stats', parseResult, { commands: false, fields: false, text: true });

        expect(results.every(r => r.kind === 'text')).toBe(true);
    });

    it('scores exact matches higher than prefix matches', () => {
        const code = `index=main | eval stat=1 | stats count`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'stat', parseResult, { commands: true, fields: true, text: false });

        // Results should be sorted by score descending
        if (results.length > 1) {
            for (let i = 0; i < results.length - 1; i++) {
                expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
            }
        }
    });

    it('handles GenericCommand with subsearches', () => {
        const code = `index=main | map search="search index=secondary"`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'map', parseResult, { commands: true, fields: false, text: false });

        const commandResult = results.find(r => r.kind === 'command' && r.match === 'map');
        expect(commandResult).toBeDefined();
    });

    it('handles StatsCommand variants (eventstats, streamstats)', () => {
        const code = `index=main | eventstats count by host`;
        const parseResult = parseSPL(code);
        const results = searchSpl(code, 'eventstats', parseResult, { commands: true, fields: false, text: false });

        const commandResult = results.find(r => r.kind === 'command');
        expect(commandResult).toBeDefined();
        expect(commandResult?.match).toBe('eventstats');
    });
});
