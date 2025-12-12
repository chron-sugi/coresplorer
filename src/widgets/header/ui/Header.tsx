import { Database, Network, Code } from "lucide-react";
/**
 * Header Widget
 *
 * Top-level application header used across pages. Contains navigation and
 * global actions. Composes shared UI components and entity UI.
 *
 * @module widgets/header/ui
 */
import { Link, useLocation } from "react-router-dom";
import { SnapshotFreshnessBadge } from "./SnapshotFreshnessBadge";
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

    const getNavLinkClass = (path: string) => {
        const active = isActive(path);
        return cn(
            "relative flex items-center px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-md group",
            active 
                ? "text-sky-400 bg-sky-500/10" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
            <div className="flex h-16 items-center px-4 gap-4">
                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-6 flex-shrink-0">
                    <a className="flex items-center gap-2 group" href="/">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/30 transition-all duration-300">
                            <Database className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-100 group-hover:text-white transition-colors">
                            CoreSplorer
                        </span>
                    </a>

                    <nav className="hidden md:flex items-center gap-1">
                        <Link to="/" className={getNavLinkClass('/')}>
                            <Database className="mr-2 h-4 w-4 opacity-70" />
                            Knowledge Objects
                        </Link>
                        <Link to="/diagram" className={getNavLinkClass('/diagram')}>
                            <Network className="mr-2 h-4 w-4 opacity-70" />
                            Dependency Map
                        </Link>
                        <Link to="/splinter" className={getNavLinkClass('/splinter')}>
                            <Code className="mr-2 h-4 w-4 opacity-70" />
                            Search Analysis
                        </Link>
                    </nav>
                </div>
                
                {/* Center: Search */}
                <div className="flex-1 flex justify-center max-w-2xl mx-auto px-4">
                    {searchComponent && (
                        <div className="w-full max-w-lg transition-all duration-300 focus-within:max-w-xl">
                            {searchComponent}
                        </div>
                    )}
                </div>
                
                {/* Right: Actions */}
                <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    <SnapshotFreshnessBadge />


                </div>
            </div>
        </header>
    );
}
