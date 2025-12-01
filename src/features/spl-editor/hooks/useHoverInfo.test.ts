/**
 * useHoverInfo Hook Tests
 *
 * Tests for the useHoverInfo hook that manages field hover in editor.
 *
 * @module features/spl-editor/hooks/useHoverInfo.test
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHoverInfo } from './useHoverInfo';
import { createRef } from 'react';

describe('useHoverInfo', () => {
  let containerRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    containerRef = createRef<HTMLDivElement>();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides handleMouseMove and handleMouseLeave functions', () => {
    const { result } = renderHook(() =>
      useHoverInfo({ containerRef })
    );

    expect(result.current.handleMouseMove).toBeInstanceOf(Function);
    expect(result.current.handleMouseLeave).toBeInstanceOf(Function);
  });

  it('calls onHover callback when hovering over field token', async () => {
    const onHover = vi.fn();

    const { result } = renderHook(() =>
      useHoverInfo({ containerRef, onHover, debounceMs: 0 })
    );

    // Create mock token element
    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.column = '10';
    tokenElement.dataset.content = 'my_field';
    tokenElement.dataset.tokenType = 'variable';
    tokenElement.textContent = 'my_field';

    // Mock getBoundingClientRect
    tokenElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 200,
      width: 50,
      height: 20,
      right: 150,
      bottom: 220,
      x: 100,
      y: 200,
      toJSON: () => {},
    }));

    // Mock closest to return the token element
    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleMouseMove(mockEvent);
    });

    await act(async () => {
      vi.runAllTimers();
    });

    expect(onHover).toHaveBeenCalledWith('my_field', 5);
  });

  it('does not call onHover for keywords', async () => {
    const onHover = vi.fn();

    const { result } = renderHook(() =>
      useHoverInfo({ containerRef, onHover, debounceMs: 0 })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '1';
    tokenElement.dataset.column = '1';
    tokenElement.dataset.content = 'eval';
    tokenElement.textContent = 'eval';

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleMouseMove(mockEvent);
    });

    await act(async () => {
      vi.runAllTimers();
    });

    expect(onHover).not.toHaveBeenCalled();
  });

  it('debounces mouse move events', async () => {
    const onHover = vi.fn();

    const { result } = renderHook(() =>
      useHoverInfo({ containerRef, onHover, debounceMs: 50 })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '1';
    tokenElement.dataset.column = '1';
    tokenElement.dataset.content = 'field1';
    tokenElement.dataset.tokenType = 'variable';
    tokenElement.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 50,
      height: 20,
      right: 50,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleMouseMove(mockEvent);
      result.current.handleMouseMove(mockEvent);
      result.current.handleMouseMove(mockEvent);
    });

    // Should not be called yet
    expect(onHover).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Should be called once after debounce
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it('skips hover when same element is already hovered', async () => {
    const onHover = vi.fn();

    const { result } = renderHook(() =>
      useHoverInfo({ containerRef, onHover, debounceMs: 0 })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '1';
    tokenElement.dataset.column = '1';
    tokenElement.dataset.content = 'field1';
    tokenElement.dataset.tokenType = 'variable';
    tokenElement.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 50,
      height: 20,
      right: 50,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleMouseMove(mockEvent);
    });

    await act(async () => {
      vi.runAllTimers();
    });

    onHover.mockClear();

    // Hover same element again
    act(() => {
      result.current.handleMouseMove(mockEvent);
    });

    await act(async () => {
      vi.runAllTimers();
    });

    // Should not call onHover again for same element
    expect(onHover).not.toHaveBeenCalled();
  });

  it('clears state on mouse leave', () => {
    const { result } = renderHook(() =>
      useHoverInfo({ containerRef })
    );

    act(() => {
      result.current.handleMouseLeave();
    });

    // Should clear without errors
    expect(result.current.handleMouseLeave).toBeInstanceOf(Function);
  });

  it('recognizes field token types', async () => {
    const onHover = vi.fn();
    const tokenTypes = ['variable', 'property', 'attr-name', 'field'];

    for (const tokenType of tokenTypes) {
      onHover.mockClear();

      const { result } = renderHook(() =>
        useHoverInfo({ containerRef, onHover, debounceMs: 0 })
      );

      const tokenElement = document.createElement('span');
      tokenElement.dataset.line = '1';
      tokenElement.dataset.column = '1';
      tokenElement.dataset.content = 'my_field';
      tokenElement.dataset.tokenType = tokenType;
      tokenElement.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 50,
        height: 20,
        right: 50,
        bottom: 20,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));

      const mockEvent = {
        target: tokenElement,
      } as any;

      (mockEvent.target as any).closest = vi.fn(() => tokenElement);

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(onHover).toHaveBeenCalled();
    }
  });
});
