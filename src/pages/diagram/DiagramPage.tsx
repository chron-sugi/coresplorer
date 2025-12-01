/**
 * Diagram Page
 *
 * Page that displays the Knowledge Objects dependency diagram.
 * Route: /diagram and /diagram/:nodeId
 *
 * @module pages/diagram/DiagramPage
 */
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/widgets/layout';
import { DiagramContextPanel } from '@/features/diagram/ui/ContextPanel/ContextPanel';
import { SearchCommand } from '@/features/diagram/ui/Search/SearchCommand';
import { DiagramCanvas } from '@/features/diagram/ui/Canvas/Canvas';
import { useDiagramStore } from '@/features/diagram';

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
  const coreId = useDiagramStore((state) => state.coreId);
  const setCoreId = useDiagramStore((state) => state.setCoreId);

  // Sync URL param to diagram store
  useEffect(() => {
    if (nodeId) {
      setCoreId(nodeId);
    }
  }, [nodeId, setCoreId]);

  // Don't render until coreId matches the URL param (avoids flash of wrong data)
  if (nodeId && coreId !== nodeId) {
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
