/**
 * useSPLParser Hook
 * 
 * Manages SPL parsing with debouncing and error handling.
 * 
 * @module entities/spl/hooks/useSPLParser
 */

import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../store';
import { parseSPL, type ParseResult } from '@/entities/spl/lib/parser';

interface UseSPLParserOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Callback when parsing completes */
  onParse?: (result: ParseResult) => void;
  /** Callback when parsing fails */
  onError?: (error: Error) => void;
}

interface UseSPLParserReturn {
  /** Current parse result */
  parseResult: ParseResult | null;
  /** Whether parsing is in progress */
  isParsing: boolean;
  /** Parse error message if any */
  parseError: string | null;
  /** Manually trigger a parse */
  parse: (spl: string) => void;
  /** Parse immediately without debounce */
  parseImmediate: (spl: string) => ParseResult;
}

/**
 * Hook for parsing SPL with debouncing.
 */
export function useSPLParser(options: UseSPLParserOptions = {}): UseSPLParserReturn {
  const { debounceMs = 150, onParse, onError } = options;
  
  const {
    parseResult,
    isParsing,
    parseError,
    setParseResult,
    setIsParsing,
    setParseError,
  } = useEditorStore();
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  /**
   * Parse SPL immediately without debouncing.
   */
  const parseImmediate = useCallback((spl: string): ParseResult => {
    try {
      const result = parseSPL(spl);
      setParseResult(result);
      onParse?.(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setParseError(err.message);
      onError?.(err);
      throw err;
    }
  }, [setParseResult, setParseError, onParse, onError]);

  /**
   * Parse SPL with debouncing.
   */
  const parse = useCallback((spl: string) => {
    // Clear any pending parse
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Create new abort controller
    abortRef.current = new AbortController();

    setIsParsing(true);

    debounceRef.current = setTimeout(() => {
      // Check if aborted
      if (abortRef.current?.signal.aborted) {
        return;
      }

      try {
        const result = parseSPL(spl);
        
        // Check again if aborted before updating state
        if (abortRef.current?.signal.aborted) {
          return;
        }

        setParseResult(result);
        setIsParsing(false);
        onParse?.(result);
      } catch (error) {
        if (abortRef.current?.signal.aborted) {
          return;
        }

        const err = error instanceof Error ? error : new Error(String(error));
        setParseError(err.message);
        setIsParsing(false);
        onError?.(err);
      }
    }, debounceMs);
  }, [debounceMs, setParseResult, setIsParsing, setParseError, onParse, onError]);

  return {
    parseResult,
    isParsing,
    parseError,
    parse,
    parseImmediate,
  };
}
