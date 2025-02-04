import { Provider, IAgentRuntime } from "@elizaos/core";
import { LogEventManager, LogEvent } from "@elizaos/plugin-log-interceptor";
import { WebSocketServer } from "../services/websocketService";

export const streamProvider: Provider = {
    get: async (runtime: IAgentRuntime): Promise<void> => {
        const eventManager = runtime
            .getService<LogEventManager>(LogEventManager.serviceType)
            .getInstance();

        const wsServer = runtime
            .getService<WebSocketServer>(WebSocketServer.serviceType)
            .getInstance();

        const logLevels: LogEvent['level'][] = ['info', 'error', 'warn', 'log', 'debug', 'assert'];

        // Add cleanup functions for each listener
        const cleanupFns = logLevels.map(level =>
            eventManager.addEventListener(level, async (event) => {
                wsServer.broadcast({
                    type: 'log',
                    data: {
                        level: event.level,
                        message: event.message,
                        metadata: event.metadata,
                        timestamp: event.timestamp
                    }
                });
            }, 500) // Lower priority than TEE logger
        );

        // Clean up listeners on runtime shutdown
        // runtime.onShutdown?.(() => {
        //     cleanupFns.forEach(cleanup => cleanup());
        // });
    }
};