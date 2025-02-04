import { Plugin } from "@elizaos/core";
import { logEventProvider } from "./providers/logEventProvider";
import { LogEventManager } from "./services/logEventManager";

export const logInterceptorPlugin: Plugin = {
    name: "log-interceptor",
    description: "Provides event-based logging interception system",
    actions: [],
    providers: [logEventProvider],
    evaluators: [],
    services: [new LogEventManager()],
    clients: [],
};

export * from "./services/logEventManager";
export default logInterceptorPlugin;