# Log Terminal Web Component

A web component for displaying real-time logs from a WebSocket connection using xterm.js.

## Features

- Real-time log streaming via WebSocket
- Terminal emulation using xterm.js
- Configurable WebSocket URL
- Auto-reconnection on connection loss
- Supports all log levels with color coding
- Metadata display support
- Responsive design with auto-resize

## Installation

```bash
npm install @elizaos/log-terminal
# or
pnpm add @elizaos/log-terminal
# or
yarn add @elizaos/log-terminal
```

## Usage

### Browser (ES Module)
```html
<!-- Load dependencies -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css">
<script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>

<!-- Use component -->
<log-terminal ws-url="ws://your-server:8080" style="width:800px;height:600px"></log-terminal>

<script type="module">
    import '@elizaos/log-terminal';
</script>
```

### React
```tsx
import '@elizaos/log-terminal';

function App() {
    return (
        <log-terminal
            ws-url="ws://your-server:8080"
            style={{ width: '100%', height: '100vh' }}
        />
    );
}
```

### Angular
```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}

// component.html
<log-terminal [attr.ws-url]="endpoint"></log-terminal>
```

### Vue
```vue
<template>
    <log-terminal :ws-url="wsEndpoint" />
</template>

<script>
import '@elizaos/log-terminal';

export default {
    data() {
        return {
            wsEndpoint: 'ws://your-server:8080'
        }
    }
}
</script>
```

## Deployment & Self-Hosting

### 1. Build the Component
```bash
pnpm build
```

This creates the following files in the `dist` directory:
- `log-terminal.es.js` (ES Module)
- `log-terminal.umd.js` (UMD Bundle)
- `types/LogTerminal.d.ts` (TypeScript declarations)

### 2. Host the Files
Upload the built files to your web server:
```
https://your-domain.com/static/
├── log-terminal.es.js
└── log-terminal.umd.js
```

### 3. Usage with Self-Hosted Files

#### Direct Script Include
```html
<!DOCTYPE html>
<html>
<head>
    <!-- Required Dependencies -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css">
    <script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>

    <!-- Your hosted component -->
    <script src="https://your-domain.com/static/log-terminal.umd.js"></script>
</head>
<body>
    <log-terminal ws-url="wss://your-log-server.com"></log-terminal>
</body>
</html>
```

#### ES Module Import
```javascript
import 'https://your-domain.com/static/log-terminal.es.js';
```

### 4. Server Configuration

#### CORS Headers (Nginx)
```nginx
location /static/ {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET';

    # Enable compression
    gzip on;
    gzip_types application/javascript;

    # Cache control
    add_header Cache-Control "public, max-age=31536000";
}
```

### 5. Production Best Practices

1. **Version Your Builds**
```
/static/log-terminal/v0.1.0/log-terminal.es.js
```

2. **Use Subresource Integrity**
```html
<script
    src="https://your-domain.com/static/log-terminal.es.js"
    integrity="sha384-xxxx..."
    crossorigin="anonymous">
</script>
```

3. **Use HTTPS**
- Always serve files over HTTPS
- Use WSS (WebSocket Secure) for log connections

4. **Performance Optimization**
- Enable server compression (gzip/brotli)
- Set appropriate cache headers
- Consider using a CDN for global distribution

## API

### Attributes
| Attribute | Description | Default |
|-----------|-------------|---------|
| `ws-url`  | WebSocket server URL | `ws://localhost:8080` |

### Events
```javascript
const terminal = document.querySelector('log-terminal');
terminal.addEventListener('connected', () => {
    console.log('WebSocket connected');
});
terminal.addEventListener('disconnected', () => {
    console.warn('WebSocket disconnected');
});
terminal.addEventListener('error', (e) => {
    console.error('WebSocket error:', e.detail);
});
```

### Styling
Control dimensions via CSS:
```css
log-terminal {
    width: 100%;
    height: 400px;
    border: 1px solid #333;
    border-radius: 4px;
}
```

## Development

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Start development build:
```bash
pnpm dev
```

4. Test the component:
```bash
# Serve the directory
python -m http.server
# Open demo.html in your browser
```

## Building

```bash
pnpm build
```

This creates:
- ES Module: `dist/log-terminal.es.js`
- UMD Bundle: `dist/log-terminal.umd.js`
- Type Declarations: `dist/types/LogTerminal.d.ts`

## Troubleshooting

**Component not loading:**
1. Verify xterm.js and fit addon are loaded before the component
2. Check browser console for CORS errors
3. Ensure WebSocket server is running

**Logs not displaying:**
1. Verify WebSocket URL is correct
2. Check network tab for WS connection status
3. Ensure logs are sent in correct format:
```typescript
interface LogEvent {
    type: 'log';
    data: {
        level: 'info' | 'error' | 'warn' | 'log' | 'debug' | 'assert';
        message: string;
        metadata?: Record<string, any>;
        timestamp: number;
    }
}
```

## License

MIT