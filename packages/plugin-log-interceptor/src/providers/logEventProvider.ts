import { Provider, elizaLogger, IAgentRuntime } from "@elizaos/core";
import { LogEventManager, LogLevel } from "../services/logEventManager";

export const logEventProvider: Provider = {
    get: async (runtime: IAgentRuntime): Promise<void> => {
        const eventManager = runtime.getService<LogEventManager>(LogEventManager.serviceType).getInstance();

        // Store original methods
        const originalMethods = {
            info: elizaLogger.info,
            error: elizaLogger.error,
            warn: elizaLogger.warn,
            log: elizaLogger.log,
            debug: elizaLogger.debug,
            assert: elizaLogger.assert
        };

        // Create wrapped logger method
        const createLoggerMethod = (level: LogLevel) => {
            return async (...args: any[]) => {
                const [message, metadata = {}] = args;

                // Emit event before actual logging
                await eventManager.emit({
                    level,
                    message: typeof message === 'string' ? message : JSON.stringify(message),
                    metadata: {
                        agentId: metadata.agentId || runtime.agentId,
                        roomId: metadata.roomId || 'default',
                        userId: metadata.userId || 'system',
                        ...metadata
                    },
                    timestamp: Date.now()
                });

                // Call original method
                return originalMethods[level].apply(elizaLogger, args);
            };
        };

        // Replace logger methods
        elizaLogger.info = createLoggerMethod('info');
        elizaLogger.error = createLoggerMethod('error');
        elizaLogger.warn = createLoggerMethod('warn');
        elizaLogger.log = createLoggerMethod('log');
        elizaLogger.debug = createLoggerMethod('debug');
        elizaLogger.assert = createLoggerMethod('assert');
    }
};