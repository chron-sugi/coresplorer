/**
 * NodeActionToolbar
 *
 * Floating toolbar that appears above a selected node in the vis-network diagram.
 * Shows action buttons like "View diagram" and "View in Splunk".
 *
 * @module features/diagram/ui/Canvas/NodeActionToolbar
 */
import { Network, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildSplunkUrl, isSplunkWebUrlAvailable } from '@/shared/lib/splunk-url-builder';
import { encodeUrlParam } from '@/shared/lib';

export type NodeActionToolbarProps = {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  nodeApp?: string;
  nodeOwner?: string;
  position: { x: number; y: number };
  onClose: () => void;
};

/**
 * NodeActionToolbar
 *
 * Floating action toolbar for selected nodes.
 * Positioned above the node using absolute positioning.
 */
export function NodeActionToolbar({
  nodeId,
  nodeLabel,
  nodeType,
  nodeApp,
  nodeOwner,
  position,
}: NodeActionToolbarProps): React.JSX.Element {
  const navigate = useNavigate();

  // Generate Splunk URL if available
  const splunkUrl =
    nodeLabel && nodeApp && isSplunkWebUrlAvailable()
      ? buildSplunkUrl({
          name: nodeLabel,
          type: nodeType as Parameters<typeof buildSplunkUrl>[0]['type'],
          app: nodeApp,
          owner: nodeOwner,
        })
      : null;

  return (
    <div
      className="absolute z-30 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y - 36, // Position above the node center
        transform: 'translateX(-50%)',
      }}
    >
      <div className="flex gap-1 bg-white border border-slate-200 rounded-md p-1 shadow-md">
        <button
          onClick={() => navigate(`/diagram/${encodeUrlParam(nodeId)}`)}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-sky-600 transition-colors"
          title="Open as diagram core"
        >
          <Network size={16} />
        </button>
        {splunkUrl && (
          <a
            href={splunkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-sky-600 transition-colors"
            title="View in Splunk"
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  );
}
