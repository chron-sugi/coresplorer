# Coresplorer
Coresplorer™ is a powerful visualization and analysis tool for Splunk™ SPL (Search Processing Language). It helps users understand complex queries by visualizing field lineage, data flow, and knowledge object dependencies.
## Overview

Coresplorer™ helps teams understand and optimize Splunk™ deployments by analyzing SPL (Search Processing Language) queries and their dependencies across knowledge objects.

## Features

- **SPL Visualization**: Visualize  knowledgeable objects as interactive flow diagrams.
- **Field Lineage**: Track the origin and transformation of fields through the pipeline.
- **Knowledge Object Explorer**: Explore dependencies between macros, lookups, and saved searches.
- **Syntax Highlighting**: Rich SPL syntax highlighting and validation.
- **Field Lineage**: Track the origin and transformation of fields through the pipeline.


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

The app expects a  set of JSON files in `public/` to power the graph visualizations and the Knowledge Object Explorer list/detail views.

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
      - `spl_code` (string | null): raw SPL (if applicable)
      - `upstream_count` (number), `downstream_count` (number): dependency counts for quick summaries
   - Used for: showing detailed metadata/code when selecting an item in the explorer.

### Minimal data contract

- All IDs must align across `index.json`, `graph.json` nodes, and `public/objects/<id>.json` files.
- `graph.json.nodes[*].edges` should only reference valid IDs present in `index.json`.
- Additive fields are tolerated, but missing required fields will surface as empty labels or missing links in the UI.

## Known Limitations

### SPL Parser
- **100+ commands supported** with full grammar rules for parsing
- Some command options incomplete: `streamstats window=`, `chart span=`, `rex mode=sed`, `lookup OUTPUT`, `dedup sortby`, `foreach`, `transaction maxspan`
- Commands not explicitly defined are silently accepted but provide no semantic analysis

### Data/API
- **Static mode only**: Uses JSON files from `public/*.json` - no live Splunk connectivity
- Environment variables for Splunk API are scaffolded but not implemented

### Field Lineage
- **58 command handlers** track field creation, modification, consumption, and drops
- Macros tokenized but not expanded
- Subsearch field flow doesn't cross boundaries
- Knowledge object search loads SPL into editor and navigates to diagram view

### Knowledge Object Types
- Only 7 types supported: `index`, `macro`, `lookup`, `data_model`, `dashboard`, `saved_search`, `event_type`

## License

Apache License 2.0

## Disclaimer

This project is not affiliated with Splunk Inc. Splunk™ and SPL (Search Processing Language)™ are registered trademarks of Splunk Inc.


