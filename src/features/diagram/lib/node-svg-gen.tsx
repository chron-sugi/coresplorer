import { renderToStaticMarkup } from 'react-dom/server';
import { getNodeIcon, Layers, Share2 } from './node-icons';

/**
 * Props for foreignObject content div that includes xmlns namespace.
 * Required for SVG foreignObject to render HTML correctly.
 */
interface ForeignObjectDivProps extends React.HTMLAttributes<HTMLDivElement> {
  xmlns: string;
}

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
        <div {...{ xmlns: "http://www.w3.org/1999/xhtml" } as ForeignObjectDivProps} className="node-box">
          <div className="node-icon">
            <Icon 
              size={16} 
              color={colors.border} 
              fill={colors.border} 
              fillOpacity={0.2} 
            />
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

interface ClusterSvgOptions {
  label: string;        // e.g., "Macros"
  count: number;        // Number of nodes in cluster
  color: string;        // Type color from getKoColor()
  isHub?: boolean;      // True for hub clusters (uses different icon)
}

/**
 * Generate a Data URL for a cluster node SVG image (diamond shape).
 */
export function generateClusterSvgUrl(options: ClusterSvgOptions): string {
  const { label, count, color, isHub = false } = options;

  // Cluster nodes are 3x larger than regular nodes
  const width = 420;
  const height = 180;

  // Diamond shape points (centered in the viewBox)
  const cx = width / 2;
  const cy = height / 2;

  const Icon = isHub ? Share2 : Layers;
  const displayLabel = `${count} ${label}${count !== 1 ? 's' : ''}`;

  const svgString = renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Diamond background - white fill with colored border */}
      <polygon
        points={`${cx},${4} ${width - 4},${cy} ${cx},${height - 4} ${4},${cy}`}
        fill="#ffffff"
        stroke={color}
        strokeWidth="3"
        filter="url(#shadow)"
      />

      {/* Content overlay using foreignObject - centered within diamond's safe area */}
      <foreignObject x="100" y="40" width={width - 200} height={height - 80}>
        <div
          {...{ xmlns: "http://www.w3.org/1999/xhtml" } as ForeignObjectDivProps}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '28px', // Scaled up for large SVG viewBox
            fontWeight: 'normal',
            color: '#1e293b', // slate-800 - matches regular node text
            textAlign: 'center',
            lineHeight: '1.2',
          }}
        >
          <Icon size={40} color={color} />
          <span>{displayLabel}</span>
        </div>
      </foreignObject>
    </svg>
  );

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}
