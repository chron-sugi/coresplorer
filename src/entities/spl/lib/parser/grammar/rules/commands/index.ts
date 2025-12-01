/**
 * Command Rules Index
 * 
 * Aggregates all command rule mixins.
 * 
 * @module entities/spl/lib/parser/grammar/rules/commands
 */

import type { SPLParser } from '../../types';
import { applyFieldCreatorCommands } from './field-creators';
import { applyFieldFilterCommands } from './field-filters';
import { applySplitterCommands } from './splitters';
import { applyStructuralCommands } from './structural';
import { applyGenericCommands } from './generic';

export function applyCommandRules(parser: SPLParser): void {
  applyFieldCreatorCommands(parser);
  applyFieldFilterCommands(parser);
  applySplitterCommands(parser);
  applyStructuralCommands(parser);
  applyGenericCommands(parser);
}

export {
  applyFieldCreatorCommands,
  applyFieldFilterCommands,
  applySplitterCommands,
  applyStructuralCommands,
  applyGenericCommands,
};
