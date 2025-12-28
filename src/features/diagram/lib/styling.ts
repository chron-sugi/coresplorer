/**
 * Styling helpers for diagram visuals
 *
 * Contains small pure utilities for deriving colors and class names used
 * by diagram components and tests.
 */
import { getKoColor } from '@/entities/knowledge-object';
import { DIAGRAM_LAYOUT } from '../model/constants/diagram.constants';

/**
 * Generates React Flow node styling based on type and core status
 *
 * Returns a style object with appropriate colors, dimensions, and visual
 * properties for diagram nodes. Core nodes receive enhanced styling with
 * larger dimensions, bold borders, and shadow effects.
 *
 * @param type - Knowledge object type (saved_search, lookup, macro, etc.)
 * @param isCore - Whether this is the core/focus node
 * @returns Style object for React Flow node
 */
export const getNodeStyle = (type: string, isCore = false) => {
    const color = getKoColor(type);

    if (isCore) {
        return {
            background: '#fff',
            border: `3px solid ${color}`,
            borderRadius: '8px',
            fontWeight: 'bold',
            color: '#1e293b',
            width: DIAGRAM_LAYOUT.NODE_WIDTH_CORE,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        };
    }

    return {
        background: color,
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        width: DIAGRAM_LAYOUT.NODE_WIDTH,
        fontSize: '12px',
    };
};
