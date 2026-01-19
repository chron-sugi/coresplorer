import type { KnowledgeObject } from '@/entities/knowledge-object';
import { cn } from '@/shared/lib/utils';

/**
 * Props for the SummaryStrip component
 */
interface SummaryStripProps {
    kos: KnowledgeObject[];
}

/**
 * Summary statistics strip for Knowledge Objects
 *
 * Displays high-level metrics including total count, unique apps,
 * and isolated count. Used at the top of the KO Explorer page.
 *
 * @param props - Component props
 * @param props.kos - Array of knowledge objects to summarize
 * @returns Rendered summary strip with statistics cards
 */
export function SummaryStrip({ kos }: SummaryStripProps): React.JSX.Element {
    const totalKOs = kos.length;
    const uniqueApps = new Set(kos.map(ko => ko.app)).size;
    const isolated = kos.filter(ko => ko.isolated).length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard 
                label="Total KOs" 
                value={totalKOs} 
                valueColor="text-slate-100"
            />
            <MetricCard 
                label="Apps" 
                value={uniqueApps} 
                valueColor="text-emerald-400"
            />
            <MetricCard 
                label="Isolated" 
                value={isolated} 
                valueColor="text-amber-400"
            />
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: number;
    valueColor: string;
}

function MetricCard({ label, value, valueColor }: MetricCardProps) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center transition-colors hover:border-slate-700">
            <div className={cn("text-4xl font-bold mb-1", valueColor)}>{value}</div>
            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">{label}</div>
        </div>
    );
}
