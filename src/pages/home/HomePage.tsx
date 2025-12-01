/**
 * Home Page
 *
 * Landing page that displays the Knowledge Objects explorer.
 * Route: /
 *
 * @module pages/home/HomePage
 */
import { useMemo } from 'react';
import { Layout } from '@/widgets/layout';
import {
  SummaryStrip,
  FilterBar,
  KOTable,
  useKOData,
  useKOFilters,
  useKOSort,
  deriveFilterOptions,
} from '@/features/ko-explorer';

/**
 * Home page component - Knowledge Objects Explorer
 *
 * Main landing page that displays a comprehensive view of all Knowledge Objects
 * with filtering, sorting, and summary statistics.
 *
 * @returns Rendered home page with KO explorer
 */
export function HomePage(): React.JSX.Element {
  const { kos, loading, error } = useKOData();
  const { filters, setFilter, clearFilters, filteredKOs } = useKOFilters(kos);
  const { sortBy, sortDirection, handleSort, sortedKOs } = useKOSort(filteredKOs);

  // Derive filter options from all KOs (not filtered ones)
  const filterOptions = useMemo(() => deriveFilterOptions(kos), [kos]);

  return (
    <Layout>
      <div className="bg-slate-950 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-100 mb-8 tracking-tight">
            Knowledge Objects
          </h1>
          <SummaryStrip kos={kos} />
          <FilterBar
            filters={filters}
            setFilter={setFilter}
            clearFilters={clearFilters}
            filterOptions={filterOptions}
          />
          <KOTable
            kos={sortedKOs}
            loading={loading}
            error={error}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>
      </div>
    </Layout>
  );
}
