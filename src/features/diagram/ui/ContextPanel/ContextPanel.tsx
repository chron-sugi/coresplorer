/**
 * Diagram-specific context panel.
 * Wraps the generic ContextPanel with diagram-specific content (node details, tabs).
 */

import { useState } from 'react';
import { ContextPanel } from '@/shared/ui/ContextPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Separator } from '@/shared/ui/separator';
import { useDiagramStore, type PanelTab } from '../../model/store/diagram.store';
import { useDiagramData } from '../../model/hooks/useDiagramData';
import type { DiagramData, DiagramNodeView } from '../../model/types';
import { useNodeDetailsQuery } from '@/entities/snapshot';
import { NodeDetailsSection } from './Tabs/NodeDetailsTab';
import { SplTab } from './Tabs/SplTab';
// Impact tab removed from UI - keeping import for future use
// import { NodeImpactTab } from './Tabs/NodeImpactTab';
import { themeConfig } from '@/shared/config';
import { cn } from '@/shared/lib/utils';

/** Shared styling for tab triggers - extracted to avoid duplication */
const tabTriggerClasses = cn(
    'rounded-none py-2.5 text-xs font-medium transition-colors text-slate-400',
    'data-[state=active]:bg-slate-800/50 data-[state=active]:text-slate-100',
    'data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sky-500'
);

export function DiagramContextPanel() {
    const [collapsed, setCollapsed] = useState(false);
    
    const selectedNodeId = useDiagramStore(state => state.selectedNodeId);
    const activeTab = useDiagramStore(state => state.activeTab);
    const setActiveTab = useDiagramStore(state => state.setActiveTab);
    const coreId = useDiagramStore(state => state.coreId);
    const hiddenTypes = useDiagramStore(state => state.hiddenTypes);

    // Use TanStack Query hook to fetch node details from public/objects/
    const { data: nodeDetails } = useNodeDetailsQuery(selectedNodeId);
    const { fullData } = useDiagramData(coreId, hiddenTypes) as unknown as { fullData: DiagramData | null };

    // Get node details and type for selected node
    const selectedNodeDetails = nodeDetails ? {
        name: nodeDetails.name,
        owner: nodeDetails.owner,
        app: nodeDetails.app,
        last_modified: nodeDetails.last_modified,
        description: nodeDetails.description,
        spl_code: nodeDetails.spl_code ?? undefined
    } : null;
    
    const selectedNodeType = selectedNodeId && fullData && fullData.nodes.find((n: DiagramNodeView) => n.id === selectedNodeId)
        ? fullData.nodes.find((n: DiagramNodeView) => n.id === selectedNodeId)?.type
        : undefined;

    // Empty state
    const emptyState = (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Select a node to view details</p>
            <p className="text-xs text-slate-500 mt-1">Click on any node in the graph to see its properties, SPL code, and impact analysis.</p>
        </div>
    );
    const subtitle = selectedNodeDetails ? (
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {selectedNodeDetails.app}
            </span>
            {selectedNodeType && (
                <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium border border-slate-700/50 bg-slate-800"
                    style={{ color: themeConfig.colors.koTypes[selectedNodeType as keyof typeof themeConfig.colors.koTypes] || themeConfig.colors.semantic.node.fallbackColor }}
                >
                    {selectedNodeType}
                </span>
            )}
        </div>
    ) : null;

    // Tab content using Radix Tabs
    const tabContent = selectedNodeId ? (
        <>
            <Separator className="bg-slate-800" />
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PanelTab)} className="flex flex-col flex-1 min-h-0">
                {/* Impact tab removed from UI - grid changed from 3 to 2 columns */}
                <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border-b border-slate-800 rounded-none h-auto p-0">
                    <TabsTrigger value="details" className={tabTriggerClasses}>
                        Details
                    </TabsTrigger>
                    <TabsTrigger value="spl" className={tabTriggerClasses}>
                        SPL
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="flex-1 min-h-0 overflow-auto mt-0">
                    <NodeDetailsSection
                        nodeId={selectedNodeId}
                        nodeDetails={selectedNodeDetails}
                        nodeType={selectedNodeType}
                    />
                </TabsContent>

                <TabsContent value="spl" className="flex-1 min-h-0 overflow-auto mt-0">
                    <SplTab
                        code={selectedNodeDetails?.spl_code || ''}
                        nodeName={selectedNodeDetails?.name || ''}
                    />
                </TabsContent>

                {/* Impact tab removed from UI - keeping code for future use
                <TabsContent value="impact" className="flex-1 min-h-0 overflow-auto mt-0">
                    <NodeImpactTab nodeId={selectedNodeId} />
                </TabsContent>
                */}
            </Tabs>
        </>
    ) : null;

    return (
        <ContextPanel
            title={selectedNodeDetails?.name || 'No Node Selected'}
            subtitle={subtitle}
            side="left"
            isCollapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
            emptyState={!selectedNodeId ? emptyState : undefined}
        >
            {tabContent}
        </ContextPanel>
    );
}
