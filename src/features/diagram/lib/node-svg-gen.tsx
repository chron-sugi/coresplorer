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

// Estimate node dimensions based on label text.
export function estimateNodeDimensions(label: string, isCore: boolean) {
  // Reduced widths by ~50% as requested
  const minWidth = isCore ? 150 : 90;
  const maxWidth = 160; // Cap width
  const charWidth = 7.5; // Avg char width
  const iconSpace = 0; // 16px icon + 16px padding
  const padding = 0; // 12px * 2
  
  // Calculate text length and available width
  const estimatedTextWidth = label.length * charWidth;
  const contentWidth = estimatedTextWidth + iconSpace + padding;
  
  // Width logic: use content width but clamp between min and max
  const width = Math.min(Math.max(minWidth, contentWidth), maxWidth);
  
  // Height calculation with wrapping
  const availableTextWidth = width - iconSpace - padding;
  // Estimate lines: (total text width / available line width), min 1 line
  const lines = Math.max(1, Math.ceil(estimatedTextWidth / Math.max(1, availableTextWidth)));
  
  const fontSize = isCore ? 14 : 12;
  const lineHeight = fontSize * 1.3;
  // Base height (padding + borders) + text height
  const baseHeight = isCore ? 20 : 16; // Top/bottom padding approx
  const calculatedHeight = baseHeight + (lines * lineHeight);
  
  // Ensure a minimum height
  const height = Math.max(isCore ? 40 : 32, calculatedHeight);
  
  return { width, height };
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
            padding: 2px 8px;
            gap: 2px;
            border: ${isCore ? '2px' : '1px'} solid ${colors.border};
            background-color: ${colors.background};
            color: ${colors.text};
            border-radius: 6px;
            line-height: 1.3;
          }
          .node-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            padding-right: 4px;
          }
          .node-label {
            white-space: normal;
            word-wrap: break-word;
            overflow: hidden;
            flex-grow: 1;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
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
