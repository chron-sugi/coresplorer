/**
 * Compressed filter section for the unified context panel.
 * Displays object type filters in a compact layout.
 */

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useDiagramStore } from '../../model/store/diagram.store';
import { NODE_TYPES, getTypeIcon } from '../../model/constants/diagram.constants';

export function NodeFilterSection() {
    const hiddenTypes = useDiagramStore(state => state.hiddenTypes);
    const toggleHiddenType = useDiagramStore(state => state.toggleHiddenType);

    return (
        <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider px-2">
                Object Types
            </h3>
            <div className="space-y-0.5">
                {NODE_TYPES.map((type) => {
                    const Icon = getTypeIcon(type);
                    const isHidden = hiddenTypes.has(type);

                    return (
                        <button
                            key={type}
                            onClick={() => toggleHiddenType(type)}
                            className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded",
                                "hover:bg-slate-800 text-slate-300 hover:text-slate-100",
                                "transition-all duration-200",
                                isHidden && "opacity-40 line-through"
                            )}
                        >
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="flex-1 text-left">{type}</span>
                            {isHidden ? (
                                <EyeOff className="h-3 w-3 text-slate-500 flex-shrink-0" />
                            ) : (
                                <Eye className="h-3 w-3 text-sky-400 flex-shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

