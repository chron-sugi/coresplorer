/**
 * AppDropdown Component Tests
 *
 * Tests for the AppDropdown component.
 *
 * @module features/ko-explorer/ui/AppDropdown.test
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppDropdown } from './AppDropdown';
import { useFilterStore } from '../model/store/useFilterStore';

describe('AppDropdown', () => {
  beforeEach(() => {
    useFilterStore.getState().clearFilters();
  });

  it('renders trigger button', () => {
    render(<AppDropdown availableApps={['search', 'reporting']} />);

    expect(screen.getByRole('button', { name: /filter by app/i })).toBeInTheDocument();
  });

  it('shows selected count badge when apps selected', () => {
    useFilterStore.getState().setApps(['search']);

    render(<AppDropdown availableApps={['search', 'reporting']} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens popover when trigger clicked', async () => {
    render(<AppDropdown availableApps={['search', 'reporting']} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search apps/i)).toBeInTheDocument();
    });
  });

  it('displays all available apps in popover', async () => {
    render(<AppDropdown availableApps={['search', 'reporting', 'security']} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('search')).toBeInTheDocument();
      expect(screen.getByText('reporting')).toBeInTheDocument();
      expect(screen.getByText('security')).toBeInTheDocument();
    });
  });

  it('filters apps based on search input', async () => {
    render(<AppDropdown availableApps={['search', 'reporting', 'security']} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search apps/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search apps/i);
    fireEvent.change(searchInput, { target: { value: 'search' } });

    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.queryByText('reporting')).not.toBeInTheDocument();
  });

  it('shows "No apps found" when search has no matches', async () => {
    render(<AppDropdown availableApps={['search', 'reporting']} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search apps/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search apps/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/no apps found/i)).toBeInTheDocument();
  });

  it('toggles app selection when checkbox clicked', async () => {
    render(<AppDropdown availableApps={['search', 'reporting']} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByLabelText(/select search/i)).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/select search/i);
    fireEvent.click(checkbox);

    const store = useFilterStore.getState();
    expect(store.apps).toContain('search');
  });

  it('reflects pre-selected apps from store', async () => {
    useFilterStore.getState().setApps(['reporting']);

    render(<AppDropdown availableApps={['search', 'reporting']} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      const checkbox = screen.getByLabelText(/select reporting/i) as HTMLInputElement;
      expect(checkbox.ariaChecked).toBe('true');
    });
  });

  it('handles empty available apps', async () => {
    render(<AppDropdown availableApps={[]} />);

    const trigger = screen.getByRole('button', { name: /filter by app/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/no apps found/i)).toBeInTheDocument();
    });
  });

  it('updates selected count badge dynamically', async () => {
    const { rerender } = render(<AppDropdown availableApps={['search', 'reporting']} />);

    // Initially no badge
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    // Select an app
    act(() => {
      useFilterStore.getState().setApps(['search']);
    });
    rerender(<AppDropdown availableApps={['search', 'reporting']} />);

    expect(screen.getByText('1')).toBeInTheDocument();

    // Select another app
    act(() => {
      useFilterStore.getState().setApps(['search', 'reporting']);
    });
    rerender(<AppDropdown availableApps={['search', 'reporting']} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
