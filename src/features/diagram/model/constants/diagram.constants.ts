/**
 * Diagram feature constants
 *
 * Centralized sizing, spacing and zoom constants used across the
 * diagram components and layout helpers.
 */
import { SPLUNK_KO_TYPES, SPLUNK_KO_ICONS } from '@/entities/knowledge-object';

export const NODE_TYPES = Object.values(SPLUNK_KO_TYPES);
export const TYPE_ICONS = SPLUNK_KO_ICONS;

export const DIAGRAM_LAYOUT = {
  /** Estimated node width for layout calculations (actual width auto-fits to label) */
  NODE_WIDTH: 180,
  /** Base node height (single-line pill) */
  NODE_HEIGHT: 32,
  /** Estimated core node width for layout */
  NODE_WIDTH_CORE: 200,
  /** Core node height */
  NODE_HEIGHT_CORE: 36,
  /** Horizontal spacing between sibling nodes */
  NODE_SEPARATION: 60,
  /** Vertical spacing between ranks/levels */
  RANK_SEPARATION: 50,
} as const;

export const DIAGRAM_ZOOM = {
    MIN: 0.1,
    MAX: 2.0,
    FIT_VIEW: {
        PADDING: 2,
        MIN: 0.5,
        MAX: 1.5,
        DURATION_MS: 800,
    },
} as const;

export const DIAGRAM_BACKGROUND = {
    GAP: 20,
    SIZE: 1,
    COLOR: '#cbd5e1',
    OPACITY: 0.3,
} as const;
