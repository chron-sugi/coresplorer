/**
 * Splinter Feature (SPL Inspector)
 * 
 * Provides SPL inspection, analysis, and linting capabilities.
 * 
 * @module features/splinter
 */

// Stores
export { useInspectorStore } from './model/store/splinter.store';
export { useSchemaStore } from './model/store/schema.store';

// Hooks
export { useKnowledgeObjectInspector, type InspectorObjectDetails } from './model/hooks/useKnowledgeObjectInspector';
export { useSPLinterPage, type SPLinterTab, type UseSPLinterPageReturn } from './model/useSPLinterPage';

// Schemas & Types
export type { SplAnalysis, FoldRange, MockField, LinterWarning, LinterSeverity } from './model/splinter.schemas';

// Constants (re-export common ones for external use)
export { SCHEMA_TYPES, EDITOR_LAYOUT, ANALYSIS_CONFIG } from './model/constants/splinter.constants';

// Variants
export {
  tabVariants,
  badgeVariants,
  warningCardVariants,
  warningBadgeVariants,
  warningTextVariants,
  linterWarningButtonVariants,
  editorContainerVariants,
  searchInputVariants,
  searchSuggestionVariants,
  dropdownVariants,
} from './ui/splinter.variants';

// UI Components for page consumption
export { SplStatsPanel } from './ui/panels/SplStatsPanel';
export { SplAnalysisPanel } from './ui/panels/SplAnalysisPanel';
export { SubsearchPanel } from './ui/tools/StructurePanel/SubsearchPanel';
export { PerfLinterPanel } from './ui/tools/PerfLinter/PerfLinterPanel';
