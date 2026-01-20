/**
 * IconRail component for collapsed context panel state.
 * Shows minimal icons and expand button.
 */

import { PanelLeftOpen, Filter, Info } from 'lucide-react';

interface IconRailProps {
    onExpand: () => void;
}

export function IconRail({ onExpand }: IconRailProps) {
    return (
        <div className="flex flex-col items-center py-4 gap-4 h-full">
            {/* Expand Button */}
            <button
                onClick={onExpand}
                className="p-2 hover:bg-accent rounded-lg transition-colors group"
                title="Expand panel"
                aria-label="Expand context panel"
            >
                <PanelLeftOpen className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            </button>

            <div className="w-px h-8 bg-border" />

            {/* Icon Indicators */}
            <div className="flex flex-col gap-3 opacity-50">
                <Filter className="h-4 w-4 text-muted-foreground" aria-label="Filters" />
                <Info className="h-4 w-4 text-muted-foreground" aria-label="Details" />
            </div>
        </div>
    );
}
