/**
 * useFieldLineage Hook
 * 
 * Manages field lineage analysis and provides query methods.
 * 
 * @module features/field-lineage/model/hooks/useFieldLineage
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useEditorStore, selectAST, selectParseResult } from '@/entities/spl';
import { useLineageStore } from '@/entities/field';
import { analyzeLineage } from '../../lib/analyzer';
import type { LineageIndex, FieldLineage } from '../field-lineage.types';

interface UseFieldLineageReturn {
  /** The lineage index for querying */
  lineageIndex: LineageIndex | null;
  
  /** Get lineage for a specific field */
  getFieldLineage: (fieldName: string) => FieldLineage | null;
  
  /** Check if field exists at a line */
  fieldExistsAt: (fieldName: string, line: number) => boolean;
  
  /** Get all fields at a line */
  getFieldsAtLine: (line: number) => string[];
  
  /** Get field origin */
  getFieldOrigin: (fieldName: string) => { line: number; command: string } | null;
  
  /** Get all warnings */
  warnings: Array<{ level: string; message: string; line?: number }>;
  
  /** Re-analyze lineage */
  reanalyze: () => void;
}

/**
 * Hook for accessing and querying field lineage.
 */
export function useFieldLineage(): UseFieldLineageReturn {
  const ast = useEditorStore(selectAST);
  const parseResult = useEditorStore(selectParseResult);
  const { lineageIndex, setLineageIndex } = useLineageStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Analyze lineage when AST changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        console.warn('[Lineage] running analyzeLineage, hasAST?', !!ast, 'stages', (ast as any)?.stages?.length);
        if (parseResult?.parseErrors?.length) {
          console.warn('[Lineage] parse errors', parseResult.parseErrors);
        }
        if (parseResult?.lexErrors?.length) {
          console.warn('[Lineage] lex errors', parseResult.lexErrors);
        }
        if (ast) {
          const index = analyzeLineage(ast);
          console.warn('[Lineage] lineageIndex built?', !!index, 'fields', index?.getAllFields().slice(0, 5));
          setLineageIndex(index);
        } else {
          setLineageIndex(null);
        }
      } catch (e) {
        console.warn('[useFieldLineage] analyzeLineage failed', e);
        setLineageIndex(null);
      }
    }, 120);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [ast, setLineageIndex]);

  // Query methods
  const getFieldLineage = useCallback((fieldName: string): FieldLineage | null => {
    return lineageIndex?.getFieldLineage(fieldName) ?? null;
  }, [lineageIndex]);

  const fieldExistsAt = useCallback((fieldName: string, line: number): boolean => {
    return lineageIndex?.fieldExistsAt(fieldName, line) ?? false;
  }, [lineageIndex]);

  const getFieldsAtLine = useCallback((line: number): string[] => {
    return lineageIndex?.getFieldsAtLine(line) ?? [];
  }, [lineageIndex]);

  const getFieldOrigin = useCallback((fieldName: string): { line: number; command: string } | null => {
    const origin = lineageIndex?.getFieldOrigin(fieldName);
    if (!origin) return null;
    return { line: origin.line, command: origin.command };
  }, [lineageIndex]);

  const warnings = useMemo(() => {
    return lineageIndex?.getWarnings() ?? [];
  }, [lineageIndex]);

  const reanalyze = useCallback(() => {
    if (ast) {
      const index = analyzeLineage(ast);
      setLineageIndex(index);
    }
  }, [ast, setLineageIndex]);

  return {
    lineageIndex,
    getFieldLineage,
    fieldExistsAt,
    getFieldsAtLine,
    getFieldOrigin,
    warnings,
    reanalyze,
  };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook for getting info about a specific field.
 */
export function useFieldInfo(fieldName: string | null) {
  const { getFieldLineage, getFieldOrigin, fieldExistsAt } = useFieldLineage();
  const { cursorLine } = useEditorStore();

  return useMemo(() => {
    if (!fieldName) return null;

    const lineage = getFieldLineage(fieldName);
    const origin = getFieldOrigin(fieldName);
    const existsAtCursor = fieldExistsAt(fieldName, cursorLine);

    return {
      fieldName,
      lineage,
      origin,
      existsAtCursor,
      events: lineage?.events ?? [],
      dependsOn: lineage?.dependsOn ?? [],
      dependedOnBy: lineage?.dependedOnBy ?? [],
      dataType: lineage?.dataType ?? 'unknown',
      confidence: lineage?.confidence ?? 'unknown',
    };
  }, [fieldName, getFieldLineage, getFieldOrigin, fieldExistsAt, cursorLine]);
}

/**
 * Hook for getting fields at the current cursor position.
 */
export function useFieldsAtCursor() {
  const { cursorLine } = useEditorStore();
  const { getFieldsAtLine } = useFieldLineage();

  return useMemo(() => {
    return getFieldsAtLine(cursorLine);
  }, [cursorLine, getFieldsAtLine]);
}
