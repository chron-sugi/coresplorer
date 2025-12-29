/**
 * DiagramToolbar
 *
 * Library-agnostic toolbar component for diagram controls.
 * Accepts callback props for zoom/fit operations to work with any renderer.
 *
 * @module features/diagram/ui/Canvas/Toolbar
 */
import { ZoomIn, ZoomOut, Maximize2, LocateFixed, Layers, Share2, Expand } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { KO_TYPE_CONFIG, type SplunkKoType } from '@/entities/knowledge-object';

export type DiagramToolbarProps = {
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnCore?: () => void;
  // Clustering
  onClusterByType?: (type: SplunkKoType) => void;
  onClusterHubs?: (threshold?: number) => void;
  onExpandAllClusters?: () => void;
  clusteredTypes?: Set<string>;
  hubsClusterThreshold?: number | null;
};

/**
 * DiagramToolbar
 *
 * Custom toolbar with zoom controls and feature toggles.
 * Uses shared Button component (Radix UI based).
 */
export function DiagramToolbar({
  onFitView,
  onZoomIn,
  onZoomOut,
  onCenterOnCore,
  onClusterByType,
  onClusterHubs,
  onExpandAllClusters,
  clusteredTypes = new Set(),
  hubsClusterThreshold,
}: DiagramToolbarProps): React.JSX.Element {
  const hasAnyClusters = clusteredTypes.size > 0 || hubsClusterThreshold !== null;

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-0.5 bg-white/90 rounded-lg p-1 shadow-md border border-slate-200">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        title="Zoom in"
        className="h-8 w-8 text-slate-600 hover:text-slate-900"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        title="Zoom out"
        className="h-8 w-8 text-slate-600 hover:text-slate-900"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onFitView}
        title="Fit view"
        className="h-8 w-8 text-slate-600 hover:text-slate-900"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      {onCenterOnCore && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onCenterOnCore}
          title="Center on core node"
          className="h-8 w-8 text-slate-600 hover:text-slate-900"
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
      )}

      {/* Cluster dropdown */}
      {onClusterByType && (
        <>
          <div className="h-px bg-slate-200 my-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                title="Cluster nodes"
                className={`h-8 w-8 ${hasAnyClusters ? 'text-indigo-600' : 'text-slate-600'} hover:text-slate-900`}
              >
                <Layers className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-48">
              <DropdownMenuLabel>Cluster by Type</DropdownMenuLabel>
              {(Object.entries(KO_TYPE_CONFIG) as [SplunkKoType, typeof KO_TYPE_CONFIG[SplunkKoType]][]).map(
                ([type, config]) => {
                  const Icon = config.icon;
                  const isClustered = clusteredTypes.has(type);
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => onClusterByType(type)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                      <span className={isClustered ? 'font-medium' : ''}>
                        {config.label}s
                      </span>
                      {isClustered && (
                        <span className="ml-auto text-xs text-indigo-600">Active</span>
                      )}
                    </DropdownMenuItem>
                  );
                }
              )}

              {onClusterHubs && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onClusterHubs(5)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4 text-indigo-500" />
                    <span className={hubsClusterThreshold ? 'font-medium' : ''}>
                      Cluster Hubs (5+)
                    </span>
                    {hubsClusterThreshold && (
                      <span className="ml-auto text-xs text-indigo-600">Active</span>
                    )}
                  </DropdownMenuItem>
                </>
              )}

              {onExpandAllClusters && hasAnyClusters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onExpandAllClusters}
                    className="flex items-center gap-2 text-slate-600"
                  >
                    <Expand className="h-4 w-4" />
                    <span>Expand All Clusters</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}

