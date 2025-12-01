/**
 * Keyboard shortcut constants for the diagram feature
 *
 * Central source of keyboard shortcut keys and modifiers used in the diagram.
 * 
 * @module features/diagram/diagram.keyboard.constants
 */
export const KEYBOARD_SHORTCUTS = {
  SEARCH: {
    KEY: 'f',
    MODIFIER: 'ctrlOrMeta', // Logic to handle this will be in the component
  },
  CLOSE: {
    KEY: 'Escape',
  },
  COMMAND_PALETTE: {
    KEY: 'k',
    MODIFIER: 'ctrlOrMeta',
  },
} as const;
