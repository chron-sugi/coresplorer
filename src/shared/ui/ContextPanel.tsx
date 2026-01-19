import React from 'react';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface ContextPanelProps {
    /** Panel title displayed in the header */
    title?: string;
    
    /** Optional subtitle content rendered below the title (e.g., badges, metadata) */
    subtitle?: React.ReactNode;
    
    /** Which side of the screen to position the panel. Defaults to 'right' */
    side?: 'left' | 'right';
    
    /** Whether the panel is collapsed to a narrow state (typically 56px wide) */
    isCollapsed?: boolean;
    
    /** Callback fired when the collapse/expand button is clicked */
    onToggleCollapse?: () => void;
    
    /** Optional content rendered in the header area (e.g., tabs, filters) */
    headerContent?: React.ReactNode;
    
    /** Content displayed when the panel is empty (e.g., "No selection" message) */
    emptyState?: React.ReactNode;
    
    /** Content displayed when panel is collapsed. If not provided, children will be used. */
    collapsedContent?: React.ReactNode;
    
    /** Additional CSS classes to apply to the panel container */
    className?: string;
    
    /** Main content displayed when the panel is expanded */
    children: React.ReactNode;
}

export function ContextPanel({
    title,
    subtitle,
    side = 'right',
    isCollapsed = false,
    onToggleCollapse,
    headerContent,
    emptyState,
    collapsedContent,
    className,
    children
}: ContextPanelProps) {
    const CollapseIcon = side === 'right' ? PanelRightClose : PanelLeftClose;
    const ExpandIcon = side === 'right' ? PanelRightOpen : PanelLeftOpen;
    
    if (isCollapsed) {
        return (
            <div className={cn(
                "w-14 bg-card flex-shrink-0 transition-all duration-300",
                side === 'right' ? 'border-l border-border' : 'border-r border-border',
                className
            )}>
                {collapsedContent ?? (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        className="w-full h-full flex items-center justify-center hover:bg-accent transition-colors"
                        title="Expand panel"
                        aria-label="Expand context panel"
                    >
                        <ExpandIcon className="h-5 w-5 text-muted-foreground" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className={cn(
            "w-80 bg-card flex flex-col flex-shrink-0 transition-all duration-300",
            side === 'right' ? 'border-l border-border' : 'border-r border-border',
            className
        )}>
            {/* Panel Header */}
            <div className="flex flex-col border-b border-border bg-card">
                <div className="flex items-start justify-between p-4 pb-2">
                    <div className="flex-1 min-w-0 mr-2">
                        {title && (
                            <h2 className="text-sm font-bold text-card-foreground truncate" title={title}>
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <div className="mt-1.5">
                                {subtitle}
                            </div>
                        )}
                    </div>
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-1.5 hover:bg-accent rounded transition-colors group flex-shrink-0 mt-0.5"
                            title={`Collapse panel`}
                            aria-label="Collapse context panel"
                        >
                            <CollapseIcon className="h-4 w-4 text-muted-foreground group-hover:text-card-foreground" />
                        </button>
                    )}
                </div>

                {/* Custom header content (e.g., tabs) */}
                {headerContent}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-card">
                {emptyState || children}
            </div>
        </div>
    );
}
