/**
 * Editor Configuration
 * 
 * Shared layout constants for code editors and code blocks to ensure
 * consistent visual alignment and coordinate calculations.
 * 
 * @module shared/config/editor.config
 */

export const editorConfig = {
    // Font metrics for text-sm (14px)
    FONT_SIZE: 14,
    LINE_HEIGHT: 21, // 1.5 * 14px
    CHAR_WIDTH: 8.4, // Standard monospace width for 14px (approximate, depends on font)

    // Spacing
    PADDING_X: 16, // Matches p-4 (1rem)
    PADDING_Y: 16, // Matches p-4 (1rem)
    
    // Gutter
    GUTTER_WIDTH: 48, // Matches pl-16 (4rem = 64px) - PADDING_X (16px) = 48px? 
                      // Wait, pl-16 is 4rem = 64px total padding left.
                      // If PADDING_X is 16, then GUTTER_WIDTH should be the difference?
                      // Let's define TOTAL_LEFT_PADDING_WITH_GUTTER for clarity.
    
    // Computed totals
    get TOTAL_LEFT_PADDING() {
        return 64; // pl-16 = 4rem = 64px
    }
} as const;
