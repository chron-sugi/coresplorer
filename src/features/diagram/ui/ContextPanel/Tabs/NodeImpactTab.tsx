/**
 * Node impact tab
 *
 * Displays simple upstream/downstream counts for the selected node
 * using the currently loaded diagram data. Read-only; highlighting is
 * handled elsewhere.
 */
import { useDiagramData } from '../../../model/hooks/useDiagramData';
import { useDiagramStore } from '../../../model/store/diagram.store';

interface ImpactTabProps {
    nodeId: string;
}

/**
 * Renders the Impact tab content for a selected node.
 * @param nodeId - the id of the node currently selected in the diagram
 */
export function NodeImpactTab({ nodeId }: ImpactTabProps) {
    const coreId = useDiagramStore(state => state.coreId);
    const hiddenTypes = useDiagramStore(state => state.hiddenTypes);
    const { fullData } = useDiagramData(coreId, hiddenTypes);
    
    if (!fullData) return null;

    // Calculate downstream (outgoing)
    // Filter edges where source is the current node
    // With nested edges, we can just check the node's edges array
    const node = fullData.nodes.find(n => n.id === nodeId);
    const downstreamCount = node?.edges?.length || 0;

    // Calculate upstream (incoming)
    // We need to check all other nodes to see if they have edges pointing to this node
    let upstreamCount = 0;
    fullData.nodes.forEach(otherNode => {
        const incomingEdges = otherNode.edges?.filter(e => e.target === nodeId);
        if (incomingEdges) {
            upstreamCount += incomingEdges.length;
        }
    });
    
    return (
        <div className="p-4 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-200 mb-3">Impact Analysis</h3>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded border border-slate-700/50">
                        <div className="text-2xl font-bold text-sky-400">{upstreamCount}</div>
                        <div className="text-xs text-slate-400 mt-1">Upstream Sources</div>
                    </div>
                    
                    <div className="bg-slate-900 p-3 rounded border border-slate-700/50">
                        <div className="text-2xl font-bold text-emerald-400">{downstreamCount}</div>
                        <div className="text-xs text-slate-400 mt-1">Downstream Nodes</div>
                    </div>
                </div>
                
                <p className="text-xs text-slate-500 mt-4 italic">
                    Impact metrics are read-only. Impact highlighting is handled automatically.
                </p>
            </div>
        </div>
    );
}

