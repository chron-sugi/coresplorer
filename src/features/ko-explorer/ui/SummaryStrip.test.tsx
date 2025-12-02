/**
 * SummaryStrip Component Tests
 *
 * Tests for the SummaryStrip component that displays KO statistics.
 *
 * @module features/ko-explorer/ui/SummaryStrip.test
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SummaryStrip } from './SummaryStrip';
import type { KnowledgeObject } from '@/entities/knowledge-object';

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
    isolated: true,
  },
  {
    id: 'ko-3',
    name: 'Report 1',
    type: 'saved_search',
    app: 'search',
    owner: 'admin',
    isolated: true,
  },
];

describe('SummaryStrip', () => {
  it('displays total KO count', () => {
    render(<SummaryStrip kos={mockKOs} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/total kos/i)).toBeInTheDocument();
  });

  it('displays unique app count', () => {
    render(<SummaryStrip kos={mockKOs} />);

    // 2 unique apps: search, reporting
    const appCount = screen.getAllByText('2').find((el) =>
      el.nextElementSibling?.textContent?.toLowerCase().includes('apps')
    );
    expect(appCount).toBeTruthy();
  });

  it('displays isolated count', () => {
    render(<SummaryStrip kos={mockKOs} />);

    // 2 isolated KOs
    const isolatedCount = screen.getAllByText('2').find((el) =>
      el.nextElementSibling?.textContent?.toLowerCase().includes('isolated')
    );
    expect(isolatedCount).toBeTruthy();
  });

  it('handles empty KO list', () => {
    render(<SummaryStrip kos={[]} />);

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(3);
  });

  it('handles single KO', () => {
    const singleKO: KnowledgeObject[] = [
      {
        id: 'ko-1',
        name: 'Search 1',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
        isolated: false,
      },
    ];

    render(<SummaryStrip kos={singleKO} />);

    const totalCount = screen.getAllByText('1').find((el) =>
      el.nextElementSibling?.textContent?.toLowerCase().includes('total ko')
    );
    expect(totalCount).toBeTruthy(); // Total
    expect(screen.getByText('0')).toBeInTheDocument(); // Isolated
  });

  it('counts unique apps correctly', () => {
    const kosWithDuplicateApps: KnowledgeObject[] = [
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
        name: 'Search 2',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
        isolated: false,
      },
      {
        id: 'ko-3',
        name: 'Search 3',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
        isolated: false,
      },
    ];

    render(<SummaryStrip kos={kosWithDuplicateApps} />);

    // Should show 1 unique app
    const appCount = screen.getAllByText('1').find((el) => {
      return el.nextElementSibling?.textContent?.toLowerCase().includes('app');
    });
    expect(appCount).toBeTruthy();
  });

  it('counts isolated KOs correctly', () => {
    const allIsolated: KnowledgeObject[] = [
      {
        id: 'ko-1',
        name: 'KO 1',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
        isolated: true,
      },
      {
        id: 'ko-2',
        name: 'KO 2',
        type: 'saved_search',
        app: 'search',
        owner: 'admin',
        isolated: true,
      },
    ];

    render(<SummaryStrip kos={allIsolated} />);

    // Total = 2, Isolated = 2
    const twoCount = screen.getAllByText('2');
    expect(twoCount.length).toBeGreaterThanOrEqual(2);
  });

  it('renders three metric cards', () => {
    render(<SummaryStrip kos={mockKOs} />);

    expect(screen.getByText(/total kos/i)).toBeInTheDocument();
    expect(screen.getByText(/apps/i)).toBeInTheDocument();
    expect(screen.getByText(/isolated/i)).toBeInTheDocument();
  });

  it('uses responsive grid layout', () => {
    const { container } = render(<SummaryStrip kos={mockKOs} />);

    const grid = container.querySelector('.grid');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-3');
  });
});
