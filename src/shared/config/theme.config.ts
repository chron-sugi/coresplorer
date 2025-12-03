/**
 * Theme configuration
 *
 * Centralized color and layout token definitions used across the UI
 * components. Keeping these values in a single module ensures
 * consistency and makes it easy to adjust the visual design system.
 *
 * @module shared/config/theme.config
 */
export const themeConfig = {
  colors: {
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    semantic: {
      codeEditor: {
        background: '#2d2d2d',
        highlightWeak: 'rgba(14, 165, 233, 0.15)',
        highlightStrong: 'rgba(14, 165, 233, 0.3)',
      },
      node: {
        defaultBackground: '#ffffff',
        defaultBorder: '#cbd5e1',
        fallbackColor: '#94a3b8',
        /** Core node background (sky-100) */
        coreBackground: '#dbeafe',
        /** Highlighted node background (sky-100) */
        highlightedBackground: '#dbeafe',
        /** Focused node background (amber-100) */
        focusedBackground: '#fef3c7',
        /** Focused node border (amber-500) */
        focusedBorder: '#f59e0b',
        /** Hover background (slate-100) */
        hoverBackground: '#f1f5f9',
        /** Highlight hover (sky-200) */
        highlightHover: '#bfdbfe',
        /** Dimmed background (slate-50) */
        dimmedBackground: '#f8fafc',
        /** Dimmed border (slate-200) */
        dimmedBorder: '#e2e8f0',
        /** Dimmed text (slate-400) */
        dimmedText: '#94a3b8',
      },
      edge: {
        default: '#64748b',
        highlighted: '#3b82f6',
        /** Dimmed edge color (slate-300) */
        dimmed: '#cbd5e1',
      },
    },
    koTypes: {
      dashboard: '#ec4899',
      saved_search: '#0ea5e9',
      macro: '#f59e0b',
      event_type: '#a855f7',
      lookup: '#f97316',
      data_model: '#10b981',
      index: '#64748b',
      unknown: '#cbd5e1',
    },
    /**
     * Field event colors for lineage visualization.
     * Used for both text badges and editor highlighting.
     */
    fieldEvents: {
      origin: '#94a3b8',      // slate-400
      created: '#34d399',     // emerald-400
      modified: '#fbbf24',    // amber-400
      renamed: '#60a5fa',     // blue-400
      consumed: '#22d3ee',    // cyan-400
      dropped: '#f87171',     // red-400
    },
  },
  layout: {
    edgeWidth: {
      default: 1.5,
      highlighted: 2.5,
    },
  },
} as const;

/**
 * Field event Tailwind classes for consistent styling across components.
 * Text colors for badges, highlight classes for editor lines.
 */
export const fieldEventStyles = {
  /** Text colors for badges and labels */
  text: {
    origin: 'text-slate-400',
    created: 'text-emerald-400',
    modified: 'text-amber-400',
    renamed: 'text-blue-400',
    consumed: 'text-cyan-400',
    dropped: 'text-red-400',
  },
  /** Solid background colors for indicators */
  bg: {
    origin: 'bg-slate-400',
    created: 'bg-emerald-400',
    modified: 'bg-amber-400',
    renamed: 'bg-blue-400',
    consumed: 'bg-cyan-400',
    dropped: 'bg-red-400',
  },
  /** Background highlight classes for editor lines */
  highlight: {
    origin: 'bg-slate-500/20 border-l-2 border-slate-400',
    created: 'bg-emerald-500/20 border-l-2 border-emerald-400',
    modified: 'bg-amber-500/20 border-l-2 border-amber-400',
    renamed: 'bg-blue-500/20 border-l-2 border-blue-400',
    consumed: 'bg-cyan-500/20 border-l-2 border-cyan-400',
    dropped: 'bg-red-500/20 border-l-2 border-red-400',
  },
  /** Labels for event kinds */
  labels: {
    origin: 'Implicit field',
    created: 'Created',
    modified: 'Modified',
    renamed: 'Renamed',
    consumed: 'Used',
    dropped: 'Dropped',
  },
} as const;

export type FieldEventKind = keyof typeof fieldEventStyles.text;
