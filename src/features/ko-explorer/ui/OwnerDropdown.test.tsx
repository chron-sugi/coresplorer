/**
 * OwnerDropdown Component Tests
 *
 * Tests for the OwnerDropdown component.
 *
 * @module features/ko-explorer/ui/OwnerDropdown.test
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { OwnerDropdown } from './OwnerDropdown';
import { useFilterStore } from '../model/store/useFilterStore';

describe('OwnerDropdown', () => {
  beforeEach(() => {
    useFilterStore.getState().clearFilters();
  });

  it('renders trigger button', () => {
    render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    expect(screen.getByRole('button', { name: /filter by owner/i })).toBeInTheDocument();
  });

  it('shows selected count badge when owners selected', () => {
    useFilterStore.getState().setOwners(['admin']);

    render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens popover when trigger clicked', async () => {
    render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search owners/i)).toBeInTheDocument();
    });
  });

  it('displays all available owners in popover', async () => {
    render(<OwnerDropdown availableOwners={['admin', 'user1', 'user2']} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  it('filters owners based on search input', async () => {
    render(<OwnerDropdown availableOwners={['admin', 'user1', 'user2']} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search owners/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search owners/i);
    fireEvent.change(searchInput, { target: { value: 'admin' } });

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.queryByText('user1')).not.toBeInTheDocument();
  });

  it('shows "No owners found" when search has no matches', async () => {
    render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search owners/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search owners/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/no owners found/i)).toBeInTheDocument();
  });

  it('toggles owner selection when checkbox clicked', async () => {
    render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByLabelText(/select admin/i)).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/select admin/i);
    fireEvent.click(checkbox);

    const store = useFilterStore.getState();
    expect(store.owners).toContain('admin');
  });

  it('reflects pre-selected owners from store', async () => {
    useFilterStore.getState().setOwners(['user1']);

    render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      const checkbox = screen.getByLabelText(/select user1/i) as HTMLInputElement;
      expect(checkbox.ariaChecked).toBe('true');
    });
  });

  it('handles empty available owners', async () => {
    render(<OwnerDropdown availableOwners={[]} />);

    const trigger = screen.getByRole('button', { name: /filter by owner/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/no owners found/i)).toBeInTheDocument();
    });
  });

  it('updates selected count badge dynamically', async () => {
    const { rerender } = render(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    // Initially no badge
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    // Select an owner
    act(() => {
      useFilterStore.getState().setOwners(['admin']);
    });
    rerender(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    expect(screen.getByText('1')).toBeInTheDocument();

    // Select another owner
    act(() => {
      useFilterStore.getState().setOwners(['admin', 'user1']);
    });
    rerender(<OwnerDropdown availableOwners={['admin', 'user1']} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
