import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { IndexLineageFilterBar } from './IndexLineageFilterBar';

function renderFilterBar(overrides?: Partial<ComponentProps<typeof IndexLineageFilterBar>>) {
  const props: ComponentProps<typeof IndexLineageFilterBar> = {
    searchTerm: '',
    onSearchChange: vi.fn(),
    totalGroups: 10,
    filteredGroups: 4,
    filteredPaths: 12,
    filterOptions: {
      types: ['saved_search', 'dashboard'],
      apps: ['search'],
      owners: ['admin'],
    },
    selectedTypes: [],
    selectedApps: [],
    selectedOwners: [],
    groupBy: 'index+sourcetype+source',
    onGroupByChange: vi.fn(),
    onToggleType: vi.fn(),
    onToggleApp: vi.fn(),
    onToggleOwner: vi.fn(),
    onClearStructuredFilters: vi.fn(),
    ...overrides,
  };

  render(<IndexLineageFilterBar {...props} />);
  return props;
}

describe('IndexLineageFilterBar', () => {
  it('renders search input and calls onSearchChange', () => {
    const props = renderFilterBar();
    const input = screen.getByPlaceholderText(/search by index, sourcetype/i);

    fireEvent.change(input, { target: { value: 'security dashboard' } });
    expect(props.onSearchChange).toHaveBeenCalledWith('security dashboard');
  });

  it('calls onToggleType when a type chip is clicked', () => {
    const props = renderFilterBar();
    fireEvent.click(screen.getByRole('button', { name: /filter by saved_search/i }));

    expect(props.onToggleType).toHaveBeenCalledWith('saved_search');
  });

  it('shows clear button when structured filters are active', () => {
    const props = renderFilterBar({
      selectedApps: ['search'],
    });

    const clearButton = screen.getByRole('button', { name: /clear lineage ko filters/i });
    fireEvent.click(clearButton);
    expect(props.onClearStructuredFilters).toHaveBeenCalled();
  });

  it('updates group-by mode from the dropdown', () => {
    const props = renderFilterBar();

    fireEvent.click(screen.getByRole('button', { name: /group lineage rows/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Index + Source' }));

    expect(props.onGroupByChange).toHaveBeenCalledWith('index+source');
  });
});
