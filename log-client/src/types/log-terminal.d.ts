import { LogEvent } from '@elizaos/plugin-log-interceptor';

declare global {
    interface HTMLElementTagNameMap {
        'log-terminal': LogTerminal;
    }
}

declare class LogTerminal extends HTMLElement {
    /** WebSocket endpoint URL */
    wsUrl: string;

    /** Dispatch when WebSocket connects */
    onconnected: () => void;

    /** Dispatch on WebSocket errors */
    onerror: (error: Event) => void;
}

export interface LogTerminalConfig {
    wsUrl?: string;
}

declare module 'xterm/css/xterm.css?inline' {
    const content: string;
    export default content;
}

export interface WebSocketMessage {
    type: string;
    data: LogEvent;
}

