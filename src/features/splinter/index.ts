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
} from './splinter.variants';
