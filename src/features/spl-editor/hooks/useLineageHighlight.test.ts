/**
 * useLineageHighlight Hook Tests
 *
 * Tests for the useLineageHighlight hook that manages click highlighting.
 *
 * @module features/spl-editor/hooks/useLineageHighlight.test
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLineageHighlight } from './useLineageHighlight';
import { createRef } from 'react';

describe('useLineageHighlight', () => {
  let containerRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    containerRef = createRef<HTMLDivElement>();
    vi.clearAllMocks();
  });

  it('provides necessary functions', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    expect(result.current.handleClick).toBeInstanceOf(Function);
    expect(result.current.handleDoubleClick).toBeInstanceOf(Function);
    expect(result.current.clearHighlight).toBeInstanceOf(Function);
  });

  it('initializes with no selected field', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    expect(result.current.selectedField).toBeNull();
  });

  it('selects field on click', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef, onClick })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = 'my_field';

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField).toEqual({
      fieldName: 'my_field',
      locked: false,
    });
    expect(onClick).toHaveBeenCalledWith('my_field', 5);
  });

  it('toggles lock when clicking same field', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = 'my_field';

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    // First click - select
    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField?.locked).toBe(false);

    // Second click - toggle lock
    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField?.locked).toBe(true);

    // Third click - toggle lock again
    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField?.locked).toBe(false);
  });

  it('locks selection on double click', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = 'my_field';

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleDoubleClick(mockEvent);
    });

    expect(result.current.selectedField).toEqual({
      fieldName: 'my_field',
      locked: true,
    });
  });

  it('clears selection when clicking outside if not locked', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    // First select a field
    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = 'my_field';

    let mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField).not.toBeNull();

    // Click outside (no token)
    mockEvent = {
      target: document.createElement('div'),
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => null);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField).toBeNull();
  });

  it('does not clear selection when clicking outside if locked', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    // Select and lock
    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = 'my_field';

    let mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleDoubleClick(mockEvent);
    });

    expect(result.current.selectedField?.locked).toBe(true);

    // Click outside (no token)
    mockEvent = {
      target: document.createElement('div'),
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => null);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    // Should still be selected
    expect(result.current.selectedField).toEqual({
      fieldName: 'my_field',
      locked: true,
    });
  });

  it('clears selection with clearHighlight', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    // Select a field
    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = 'my_field';

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleDoubleClick(mockEvent);
    });

    expect(result.current.selectedField).not.toBeNull();

    act(() => {
      result.current.clearHighlight();
    });

    expect(result.current.selectedField).toBeNull();
  });

  it('ignores invalid field names', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = '123invalid'; // Starts with number

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField).toBeNull();
  });

  it('accepts valid field names with underscores and dots', () => {
    const { result } = renderHook(() =>
      useLineageHighlight({ containerRef })
    );

    const tokenElement = document.createElement('span');
    tokenElement.dataset.line = '5';
    tokenElement.dataset.content = '_field.name_123';

    const mockEvent = {
      target: tokenElement,
    } as any;

    (mockEvent.target as any).closest = vi.fn(() => tokenElement);

    act(() => {
      result.current.handleClick(mockEvent);
    });

    expect(result.current.selectedField?.fieldName).toBe('_field.name_123');
  });
});
