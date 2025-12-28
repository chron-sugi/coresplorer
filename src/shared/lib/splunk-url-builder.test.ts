import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildSplunkUrl, isSplunkWebUrlAvailable } from './splunk-url-builder';

describe('splunk-url-builder', () => {
  beforeEach(() => {
    // Reset environment before each test
    vi.stubEnv('VITE_SPLUNK_WEB_HOST', undefined);
    vi.stubEnv('VITE_SPLUNK_WEB_PORT', undefined);
    vi.stubEnv('VITE_SPLUNK_WEB_PROTOCOL', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('buildSplunkUrl', () => {
    describe('when config is present', () => {
      beforeEach(() => {
        vi.stubEnv('VITE_SPLUNK_WEB_HOST', 'localhost');
        vi.stubEnv('VITE_SPLUNK_WEB_PORT', '8000');
        vi.stubEnv('VITE_SPLUNK_WEB_PROTOCOL', 'https');
      });

      it('builds URL for dashboard', () => {
        const url = buildSplunkUrl({
          name: 'my_dashboard',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toBe('https://localhost:8000/en-US/app/search/my_dashboard');
      });

      it('builds URL for saved_search', () => {
        const url = buildSplunkUrl({
          name: 'my_search',
          type: 'saved_search',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/app/search/report?s=my_search'
        );
      });

      it('builds URL for macro', () => {
        const url = buildSplunkUrl({
          name: 'my_macro',
          type: 'macro',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/manager/search/admin/macros/my_macro'
        );
      });

      it('builds URL for lookup_def', () => {
        const url = buildSplunkUrl({
          name: 'my_lookup',
          type: 'lookup_def',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/manager/search/data/transforms/lookups/my_lookup'
        );
      });

      it('builds URL for lookup_file', () => {
        const url = buildSplunkUrl({
          name: 'my_lookup_file',
          type: 'lookup_file',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/manager/search/data/lookups/my_lookup_file'
        );
      });

      it('builds URL for data_model', () => {
        const url = buildSplunkUrl({
          name: 'my_model',
          type: 'data_model',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/manager/search/data/models/model/edit/my_model'
        );
      });

      it('builds URL for event_type', () => {
        const url = buildSplunkUrl({
          name: 'my_eventtype',
          type: 'event_type',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/manager/search/saved/eventtypes/my_eventtype'
        );
      });

      it('builds URL for index', () => {
        const url = buildSplunkUrl({
          name: 'main',
          type: 'index',
          app: 'search',
        });
        expect(url).toBe(
          'https://localhost:8000/en-US/manager/search/data/indexes/main'
        );
      });

      it('URL encodes special characters in name', () => {
        const url = buildSplunkUrl({
          name: 'my search with spaces',
          type: 'saved_search',
          app: 'search',
        });
        expect(url).toContain('my%20search%20with%20spaces');
      });

      it('URL encodes special characters in app', () => {
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'my app',
        });
        expect(url).toContain('/app/my%20app/');
      });

      it('uses http protocol when specified', () => {
        vi.stubEnv('VITE_SPLUNK_WEB_PROTOCOL', 'http');
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toMatch(/^http:\/\//);
      });

      it('falls back to unknown template for unknown types', () => {
        const url = buildSplunkUrl({
          name: 'test',
          type: 'unknown_type',
          app: 'search',
        });
        // Default unknown template is /app/{app}/search
        expect(url).toBe('https://localhost:8000/en-US/app/search/search');
      });
    });

    describe('when config is missing', () => {
      it('returns null when host is missing', () => {
        vi.stubEnv('VITE_SPLUNK_WEB_PORT', '8000');
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toBeNull();
      });

      it('returns null when port is missing', () => {
        vi.stubEnv('VITE_SPLUNK_WEB_HOST', 'localhost');
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toBeNull();
      });

      it('returns null when both host and port are missing', () => {
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toBeNull();
      });
    });

    describe('config validation', () => {
      it('defaults protocol to https when not specified', () => {
        vi.stubEnv('VITE_SPLUNK_WEB_HOST', 'localhost');
        vi.stubEnv('VITE_SPLUNK_WEB_PORT', '8000');
        // Don't set protocol
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toMatch(/^https:\/\//);
      });

      it('rejects invalid port format', () => {
        vi.stubEnv('VITE_SPLUNK_WEB_HOST', 'localhost');
        vi.stubEnv('VITE_SPLUNK_WEB_PORT', 'not-a-number');
        const url = buildSplunkUrl({
          name: 'test',
          type: 'dashboard',
          app: 'search',
        });
        expect(url).toBeNull();
      });
    });
  });

  describe('isSplunkWebUrlAvailable', () => {
    it('returns true when config is complete', () => {
      vi.stubEnv('VITE_SPLUNK_WEB_HOST', 'localhost');
      vi.stubEnv('VITE_SPLUNK_WEB_PORT', '8000');
      expect(isSplunkWebUrlAvailable()).toBe(true);
    });

    it('returns false when host is missing', () => {
      vi.stubEnv('VITE_SPLUNK_WEB_PORT', '8000');
      expect(isSplunkWebUrlAvailable()).toBe(false);
    });

    it('returns false when port is missing', () => {
      vi.stubEnv('VITE_SPLUNK_WEB_HOST', 'localhost');
      expect(isSplunkWebUrlAvailable()).toBe(false);
    });

    it('returns false when both are missing', () => {
      expect(isSplunkWebUrlAvailable()).toBe(false);
    });
  });
});
