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
} as const;

export const UI_DIMENSIONS = {
  MINIMAP: {
    WIDTH: '100px',
    HEIGHT: '75px',
  },
  CODE_BLOCK: {
    MIN_HEIGHT_PX: 120,
  },
} as const;

export const UI_OPACITY = {
  DIMMED: 0.2,
  FULL: 1.0,
} as const;
