/// <reference types="vite/client" />

/**
 * Type definitions for environment variables accessible via import.meta.env
 * 
 * All custom environment variables must be prefixed with VITE_ to be exposed
 * to the client-side code. These are inlined at build time.
 * 
 * @see https://vitejs.dev/guide/env-and-mode.html
 */
interface ImportMetaEnv {
  /** Base URL for the application (set by Vite) */
  readonly BASE_URL: string;
  /** Current mode: 'development' | 'production' */
  readonly MODE: string;
  /** Whether app is running in development mode */
  readonly DEV: boolean;
  /** Whether app is running in production mode */
  readonly PROD: boolean;
  /** Whether app is running in SSR mode */
  readonly SSR: boolean;

  // Application-specific environment variables
  /** Enable Mock Service Worker for API mocking */
  readonly VITE_ENABLE_MSW?: string;
  
  /** 
   * Enable Splunk API mode
   * If 'true', the app will fetch data from the configured Splunk server
   * If 'false' or undefined, it will use static JSON files
   */
  readonly VITE_USE_SPLUNK_API?: string;
  
  // Splunk Server Configuration
  /** Splunk server hostname or IP address */
  readonly VITE_SPLUNK_HOST?: string;
  /** Splunk server port (typically 8089 for management port) */
  readonly VITE_SPLUNK_PORT?: string;
  /** Protocol to use for Splunk API (http or https) */
  readonly VITE_SPLUNK_PROTOCOL?: string;
  /** Optional: Splunk API authentication token */
  readonly VITE_SPLUNK_TOKEN?: string;

  // Data File Paths (relative to BASE_PATH)
  /** Path to metadata file */
  readonly VITE_DATA_META_PATH?: string;
  /** Path to index file */
  readonly VITE_DATA_INDEX_PATH?: string;
  /** Path to graph file */
  readonly VITE_DATA_GRAPH_PATH?: string;
  /** Path to objects folder */
  readonly VITE_DATA_OBJECTS_PATH?: string;
  /** Path to release notes file */
  readonly VITE_DATA_RELEASE_NOTES_PATH?: string;

  // Splunk Web UI Configuration (for deep links)
  /** Splunk Web UI hostname (typically same as VITE_SPLUNK_HOST) */
  readonly VITE_SPLUNK_WEB_HOST?: string;
  /** Splunk Web UI port (typically 8000, different from API port 8089) */
  readonly VITE_SPLUNK_WEB_PORT?: string;
  /** Protocol to use for Splunk Web UI (http or https) */
  readonly VITE_SPLUNK_WEB_PROTOCOL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
