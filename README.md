# Coresplorer

Coresplorer is a powerful visualization and analysis tool for Splunk SPL (Search Processing Language). It helps users understand complex queries by visualizing field lineage, data flow, and knowledge object dependencies.

## Features

- **SPL Visualization**: Visualize SPL queries as interactive flow diagrams.
- **Field Lineage**: Track the origin and transformation of fields through the pipeline.
- **Knowledge Object Explorer**: Explore dependencies between macros, lookups, and saved searches.
- **Syntax Highlighting**: Rich SPL syntax highlighting and validation.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: Zustand, TanStack Query
- **Visualization**: React Flow, D3 (dagre)
- **Testing**: Vitest, Testing Library, Playwright

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

## License

Apache License 2.0

