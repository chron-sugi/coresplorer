# Diagram Edges Array Design

## Overview

The diagram displays nodes based on the `edges` array of the selected core node. No graph traversal is performed - the edges array is the single source of truth for what gets displayed.

## Data Structure

Each node in the JSON has an `edges` array containing all relationships to display:

```json
{
  "id": "my_saved_search",
  "label": "My Saved Search",
  "type": "saved_search",
  "edges": [
    { "source": "my_saved_search", "target": "index_main" },
    { "source": "my_saved_search", "target": "lookup_users" },
    { "source": "dashboard_ops", "target": "my_saved_search" }
  ]
}
```

## Edge Requirements

| Field | Required | Description |
|-------|----------|-------------|
| `source` | Yes | ID of the node where the edge originates |
| `target` | Yes | ID of the node where the edge points |
| `label` | No | Optional edge label for display |

## Key Design Decision

**The edges array must contain ALL edges to display** - both direct and indirect dependencies.

### Why?

- **No traversal**: The diagram does not walk the graph. It only reads the edges array.
- **Explicit control**: Data generator decides what relationships to include.
- **Performance**: Simple iteration vs recursive graph traversal.
- **Predictability**: What you put in edges is exactly what displays.

## Level Computation

Levels are computed automatically from source/target relationships:

| Scenario | Level Assignment |
|----------|-----------------|
| Core node | Level 0 |
| Edge where `source` is core | Target gets level -1 (downstream) |
| Edge where `target` is core | Source gets level +1 (upstream) |
| Propagation | If source has level N, target gets N-1 |

### Example

For core node `A`:

```
edges: [
  { source: "A", target: "B" }   → B = level -1
  { source: "B", target: "C" }   → C = level -2
  { source: "D", target: "A" }   → D = level +1
]
```

## What Gets Displayed

Only nodes that appear in the edges array (as source or target) are displayed. If a node has no edges, only the core node itself is shown.

## Data Generator Responsibility

When generating the JSON, include in each node's edges array:

1. **Direct dependencies** - What this node directly uses
2. **Indirect dependencies** - Transitive dependencies to show deeper levels
3. **Direct dependents** - What directly uses this node
4. **Indirect dependents** - Transitive dependents for upstream visualization

The depth and breadth of what to include is a data generation decision, not a UI decision.
