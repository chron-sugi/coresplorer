import { describe, it, expect } from 'vitest';
import { searchSpl } from './searchSpl';

describe('searchSpl', () => {
    const code = `index=main
| stats count by host
| eval status="ok"`;

    it('returns empty array for empty search term', () => {
        expect(searchSpl(code, '')).toEqual([]);
        expect(searchSpl(code, '   ')).toEqual([]);
    });

    it('finds matches case-insensitively', () => {
        const results = searchSpl(code, 'STATS');
        expect(results).toHaveLength(1);
        expect(results[0]).toEqual({
            line: 2,
            content: '| stats count by host'
        });
    });

    it('returns line numbers and content', () => {
        const results = searchSpl(code, 'host');
        expect(results).toHaveLength(1);
        expect(results[0].line).toBe(2);
    });

    it('handles multiple matches', () => {
        const multiMatchCode = `host=a
host=b`;
        const results = searchSpl(multiMatchCode, 'host');
        expect(results).toHaveLength(2);
        expect(results[0].line).toBe(1);
        expect(results[1].line).toBe(2);
    });

    it('handles no matches', () => {
        expect(searchSpl(code, 'missing')).toEqual([]);
    });
});
