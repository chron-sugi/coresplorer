/**
 * System/Utility Commands
 *
 * Commands for system operations and utilities: rest, metadata, datamodel,
 * loadjob, savedsearch, outputcsv, sendemail.
 *
 * @module entities/spl/lib/parser/grammar/rules/commands/system
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applySystemCommands(parser: SPLParser): void {
  /**
   * rest <endpoint> [options]
   * Makes REST API calls to Splunk endpoints
   * Example: | rest /services/server/info
   */
  parser.restCommand = parser.RULE('restCommand', () => {
    parser.CONSUME(t.Rest);
    // Endpoint can be a string or identifier path
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'endpoint' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'endpoint' }) },
    ]);
    parser.MANY(() => {
      parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * metadata type=<type> [index=<index>] [options]
   * Returns metadata about indexes, sourcetypes, sources, or hosts
   * Note: 'type' is a keyword token
   */
  parser.metadataCommand = parser.RULE('metadataCommand', () => {
    parser.CONSUME(t.Metadata);
    parser.AT_LEAST_ONE(() => {
      // Option name can be 'type' keyword or identifier
      parser.OR([
        { ALT: () => parser.CONSUME(t.Type, { LABEL: 'optionName' }) },
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
   * datamodel <datamodel-name> [<object-name>] [options]
   * Accesses accelerated datamodel data
   * Note: 'datamodel' is a keyword token used in tstats FROM clause
   */
  parser.datamodelCommand = parser.RULE('datamodelCommand', () => {
    parser.CONSUME(t.Datamodel);
    // Datamodel name (required)
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'datamodelName' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'datamodelName' }) },
    ]);
    // Optional object name
    parser.OPTION(() => {
      parser.OR2([
        { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'objectName' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'objectName' }) },
      ]);
    });
    // Options
    parser.MANY(() => {
      parser.CONSUME3(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR3([
        { ALT: () => parser.CONSUME3(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME4(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * loadjob <sid> [options]
   * Loads results from a previously run search job
   * SID can be a number (e.g., 1234567890.123) or string
   */
  parser.loadjobCommand = parser.RULE('loadjobCommand', () => {
    parser.CONSUME(t.Loadjob);
    // Search ID (required) - can be number, string, or identifier
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'sid' }) },
      { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'sid' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'sid' }) },
    ]);
    parser.MANY(() => {
      parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * savedsearch <search-name> [options]
   * Runs a saved search by name
   * Note: option values like 'search' are keyword tokens
   */
  parser.savedsearchCommand = parser.RULE('savedsearchCommand', () => {
    parser.CONSUME(t.Savedsearch);
    // Search name (required)
    parser.OR([
      { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'searchName' }) },
      { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'searchName' }) },
    ]);
    parser.MANY(() => {
      parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR2([
        { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.Search, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * outputcsv <filename> [options]
   * Outputs search results to a CSV file
   */
  parser.outputcsvCommand = parser.RULE('outputcsvCommand', () => {
    parser.CONSUME(t.Outputcsv);
    parser.MANY(() => {
      parser.OR([
        {
          // Options: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Filename (positional)
          ALT: () => {
            parser.OR3([
              { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'filename' }) },
              { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'filename' }) },
            ]);
          },
        },
      ]);
    });
  });

  /**
   * sendemail to=<email> [subject=<string>] [message=<string>] [options]
   * Sends search results via email
   */
  parser.sendemailCommand = parser.RULE('sendemailCommand', () => {
    parser.CONSUME(t.Sendemail);
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
}
