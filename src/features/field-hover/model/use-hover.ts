/**
 * useHover Hook
 *
 * Provides field hover state and lineage info for the currently hovered field.
 *
 * @module features/field-hover/model/use-hover
 */

import { useMemo } from 'react';
import {
  useLineageStore,
  selectHoveredField,
  selectTooltipVisible,
  selectLineageIndex,
  type FieldLineage,
  type FieldEvent,
} from '@/entities/field';

export interface HoverPosition {
  x: number;
  y: number;
}

export interface UseHoverReturn {
  /** Currently hovered field name */
  hoveredField: string | null;
  /** Hover position for tooltip placement */
  position: HoverPosition | null;
  /** Line number where hover occurred */
  hoverLine: number | null;
  /** Whether tooltip should be visible */
  tooltipVisible: boolean;
  /** Full lineage data for the hovered field */
  lineage: FieldLineage | null;
  /** Origin event (where field was created) */
  origin: FieldEvent | null;
  /** Field dependencies */
  dependencies: string[];
  /** Field data type */
  dataType: string;
  /** Set hover state */
  setHover: (
    fieldName: string | null,
    position?: { x: number; y: number },
    line?: number,
    column?: number
  ) => void;
  /** Clear hover state */
  clearHover: () => void;
}

/**
 * Hook for managing field hover state and retrieving lineage info.
 */
export function useHover(): UseHoverReturn {
  const hoveredInfo = useLineageStore(selectHoveredField);
  const tooltipVisible = useLineageStore(selectTooltipVisible);
  const lineageIndex = useLineageStore(selectLineageIndex);
  const setHoveredField = useLineageStore((s) => s.setHoveredField);

  const hoveredFieldName = hoveredInfo?.fieldName ?? null;

  const lineage = useMemo(() => {
    if (!hoveredFieldName || !lineageIndex) return null;
    return lineageIndex.getFieldLineage(hoveredFieldName);
  }, [hoveredFieldName, lineageIndex]);

  const origin = useMemo(() => {
    return lineage?.origin ?? null;
  }, [lineage]);

  const dependencies = useMemo(() => {
    return lineage?.dependsOn ?? [];
  }, [lineage]);

  const dataType = useMemo(() => {
    return lineage?.dataType ?? 'unknown';
  }, [lineage]);

  const setHover = (
    fieldName: string | null,
    position?: { x: number; y: number },
    line?: number,
    column?: number
  ): void => {
    if (!fieldName) {
      setHoveredField(null);
    } else {
      setHoveredField({
        fieldName,
        line: line ?? 0,
        column: column ?? 0,
        x: position?.x ?? 0,
        y: position?.y ?? 0,
      });
    }
  };

  const clearHover = (): void => {
    setHoveredField(null);
  };

  return {
    hoveredField: hoveredInfo?.fieldName ?? null,
    position: hoveredInfo ? { x: hoveredInfo.x, y: hoveredInfo.y } : null,
    hoverLine: hoveredInfo?.line ?? null,
    tooltipVisible,
    lineage,
    origin,
    dependencies,
    dataType,
    setHover,
    clearHover,
  };
}
