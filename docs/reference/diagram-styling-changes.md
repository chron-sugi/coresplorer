# Diagram Styling Changes

Summary of layout and styling changes made to the diagram feature.

## Changes Made

### 1. Dagre Layout Configuration

**File:** `src/features/diagram/model/hooks/useDiagramLayout.ts`

#### Before
```typescript
dagreGraph.setGraph({
    rankdir: direction,
    nodesep: DIAGRAM_LAYOUT.NODE_SEPARATION,
    ranksep: DIAGRAM_LAYOUT.RANK_SEPARATION,
    ranker: 'longest-path',
    align: 'DR'
});
```

#### After
```typescript
dagreGraph.setGraph({
    rankdir: direction,
    nodesep: DIAGRAM_LAYOUT.NODE_SEPARATION,
    ranksep: DIAGRAM_LAYOUT.RANK_SEPARATION,
    ranker: 'network-simplex',
});
```

#### Rationale
- **Removed `align: 'DR'`**: The Down-Right alignment was causing nodes to cluster asymmetrically. Removing it allows dagre to center nodes within their ranks, creating better left/right symmetry around the core node.
- **Changed `ranker` to `'network-simplex'`**: This algorithm produces more balanced node distribution compared to `'longest-path'` which tends to stretch layouts.

### 2. Edge Type

**File:** `src/features/diagram/model/hooks/useDiagramData.ts`

Edge type remains as `'smoothstep'` which provides right-angle paths with rounded corners.

```typescript
newEdges.push({
    type: 'smoothstep',
    // ...
});
```

## Available Dagre Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `rankdir` | string | `'TB'` | Direction: `'TB'`, `'BT'`, `'LR'`, `'RL'` |
| `align` | string | undefined | Node alignment: `'UL'`, `'UR'`, `'DL'`, `'DR'`, or undefined (centered) |
| `nodesep` | number | 50 | Horizontal spacing between nodes in same rank |
| `ranksep` | number | 50 | Vertical spacing between ranks |
| `ranker` | string | `'network-simplex'` | Algorithm: `'network-simplex'`, `'tight-tree'`, `'longest-path'` |

## Available React Flow Edge Types Reference

| Type | Description |
|------|-------------|
| `bezier` | Smooth curved S-line |
| `straight` | Direct straight line |
| `step` | Right-angle corners (Manhattan routing) |
| `smoothstep` | Right-angle with rounded corners |

## Current Configuration

- **Layout**: `network-simplex` ranker with centered alignment
- **Edge style**: `smoothstep` with dashed lines (`strokeDasharray: '6 4'`)
- **Node separation**: 60px horizontal, 50px vertical (defined in `diagram.constants.ts`)
