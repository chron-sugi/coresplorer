/**
 * Extraction Commands
 *
 * Commands that extract data from fields: xpath, xmlkv, xmlunescape, multikv, erex, kv.
 *
 * @module entities/spl/lib/parser/grammar/rules/commands/extraction
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyExtractionCommands(parser: SPLParser): void {
  /**
   * xpath [field=<field>] <xpath-expression> [outfield=<field>] [default=<string>]
   * Extracts values from XML using XPath expressions
   * Note: 'field' and 'default' are keyword tokens
   */
  parser.xpathCommand = parser.RULE('xpathCommand', () => {
    parser.CONSUME(t.Xpath);
    parser.MANY(() => {
      parser.OR([
        {
          // field=<field> (field is a keyword)
          GATE: () => parser.LA(1).tokenType === t.Field,
          ALT: () => {
            parser.CONSUME(t.Field, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // default=<string> (default is a keyword)
          GATE: () => parser.LA(1).tokenType === t.Default,
          ALT: () => {
            parser.CONSUME(t.Default, { LABEL: 'optionName' });
            parser.CONSUME2(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // outfield=<field> and other options
          GATE: () => parser.LA(1).tokenType === t.Identifier && parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME3(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME3(t.Equals);
            parser.OR4([
              { ALT: () => parser.CONSUME3(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME4(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // The XPath expression itself (a string)
          ALT: () => parser.CONSUME4(t.StringLiteral, { LABEL: 'xpathExpr' }),
        },
      ]);
    });
  });

  /**
   * xmlkv [field=<field>] [maxinputs=<int>]
   * Extracts XML key-value pairs from a field
   * Note: 'field' is a keyword token
   */
  parser.xmlkvCommand = parser.RULE('xmlkvCommand', () => {
    parser.CONSUME(t.Xmlkv);
    parser.MANY(() => {
      // Option name can be 'field' keyword or identifier
      parser.OR([
        { ALT: () => parser.CONSUME(t.Field, { LABEL: 'optionName' }) },
        { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
      ]);
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * xmlunescape [field=<field>]
   * Unescapes XML entities in a field
   * Note: 'field' is a keyword token
   */
  parser.xmlunescapeCommand = parser.RULE('xmlunescapeCommand', () => {
    parser.CONSUME(t.Xmlunescape);
    parser.MANY(() => {
      // Option name can be 'field' keyword or identifier
      parser.OR([
        { ALT: () => parser.CONSUME(t.Field, { LABEL: 'optionName' }) },
        { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
      ]);
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * multikv [conf=<conf-file>] [filter=<string>] [fields=<field-list>]
   * [forceheader=<int>] [noheader=<bool>] [rmorig=<bool>]
   * Extracts key-value pairs from table-formatted events
   */
  parser.multikvCommand = parser.RULE('multikvCommand', () => {
    parser.CONSUME(t.Multikv);
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
   * erex <field> [fromfield=<field>] [examples=<string>] [counterexamples=<string>]
   * [maxtrainers=<int>]
   * Extracts fields using example-based learning
   */
  parser.erexCommand = parser.RULE('erexCommand', () => {
    parser.CONSUME(t.Erex);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'targetField' });
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * kv [field=<field>] [pairdelim=<string>] [kvdelim=<string>]
   * Extracts key-value pairs from a field (dedicated rule replacing generic)
   * Note: 'field' is a keyword token
   */
  parser.kvCommand = parser.RULE('kvCommand', () => {
    parser.CONSUME(t.Kv);
    parser.MANY(() => {
      // Option name can be 'field' keyword or identifier
      parser.OR([
        { ALT: () => parser.CONSUME(t.Field, { LABEL: 'optionName' }) },
        { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
      ]);
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });
}
