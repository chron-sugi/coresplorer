import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNodeDetails } from './useNodeDetails';

describe('useNodeDetails', () => {
    it('should initialize with empty state', () => {
        const { result } = renderHook(() => useNodeDetails());

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(result.current.nodeDetailsData).toEqual({});
        expect(typeof result.current.fetchNodeDetails).toBe('function');
    });

    it('should have fetchNodeDetails method', () => {
        const { result } = renderHook(() => useNodeDetails());

        expect(result.current.fetchNodeDetails).toBeDefined();
        expect(typeof result.current.fetchNodeDetails).toBe('function');
    });

    // Note: Tests for fetchNodeDetails behavior are skipped because they depend on
    // Vite's import.meta.glob which is a compile-time feature that's difficult to mock
    // in unit tests. Integration tests should verify the full loading flow.
});
