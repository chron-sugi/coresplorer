/**
 * Command Patterns Index
 *
 * Aggregates all command pattern modules for use by the registry.
 *
 * @module entities/spl/lib/parser/patterns/commands
 */

// Re-export all command modules
export * from './aggregation';
export * from './field-creators';
export * from './field-modifiers';
export * from './filters';
export * from './pipeline';
export * from './results';
export * from './generators';
export * from './metrics';
export * from './output';

// Selectively export unique commands from misc.ts (avoiding duplicates with other modules)
export {
  accumCommand,
  autoregressCommand,
  deltaCommand,
  gaugeCommand,
  geomCommand,
  geomfilterCommand,
  highlightCommand,
  historyCommand,
  iconifyCommand,
  kmeansCommand,
  kvformCommand,
  loadjobCommand,
  localizeCommand,
  localopCommand,
  makecontinuousCommand,
  metasearchCommand,
  multikvCommand,
  nomvCommand,
  outlierCommand,
  pivotCommand,
  predictCommand,
  reltimeCommand,
  restCommand,
  rtorderCommand,
  savedsearchCommand,
  scriptCommand,
  scrubCommand,
  searchtxnCommand,
  setfieldsCommand,
  sichartCommand,
  sirareCommand,
  sistatsCommand,
  sitimechartCommand,
  sitopCommand,
  tagsCommand,
  trendlineCommand,
  typeaheadCommand,
  uniqCommand,
  abstractCommand,
  addcoltotalsCommand,
  addinfoCommand,
  analyzefieldsCommand,
  anomaliesCommand,
  anomalousvalueCommand,
  anomalydetectionCommand,
  arulesCommand,
  associateCommand,
  auditCommand,
  bucketdirCommand,
  clusterCommand,
  cofilterCommand,
  concurrencyCommand,
  contingencyCommand,
  correlateCommand,
  datamodelCommand,
  dbinspectCommand,
  deleteCommand,
  diffCommand,
  eventcountCommand,
  fieldformatCommand,
  fieldsummaryCommand,
  findtypesCommand,
  folderizeCommand,
  fromCommand,
  outputtextCommand,
  overlapCommand,
  timewrapCommand,
  tscollectCommand,
  typelearnerCommand,
  typerCommand,
  walklexCommand,
  x11Command,
  xmlunescapeCommand,
} from './misc';

// Import aggregated command objects
import { aggregationCommands } from './aggregation';
import { fieldCreatorCommands } from './field-creators';
import { fieldModifierCommands } from './field-modifiers';
import { filterCommands } from './filters';
import { pipelineCommands } from './pipeline';
import { resultsCommands } from './results';
import { generatorCommands } from './generators';
import { metricsCommands } from './metrics';
import { outputCommands } from './output';
import { miscCommands } from './misc';

/**
 * All command patterns combined from all modules
 *
 * This object contains all command patterns organized by command name.
 * It's used by the registry to provide command lookups.
 */
export const allCommands = {
  ...aggregationCommands,
  ...fieldCreatorCommands,
  ...fieldModifierCommands,
  ...filterCommands,
  ...pipelineCommands,
  ...resultsCommands,
  ...generatorCommands,
  ...metricsCommands,
  ...outputCommands,
  ...miscCommands,
} as const;

/**
 * Command count by module for tracking coverage
 */
export const commandModuleCounts = {
  aggregation: Object.keys(aggregationCommands).length,
  fieldCreators: Object.keys(fieldCreatorCommands).length,
  fieldModifiers: Object.keys(fieldModifierCommands).length,
  filters: Object.keys(filterCommands).length,
  pipeline: Object.keys(pipelineCommands).length,
  results: Object.keys(resultsCommands).length,
  generators: Object.keys(generatorCommands).length,
  metrics: Object.keys(metricsCommands).length,
  output: Object.keys(outputCommands).length,
  misc: Object.keys(miscCommands).length,
  total: Object.keys(allCommands).length,
} as const;
