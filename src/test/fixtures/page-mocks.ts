/**
 * Mock data fixtures for page component tests.
 * Provides realistic test data for pages and integration tests.
 */

// Mock Knowledge Object data for HomePage
export const mockKOList = [
  {
    id: 'ko-1',
    name: 'Failed Login Dashboard',
    type: 'dashboard',
    owner: 'admin',
    app: 'search',
    sharing: 'global',
    description: 'Dashboard showing failed login attempts',
  },
  {
    id: 'ko-2',
    name: 'Error Rate Alert',
    type: 'saved_search',
    owner: 'security',
    app: 'monitoring',
    sharing: 'app',
    description: 'Alert for high error rates',
  },
  {
    id: 'ko-3',
    name: 'User Activity Report',
    type: 'report',
    owner: 'analyst',
    app: 'search',
    sharing: 'private',
    description: 'Weekly user activity summary',
  },
  {
    id: 'ko-4',
    name: 'IP Lookup Table',
    type: 'lookup_file',
    owner: 'admin',
    app: 'security',
    sharing: 'global',
    description: 'IP address to location mapping',
  },
  {
    id: 'ko-5',
    name: 'Format Timestamp Macro',
    type: 'macro',
    owner: 'admin',
    app: 'search',
    sharing: 'global',
    description: 'Macro to format timestamps consistently',
  },
];

// Mock diagram node data for DiagramPage
export const mockDiagramNode = {
  id: 'node-1',
  label: 'Security Dashboard',
  object_type: 'dashboard',
  owner: 'admin',
  app: 'security',
};

// Mock diagram graph data
export const mockDiagramGraph = {
  version: '1.0',
  nodes: [
    {
      id: 'node-1',
      label: 'Security Dashboard',
      object_type: 'dashboard',
      owner: 'admin',
      app: 'security',
    },
    {
      id: 'node-2',
      label: 'Failed Logins Search',
      object_type: 'saved_search',
      owner: 'admin',
      app: 'security',
    },
    {
      id: 'node-3',
      label: 'User Lookup',
      object_type: 'lookup_def',
      owner: 'admin',
      app: 'security',
    },
  ],
  edges: [
    { id: 'edge-1', source: 'node-1', target: 'node-2' },
    { id: 'edge-2', source: 'node-2', target: 'node-3' },
  ],
};

// Mock SPL code for SPLinterPage and editor widgets
export const mockSplCode = `search index=main status=500
| stats count by host
| eval is_error=if(status >= 500, "yes", "no")`;

// Mock complex SPL with multiple commands
export const mockComplexSpl = `search index=main sourcetype=access_combined status=*
| rex field=_raw "(?<response_time>\\d+)ms"
| eval response_time_sec=response_time/1000
| stats avg(response_time_sec) as avg_response, count by status, host
| where count > 100
| lookup geo_ip_lookup host OUTPUT city, country
| rename avg_response as "Average Response Time (s)", count as "Request Count"
| sort - "Request Count"
| head 20`;

// Mock SPL with subsearches
export const mockSplWithSubsearches = `search index=main
[search index=security action=failed
 | stats count by user
 | where count > 5
 | fields user]
| stats count by user, action`;

// Mock performance linter SPL (has issues)
export const mockProblematicSpl = `search index=main
| join type=inner host [search index=network]
| transaction host maxspan=5m
| stats count`;
