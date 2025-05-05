# CLI Browser Bridge Integration

This project uses the [vite-plugin-cli-browser-bridge](https://github.com/HexaField/vite-plugin-cli-browser-bridge) plugin to enable command execution in the browser context from the command line. This is particularly useful for AI assistants, automation tools, and testing frameworks.

## Setup

The plugin has been installed and configured in the `example/vite.config.ts` file:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vitePluginCliBrowserBridge from 'vite-plugin-cli-browser-bridge';

export default defineConfig({
  plugins: [
    react(),
    vitePluginCliBrowserBridge({
      port: 3333, // WebSocket server port (default: 3333)
      verbose: true, // Verbose console logs (default: false)
    }),
  ],
});
```

## Usage

### Prerequisites

1. Start the development server:
   ```bash
   cd example
   npm run dev
   ```

2. Make sure the browser is open with the application running.

### CLI Commands

Once your Vite server is running with the plugin enabled, you can use the CLI to interact with the browser:

```bash
# Execute JavaScript in the browser
npx cli-browser-bridge exec "window.document.title"

# Reload the browser
npx cli-browser-bridge reload

# Open a new browser tab
npx cli-browser-bridge open

# Close all browser tabs
npx cli-browser-bridge close

# Use verbose mode for verbose console output (useful for debugging)
npx cli-browser-bridge exec --verbose "window.document.title"
```

### Example Script

A test script is provided in `example/test-browser-bridge.js` that demonstrates how to use the CLI browser bridge programmatically:

```bash
# Run the test script
cd example
node test-browser-bridge.js
```

## API Reference

### CLI Commands

| Command | Description |
|---------|-------------|
| `exec <command>` | Execute JavaScript in the browser (output is automatically formatted) |
| `reload` | Force the browser to reload |
| `open` | Open the Vite development server in the default browser |
| `close` | Close all open browser tabs |

### CLI Options

| Option | Description |
|--------|-------------|
| `-p, --port` | WebSocket server port (default: 3333) |
| `-v, --verbose` | Verbose console output (default: false) |

## Use Cases for AI Assistants

This plugin is particularly useful for AI assistants that need to interact with web applications:

```bash
# AI can get information from the page
npx cli-browser-bridge exec "window.document.title"

# AI can modify the page
npx cli-browser-bridge exec "document.querySelector('h1').textContent = 'Updated by AI'"

# AI can inspect React components
npx cli-browser-bridge exec "window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.size > 0"

# AI can get the current state of the application
npx cli-browser-bridge exec "window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && Array.from(window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.values())[0].getFiberRoots().values().next().value.current.memoizedState"
```

## Troubleshooting

- If you get a connection error, make sure the Vite development server is running.
- If commands don't seem to have any effect, make sure the browser tab with your application is open and active.
- Check the console logs in both the terminal and browser for any error messages.
