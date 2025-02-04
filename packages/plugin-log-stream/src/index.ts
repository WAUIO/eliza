import { Plugin } from "@elizaos/core";
import { streamProvider } from "./providers/streamProvider";
import { WebSocketServer } from "./services/websocketService";

export const logStreamPlugin: Plugin = {
    name: "log-stream",
    description: "Real-time log streaming via WebSocket",
    actions: [],
    providers: [streamProvider],
    evaluators: [],
    services: [new WebSocketServer()],
    clients: [],
};

export * from "./services/websocketService";
export default logStreamPlugin;