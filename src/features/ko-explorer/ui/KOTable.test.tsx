/**
 * KOTable Component Tests
 *
 * Tests for the KOTable component that displays Knowledge Objects.
 *
 * @module features/ko-explorer/ui/KOTable.test
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { KOTable } from './KOTable';
import type { KnowledgeObject } from '@/entities/knowledge-object';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockKOs: KnowledgeObject[] = [
  {
    id: 'ko-1',
    name: 'Search 1',
    type: 'saved_search',
    app: 'search',
    owner: 'admin',
    isolated: false,
  },
  {
    id: 'ko-2',
    name: 'Dashboard 1',
    type: 'dashboard',
    app: 'reporting',
    owner: 'user1',
    isolated: false,
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('KOTable', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders loading state', () => {
    renderWithRouter(
      <KOTable
        kos={[]}
        loading={true}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    renderWithRouter(
      <KOTable
        kos={[]}
        loading={false}
        error="Failed to load data"
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('renders empty state when no KOs', () => {
    renderWithRouter(
      <KOTable
        kos={[]}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByText(/actions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /type/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /owner/i })).toBeInTheDocument();
  });

  it('renders KO rows with data', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    expect(screen.getByText('Search 1')).toBeInTheDocument();
    expect(screen.getByText('Dashboard 1')).toBeInTheDocument();
    expect(screen.getByText('search')).toBeInTheDocument();
    expect(screen.getByText('reporting')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  it('calls onSort when column header is clicked', () => {
    const onSort = vi.fn();

    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={onSort}
      />
    );

    const typeHeader = screen.getByRole('button', { name: /type/i });
    fireEvent.click(typeHeader);

    expect(onSort).toHaveBeenCalledWith('type');
  });

  it('navigates to diagram page when action button is clicked', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    const diagramButtons = screen.getAllByTitle('View in diagram');
    fireEvent.click(diagramButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/diagram/ko-1');
  });

  it('shows ascending sort icon on sorted column', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader.querySelector('svg')).toBeTruthy();
  });

  it('shows descending sort icon when sorted descending', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="desc"
        onSort={vi.fn()}
      />
    );

    const nameHeader = screen.getByRole('button', { name: /name/i });
    expect(nameHeader.querySelector('svg')).toBeTruthy();
  });

  it('does not show sort icon on unsorted columns', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    const typeHeader = screen.getByRole('button', { name: /type/i });
    // Type header should not have a sort icon since sortBy is 'name'
    const hasIcon = typeHeader.textContent?.includes('Type') && typeHeader.querySelector('svg');
    expect(hasIcon).toBeFalsy();
  });

  it('renders correct number of rows', () => {
    renderWithRouter(
      <KOTable
        kos={mockKOs}
        loading={false}
        error={null}
        sortBy="name"
        sortDirection="asc"
        onSort={vi.fn()}
      />
    );

    const diagramButtons = screen.getAllByTitle('View in diagram');
    expect(diagramButtons).toHaveLength(2);
  });
});
