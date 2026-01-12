/**
 * Marching Ants Animation Hook
 *
 * Handles animated edge highlighting with marching ants effect.
 * Draws custom dashed lines and arrowheads on highlighted edges.
 *
 * @module features/diagram/model/hooks/useMarchingAntsAnimation
 */
import { useEffect, useRef } from 'react';
import type { Network } from 'vis-network/standalone';

import { useAnimationLoop } from './useAnimationLoop';
import { themeConfig } from '@/shared/config';
import { ANIMATION_SETTINGS } from '../constants/diagram.ui.constants';

export interface UseMarchingAntsAnimationOptions {
  networkInstance: Network | null;
  highlightedEdges: Set<string>;
}

/**
 * Hook for rendering animated marching ants effect on highlighted edges
 */
export function useMarchingAntsAnimation({
  networkInstance,
  highlightedEdges,
}: UseMarchingAntsAnimationOptions): void {
  const isHighlighting = highlightedEdges.size > 0;
  const time = useAnimationLoop(isHighlighting);
  const timeRef = useRef(0);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  // Trigger redraw on animation frame
  useEffect(() => {
    if (isHighlighting && networkInstance) {
      networkInstance.redraw();
    }
  }, [time, isHighlighting, networkInstance]);

  // Custom drawing for animated edges
  useEffect(() => {
    if (!networkInstance) return;

    const afterDrawing = (ctx: CanvasRenderingContext2D) => {
      if (highlightedEdges.size === 0) return;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -timeRef.current / ANIMATION_SETTINGS.MARCHING_ANTS_SPEED_DIVISOR;
      ctx.lineWidth = themeConfig.layout.edgeWidth.default;
      ctx.strokeStyle = themeConfig.colors.semantic.edge.default;

      highlightedEdges.forEach((edgeId) => {
        // @ts-expect-error - accessing internal vis-network properties
        const edge = networkInstance.body.edges[edgeId];
        if (!edge) return;

        // Draw the edge path
        const startX = edge.from.x;
        const startY = edge.from.y;
        let endX = edge.to.x;
        let endY = edge.to.y;
        let angle = 0;

        if (edge.edgeType?.via) {
          const viaX = edge.edgeType.via.x;
          const viaY = edge.edgeType.via.y;
          ctx.moveTo(startX, startY);
          ctx.lineTo(viaX, viaY);
          ctx.lineTo(endX, endY);
          // Calculate angle from via point to end point
          angle = Math.atan2(endY - viaY, endX - viaX);
        } else {
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          // Calculate angle from start to end
          angle = Math.atan2(endY - startY, endX - startX);
        }

        ctx.stroke();

        // Draw Arrowhead
        const arrowLength = 15;
        const arrowWidth = 9;

        // Use toPoint if available for accurate arrow placement
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targetPoint = (edge as any).toPoint || edge.to;
        endX = targetPoint.x;
        endY = targetPoint.y;

        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([]); // Solid arrow
        ctx.fillStyle = themeConfig.colors.semantic.edge.default;

        ctx.translate(endX, endY);
        ctx.rotate(angle);

        ctx.moveTo(-arrowLength, -arrowWidth);
        ctx.lineTo(0, 0);
        ctx.lineTo(-arrowLength, arrowWidth);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();
    };

    networkInstance.on('afterDrawing', afterDrawing);

    return () => {
      networkInstance.off('afterDrawing', afterDrawing);
    };
  }, [highlightedEdges, networkInstance]);
}
