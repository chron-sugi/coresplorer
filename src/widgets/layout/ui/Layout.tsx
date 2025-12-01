/**
 * Application Layout Widget
 *
 * Wraps page content with header, navigation and global chrome.
 * Provides the main application structure used by all pages.
 *
 * @module widgets/layout/ui
 */
import { Header } from "@/widgets/header";
import { cn } from "@/shared/lib/utils";

/**
 * Props for the Layout component
 */
interface LayoutProps {
    children: React.ReactNode;
    leftPanel?: React.ReactNode;
    searchComponent?: React.ReactNode;
}

/**
 * Application layout wrapper
 *
 * Provides consistent page structure with header, optional left sidebar panel,
 * and main content area. Handles responsive layout and proper overflow behavior.
 *
 * @param props - Component props
 * @param props.children - Main page content
 * @param props.leftPanel - Optional left sidebar panel (e.g., context panel)
 * @param props.searchComponent - Optional search component for header
 * @returns Rendered layout with header and content areas
 */
export function Layout({ children, leftPanel, searchComponent }: LayoutProps): React.JSX.Element {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
            <Header searchComponent={searchComponent} />
            <div className="flex flex-1 overflow-hidden">
                {leftPanel}
                <main className={cn("flex-1 bg-slate-950 overflow-auto", leftPanel && "p-6")}>
                    {children}
                </main>
            </div>
        </div>
    );
}
