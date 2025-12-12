import { renderToStaticMarkup } from 'react-dom/server';
import { getNodeIcon } from './node-icons';


interface NodeSvgOptions {
  label: string;
  type: string;
  isCore: boolean;
  colors: {
    background: string;
    border: string;
    text: string;
  };
  width?: number;
}

/**
 * Estimate node dimensions based on label text.
 */
export function estimateNodeDimensions(label: string, isCore: boolean) {
  const minWidth = isCore ? 220 : 180;
  const charWidth = 8; // Approx for 12/14px font
  const iconSpace = 32; // 16px icon + 16px padding
  const padding = 24; // 12px * 2
  
  const estimatedTextWidth = label.length * charWidth;
  const contentWidth = estimatedTextWidth + iconSpace + padding;
  
  const width = Math.max(minWidth, contentWidth);
  // Cap width if it gets too crazy (though we truncated label already)
  const finalWidth = Math.min(width, 400);
  
  // Height: Core nodes are taller
  const height = isCore ? 40 : 32;
  
  return { width: finalWidth, height };
}

/**
 * Generate a Data URL for a node SVG image.
 */
export function generateNodeSvgUrl(options: NodeSvgOptions): string {
  const { label, type, isCore, colors } = options;
  const { width, height } = estimateNodeDimensions(label, isCore);
  const Icon = getNodeIcon(type);

  // Render the node content as HTML/SVG
  const svgString = renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <style>
        {`
          .node-box {
            font-family: system-ui, -apple-system, sans-serif;
            font-size: ${isCore ? '14px' : '12px'};
            font-weight: ${isCore ? 'bold' : 'normal'};
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 0 12px;
            gap: 8px;
            border: ${isCore ? '2px' : '1px'} solid ${colors.border};
            background-color: ${colors.background};
            color: ${colors.text};
            border-radius: 4px; /* vis-network box radius approximation */
          }
          .node-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .node-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-grow: 1;
          }
        `}
      </style>
      <foreignObject x="0" y="0" width={width} height={height}>
        { }
        <div {...{ xmlns: "http://www.w3.org/1999/xhtml" } as any} className="node-box">
          <div className="node-icon">
            <Icon size={16} color={colors.text} />
          </div>
          <div className="node-label">
            {label}
          </div>
        </div>
      </foreignObject>
    </svg>
  );

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
