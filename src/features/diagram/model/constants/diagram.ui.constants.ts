/**
 * UI constants for the diagram feature
 *
 * Timing, dimension and opacity constants used across diagram components
 * to keep UI behaviour and spacing consistent.
 * 
 * @module features/diagram/diagram.ui.constants
 */
export const UI_TIMING = {
  COPY_FEEDBACK_MS: 2000,
  SCROLL_DELAY_MS: 100,
  HIGHLIGHT_FADE_MS: 1500,
  ANIMATION_DURATION_MS: 800,
  RELOAD_DELAY_MS: 0,
  /** Duration for fit/focus animations in ms */
  FIT_ANIMATION_MS: 500,
} as const;

export const UI_DIMENSIONS = {
  MINIMAP: {
    WIDTH: '100px',
    HEIGHT: '75px',
  },
  CODE_BLOCK: {
    MIN_HEIGHT_PX: 120,
  },
  /** Vertical offset to position toolbar above node center */
  NODE_TOOLBAR_OFFSET_Y: 20,
} as const;

export const VIS_NETWORK_SETTINGS = {
  /** Number of iterations for physics stabilization */
  STABILIZATION_ITERATIONS: 1000,
} as const;

export const UI_OPACITY = {
  DIMMED: 0.2,
  FULL: 1.0,
} as const;
