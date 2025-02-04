import { useState, useEffect } from 'react';
import { LogEvent } from '@elizaos/plugin-log-interceptor';

export const useLogStream = (url = import.meta.env.VITE_WS_LOG_URL || 'ws://localhost:8080') => {
    const [logs, setLogs] = useState<LogEvent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let ws: WebSocket;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            // Add timeout buffer for server initialization
            setTimeout(() => {
                ws = new WebSocket(url);

                ws.onopen = () => {
                    setIsConnected(true);
                    setError(null);
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'log') {
                            setLogs(prev => [...prev, {
                                level: data.data.level,
                                message: data.data.message,
                                metadata: data.data.metadata,
                                timestamp: new Date(data.data.timestamp).getTime()
                            }]);
                        }
                    } catch (err) {
                        console.error('Failed to parse log message:', err);
                    }
                };

                ws.onerror = () => {
                    setError('WebSocket connection error');
                    setIsConnected(false);
                };

                ws.onclose = () => {
                    setIsConnected(false);
                    // Attempt to reconnect after 5 seconds
                    reconnectTimeout = setTimeout(connect, 5000);
                };
            }, 1000); // Wait 1 second before initial connection attempt
        };

        connect();

        return () => {
            if (ws) {
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [url]);

    return { logs, error, isConnected };
};
