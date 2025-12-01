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
      },
      edge: {
        default: '#64748b',
        highlighted: '#64748b',
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
  },
  layout: {
    edgeWidth: {
      default: 1.5,
      highlighted: 2.5,
    },
  },
} as const;
