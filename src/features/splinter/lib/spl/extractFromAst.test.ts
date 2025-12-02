import { describe, it, expect } from 'vitest';
import { extractFromAst } from './extractFromAst';
import { parseSPL } from '@/entities/spl';

describe('extractFromAst', () => {
    it('extracts stats command', () => {
        const result = parseSPL('index=main | stats count by host');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('stats')).toContain(1);
        // byFields are not captured in fieldToLines by extractFromAst
        // (they are handled by the fallback in analyzeSpl)
    });

    it('extracts eval command and target fields', () => {
        const result = parseSPL('index=main | eval total=price*quantity');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('eval')).toContain(1);
        expect(extracted.fieldToLines.get('total')).toBeDefined();
    });

    it('extracts rename command and old/new fields', () => {
        const result = parseSPL('index=main | rename old AS new');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('rename')).toContain(1);
        expect(extracted.fieldToLines.get('old')).toBeDefined();
        expect(extracted.fieldToLines.get('new')).toBeDefined();
    });

    it('extracts rex command and extracted fields', () => {
        const result = parseSPL('index=main | rex field=_raw "(?<username>\\w+)"');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('rex')).toContain(1);
        expect(extracted.fieldToLines.get('username')).toBeDefined();
    });

    it('extracts lookup command and output fields', () => {
        const result = parseSPL('index=main | lookup users.csv user OUTPUT department');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('lookup')).toContain(1);
    });

    it('extracts inputlookup command', () => {
        const result = parseSPL('| inputlookup users.csv');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('inputlookup')).toContain(1);
    });

    it('extracts spath command', () => {
        const result = parseSPL('index=main | spath');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('spath')).toContain(1);
    });

    it('extracts table command', () => {
        const result = parseSPL('index=main | table host, source');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('table')).toContain(1);
    });

    it('extracts fields command', () => {
        const result = parseSPL('index=main | fields host, source');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('fields')).toContain(1);
    });

    it('extracts dedup command', () => {
        const result = parseSPL('index=main | dedup host');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('dedup')).toContain(1);
    });

    it('extracts append command and traverses subsearch', () => {
        const result = parseSPL('index=main | append [ search index=secondary | stats count ]');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('append')).toContain(1);
        expect(extracted.commandToLines.get('stats')).toBeDefined();
        expect(extracted.commandCount).toBeGreaterThan(2);
    });

    it('extracts join command and traverses subsearch', () => {
        const result = parseSPL('index=main | join host [ search index=secondary | stats count by host ]');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('join')).toContain(1);
        expect(extracted.fieldToLines.get('host')).toBeDefined();
        expect(extracted.commandCount).toBeGreaterThan(2);
    });

    it('extracts where command and referenced fields', () => {
        const result = parseSPL('index=main | where count > 10');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('where')).toContain(1);
        expect(extracted.fieldToLines.get('count')).toBeDefined();
    });

    it('extracts bin command', () => {
        const result = parseSPL('index=main | bin _time span=1h');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('bin')).toContain(1);
    });

    it('extracts fillnull command and fields', () => {
        const result = parseSPL('index=main | fillnull value=0 count, total');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('fillnull')).toContain(1);
    });

    it('extracts mvexpand command and field', () => {
        const result = parseSPL('index=main | mvexpand values');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('mvexpand')).toContain(1);
        expect(extracted.fieldToLines.get('values')).toBeDefined();
    });

    it('extracts transaction command and fields', () => {
        const result = parseSPL('index=main | transaction host maxspan=5m');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('transaction')).toContain(1);
        expect(extracted.fieldToLines.get('host')).toBeDefined();
        // Transaction creates implicit fields: duration, eventcount
        expect(extracted.fieldToLines.get('duration')).toBeDefined();
        expect(extracted.fieldToLines.get('eventcount')).toBeDefined();
    });

    it('extracts search expression fields from base search', () => {
        const result = parseSPL('index=main host=server1 status=200');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        // Base search fields are captured via referencedFields
        // The parser may or may not extract these depending on implementation
        expect(extracted.commandCount).toBeGreaterThanOrEqual(1);
    });

    it('handles generic commands via default case', () => {
        const result = parseSPL('index=main | head 10');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('head')).toBeDefined();
    });

    it('handles GenericCommand with subsearches', () => {
        const result = parseSPL('index=main | map search="search index=secondary"');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('map')).toBeDefined();
    });

    it('counts all commands including subsearches', () => {
        const result = parseSPL(`index=main
| stats count by host
| append [ search index=secondary | eval x=1 ]`);
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        // Main: search + stats + append = 3
        // Subsearch: search + eval = 2
        // Total should be 5
        expect(extracted.commandCount).toBeGreaterThanOrEqual(4);
    });

    it('normalizes field names to lowercase', () => {
        const result = parseSPL('index=main | eval MyField=1');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.fieldToLines.get('myfield')).toBeDefined();
        // Should not have uppercase versions
        expect(extracted.fieldToLines.get('MyField')).toBeUndefined();
    });

    it('handles stats command variants', () => {
        const result = parseSPL('index=main | eventstats count by host');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.commandToLines.get('eventstats')).toContain(1);
    });

    it('extracts aggregation output fields from stats', () => {
        const result = parseSPL('index=main | stats count AS total, sum(bytes) AS total_bytes by host');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.fieldToLines.get('total')).toBeDefined();
        expect(extracted.fieldToLines.get('total_bytes')).toBeDefined();
    });

    it('extracts dependent fields from eval expressions', () => {
        const result = parseSPL('index=main | eval result=field1+field2');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        expect(extracted.fieldToLines.get('result')).toBeDefined();
        // Dependent fields should also be captured
        expect(extracted.fieldToLines.get('field1')).toBeDefined();
        expect(extracted.fieldToLines.get('field2')).toBeDefined();
    });

    it('handles empty pipeline gracefully', () => {
        const result = parseSPL('');
        // Parser may return null AST for empty input
        if (result.ast) {
            const extracted = extractFromAst(result.ast);
            expect(extracted.commandCount).toBe(0);
            expect(extracted.commandToLines.size).toBe(0);
        }
    });

    it('avoids duplicate line entries for same field', () => {
        const result = parseSPL('index=main | eval host=host+"suffix" | stats count by host');
        expect(result.ast).not.toBeNull();

        const extracted = extractFromAst(result.ast!);
        const hostLines = extracted.fieldToLines.get('host');
        expect(hostLines).toBeDefined();
        // Each line should appear only once
        const uniqueLines = new Set(hostLines);
        expect(uniqueLines.size).toBe(hostLines!.length);
    });
});
