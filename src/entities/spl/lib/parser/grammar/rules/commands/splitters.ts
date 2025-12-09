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
    } as any);
    parser.OPTION(() => parser.SUBRULE(parser.fieldList, { LABEL: 'joinFields' }));
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * foreach <wc-field-list> [fieldstr=<string>] [matchstr=<string>] [body]
   * Iterates over fields matching a pattern and executes a command for each
   * Body is [command] - a single command in brackets (not a full pipeline)
   */
  parser.foreachCommand = parser.RULE('foreachCommand', () => {
    parser.CONSUME(t.Foreach);
    parser.SUBRULE(parser.fieldList, { LABEL: 'fields' });
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' });
    });
    parser.OPTION(() => parser.SUBRULE(parser.foreachBody, { LABEL: 'body' }));
  });

  /**
   * Foreach body: [command] - single command in brackets with template variables
   */
  parser.foreachBody = parser.RULE('foreachBody', () => {
    parser.CONSUME(t.LBracket);
    parser.SUBRULE(parser.command, { LABEL: 'inner' });
    parser.CONSUME(t.RBracket);
  });

  /**
   * map search=<search-string> [maxsearches=<int>]
   * Runs a search for each result of the preceding search
   * Note: 'search' is a keyword token
   */
  parser.mapCommand = parser.RULE('mapCommand', () => {
    parser.CONSUME(t.Map);
    parser.MANY(() => {
      parser.OR([
        {
          // search=<string> (search is a keyword)
          ALT: () => {
            parser.CONSUME(t.Search, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' });
          },
        },
        {
          // other options like maxsearches=<int>
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
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

  /**
   * appendcols [override=<bool>] [subsearch]
   * Appends fields from subsearch results as new columns
   */
  parser.appendcolsCommand = parser.RULE('appendcolsCommand', () => {
    parser.CONSUME(t.Appendcols);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * appendpipe [run_in_preview=<bool>] [subsearch]
   * Appends the results of a subsearch to the current results
   */
  parser.appendpipeCommand = parser.RULE('appendpipeCommand', () => {
    parser.CONSUME(t.Appendpipe);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * multisearch [subsearch] [subsearch] ...
   * Runs multiple searches concurrently and combines results
   */
  parser.multisearchCommand = parser.RULE('multisearchCommand', () => {
    parser.CONSUME(t.Multisearch);
    parser.AT_LEAST_ONE(() => parser.SUBRULE(parser.subsearch, { LABEL: 'searches' }));
  });

  /**
   * set <union|intersect|diff> [subsearch]
   * Performs set operations on search results
   */
  parser.setCommand = parser.RULE('setCommand', () => {
    parser.CONSUME(t.Set);
    // Operation can be 'union' (keyword) or identifier (intersect, diff)
    parser.OR([
      { ALT: () => parser.CONSUME(t.Union, { LABEL: 'operation' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'operation' }) },
    ]);
    parser.SUBRULE(parser.subsearch);
  });

  /**
   * format [options]
   * Formats subsearch results for use in outer search
   */
  parser.formatCommand = parser.RULE('formatCommand', () => {
    parser.CONSUME(t.Format);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * transpose [N] [column_name=<field>] [header_field=<field>] [include_empty=<bool>]
   * Transposes rows and columns in search results
   */
  parser.transposeCommand = parser.RULE('transposeCommand', () => {
    parser.CONSUME(t.Transpose);
    parser.OPTION(() => parser.CONSUME(t.NumberLiteral, { LABEL: 'rowCount' }));
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * untable <row-field> <column-field> <value-field>
   * Reverses table/pivot output back to original format
   */
  parser.untableCommand = parser.RULE('untableCommand', () => {
    parser.CONSUME(t.Untable);
    // Use fieldOrWildcard to handle keywords like 'value' that can be field names
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'rowField' });
    parser.SUBRULE2(parser.fieldOrWildcard, { LABEL: 'columnField' });
    parser.SUBRULE3(parser.fieldOrWildcard, { LABEL: 'valueField' });
  });
}
