/**
 * TypeChips Component Tests
 *
 * Tests for the TypeChips component that provides type filtering.
 *
 * @module features/ko-explorer/ui/TypeChips.test
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TypeChips } from './TypeChips';
import { useFilterStore } from '../model/store/useFilterStore';

describe('TypeChips', () => {
  beforeEach(() => {
    // Reset filter store before each test
    useFilterStore.getState().clearFilters();
  });

  it('renders all available types', () => {
    const availableTypes = ['saved_search', 'dashboard', 'report'];

    render(<TypeChips availableTypes={availableTypes} />);

    expect(screen.getByText(/saved search/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/report/i)).toBeInTheDocument();
  });

  it('renders empty when no types available', () => {
    const { container } = render(<TypeChips availableTypes={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('toggles type selection on click', () => {
    const availableTypes = ['saved_search', 'dashboard'];

    render(<TypeChips availableTypes={availableTypes} />);

    const searchChip = screen.getByText(/saved search/i);
    fireEvent.click(searchChip);

    const store = useFilterStore.getState();
    expect(store.types).toContain('saved_search');
  });

  it('allows multiple types to be selected', () => {
    const availableTypes = ['saved_search', 'dashboard', 'report'];

    render(<TypeChips availableTypes={availableTypes} />);

    fireEvent.click(screen.getByText(/saved search/i));
    fireEvent.click(screen.getByText(/dashboard/i));

    const store = useFilterStore.getState();
    expect(store.types).toContain('saved_search');
    expect(store.types).toContain('dashboard');
    expect(store.types).toHaveLength(2);
  });

  it('deselects type when clicked again', () => {
    const availableTypes = ['saved_search'];

    render(<TypeChips availableTypes={availableTypes} />);

    const searchChip = screen.getByText(/saved search/i);

    // Select
    fireEvent.click(searchChip);
    expect(useFilterStore.getState().types).toContain('saved_search');

    // Deselect
    fireEvent.click(searchChip);
    expect(useFilterStore.getState().types).not.toContain('saved_search');
  });

  it('reflects pre-selected types from store', () => {
    const availableTypes = ['saved_search', 'dashboard'];

    // Pre-select a type in store
    useFilterStore.getState().setTypes(['saved_search']);

    render(<TypeChips availableTypes={availableTypes} />);

    const searchChip = screen.getByText(/saved search/i);
    expect(searchChip.getAttribute('data-state')).toBe('on');
  });

  it('uses proper ARIA labels', () => {
    const availableTypes = ['saved_search'];

    render(<TypeChips availableTypes={availableTypes} />);

    const searchChip = screen.getByLabelText(/filter by saved_search/i);
    expect(searchChip).toBeInTheDocument();
  });

  it('handles unknown type labels gracefully', () => {
    const availableTypes = ['unknown_type'];

    render(<TypeChips availableTypes={availableTypes} />);

    expect(screen.getByText('unknown_type')).toBeInTheDocument();
  });

  it('displays formatted labels for known types', () => {
    const availableTypes = ['saved_search'];

    render(<TypeChips availableTypes={availableTypes} />);

    // Should display "Saved Search" not "saved_search"
    expect(screen.getByText(/saved search/i)).toBeInTheDocument();
  });
});
