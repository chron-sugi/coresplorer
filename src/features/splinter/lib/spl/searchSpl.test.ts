import { describe, it, expect } from 'vitest';
import { searchSpl } from './searchSpl';

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
