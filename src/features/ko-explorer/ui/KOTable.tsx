import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { KnowledgeObject } from '@/entities/knowledge-object';
import type { SortColumn, SortDirection } from '../model/ko-explorer.types';
import { UI_TEXT } from '../model/constants/ko-explorer.constants';
import { getKoBadgeClasses, getKoLabel } from '@/entities/knowledge-object';

/**
 * Props for the KOTable component
 */
interface KOTableProps {
    kos: KnowledgeObject[];
    loading: boolean;
    error: string | null;
    sortBy: SortColumn;
    sortDirection: SortDirection;
    onSort: (column: SortColumn) => void;
}

// Constants imported from ko-explorer.constants.ts

/**
 * Props for the SortIcon component
 */
interface SortIconProps {
    column: SortColumn;
    sortBy: SortColumn;
    sortDirection: 'asc' | 'desc';
}

/**
 * Sort direction indicator icon
 * 
 * Displays an arrow icon (up/down) next to the currently sorted column header.
 * Only renders when the column matches the active sort column.
 * 
 * @param props - Component props
 * @param props.column - Column identifier
 * @param props.sortBy - Currently sorted column
 * @param props.sortDirection - Current sort direction
 * @returns Arrow icon or null
 */
const SortIcon = ({ column, sortBy, sortDirection }: SortIconProps) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? 
        <ArrowUp className="h-3 w-3 inline ml-1" /> : 
        <ArrowDown className="h-3 w-3 inline ml-1" />;
};

/**
 * Knowledge Objects table component
 *
 * Displays a sortable, interactive table of Knowledge Objects with columns for
 * name, type, app, and owner. Supports click-to-navigate to detail pages.
 * Handles loading and error states.
 * 
 * @param props - Component props
 * @param props.kos - Array of knowledge objects to display
 * @param props.loading - Loading state indicator
 * @param props.error - Error message if fetch failed
 * @param props.sortBy - Current sort column
 * @param props.sortDirection - Current sort direction
 * @param props.onSort - Callback for sort column changes
 * @returns Rendered KO table with sortable columns
 */
export function KOTable({ kos, loading, error, sortBy, sortDirection, onSort }: KOTableProps): React.JSX.Element {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <div className="text-slate-400 text-sm">{UI_TEXT.LOADING_MESSAGE}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
                <div className="text-red-400 text-sm">{error}</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-800/50 border-b border-slate-800">
                <button onClick={() => onSort('name')} className="col-span-2 text-left text-sm font-bold text-slate-300 uppercase tracking-wider hover:text-slate-100">
                    Name <SortIcon column="name" sortBy={sortBy} sortDirection={sortDirection} />
                </button>
                <button onClick={() => onSort('type')} className="text-left text-sm font-bold text-slate-300 uppercase tracking-wider hover:text-slate-100">
                    Type <SortIcon column="type" sortBy={sortBy} sortDirection={sortDirection} />
                </button>
                <button onClick={() => onSort('app')} className="text-left text-sm font-bold text-slate-300 uppercase tracking-wider hover:text-slate-100">
                    App <SortIcon column="app" sortBy={sortBy} sortDirection={sortDirection} />
                </button>
                <button onClick={() => onSort('owner')} className="text-left text-sm font-bold text-slate-300 uppercase tracking-wider hover:text-slate-100">
                    Owner <SortIcon column="owner" sortBy={sortBy} sortDirection={sortDirection} />
                </button>
            </div>

            {/* Table rows */}
            {kos.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                    {UI_TEXT.NO_RESULTS}
                </div>
            ) : (
                kos.map((ko) => (
                    <div 
                        key={ko.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/diagram/${ko.id}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/diagram/${ko.id}`); }}
                        className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                        <div className="col-span-2 text-sm text-slate-100 font-medium truncate">{ko.name}</div>
                        <div>
                            <span className={getKoBadgeClasses(ko.type)}>
                                {getKoLabel(ko.type)}
                            </span>
                        </div>
                        <div className="text-sm text-slate-300 truncate">{ko.app}</div>
                        <div className="text-sm text-slate-400 truncate">{ko.owner}</div>
                    </div>
                ))
            )}
        </div>
    );
}
