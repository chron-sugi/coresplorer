# Coresplorer
Coresplorer is a powerful visualization and analysis tool for Splunk™ SPL (Search Processing Language). It helps users understand complex queries by visualizing field lineage, data flow, and knowledge object dependencies.

## Overview
Coresplorer helps teams understand and optimize Splunk™ deployments by analyzing SPL (Search Processing Language) queries and their dependencies across knowledge objects.

## Features

- **Knowledge Object Dependency Visualization**: Visualize  knowledgeable objects as interactive flow diagrams.
- **Field Lineage**: Track the origin and transformation of fields through the pipeline.
- **Knowledge Object Explorer**: Explore dependencies between macros, lookups, and saved searches.
- **Syntax Highlighting**: Rich SPL syntax highlighting and validation.


## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chron-sugi/coresplorer.git
   cd coresplorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run test`: Run unit tests
- `npm run test:e2e`: Run end-to-end tests
- `npm run lint`: Lint code

## Public data files (visualizations & Knowledge Object Explorer)

The app expects a  set of JSON files in `public/` to power the graph visualizations and the Knowledge Object Explorer list/detail views. Sample JSON files have been provided.

- `public/config.json`
   - Shape: `{ "splunk_instance": string, "port": number }`
   - Used for: pointing the UI at the Splunk Web/API host (no auth stored here).

- `public/index.json`
   - Shape: an object map keyed by knowledge object ID → `{ label, type, app, owner, isolated }`.
   - Required fields per entry:
      - `label` (string): human-friendly name
      - `type` (string): one of `index | macro | lookup | data_model | dashboard | saved_search | ...`
      - `app` (string): owning Splunk app context
      - `owner` (string): Splunk owner
      - `isolated` (boolean): whether the object is intentionally isolated from dependency graph traversal
   - Used for: listing knowledge objects and displaying summary metadata in the explorer.

- `public/graph.json`
   - Shape: `{ version: string, nodes: Array<Node> }` where `Node` contains:
      - `id` (string): matches the key used in `index.json`
      - `label` (string), `type` (string), `app` (string), `owner` (string)
      - `last_modified` (ISO string)
      - `edges`: array of `{ source: string, target: string }` describing directed dependencies
   - Used for: building the visualization graph and lineage views.

- `public/objects/*.json`
   - One file per knowledge object for detail views. Shape:
      - `id` (string): matches the filename and the `index.json` key
      - `label` (string), `type` (string), `app` (string), `owner` (string)
      - `last_modified` (ISO string)
      - `spl_code` (string | null): raw SPL 
   - Used for: showing detailed metadata/code when selecting an item in the explorer.

### Minimal data contract

- All IDs must align across `index.json`, `graph.json` nodes, and `public/objects/<id>.json` files.
- `graph.json.nodes[*].edges` should only reference valid IDs present in `index.json`.
- Additive fields are tolerated, but missing required fields will surface as empty labels or missing links in the UI.

## Splunk Web UI Deep Links

Coresplorer can generate "View in Splunk" links that open knowledge objects directly in your Splunk Web UI. These links appear in:
- Diagram node toolbar
- Diagram node context panel
- Search command suggestions

### Base Configuration

Set these environment variables in `.env.development` or `.env.production`:

```bash
VITE_SPLUNK_WEB_HOST=localhost      # Your Splunk Web UI host
VITE_SPLUNK_WEB_PORT=8000           # Web UI port (typically 8000)
VITE_SPLUNK_WEB_PROTOCOL=https      # http or https
```

### URL Templates

URLs are constructed as: `{protocol}://{host}:{port}/en-US{path_template}`

The path template portion uses placeholders that are replaced with knowledge object values:
- `{app}` - Splunk app context
- `{owner}` - Object owner
- `{name}` - Object name/label

**Default templates:**

| Type | Default Path Template |
|------|----------------------|
| dashboard | `/app/{app}/{name}` |
| saved_search | `/app/{app}/report?s={name}` |
| macro | `/manager/{app}/admin/macros/{name}` |
| lookup_def | `/manager/{app}/data/transforms/lookups/{name}` |
| lookup_file | `/manager/{app}/data/lookups/{name}` |
| data_model | `/manager/{app}/data/models/model/edit/{name}` |
| event_type | `/manager/{app}/saved/eventtypes/{name}` |
| index | `/manager/{app}/data/indexes/{name}` |

### Customizing URL Templates

Override any template via environment variables:

```bash
# Example: Use manager view for saved searches instead of report view
VITE_SPLUNK_URL_SAVED_SEARCH=/manager/{app}/saved/searches/{name}

# Example: Custom dashboard URL pattern
VITE_SPLUNK_URL_DASHBOARD=/app/{app}/dashboards/{name}
```

Available override variables:
- `VITE_SPLUNK_URL_DASHBOARD`
- `VITE_SPLUNK_URL_SAVED_SEARCH`
- `VITE_SPLUNK_URL_MACRO`
- `VITE_SPLUNK_URL_LOOKUP_DEF`
- `VITE_SPLUNK_URL_LOOKUP_FILE`
- `VITE_SPLUNK_URL_DATA_MODEL`
- `VITE_SPLUNK_URL_EVENT_TYPE`
- `VITE_SPLUNK_URL_INDEX`

## Known Limitations

### Data/API
- **Static mode only**: Uses JSON files from `public/*.json` - no live Splunk connectivity
- Environment variables for Splunk API are scaffolded but not implemented


### Knowledge Object Types
- Only 7 types supported: `index`, `macro`, `lookup`, `data_model`, `dashboard`, `saved_search`, `event_type`

## License

Apache License 2.0

## Disclaimer

This project is not affiliated with Splunk Inc. Splunk™ and SPL (Search Processing Language)™ are registered trademarks of Splunk Inc.


