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
import { getKoColor } from '@/entities/knowledge-object';
import { cn } from '@/shared/lib/utils';

/** Shared styling for tab triggers - extracted to avoid duplication */
const tabTriggerClasses = cn(
    'rounded-none py-2.5 text-xs font-medium transition-colors text-muted-foreground',
    'data-[state=active]:bg-muted/50 data-[state=active]:text-foreground',
    'data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sky-500'
);

export function DiagramContextPanel() {
    const [collapsed, setCollapsed] = useState(false);
    
    const selectedNodeId = useDiagramStore(state => state.selectedNodeId);
    const activeTab = useDiagramStore(state => state.activeTab);
    const setActiveTab = useDiagramStore(state => state.setActiveTab);
    const coreId = useDiagramStore(state => state.coreId);
    const hiddenTypes = useDiagramStore(state => state.hiddenTypes);

    // Use TanStack Query hook to fetch node details from public/data/nodes/
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
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Select a node to view details</p>
            <p className="text-xs text-muted-foreground mt-1">Click on any node in the graph to see its properties, SPL code, and impact analysis.</p>
        </div>
    );
    const subtitle = selectedNodeDetails ? (
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium bg-muted text-foreground border border-border">
                {selectedNodeDetails.app}
            </span>
            {selectedNodeType && (
                <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium border border-border/50 bg-muted"
                    style={{ color: getKoColor(selectedNodeType) }}
                >
                    {selectedNodeType}
                </span>
            )}
        </div>
    ) : null;

    // Tab content using Radix Tabs
    const tabContent = selectedNodeId ? (
        <>
            <Separator className="bg-border" />
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PanelTab)} className="flex flex-col flex-1 min-h-0">
                <TabsList className="grid w-full grid-cols-2 bg-card/50 border-b border-border rounded-none h-auto p-0">
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
