# Log Stream Plugin

Real-time log streaming via WebSocket for Eliza's logging system.

## Features

- Real-time log streaming over WebSocket
- Configurable WebSocket port
- Compatible with existing logging system
- Supports all log levels (info, error, warn, etc.)
- Low latency event-based architecture

## Installation

```bash
pnpm add @elizaos/plugin-log-stream
```

## Configuration

1. Add to .env:
```env
# WebSocket server port (default: 8080)
LOG_STREAM_PORT=8080
```

2. Add to character.json:
```json
{
    "plugins": [
        "@elizaos/plugin-log-interceptor",  // Required dependency
        "@elizaos/plugin-log-stream"
    ]
}
```

## Usage

### WebSocket Client Example

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'log') {
        console.log('[Real-time]', {
            level: data.data.level,
            message: data.data.message,
            metadata: data.data.metadata,
            timestamp: new Date(data.data.timestamp)
        });
    }
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';

interface LogEvent {
    level: string;
    message: string;
    metadata: Record<string, any>;
    timestamp: number;
}

export function useLogStream(url: string = 'ws://localhost:8080') {
    const [logs, setLogs] = useState<LogEvent[]>([]);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'log') {
                setLogs(prev => [...prev, data.data]);
            }
        };

        return () => ws.close();
    }, [url]);

    return logs;
}
```

## Development

For local development:

```json
{
    "plugins": ["../../packages/plugin-log-stream/src/index.ts"]
}
```

## Architecture

The plugin uses the event system from `@elizaos/plugin-log-interceptor` to:
1. Listen for log events with lower priority than TEE logging
2. Broadcast events to connected WebSocket clients
3. Handle client connections and disconnections automatically

## Limitations

- WebSocket server runs on a single port
- No authentication/authorization (use reverse proxy if needed)
- Messages are sent in JSON format only

## License

This plugin is part of the Eliza project. See the main project repository for license information.