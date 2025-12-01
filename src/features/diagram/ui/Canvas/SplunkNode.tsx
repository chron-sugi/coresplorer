/**
 * SplunkNode component
 *
 * Renders a single knowledge-object node as a compact pill/chip. The node
 * displays a colored circular icon (encoding the KO type) on the left and
 * the object name on the right. Core nodes use bolder text and a subtle
 * tinted background.
 *
 * Props are received via React Flow's `NodeProps` and the node's runtime
 * data is expected to include `label` and `object_type` fields. The
 * component also reads visual flags from `data` such as `isFocused`,
 * `isHighlighted`, `isDimmed` and `isCore` which may be injected by the
 * layout or highlighting logic.
 */
import { memo } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { Box, ExternalLink, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { themeConfig } from '@/shared/config';
import { SPLUNK_KO_ICONS } from '@/entities/knowledge-object';
import { DIAGRAM_LAYOUT } from '../../model/constants/diagram.constants';
import { buildSplunkUrl, isSplunkWebUrlAvailable } from '@/shared/lib/splunk-url-builder';
import { encodeUrlParam } from '@/shared/lib';
import {
  splunkNodeVariants,
  splunkNodeIconVariants,
  splunkNodeIconElementVariants,
  splunkNodeLabelVariants,
  computeNodeState,
} from './SplunkNode.variants';

/**
 * SplunkNode
 *
 * Pill-shaped node with colored icon badge and name label.
 *
 * @param {NodeProps} props - Props provided by React Flow for the node.
 * @returns {JSX.Element} Rendered node element.
 */
export const SplunkNode = memo(({ data, selected, id }: NodeProps) => {
  const navigate = useNavigate();
  const objectType = (data.object_type as string) || 'unknown';
  const Icon = SPLUNK_KO_ICONS[objectType as keyof typeof SPLUNK_KO_ICONS] || Box;
  const typeColor =
    themeConfig.colors.koTypes[objectType as keyof typeof themeConfig.colors.koTypes] ||
    themeConfig.colors.koTypes.unknown;

  // Get highlighting states from data
  const isFocused = (data as Record<string, boolean>).isFocused || false;
  const isHighlighted = (data as Record<string, boolean>).isHighlighted || false;
  const isDimmed = (data as Record<string, boolean>).isDimmed || false;
  const isCore = (data as Record<string, boolean>).isCore || false;

  // Compute state variant from boolean flags
  const state = computeNodeState({ isDimmed, isFocused, selected, isHighlighted });

  // Extract KO metadata for URL generation
  const koName = (data.name as string) || (data.label as string);
  const koApp = data.app as string;
  const koOwner = data.owner as string;

  // Generate Splunk URL if all required data is available
  const splunkUrl = koName && koApp && isSplunkWebUrlAvailable()
    ? buildSplunkUrl({
        name: koName,
        type: objectType as any,
        app: koApp,
        owner: koOwner,
      })
    : null;

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={5}>
        <div className="flex gap-3 bg-white border border-slate-200 rounded-md p-1 shadow-sm">
          <button
            onClick={() => navigate(`/diagram/${encodeUrlParam(id)}`)}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-sky-600 transition-colors"
            title="View diagram"
          >
            <Network size={14} />
          </button>
          {splunkUrl && (
            <a
              href={splunkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-sky-600 transition-colors"
              title="View in Splunk"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </NodeToolbar>

      <div
        className={splunkNodeVariants({ state, isCore })}
        style={{
          width: isCore ? DIAGRAM_LAYOUT.NODE_WIDTH_CORE : DIAGRAM_LAYOUT.NODE_WIDTH,
          height: isCore ? DIAGRAM_LAYOUT.NODE_HEIGHT_CORE : DIAGRAM_LAYOUT.NODE_HEIGHT,
        }}
      >
      {/* Handle styling handled by react-flow-overrides.css */}
      <Handle
        type="target"
        position={Position.Top}
      />

      {/* Colored circular icon */}
      <div
        className={splunkNodeIconVariants({ isCore })}
        style={{ backgroundColor: typeColor }}
      >
        <Icon className={splunkNodeIconElementVariants({ isCore })} />
      </div>

      {/* Name label - truncate to fit fixed width */}
      <span className={splunkNodeLabelVariants({ isCore })}>
        {data.label as string}
      </span>

      <Handle
        type="source"
        position={Position.Bottom}
      />
      </div>
    </>
  );
});

SplunkNode.displayName = 'SplunkNode';
