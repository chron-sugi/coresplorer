# Schema Requirements

This document defines the schema requirements for all JSON data files used by the CoreSplorer application.

## Table of Contents

- [graph.json](#graphjson)
- [node_details.json](#node_detailsjson)
- [index.json](#indexjson)
- [nodes/*.json](#nodesjson)
- [Common Types](#common-types)

---

## graph.json

**Location:** `/public/data/graph.json`

The global knowledge graph containing all nodes and their relationships.

### Schema

```typescript
type Graph = {
  version: string;
  nodes: GraphNode[];
};

type GraphNode = {
  id: string;
  label: string;
  type: NodeType;
  app: string;
  owner: string;
  last_modified: string;
  edges?: GraphEdge[];
};

type GraphEdge = {
  source: string;
  target: string;
  label?: string;
};
```

### Root Object

| Key | Required | Type | Nullable | Description |
|-----|----------|------|----------|-------------|
| `version` | **Yes** | `string` | No | Schema version (e.g., `"1.0.0"`) |
| `nodes` | **Yes** | `GraphNode[]` | No | Array of all nodes in the graph |

### GraphNode Object

| Key | Required | Type | Nullable | Acceptable Values |
|-----|----------|------|----------|-------------------|
| `id` | **Yes** | `string` | No | Alphanumeric with `-` and `_` only. No spaces, path traversal (`../`), or special characters. |
| `label` | **Yes** | `string` | No | Display name for the node |
| `type` | **Yes** | `NodeType` | No | See [NodeType](#nodetype) enum values |
| `app` | **Yes** | `string` | No | Splunk app name |
| `owner` | **Yes** | `string` | No | Node owner username |
| `last_modified` | **Yes** | `string` | No | ISO 8601 datetime (e.g., `"2025-01-15T10:00:00Z"`) |
| `edges` | No | `GraphEdge[]` | No | Array of edges from this node |

### GraphEdge Object

| Key | Required | Type | Nullable | Description |
|-----|----------|------|----------|-------------|
| `source` | **Yes** | `string` | No | Source node ID |
| `target` | **Yes** | `string` | No | Target node ID |
| `label` | No | `string` | No | Edge label/relationship name |

### Example

```json
{
  "version": "1.0.0",
  "nodes": [
    {
      "id": "security-main-index",
      "label": "Security Events",
      "type": "index",
      "app": "main",
      "owner": "admin",
      "last_modified": "2025-01-15T10:00:00Z",
      "edges": [
        {
          "source": "authentication_dm-security_ops-data_model",
          "target": "security-main-index"
        }
      ]
    }
  ]
}
```

---

## node_details.json

**Location:** `/public/data/nodes/{nodeId}.json`

Individual files containing detailed metadata for each node.

### Schema

```typescript
type NodeDetailRaw = {
  id: string;
  label: string;
  type: NodeType;
  app: string;
  owner: string;
  last_modified: string;
  description?: string;
  spl_code?: string | null;
  attributes?: Record<string, unknown> | null;
};
```

### Fields

| Key | Required | Type | Nullable | Acceptable Values |
|-----|----------|------|----------|-------------------|
| `id` | **Yes** | `string` | No | Must match filename (without `.json`). Alphanumeric with `-` and `_` only. |
| `label` | **Yes** | `string` | No | Display name for the node |
| `type` | **Yes** | `NodeType` | No | See [NodeType](#nodetype) enum values |
| `app` | **Yes** | `string` | No | Splunk app name |
| `owner` | **Yes** | `string` | No | Node owner username |
| `last_modified` | **Yes** | `string` | No | ISO 8601 datetime |
| `description` | No | `string` | No | HTML or plain text description. Defaults to `"No description available"` if absent. |
| `spl_code` | No | `string \| null` | **Yes** | SPL query code. Can be `null` for nodes without SPL (e.g., indexes, dashboards). |
| `attributes` | No | `Record<string, unknown> \| null` | **Yes** | Type-specific attributes object. Can be `null`. |

### Example - Saved Search

```json
{
  "id": "application_errors-application_monitoring-saved_search",
  "label": "Application Error Summary",
  "type": "saved_search",
  "app": "application_monitoring",
  "owner": "app_admin",
  "last_modified": "2025-01-08T11:30:00Z",
  "spl_code": "index=application level=ERROR\n| `error_classification`\n| stats count as error_count by app"
}
```

### Example - Lookup Definition (null spl_code)

```json
{
  "id": "assets_lookup-security_ops-lookup_def",
  "label": "Asset Inventory",
  "type": "lookup_def",
  "app": "security_ops",
  "owner": "security_analyst",
  "last_modified": "2025-01-14T11:00:00Z",
  "spl_code": null
}
```

### Example - With Attributes

```json
{
  "id": "users_lookup-hr_app-lookup_def",
  "label": "User Directory",
  "type": "lookup_def",
  "app": "hr_app",
  "owner": "hr_admin",
  "last_modified": "2025-01-20T09:00:00Z",
  "spl_code": null,
  "attributes": {
    "filename": "users.csv",
    "field_count": 8,
    "row_count": 1500
  }
}
```

---

## index.json

**Location:** `/public/data/index.json`

A flat key-value registry of all knowledge objects for quick lookups.

### Schema

```typescript
type KOIndex = Record<string, IndexNode>;

type IndexNode = {
  label: string;
  type: string;
  app: string;
  owner: string;
  isolated?: boolean;
};
```

### Root Structure

The root is a key-value object where:
- **Key**: Node ID (`string`)
- **Value**: `IndexNode` object

### IndexNode Object

| Key | Required | Type | Nullable | Acceptable Values |
|-----|----------|------|----------|-------------------|
| `label` | **Yes** | `string` | No | Display name for the node |
| `type` | **Yes** | `string` | No | Node type (matches NodeType values) |
| `app` | **Yes** | `string` | No | Splunk app name |
| `owner` | **Yes** | `string` | No | Node owner username |
| `isolated` | No | `boolean` | No | Whether the node is isolated (no dependencies). Defaults to `false`. |

### Example

```json
{
  "security-main-index": {
    "label": "Security Events",
    "type": "index",
    "app": "main",
    "owner": "admin",
    "isolated": false
  },
  "network-main-index": {
    "label": "Network Traffic",
    "type": "index",
    "app": "main",
    "owner": "admin"
  },
  "orphan_search-misc-saved_search": {
    "label": "Orphan Search",
    "type": "saved_search",
    "app": "misc",
    "owner": "admin",
    "isolated": true
  }
}
```

---

## nodes/*.json

**Location:** `/public/data/nodes/`

Individual JSON files for each node, following the same schema as [node_details.json](#node_detailsjson).

### File Naming Convention

- Filename: `{nodeId}.json`
- The filename (without extension) must match the `id` field inside the JSON file

### Examples by Node Type

#### Index

```json
{
  "id": "linux-main-index",
  "label": "Linux System Logs",
  "type": "index",
  "app": "main",
  "owner": "admin",
  "last_modified": "2025-01-11T16:00:00Z",
  "spl_code": null
}
```

#### Data Model

```json
{
  "id": "application_dm-application_monitoring-data_model",
  "label": "Application Performance Data Model",
  "type": "data_model",
  "app": "application_monitoring",
  "owner": "app_admin",
  "last_modified": "2025-01-08T00:00:00Z",
  "spl_code": null
}
```

#### Macro

```json
{
  "id": "calculate_bandwidth-network_monitoring-macro",
  "label": "Calculate Bandwidth",
  "type": "macro",
  "app": "network_monitoring",
  "owner": "network_admin",
  "last_modified": "2025-01-12T09:20:00Z",
  "spl_code": "eval bandwidth_mbps=round((bytes_in + bytes_out) / 1024 / 1024, 2)"
}
```

#### Dashboard

```json
{
  "id": "compliance_dashboard-compliance-dashboard",
  "label": "Compliance Status Dashboard",
  "type": "dashboard",
  "app": "compliance",
  "owner": "compliance_officer",
  "last_modified": "2025-01-10T01:30:00Z",
  "spl_code": null
}
```

#### Event Type

```json
{
  "id": "failed_login-security_ops-event_type",
  "label": "Failed Login Events",
  "type": "event_type",
  "app": "security_ops",
  "owner": "security_analyst",
  "last_modified": "2025-01-05T14:00:00Z",
  "spl_code": "index=security sourcetype=auth action=failure"
}
```

#### Lookup Definition

```json
{
  "id": "geo_lookup-network_monitoring-lookup_def",
  "label": "GeoIP Lookup",
  "type": "lookup_def",
  "app": "network_monitoring",
  "owner": "network_admin",
  "last_modified": "2025-01-14T11:00:00Z",
  "spl_code": null
}
```

#### Lookup File

```json
{
  "id": "assets_csv-security_ops-lookup_file",
  "label": "Assets CSV",
  "type": "lookup_file",
  "app": "security_ops",
  "owner": "admin",
  "last_modified": "2025-01-13T08:00:00Z",
  "spl_code": null
}
```

---

## Common Types

### NodeType

An enumeration of valid node types:

```typescript
type NodeType =
  | 'saved_search'   // Saved searches/reports
  | 'data_model'     // Data models
  | 'event_type'     // Event types
  | 'lookup_def'     // Lookup definitions
  | 'lookup_file'    // Lookup CSV files
  | 'macro'          // Search macros
  | 'index'          // Splunk indexes
  | 'dashboard'      // Dashboards
  | 'unknown';       // Unknown/unclassified type
```

### Node ID Format

Valid node IDs must:
- Contain only: alphanumeric characters (`a-z`, `A-Z`, `0-9`), hyphens (`-`), and underscores (`_`)
- **NOT** contain: spaces, path traversal sequences (`../`), special characters, or XSS payloads
- **NOT** be empty or contain only whitespace

**Convention:** `{name}-{app}-{type}` (e.g., `security_search-main-saved_search`)

### DateTime Format

All datetime fields use ISO 8601 format:
- Format: `YYYY-MM-DDTHH:mm:ssZ`
- Example: `"2025-01-15T10:00:00Z"`
- Timezone: Always UTC (indicated by `Z` suffix)

---

## Summary Table

| File | Required Keys | Optional Keys | Nullable Keys |
|------|---------------|---------------|---------------|
| `graph.json` | `version`, `nodes[].*` (id, label, type, app, owner, last_modified) | `nodes[].edges`, `edges[].label` | None |
| `node_details.json` | `id`, `label`, `type`, `app`, `owner`, `last_modified` | `description`, `spl_code`, `attributes` | `spl_code`, `attributes` |
| `index.json` | `{nodeId}.label`, `{nodeId}.type`, `{nodeId}.app`, `{nodeId}.owner` | `{nodeId}.isolated` | None |
| `nodes/*.json` | Same as `node_details.json` | Same as `node_details.json` | `spl_code`, `attributes` |

---

## Validation

All schemas are validated at runtime using [Zod](https://zod.dev/). Schema definitions can be found in:

- `src/entities/snapshot/model/snapshot.schemas.ts` - Graph and node schemas
- `src/entities/knowledge-object/model/knowledge-object.schemas.ts` - KO index schema
