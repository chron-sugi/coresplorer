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
  color: string;
}

// =============================================================================
// CONSOLIDATED CONFIG
// =============================================================================

/**
 * Single source of truth for all KO type metadata.
 * Add new types here - labels, icons, and colors are all in one place.
 */
export const KO_TYPE_CONFIG: Record<SplunkKoType, KoTypeConfig> = {
  // DASHBOARD: Blue - The presentation layer, the interface users actually see—cool, polished, "finished"
  dashboard: {
    label: 'Dashboard',
    icon: LayoutDashboard,
    badgeClasses: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    color: '#3b82f6',
  },
  // SAVED_SEARCH: Orange - Active, energetic—the workhorse doing the actual querying
  saved_search: {
    label: 'Saved Search',
    icon: Search,
    badgeClasses: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    color: '#f97316',
  },
  // MACRO: Purple/violet - Abstraction, reusability, the "magic" that expands into more code
  macro: {
    label: 'Macro',
    icon: FileText,
    badgeClasses: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    color: '#a855f7',
  },
  // EVENT_TYPE: Green - Classification and tagging—green has that "categorical" feel
  event_type: {
    label: 'Event Type',
    icon: Activity,
    badgeClasses: 'bg-green-500/10 text-green-400 border-green-500/20',
    color: '#22c55e',
  },
  // LOOKUP_DEF: Warm yellow - Lighter sibling to lookup files—it's the schema/pointer
  lookup_def: {
    label: 'Lookup Def',
    icon: Table,
    badgeClasses: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    color: '#eab308',
  },
  // LOOKUP_FILE: Amber/gold - Data resources, the "treasure" you're enriching with
  lookup_file: {
    label: 'Lookup File',
    icon: Table,
    badgeClasses: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    color: '#f59e0b',
  },
  // DATA_MODEL: Cyan/teal - Structural, architectural—blueprint energy
  data_model: {
    label: 'Data Model',
    icon: Database,
    badgeClasses: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    color: '#06b6d4',
  },
  // INDEX: Slate gray - The bedrock—foundational, grounded, where everything ultimately lives
  index: {
    label: 'Index',
    icon: Box,
    badgeClasses: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    color: '#64748b',
  },
};

/** Fallback config for unknown types */
const UNKNOWN_CONFIG: KoTypeConfig = {
  label: 'Unknown',
  icon: HelpCircle,
  badgeClasses: 'bg-slate-700 text-slate-300 border-slate-600',
  color: '#cbd5e1',
};

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

/**
 * Get the hex color for a knowledge object type.
 * Use for programmatic styling (canvas, SVG, inline styles).
 */
export function getKoColor(type: string): string {
  return getKoConfig(type).color;
}

// isValidKoType is re-exported from @/shared/lib above
