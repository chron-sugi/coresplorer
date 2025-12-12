/**
 * Field-Affecting Commands (Phase 5)
 *
 * Grammar rules for commands that were marked as 'generic' but affect fields:
 * - Input: inputcsv
 * - Field creators: fieldsummary, addcoltotals, bucketdir, geom, geomfilter, concurrency, typer
 * - Field modifiers: nomv, makecontinuous, reltime
 *
 * @module entities/spl/lib/parser/grammar/rules/commands/field-affecting
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyFieldAffectingCommands(parser: SPLParser): void {
  // ===========================================================================
  // INPUT COMMANDS
  // ===========================================================================

  /**
   * inputcsv [append=<bool>] [start=<int>] [max=<int>] [events=<bool>] <filename>
   * Loads search results from a CSV file
   */
  parser.inputcsvCommand = parser.RULE('inputcsvCommand', () => {
    parser.CONSUME(t.Inputcsv);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.True, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.False, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Filename (string or identifier)
          ALT: () =>
            parser.OR3([
              { ALT: () => parser.CONSUME2(t.StringLiteral, { LABEL: 'filename' }) },
              { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'filename' }) },
            ]),
        },
      ]);
    });
  });

  // ===========================================================================
  // FIELD CREATOR COMMANDS
  // ===========================================================================

  /**
   * fieldsummary [maxvals=<int>] [<field-list>]
   * Generates field summary statistics
   */
  parser.fieldsummaryCommand = parser.RULE('fieldsummaryCommand', () => {
    parser.CONSUME(t.Fieldsummary);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
  });

  /**
   * addcoltotals [labelfield=<field>] [label=<string>] [<field-list>]
   * Computes totals for numeric fields
   */
  parser.addcoltotalsCommand = parser.RULE('addcoltotalsCommand', () => {
    parser.CONSUME(t.Addcoltotals);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
            parser.CONSUME(t.Equals);
            parser.OR2([
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'fields' }),
        },
      ]);
    });
  });

  /**
   * bucketdir [pathfield=<field>] [sizefield=<field>] [sep=<string>] [maxcount=<int>]
   * Creates path hierarchy based on directory structure
   */
  parser.bucketdirCommand = parser.RULE('bucketdirCommand', () => {
    parser.CONSUME(t.Bucketdir);
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
   * geom [<featurecollection>] [featureIdField=<field>] [gen=<num>]
   * Adds geographic features for choropleth maps
   */
  parser.geomCommand = parser.RULE('geomCommand', () => {
    parser.CONSUME(t.Geom);
    parser.OPTION(() => {
      // Feature collection name (optional positional)
      parser.CONSUME(t.Identifier, { LABEL: 'featureCollection' });
    });
    parser.MANY(() => {
      parser.CONSUME2(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME3(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * geomfilter [min_x=<num>] [min_y=<num>] [max_x=<num>] [max_y=<num>]
   * Filters geographic data by bounding box
   */
  parser.geomfilterCommand = parser.RULE('geomfilterCommand', () => {
    parser.CONSUME(t.Geomfilter);
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
   * concurrency [duration=<field>] [start=<field>]
   * Tags events with concurrent session count
   */
  parser.concurrencyCommand = parser.RULE('concurrencyCommand', () => {
    parser.CONSUME(t.Concurrency);
    parser.MANY(() => {
      parser.CONSUME(t.Identifier, { LABEL: 'optionName' });
      parser.CONSUME(t.Equals);
      parser.OR([
        { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
        { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
      ]);
    });
  });

  /**
   * typer
   * Calculates eventtype field for events
   */
  parser.typerCommand = parser.RULE('typerCommand', () => {
    parser.CONSUME(t.Typer);
    // typer has no options
  });

  // ===========================================================================
  // FIELD MODIFIER COMMANDS
  // ===========================================================================

  /**
   * nomv <field>
   * Converts multivalue field to single value
   */
  parser.nomvCommand = parser.RULE('nomvCommand', () => {
    parser.CONSUME(t.Nomv);
    parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' });
  });

  /**
   * makecontinuous [<field>] [span=<span>]
   * Makes field values continuous by filling gaps
   */
  parser.makecontinuousCommand = parser.RULE('makecontinuousCommand', () => {
    parser.CONSUME(t.Makecontinuous);
    parser.MANY(() => {
      parser.OR([
        {
          // Option: name=value (span, start, end)
          GATE: () => parser.LA(2).tokenType === t.Equals,
          ALT: () => {
            parser.OR2([
              { ALT: () => parser.CONSUME(t.Span, { LABEL: 'optionName' }) },
              { ALT: () => parser.CONSUME(t.Identifier, { LABEL: 'optionName' }) },
            ]);
            parser.CONSUME(t.Equals);
            parser.OR3([
              { ALT: () => parser.CONSUME(t.NumberLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME(t.StringLiteral, { LABEL: 'optionValue' }) },
              { ALT: () => parser.CONSUME2(t.Identifier, { LABEL: 'optionValue' }) },
            ]);
          },
        },
        {
          // Field
          ALT: () => parser.SUBRULE(parser.fieldOrWildcard, { LABEL: 'field' }),
        },
      ]);
    });
  });

  /**
   * reltime
   * Converts _time to relative time format
   */
  parser.reltimeCommand = parser.RULE('reltimeCommand', () => {
    parser.CONSUME(t.Reltime);
    // reltime has no options
  });
}
