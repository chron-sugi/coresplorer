/**
 * ClearFiltersButton Component Tests
 *
 * Tests for the ClearFiltersButton component.
 *
 * @module features/ko-explorer/ui/ClearFiltersButton.test
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClearFiltersButton } from './ClearFiltersButton';
import { useFilterStore } from '../model/store/useFilterStore';

describe('ClearFiltersButton', () => {
  beforeEach(() => {
    useFilterStore.getState().clearFilters();
  });

  it('does not render when no filters are active', () => {
    const { container } = render(<ClearFiltersButton />);

    expect(container.firstChild).toBeNull();
  });

  it('does not render when only search term is active', () => {
    // Note: hasActiveFilters() does not check searchTerm, only types/apps/owners
    useFilterStore.getState().setSearchTerm('test');

    const { container } = render(<ClearFiltersButton />);

    expect(container.firstChild).toBeNull();
  });

  it('renders when type filter is active', () => {
    useFilterStore.getState().setTypes(['saved_search']);

    render(<ClearFiltersButton />);

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('renders when app filter is active', () => {
    useFilterStore.getState().setApps(['search']);

    render(<ClearFiltersButton />);

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('renders when owner filter is active', () => {
    useFilterStore.getState().setOwners(['admin']);

    render(<ClearFiltersButton />);

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('renders when multiple filters are active', () => {
    useFilterStore.getState().setTypes(['saved_search']);
    useFilterStore.getState().setApps(['search']);

    render(<ClearFiltersButton />);

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
  });

  it('clears all filters when clicked', () => {
    useFilterStore.getState().setTypes(['saved_search']);
    useFilterStore.getState().setApps(['search']);
    useFilterStore.getState().setOwners(['admin']);

    render(<ClearFiltersButton />);

    const button = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(button);

    const store = useFilterStore.getState();
    expect(store.searchTerm).toBe('');
    expect(store.types).toEqual([]);
    expect(store.apps).toEqual([]);
    expect(store.owners).toEqual([]);
  });

  it('hides after clearing filters', () => {
    useFilterStore.getState().setTypes(['saved_search']);

    const { rerender } = render(<ClearFiltersButton />);

    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();

    const button = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(button);

    rerender(<ClearFiltersButton />);

    expect(screen.queryByRole('button', { name: /clear all filters/i })).not.toBeInTheDocument();
  });

  it('displays "Clear" text', () => {
    useFilterStore.getState().setTypes(['saved_search']);

    render(<ClearFiltersButton />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('has proper ARIA label', () => {
    useFilterStore.getState().setTypes(['saved_search']);

    render(<ClearFiltersButton />);

    const button = screen.getByRole('button', { name: /clear all filters/i });
    expect(button.getAttribute('aria-label')).toBe('Clear all filters');
  });
});
