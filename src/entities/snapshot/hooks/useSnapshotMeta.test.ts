import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSnapshotMeta } from './useSnapshotMeta';
import { renderHook } from '@testing-library/react';
import { useMetaQuery } from '../api/meta.queries';

// Mock the TanStack query hook used inside useSnapshotMeta
vi.mock('../api/meta.queries', () => ({
  useMetaQuery: vi.fn(),
}));

const mockedUseMetaQuery = useMetaQuery as unknown as ReturnType<typeof vi.fn>;

// Helper to set mock return value
function mockMetaQuery(value: any) {
  mockedUseMetaQuery.mockReturnValue(value);
}

describe('useSnapshotMeta', () => {
  const fixedNow = new Date('2024-01-01T12:00:00Z').getTime();

  beforeEach(() => {
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should return loading state when query is loading', () => {
    mockMetaQuery({ data: undefined, isLoading: true, isError: false });

    const { result } = renderHook(() => useSnapshotMeta());

    expect(result.current.status).toBe('loading');
    expect(result.current.generatedAt).toBeNull();
    expect(result.current.relativeAge).toBe('unknown');
    expect(result.current.formattedTime).toBe('');
  });

  it('should return error state when query errors', () => {
    mockMetaQuery({ data: undefined, isLoading: false, isError: true });

    const { result } = renderHook(() => useSnapshotMeta());

    expect(result.current.status).toBe('error');
    expect(result.current.generatedAt).toBeNull();
    expect(result.current.relativeAge).toBe('unknown');
    expect(result.current.formattedTime).toBe('');
  });

  it('should return error state when data is missing', () => {
    mockMetaQuery({ data: undefined, isLoading: false, isError: false });

    const { result } = renderHook(() => useSnapshotMeta());

    expect(result.current.status).toBe('error');
    expect(result.current.generatedAt).toBeNull();
  });

  it('should parse and format valid metadata', () => {
    mockMetaQuery({
      data: { generated_at: '2024-01-01T11:59:00Z', env: 'prod' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSnapshotMeta());

    expect(result.current.status).toBe('success');
    expect(result.current.env).toBe('prod');
    expect(result.current.generatedAt?.toISOString()).toBe('2024-01-01T11:59:00.000Z');
    expect(result.current.relativeAge).toBe('1 min ago');
    expect(result.current.formattedTime).not.toBe('');
  });

  it('should compute relativeAge in hours bucket', () => {
    mockMetaQuery({
      data: { generated_at: '2024-01-01T10:00:00Z', env: 'stage' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSnapshotMeta());

    expect(result.current.relativeAge).toBe('2 hours ago');
  });

  it('should return error state when generated_at is invalid', () => {
    mockMetaQuery({
      data: { generated_at: 'not-a-date', env: 'dev' },
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useSnapshotMeta());

    expect(result.current.status).toBe('error');
    expect(result.current.relativeAge).toBe('unknown');
  });
});
