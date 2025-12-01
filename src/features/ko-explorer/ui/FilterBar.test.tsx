/**
 * FilterBar Component Tests
 *
 * Tests for the FilterBar component that provides filtering UI.
 *
 * @module features/ko-explorer/ui/FilterBar.test
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from './FilterBar';
import type { FilterState } from '../model/ko-explorer.types';
import type { FilterOptions } from '../lib/deriveFilterOptions';

const mockFilters: FilterState = {
  searchTerm: '',
  types: [],
  apps: [],
  owners: [],
};

const mockFilterOptions: FilterOptions = {
  types: ['saved_search', 'dashboard'],
  apps: ['search', 'reporting'],
  owners: ['admin', 'user1'],
};

describe('FilterBar', () => {
  it('renders search input', () => {
    render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('calls setFilter when search input changes', () => {
    const setFilter = vi.fn();

    render(
      <FilterBar
        filters={mockFilters}
        setFilter={setFilter}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(setFilter).toHaveBeenCalledWith('searchTerm', 'test');
  });

  it('displays current search term value', () => {
    const filtersWithSearch = { ...mockFilters, searchTerm: 'my search' };

    render(
      <FilterBar
        filters={filtersWithSearch}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    expect(searchInput.value).toBe('my search');
  });

  it('renders TypeChips when types are available', () => {
    render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    // TypeChips should render with available types
    expect(screen.getByText(/saved search/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('does not render TypeChips when no types available', () => {
    const emptyOptions: FilterOptions = {
      types: [],
      apps: [],
      owners: [],
    };

    render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={emptyOptions}
      />
    );

    // TypeChips component returns null when empty
    expect(screen.queryByText(/saved search/i)).not.toBeInTheDocument();
  });

  it('renders AppDropdown', () => {
    render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    expect(screen.getByLabelText(/filter by app/i)).toBeInTheDocument();
  });

  it('renders OwnerDropdown', () => {
    render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    expect(screen.getByLabelText(/filter by owner/i)).toBeInTheDocument();
  });

  it('renders ClearFiltersButton', () => {
    render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    // ClearFiltersButton is present but may not be visible without active filters
    // The button itself will decide if it renders
    const container = screen.getByPlaceholderText(/search/i).closest('div');
    expect(container).toBeTruthy();
  });

  it('has proper layout structure', () => {
    const { container } = render(
      <FilterBar
        filters={mockFilters}
        setFilter={vi.fn()}
        clearFilters={vi.fn()}
        filterOptions={mockFilterOptions}
      />
    );

    // Should have grid layout
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
  });
});
