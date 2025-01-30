import { IAgentRuntime, Plugin, ServiceType } from "@elizaos/core";
import { elizaLoggerProvider } from "./providers/elizaLoggerProvider";
import { EnhancedTeeLogService } from "./services/enhancedLogService";
import { TeeLogService } from "@elizaos/plugin-tee-log";

export const teeElizaLoggerPlugin: Plugin = {
    name: "tee-eliza-logger",
    description: "Integrates elizaLogger with TEE logging system and provides enhanced log querying",
    actions: [],
    providers: [elizaLoggerProvider],
    evaluators: [],
    services: [new EnhancedTeeLogService()],
    clients: [],
};

export * from './services/enhancedLogService';
export default teeElizaLoggerPlugin;
