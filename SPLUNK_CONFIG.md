# Splunk Server Configuration Guide

This document explains how to configure the CoreSplorer application to connect to a Splunk server instance.

## Overview

The application supports two modes:

1. **Static Mode** (default): Loads pre-generated JSON files from the `public` folder
2. **Splunk Mode**: Connects to a live Splunk server via REST API

The mode is automatically determined by environment variables - if Splunk configuration is present, it will be used; otherwise, it falls back to static files.

## Quick Start

### Option 1: Use Local Override (Recommended for Development)

1. Copy the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and set your Splunk instance details:

   ```env
   VITE_SPLUNK_HOST=your-splunk-server.com
   VITE_SPLUNK_PORT=8089
   VITE_SPLUNK_PROTOCOL=https
   VITE_SPLUNK_TOKEN=your-token-here
   ```

3. Restart the dev server:

   ```bash
   npm run dev
   ```

4. Copy the token value into your `.env.local` file

## API Endpoints

When Splunk mode is enabled, the application maps endpoints as follows:

| Purpose      | Static Path          | Splunk API Path               |
| ------------ | -------------------- | ----------------------------- |
| Metadata     | `/data/meta.json`    | `/services/data/meta`         |
| Index List   | `/index.json`        | `/services/data/indexes`      |
| Graph Data   | `/graph.json`        | `/services/data/graph`        |
| Node Details | `/objects/{id}.json` | `/services/data/objects/{id}` |

## Checking Current Configuration

You can verify which mode is active by checking the browser console on app startup. The configuration is also available via:

```typescript
import { apiConfig } from "@/shared/config";

console.log("Splunk mode enabled:", apiConfig.splunk.enabled);
console.log("Base URL:", apiConfig.splunk.baseUrl);
```

## Security Notes

⚠️ **Important Security Considerations:**

- **Never commit `.env.local`** - It's gitignored by default
- **Don't commit tokens** - Use environment-specific files or secret management
- **Use HTTPS in production** - Set `VITE_SPLUNK_PROTOCOL=https`
- **Limit token permissions** - Use read-only tokens when possible
- **Consider CORS** - Ensure your Splunk server allows requests from your app's domain

## Troubleshooting

### App still using static files

- Verify both `VITE_SPLUNK_HOST` and `VITE_SPLUNK_PORT` are set
- Restart the dev server (`npm run dev`)
- Check the browser console for configuration values

### CORS errors

- Configure your Splunk server to allow requests from your app's origin
- In development, you may need to add CORS headers to Splunk's `server.conf`

### Authentication failures

- Verify your token is valid and not expired
- Ensure the token has sufficient permissions
- Check that the token is properly set in `VITE_SPLUNK_TOKEN`

## Example Configurations

### Local Development

```env
# .env.local
VITE_SPLUNK_HOST=localhost
VITE_SPLUNK_PORT=8089
VITE_SPLUNK_PROTOCOL=http
```

### Remote Splunk Instance

```env
# .env.local
VITE_SPLUNK_HOST=splunk.company.com
VITE_SPLUNK_PORT=8089
VITE_SPLUNK_PROTOCOL=https
VITE_SPLUNK_TOKEN=eyJhbGc...
```

### Production Build

```env
# .env.production
VITE_SPLUNK_HOST=prod-splunk.company.com
VITE_SPLUNK_PORT=8089
VITE_SPLUNK_PROTOCOL=https
```

## File Priority

Environment files are loaded in this order (later files override earlier ones):

1. `.env` - Base configuration
2. `.env.development` or `.env.production` - Mode-specific
3. `.env.local` - Local overrides (highest priority, gitignored)

---

For more information about Vite environment variables, see: https://vitejs.dev/guide/env-and-mode.html
