/**
 * KO Explorer Feature Constants
 *
 * Styling and UI text constants used by the KO Explorer feature.
 *
 * @module features/ko-explorer/model/constants/ko-explorer.constants
 */

// KO Type styling (referenced from theme config)
export const KO_TYPE_STYLES = {
    saved_search: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    lookup: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    macro: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    data_model: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    index: 'bg-red-500/20 text-red-300 border-red-500/30',
    dashboard: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    event_type: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
} as const;

// UI text constants
export const UI_TEXT = {
    SEARCH_PLACEHOLDER: 'Search by name, ID, app, owner…',
    LOADING_MESSAGE: 'Loading knowledge objects...',
    NO_RESULTS: 'No results found',
    CLEAR_FILTERS: 'Clear filters',
} as const;
