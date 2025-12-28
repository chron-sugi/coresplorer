/**
 * Knowledge Object Model
 *
 * Consolidated labels, icons, and styling for Splunk knowledge object types.
 * Core type definitions are re-exported from @/shared/lib for FSD compliance.
 *
 * @module entities/knowledge-object/model/knowledge-object
 */
import {
  LayoutDashboard,
  Search,
  Database,
  FileText,
  Table,
  Box,
  Activity,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

// Re-export core types from shared layer (FSD compliance)
export { SPLUNK_KO_TYPES, isValidKoType, type SplunkKoType } from '@/shared/lib';
import { type SplunkKoType, isValidKoType } from '@/shared/lib';

// =============================================================================
// ENTITY-SPECIFIC CONFIG
// =============================================================================

/**
 * Configuration for a single knowledge object type.
 */
interface KoTypeConfig {
  label: string;
  icon: LucideIcon;
  badgeClasses: string;
}

// =============================================================================
// CONSOLIDATED CONFIG
// =============================================================================

/**
 * Single source of truth for all KO type metadata.
 * Add new types here - labels, icons, and colors are all in one place.
 */
export const KO_TYPE_CONFIG: Record<SplunkKoType, KoTypeConfig> = {
  dashboard: {
    label: 'Dashboard',
    icon: LayoutDashboard,
    badgeClasses: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  saved_search: {
    label: 'Saved Search',
    icon: Search,
    badgeClasses: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  macro: {
    label: 'Macro',
    icon: FileText,
    badgeClasses: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  event_type: {
    label: 'Event Type',
    icon: Activity,
    badgeClasses: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  lookup_def: {
    label: 'Lookup Def',
    icon: Table,
    badgeClasses: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  lookup_file: {
    label: 'Lookup File',
    icon: Table,
    badgeClasses: 'bg-purple-500/30 text-purple-200 border-purple-500/50',
  },
  data_model: {
    label: 'Data Model',
    icon: Database,
    badgeClasses: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  index: {
    label: 'Index',
    icon: Box,
    badgeClasses: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
};

/** Fallback config for unknown types */
const UNKNOWN_CONFIG: KoTypeConfig = {
  label: 'Unknown',
  icon: HelpCircle,
  badgeClasses: 'bg-slate-700 text-slate-300 border-slate-600',
};

// =============================================================================
// DERIVED EXPORTS (backward compatibility)
// =============================================================================

/**
 * Human-readable labels for knowledge object types.
 * @deprecated Use KO_TYPE_CONFIG[type].label or getKoLabel() instead
 */
export const SPLUNK_KO_LABELS: Record<SplunkKoType, string> = Object.fromEntries(
  Object.entries(KO_TYPE_CONFIG).map(([key, config]) => [key, config.label])
) as Record<SplunkKoType, string>;

/**
 * Lucide icon components for knowledge object types.
 * @deprecated Use KO_TYPE_CONFIG[type].icon or getKoIcon() instead
 */
export const SPLUNK_KO_ICONS: Record<SplunkKoType, LucideIcon> = Object.fromEntries(
  Object.entries(KO_TYPE_CONFIG).map(([key, config]) => [key, config.icon])
) as Record<SplunkKoType, LucideIcon>;

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get the full config for a knowledge object type.
 */
export function getKoConfig(type: string): KoTypeConfig {
  return isValidKoType(type) ? KO_TYPE_CONFIG[type] : UNKNOWN_CONFIG;
}

/**
 * Get the label for a knowledge object type.
 */
export function getKoLabel(type: string): string {
  return getKoConfig(type).label;
}

/**
 * Get the icon for a knowledge object type.
 */
export function getKoIcon(type: string): LucideIcon {
  return getKoConfig(type).icon;
}

/**
 * Get the badge CSS classes for a knowledge object type.
 * Base classes for badge styling are included.
 */
export function getKoBadgeClasses(type: string): string {
  const baseClasses = 'inline-block px-2 py-0.5 text-xs rounded-md border';
  return `${baseClasses} ${getKoConfig(type).badgeClasses}`;
}

// isValidKoType is re-exported from @/shared/lib above
