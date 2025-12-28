/**
 * Node details section for the unified context panel.
 * Displays detailed information about the selected node.
 */

import { ExternalLink } from 'lucide-react';
import type { NodeDetails } from '../../../model/diagram.schemas';
import { buildSplunkUrl, isSplunkWebUrlAvailable } from '@/shared/lib/splunk-url-builder';

interface NodeDetailsSectionProps {
    nodeId: string | null;
    nodeDetails: NodeDetails | null;
    nodeType?: string;
}

export function NodeDetailsSection({
    nodeId,
    nodeDetails,
    nodeType
}: NodeDetailsSectionProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleString();
    };

    if (!nodeId || !nodeDetails) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm px-4 text-center">
                Select a node to view details
            </div>
        );
    }

    // Generate Splunk URL if available
    const splunkUrl = nodeType && isSplunkWebUrlAvailable()
        ? buildSplunkUrl({
            name: nodeDetails.name,
            type: nodeType,
            app: nodeDetails.app,
            owner: nodeDetails.owner,
          })
        : null;

    return (
        <div className="flex flex-col h-full overflow-y-auto p-4 min-h-0">
            <div className="space-y-3">
                {/* Node ID */}
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400 mb-1">Node ID</p>
                    <code className="text-xs text-slate-200 font-mono break-all">{nodeId}</code>
                </div>

                {/* Owner & App */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/50 rounded-lg p-2.5">
                        <p className="text-xs text-slate-400 mb-1">Owner</p>
                        <p className="text-xs text-slate-100 font-medium">{nodeDetails.owner}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2.5">
                        <p className="text-xs text-slate-400 mb-1">App</p>
                        <p className="text-xs text-slate-100 font-medium">{nodeDetails.app}</p>
                    </div>
                </div>

                {/* Last Modified */}
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400 mb-1">Last Modified</p>
                    <p className="text-xs text-slate-100">{formatDate(nodeDetails.last_modified)}</p>
                </div>

                {/* Attributes */}
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                    <p className="text-xs text-slate-400 mb-1">Attributes</p>
                    {nodeDetails.attributes && Object.keys(nodeDetails.attributes).length > 0 ? (
                        <div className="space-y-1">
                            {Object.entries(nodeDetails.attributes).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-start gap-2">
                                    <span className="text-xs text-slate-400 font-mono">{key}:</span>
                                    <span className="text-xs text-slate-200 text-right break-all">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-200 leading-relaxed">
                            No attributes available
                        </p>
                    )}
                </div>

                {/* View in Splunk Button */}
                {splunkUrl && (
                    <a
                        href={splunkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span>View in Splunk</span>
                    </a>
                )}
            </div>
        </div>
    );
}

