/**
 * DiagramToolbar
 *
 * Library-agnostic toolbar component for diagram controls.
 * Accepts callback props for zoom/fit operations to work with any renderer.
 *
 * @module features/diagram/ui/Canvas/Toolbar
 */
import { ZoomIn, ZoomOut, Maximize2, Zap, LocateFixed } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

export type DiagramToolbarProps = {
  autoImpactMode: boolean;
  onToggleAutoImpact: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterOnCore?: () => void;
};

/**
 * DiagramToolbar
 *
 * Custom toolbar with zoom controls and feature toggles.
 * Uses shared Button component (Radix UI based).
 */
export function DiagramToolbar({
  autoImpactMode,
  onToggleAutoImpact,
  onFitView,
  onZoomIn,
  onZoomOut,
  onCenterOnCore,
}: DiagramToolbarProps): React.JSX.Element {
  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-0.5 bg-white/90 rounded-lg p-1 shadow-md border border-slate-200 pointer-events-auto">
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
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleAutoImpact}
        title={autoImpactMode ? 'Disable auto-impact' : 'Enable auto-impact'}
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

