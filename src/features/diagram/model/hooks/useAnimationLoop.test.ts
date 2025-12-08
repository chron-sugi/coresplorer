import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnimationLoop } from './useAnimationLoop';

describe('useAnimationLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 0 initially', () => {
    const { result } = renderHook(() => useAnimationLoop(false));
    expect(result.current).toBe(0);
  });

  it('should not update when inactive', () => {
    const { result } = renderHook(() => useAnimationLoop(false));
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(0);
  });

  it('should update time when active', () => {
    const { result } = renderHook(() => useAnimationLoop(true));
    
    // Initial render might be 0 or current time depending on implementation
    // The hook uses requestAnimationFrame, which we need to mock or advance
    
    // Since we are using fake timers, we need to trigger frames
    act(() => {
      vi.advanceTimersByTime(16); // ~1 frame
    });

    expect(result.current).toBeGreaterThan(0);
  });

  it('should stop updating when becoming inactive', () => {
    const { result, rerender } = renderHook(({ active }) => useAnimationLoop(active), {
      initialProps: { active: true },
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    const timeAtStop = result.current;
    expect(timeAtStop).toBeGreaterThan(0);

    // Stop animation
    rerender({ active: false });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(timeAtStop); // Should not have changed
  });
});
