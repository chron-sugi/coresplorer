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
import { applyExtractionCommands } from './extraction';
import { applyStatisticalCommands } from './statistical';
import { applySystemCommands } from './system';
import { applyGenericCommands } from './generic';
import { applyNeededCommands } from './needed';
import { applyFieldAffectingCommands } from './field-affecting';

export function applyCommandRules(parser: SPLParser): void {
  applyFieldCreatorCommands(parser);
  applyFieldFilterCommands(parser);
  applySplitterCommands(parser);
  applyStructuralCommands(parser);
  applyExtractionCommands(parser);
  applyStatisticalCommands(parser);
  applySystemCommands(parser);
  applyNeededCommands(parser);
  applyFieldAffectingCommands(parser);
  applyGenericCommands(parser);
}

export {
  applyFieldCreatorCommands,
  applyFieldFilterCommands,
  applySplitterCommands,
  applyStructuralCommands,
  applyExtractionCommands,
  applyStatisticalCommands,
  applySystemCommands,
  applyGenericCommands,
  applyNeededCommands,
  applyFieldAffectingCommands,
};
