/**
 * Generic Command Fallback
 * 
 * Catches any command not explicitly defined, allowing extensibility.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands/generic
 */

import type { SPLParser } from '../../types';
import * as t from '../../../lexer/tokens';

export function applyGenericCommands(parser: SPLParser): void {
  /**
   * Generic command: <command-name> [args...]
   * Fallback for commands not explicitly defined.
   */
  parser.genericCommand = parser.RULE('genericCommand', () => {
    parser.CONSUME(t.Identifier, { LABEL: 'commandName' });
    parser.MANY(() => {
      parser.OR([
        { ALT: () => parser.SUBRULE(parser.subsearch) },
        { ALT: () => parser.SUBRULE(parser.genericArg) },
      ]);
    });
  });

  /**
   * Generic argument: any token that could be part of a command.
   */
  parser.genericArg = parser.RULE('genericArg', () => {
    parser.OR([
      { ALT: () => parser.CONSUME(t.Identifier) },
      { ALT: () => parser.CONSUME(t.StringLiteral) },
      { ALT: () => parser.CONSUME(t.NumberLiteral) },
      { ALT: () => parser.CONSUME(t.TimeModifier) },
      { ALT: () => parser.CONSUME(t.Equals) },
      { ALT: () => parser.CONSUME(t.Comma) },
      { ALT: () => parser.CONSUME(t.LParen) },
      { ALT: () => parser.CONSUME(t.RParen) },
      { ALT: () => parser.CONSUME(t.Plus) },
      { ALT: () => parser.CONSUME(t.Minus) },
      { ALT: () => parser.CONSUME(t.Multiply) },
      { ALT: () => parser.CONSUME(t.WildcardField) },
      { ALT: () => parser.CONSUME(t.MacroCall) },
      { ALT: () => parser.CONSUME(t.True) },
      { ALT: () => parser.CONSUME(t.False) },
    ]);
  });
}
