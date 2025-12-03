/**
 * Pipeline Splitter Commands
 * 
 * Commands that split or merge pipelines: append, join.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands/splitters
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applySplitterCommands(parser: SPLParser): void {
  /**
   * Subsearch enclosed in brackets.
   * Matches: [search index=main | stats count]
   */
  parser.subsearch = parser.RULE('subsearch', () => {
    parser.CONSUME(t.LBracket);
    parser.SUBRULE(parser.pipeline, { LABEL: 'inner' });
    parser.CONSUME(t.RBracket);
  });

  /**
   * append [subsearch]
   */
  parser.appendCommand = parser.RULE('appendCommand', () => {
    parser.CONSUME(t.Append);
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * join [type=<type>] [max=<int>] <field-list> [subsearch]
   * Note: 'type' is a reserved keyword, so we must accept it explicitly as an option name
   */
  parser.joinCommand = parser.RULE('joinCommand', () => {
    parser.CONSUME(t.Join);
    // Use GATE to lookahead and check for optionName=value pattern
    // This distinguishes options (type=left, max=10) from field names (host)
    parser.MANY({
      GATE: () => {
        // Check if we have optionName=optionValue pattern
        // LA(2) would be the token after the option name
        const secondToken = parser.LA(2);
        return secondToken.tokenType === t.Equals;
      },
      DEF: () => {
        // Option name can be reserved keywords or identifiers
        // 'type', 'max' are keywords that can be option names
        parser.OR1([
          { ALT: () => parser.CONSUME(t.Type, { LABEL: 'optionName' }) },
          { ALT: () => parser.CONSUME(t.Max, { LABEL: 'optionName' }) },
          { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
        ]);
        parser.CONSUME(t.Equals);
        parser.OR2([
          { ALT: () => parser.CONSUME(t.Inner, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME(t.Outer, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME(t.Left, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
          { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
        ]);
      },
    });
    parser.OPTION(() => parser.SUBRULE(parser.fieldList, { LABEL: 'joinFields' }));
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * foreach <wc-field-list> [fieldstr=<string>] [matchstr=<string>] [subsearch]
   * Iterates over fields matching a pattern and executes a subsearch for each
   */
  parser.foreachCommand = parser.RULE('foreachCommand', () => {
    parser.CONSUME(t.Foreach);
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' });
    });
    parser.OPTION(() => parser.SUBRULE(parser.subsearch, { LABEL: 'body' }));
  });

  /**
   * map search=<search-string> [maxsearches=<int>]
   * Runs a search for each result of the preceding search
   */
  parser.mapCommand = parser.RULE('mapCommand', () => {
    parser.CONSUME(t.Map);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * makeresults [count=<int>] [annotate=<bool>] [splunk_server=<string>]
   * Generates a specified number of empty results
   */
  parser.makeresultsCommand = parser.RULE('makeresultsCommand', () => {
    parser.CONSUME(t.Makeresults);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * gentimes start=<time> end=<time> [increment=<timespan>]
   * Generates timestamp results between start and end times
   */
  parser.gentimesCommand = parser.RULE('gentimesCommand', () => {
    parser.CONSUME(t.Gentimes);
    parser.AT_LEAST_ONE(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.TimeModifier, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * return [<count>] [<field-list>] [$<field>...]
   * Returns field values from a subsearch to the outer search
   * The $ prefix indicates returning field=value pairs
   */
  parser.returnCommand = parser.RULE('returnCommand', () => {
    parser.CONSUME(t.Return);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'count' }));
    parser.MANY(() => {
      parser.OR([
        { ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }) },
        { ALT: () => parser.CONSUME(t.Comma) },
      ]);
    });
  });
}
