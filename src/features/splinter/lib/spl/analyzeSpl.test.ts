import { analyzeSpl } from './analyzeSpl';

const sample = `search index=main | stats count by host
| eval total=price*quantity
| where total > 1000
| fields host, total`;

describe('analyzeSpl', () => {
  it('should correctly analyze basic SPL', () => {
    const result = analyzeSpl(sample);
    expect(result.lineCount).toBe(4);
    expect(result.commandCount).toBe(5); // search, stats, eval, where, fields (pipe segments)
    // Note: 'search' is skipped as it's an implicit base command
    expect(result.uniqueCommands).toEqual(expect.arrayContaining(['stats', 'eval', 'where', 'fields']));
    expect(result.commandToLines.get('search')).toBeUndefined(); // search is skipped
    expect(result.commandToLines.get('stats')).toEqual([1]); // stats appears after pipe on line 1
    expect(result.commandToLines.get('eval')).toEqual([2]);
    expect(result.commandToLines.get('where')).toEqual([3]);
    expect(result.commandToLines.get('fields')).toEqual([4]);
  });

  it('handles weird spacing and multi‑line commands', () => {
    const weird = `  search   index=main   |   stats   count  by  host   \n|   eval   total = price * quantity   \n   |where   total>1000`;
    const result = analyzeSpl(weird);
    expect(result.commandCount).toBe(4); // search, stats, eval, where
    // Note: 'search' is skipped as it's an implicit base command
    expect(result.uniqueCommands).toEqual(expect.arrayContaining(['stats', 'eval', 'where']));
    expect(result.commandToLines.get('search')).toBeUndefined(); // search is skipped
    expect(result.commandToLines.get('stats')).toEqual([1]);
    expect(result.commandToLines.get('eval')).toEqual([2]);
    expect(result.commandToLines.get('where')).toEqual([3]);
  });

  it('handles empty input gracefully', () => {
    const result = analyzeSpl('');
    expect(result.lineCount).toBe(0);
    expect(result.commandCount).toBe(0);
    expect(result.uniqueCommands).toEqual([]);
    expect(result.fields).toEqual([]);
  });

  it('handles duplicated commands and fields', () => {
    const dup = `search index=main\nsearch index=secondary\n| stats count as total by host\n| eval price=100`;
    const result = analyzeSpl(dup);
    expect(result.uniqueCommands).toEqual(expect.arrayContaining(['stats', 'eval']));
    expect(result.commandToLines.get('search')).toBeUndefined(); // base search is not surfaced
    expect(result.commandToLines.get('stats')).toEqual([3]);
    expect(result.fieldToLines.has('price')).toBe(true);
  });

  it('treats stats aliases as fields (not commands)', () => {
    const spl = `index=web | stats sum(is_warning) AS warning_count by host | eval risk=if(warning_count>5,1,0)`;
    const result = analyzeSpl(spl);
    expect(result.commandToLines.get('warning_count')).toBeUndefined();
    expect(result.fieldToLines.get('warning_count')).toEqual(expect.arrayContaining([1, 2]));
    expect(result.fieldToLines.get('risk')).toEqual([2]);
  });

  it('extracts fields from eval case blocks across lines', () => {
    const spl = `index=web
| eval risk_score = case(
    error_count>=50, 90,
    error_count>=20, 70,
    warning_count>=50, 60,
    total_requests>=100, 50,
    true(), 10
  )
| stats count AS rows BY risk_score`;
    const result = analyzeSpl(spl);
    expect(result.commandToLines.get('eval')).toEqual([2]);
    expect(result.fieldToLines.get('risk_score')).toEqual(expect.arrayContaining([2]));
    expect(result.fieldToLines.get('warning_count')).toEqual(expect.arrayContaining([2]));
    expect(result.commandToLines.get('warning_count')).toBeUndefined();
  });

  // --- Pattern Tests ---

  it('detects missing index in base search', () => {
    const spl = `search error | stats count`;
    const result = analyzeSpl(spl);
    const warning = result.warnings.find(w => w.message.includes('Base search does not specify an index'));
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('high');
  });

  it('detects wildcard index', () => {
    const spl = `search index=* error | stats count`;
    const result = analyzeSpl(spl);
    const warning = result.warnings.find(w => w.message.includes('Base search uses wildcard index'));
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('high');
  });

  it('detects join command', () => {
    const spl = `index=main | join type=left host [ search index=secondary ]`;
    const result = analyzeSpl(spl);
    const warning = result.warnings.find(w => w.message.includes('join'));
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('high');
  });

  it('detects transaction command', () => {
    const spl = `index=main | transaction host maxspan=5m`;
    const result = analyzeSpl(spl);
    const warning = result.warnings.find(w => w.message.includes('transaction'));
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('high');
  });

  it('detects sort 0', () => {
    const spl = `index=main | sort 0 host`;
    const result = analyzeSpl(spl);
    const warning = result.warnings.find(w => w.message.includes('sort 0'));
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('high');
  });

  it('detects leading wildcards', () => {
    const spl = `index=main | search user="*admin"`;
    const result = analyzeSpl(spl);
    const warning = result.warnings.find(w => w.message.includes('Leading wildcards'));
    expect(warning).toBeDefined();
    expect(warning?.severity).toBe('high');
  });

  it('detects complex regex', () => {
      const longRegex = 'a'.repeat(160);
      const spl = `index=main | regex _raw="${longRegex}"`;
      const result = analyzeSpl(spl);
      const warning = result.warnings.find(w => w.message.includes('Complex or long regex'));
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('medium');
  });

  it('detects negative filters', () => {
      const spl = `index=main status!=200`;
      const result = analyzeSpl(spl);
      const warning = result.warnings.find(w => w.message.includes('Negative filters'));
      expect(warning).toBeDefined();
      expect(warning?.severity).toBe('medium');
  });
});
