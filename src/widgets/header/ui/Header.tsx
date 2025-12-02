import { Bell, Database, Network, Code } from "lucide-react";
/**
 * Header Widget
 *
 * Top-level application header used across pages. Contains navigation and
 * global actions. Composes shared UI components and entity UI.
 *
 * @module widgets/header/ui
 */
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { SnapshotFreshnessBadge } from "@/entities/snapshot";
import { cn } from "@/shared/lib/utils";

/**
 * Props for the Header component
 */
interface HeaderProps {
    searchComponent?: React.ReactNode;
}

/**
 * Application header component
 *
 * Top-level navigation bar with route links, snapshot freshness indicator,
 * and optional search component slot. Highlights the active route and provides
 * consistent navigation across all pages.
 *
 * @param props - Component props
 * @param props.searchComponent - Optional search component to render in header
 * @returns Rendered application header
 */
export function Header({ searchComponent }: HeaderProps): React.JSX.Element {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const getNavButtonClass = (path: string) => {
        return cn(
            "h-8 px-3",
            isActive(path)
                ? "text-sky-400 bg-sky-950/50 hover:bg-sky-900/50 hover:text-sky-300"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur">
            <div className="flex flex-col">
                {/* Top Tier: Logo, Search, Actions */}
                <div className="relative flex h-14 items-center border-b border-slate-800/50 px-4">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <a className="flex items-center space-x-2" href="/">
                            <span className="font-bold text-slate-100">
                                CoreSplorer
                            </span>
                        </a>
                    </div>
                    
                    {/* Center: Search (offset to center over canvas, accounting for 320px left panel) */}
                    {searchComponent && (
                        <div className="absolute inset-x-0 flex justify-center pointer-events-none pl-80">
                            <div className="pointer-events-auto">
                                {searchComponent}
                            </div>
                        </div>
                    )}
                    
                    {/* Right: Actions */}
                    <div className="ml-auto flex items-center space-x-2">
                        <SnapshotFreshnessBadge />
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 hover:bg-slate-800">
                            <Bell className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Bottom Tier: Navigation */}
                <div className="container flex h-10 items-center">
                    <nav className="flex items-center space-x-1 text-sm font-medium">
                        <Button variant="ghost" size="sm" className={getNavButtonClass('/')} asChild>
                            <Link to="/">
                                <Database className="mr-2 h-4 w-4" />
                                Knowledge Objects
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className={getNavButtonClass('/diagram')} asChild>
                            <Link to="/diagram">
                                <Network className="mr-2 h-4 w-4" />
                                Dependency Map
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" className={getNavButtonClass('/splinter')} asChild>
                            <Link to="/splinter">
                                <Code className="mr-2 h-4 w-4" />
                                SPLinter
                            </Link>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
