import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2, Zap, LocateFixed } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useDiagramStore } from '../../model/store/diagram.store';
import { cn } from '@/shared/lib/utils';
import { DIAGRAM_ZOOM } from '../../model/constants/diagram.constants';

/**
 * DiagramToolbar
 *
 * Custom toolbar with zoom controls and feature toggles.
 * Uses shared Button component (Radix UI based) instead of React Flow's Controls.
 *
 * Must be rendered inside ReactFlow to access useReactFlow() context.
 */
export function DiagramToolbar() {
    const { zoomIn, zoomOut, fitView, getNode } = useReactFlow();
    const coreId = useDiagramStore(state => state.coreId);
    const autoImpactMode = useDiagramStore(state => state.autoImpactMode);
    const setAutoImpactMode = useDiagramStore(state => state.setAutoImpactMode);

    const centerOnCore = useCallback(() => {
        if (!coreId) return;

        const coreNode = getNode(coreId);
        if (!coreNode) {
            fitView();
            return;
        }

        fitView({
            nodes: [{ id: coreId }],
            padding: DIAGRAM_ZOOM.FIT_VIEW.PADDING,
            duration: DIAGRAM_ZOOM.FIT_VIEW.DURATION_MS,
            minZoom: DIAGRAM_ZOOM.FIT_VIEW.MIN,
            maxZoom: DIAGRAM_ZOOM.FIT_VIEW.MAX,
        });
    }, [coreId, fitView, getNode]);

    return (
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-0.5 bg-white/90 rounded-lg p-1 shadow-md border border-slate-200">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomIn()}
                title="Zoom in"
                className="h-8 w-8 text-slate-600 hover:text-slate-900"
            >
                <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomOut()}
                title="Zoom out"
                className="h-8 w-8 text-slate-600 hover:text-slate-900"
            >
                <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => fitView()}
                title="Fit view"
                className="h-8 w-8 text-slate-600 hover:text-slate-900"
            >
                <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={centerOnCore}
                title="Center on core node"
                className="h-8 w-8 text-slate-600 hover:text-slate-900"
            >
                <LocateFixed className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setAutoImpactMode(!autoImpactMode)}
                title={autoImpactMode ? "Disable auto-impact" : "Enable auto-impact"}
                className={cn(
                    'h-8 w-8',
                    autoImpactMode
                        ? 'text-sky-600 bg-sky-50 hover:bg-sky-100'
                        : 'text-slate-600 hover:text-slate-900'
                )}
            >
                <Zap className="h-4 w-4" />
            </Button>
        </div>
    );
}

