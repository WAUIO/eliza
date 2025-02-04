import { Provider, IAgentRuntime, ServiceType, ITeeLogService } from "@elizaos/core";
import { LogEventManager, LogEvent, LogLevel } from "@elizaos/plugin-log-interceptor";

export const elizaLoggerProvider: Provider = {
    get: async (runtime: IAgentRuntime): Promise<void> => {
        const teeLogService = runtime
            .getService<ITeeLogService>(ServiceType.TEE_LOG)
            .getInstance();

        const eventManager = runtime
            .getService<LogEventManager>(LogEventManager.serviceType)
            .getInstance();

        const logLevels: LogLevel[] = ['info', 'error', 'warn', 'log', 'debug', 'assert'];

        logLevels.forEach(level => {
            eventManager.addEventListener(level, async (event: LogEvent) => {
                await teeLogService.log(
                    event.metadata?.agentId || runtime.agentId,
                    event.metadata?.roomId || 'default',
                    event.metadata?.userId || 'system',
                    event.level.toUpperCase(),
                    event.message
                );
            }, 1000);
        });
        // Clean up on runtime shutdown
        // runtime.onShutdown(() => {
        //     removeListener();
        // });
    }
};