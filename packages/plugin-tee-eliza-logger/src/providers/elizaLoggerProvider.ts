import { Provider, elizaLogger, IAgentRuntime, ServiceType, ITeeLogService } from "@elizaos/core";

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'LOG' | 'DEBUG' | 'ASSERT';
type LogMethod = keyof Pick<typeof elizaLogger, 'info' | 'error' | 'warn' | 'log' | 'debug' | 'assert'>;

export const elizaLoggerProvider: Provider = {
    get: async (runtime: IAgentRuntime): Promise<void> => {
        const teeLogService = runtime
            .getService<ITeeLogService>(ServiceType.TEE_LOG)
            .getInstance();

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
        const createLoggerMethod = (method: LogMethod, level: LogLevel) => {
            return async (...args: any[]) => {
                const [message, metadata = {}] = args;
                await teeLogService.log(
                    metadata.agentId || runtime.agentId,
                    metadata.roomId || 'default',
                    metadata.userId || 'system',
                    level,
                    typeof message === 'string' ? message : JSON.stringify(message)
                );
                return originalMethods[method].apply(elizaLogger, args);
            };
        };

        // Apply to all log levels
        elizaLogger.info = createLoggerMethod('info', 'INFO');
        elizaLogger.error = createLoggerMethod('error', 'ERROR');
        elizaLogger.warn = createLoggerMethod('warn', 'WARN');
        elizaLogger.log = createLoggerMethod('log', 'LOG');
        elizaLogger.debug = createLoggerMethod('debug', 'DEBUG');
        elizaLogger.assert = createLoggerMethod('assert', 'ASSERT');
    }
};