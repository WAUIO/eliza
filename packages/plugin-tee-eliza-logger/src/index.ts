import { Plugin } from "@elizaos/core";
import { elizaLoggerProvider } from "./providers/elizaLoggerProvider";

export const teeElizaLoggerPlugin: Plugin = {
    name: "tee-eliza-logger",
    description: "Integrates elizaLogger with TEE logging system",
    actions: [],
    providers: [elizaLoggerProvider],
    evaluators: [],
    services: [],
    clients: [],
};

export default teeElizaLoggerPlugin;
