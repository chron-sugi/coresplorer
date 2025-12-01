/**
 * Editor Layout Configuration
 * 
 * Single source of truth for the SPL Static Editor's geometry.
 * These values are used by both the textarea (input) and the highlighter (output)
 * to ensure perfect alignment.
 * 
 * @module widgets/spl-static-editor/config/editor-layout.config
 */

export const editorLayout = {
    // Typography
    FONT_SIZE_PX: 14,
    LINE_HEIGHT_PX: 21, // 1.5 * 14px
    
    // We assume a standard monospace character width for 14px font.
    // Measured as ~7.7px (Consolas/Monaco) in browser.
    CHAR_WIDTH_PX: 7.7, 

    // Box Model
    PADDING_X_PX: 16, // 1rem
    PADDING_Y_PX: 16, // 1rem
    
    // Gutter (Line Numbers)
    // Adjusted to 16px (total 32px) to match visual alignment
    GUTTER_WIDTH_PX: 16, 
    
    get TOTAL_LEFT_PADDING_PX() {
        return this.PADDING_X_PX + this.GUTTER_WIDTH_PX;
    }
} as const;
