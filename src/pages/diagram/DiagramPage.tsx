/**
 * Diagram Page
 *
 * Page that displays the Knowledge Objects dependency diagram.
 * Route: /diagram and /diagram/:nodeId
 *
 * @module pages/diagram/DiagramPage
 */
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Layout } from '@/widgets/layout';
import { DiagramContextPanel, DiagramCanvas, useDiagramStore } from '@/features/diagram';
import { SearchCommand } from '@/widgets/header';

/**
 * Diagram page component
 *
 * Displays the interactive Knowledge Object dependency graph with
 * context panel and search functionality.
 *
 * @returns Rendered diagram page with canvas and controls
 */
export function DiagramPage(): React.JSX.Element {
  const { nodeId } = useParams<{ nodeId?: string }>();
  const location = useLocation();

  // Fallback parsing for tests or environments without configured routes
  const pathSegment = location.pathname.startsWith('/diagram/')
    ? location.pathname.slice('/diagram/'.length)
    : undefined;
  const combinedFromUrl =
    pathSegment !== undefined ? `${pathSegment}${location.search ?? ''}${location.hash ?? ''}` : undefined;
  const resolvedNodeId =
    nodeId ??
    (combinedFromUrl
      ? (() => {
          try {
            return decodeURIComponent(combinedFromUrl);
          } catch {
            return combinedFromUrl;
          }
        })()
      : undefined);
  const coreId = useDiagramStore((state) => state.coreId);
  const setCoreId = useDiagramStore((state) => state.setCoreId);
  const [isSyncing, setIsSyncing] = useState<boolean>(
    !!resolvedNodeId && coreId !== resolvedNodeId
  );
  const isSynced = !resolvedNodeId || coreId === resolvedNodeId;

  // Sync URL param to diagram store
  useEffect(() => {
    if (resolvedNodeId) {
      setCoreId(resolvedNodeId);
    }
  }, [resolvedNodeId, setCoreId]);

  // Keep a short-lived loading state while we reconcile the store with the URL
  useEffect(() => {
    if (!resolvedNodeId) {
      setIsSyncing(false);
      return;
    }

    if (coreId !== resolvedNodeId) {
      setIsSyncing(true);
      return;
    }

    const timer = window.setTimeout(() => setIsSyncing(false), 0);
    return () => window.clearTimeout(timer);
  }, [coreId, resolvedNodeId]);

  // Don't render until coreId matches the URL param (avoids flash of wrong data)
  if (resolvedNodeId && (!isSynced || isSyncing)) {
    console.warn('[DiagramPage] Syncing state:', { resolvedNodeId, coreId, isSynced, isSyncing });
    return (
      <Layout
        leftPanel={<DiagramContextPanel />}
        searchComponent={<SearchCommand />}
      >
        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-500">
          Loading...
        </div>
      </Layout>
    );
  }

  console.warn('[DiagramPage] Rendering canvas', { resolvedNodeId, coreId });

  return (
    <Layout
      leftPanel={<DiagramContextPanel />}
      searchComponent={<SearchCommand />}
    >
      <div className="flex h-full w-full overflow-hidden bg-slate-50">
        <div className="flex-1 relative h-full">
          <DiagramCanvas />
        </div>
      </div>
    </Layout>
  );
}
