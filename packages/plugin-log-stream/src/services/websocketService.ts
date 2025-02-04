import { Service, ServiceType } from "@elizaos/core";
import WebSocket from 'ws';

export interface WebSocketMessage {
    type: string;
    data: any;
}

export class WebSocketServer extends Service {
    private wss?: WebSocket.Server;
    private clients = new Set<WebSocket>();
    private initialized = false;

    static get serviceType(): ServiceType {
        return ServiceType.WEBSOCKET_SERVER;
    }

    getInstance(): WebSocketServer {
        return this;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        const port = parseInt(process.env.LOG_STREAM_PORT || '8080', 10);
        if (isNaN(port)) {
            throw new Error('Invalid LOG_STREAM_PORT configuration');
        }

        try {
            this.wss = new WebSocket.Server({ port });

            this.wss.on('connection', (ws) => {
                this.clients.add(ws);
                ws.on('close', () => this.clients.delete(ws));
            });

            console.info(`WebSocket server listening on port ${port}`);
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize WebSocket server:', error);
            throw error;
        }
    }

    broadcast(message: WebSocketMessage): void {
        if (!this.initialized) {
            console.warn('WebSocket server not initialized');
            return;
        }

        const data = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    async shutdown(): Promise<void> {
        this.clients.forEach(client => {
            try {
                client.close();
            } catch (error) {
                console.error('Error closing client connection:', error);
            }
        });
        this.clients.clear();

        if (this.wss) {
            await new Promise<void>((resolve) => {
                this.wss?.close(() => {
                    this.initialized = false;
                    resolve();
                });
            });
        }
    }
}