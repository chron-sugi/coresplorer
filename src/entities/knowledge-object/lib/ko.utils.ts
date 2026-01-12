/**
 * Knowledge Object Utilities
 * 
 * Helper functions for working with Knowledge Objects.
 * 
 * @module entities/knowledge-object/lib/ko.utils
 */

/**
 * Check if a node type typically has SPL code.
 * Some types (lookups, data_models, indexes) don't have SPL.
 * 
 * @param type - Knowledge object type string
 * @returns true if the type typically contains SPL
 */
export const nodeHasSpl = (type: string): boolean => {
    const noSplTypes = ['data_model', 'lookup', 'index'];
    return !noSplTypes.includes(type.toLowerCase());
};
