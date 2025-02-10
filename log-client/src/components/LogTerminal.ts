/// <reference types="../types/xterm" />

import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { LogEvent, LogLevel } from '@elizaos/plugin-log-interceptor';
import { WebSocketMessage } from '../types/log-terminal';

export class LogTerminal extends HTMLElement {
    private term: Terminal | null = null;
    private fitAddon: FitAddon | null = null;
    private ws: WebSocket | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private container: HTMLDivElement | null = null;

    static get observedAttributes() {
        return ['ws-url'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'terminal-container';

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            .terminal-container {
                width: 100%;
                height: 100%;
                font-family: monospace;
                user-select: none;
            }
        `;

        this.shadowRoot?.append(style, this.container);

        // Initialize terminal
        this.initTerminal();

        // Connect WebSocket
        this.connectWebSocket();

        // Add resize handler
        window.addEventListener('resize', this.handleResize);
    }

    disconnectedCallback() {
        this.cleanup();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'ws-url' && oldValue !== newValue && this.isConnected) {
            this.cleanup();
            this.connectWebSocket();
        }
    }

    private initTerminal() {
        if (!this.container) return;

        this.term = new Terminal({
            theme: {
                background: 'rgb(30, 30, 30)',
                foreground: 'rgb(169, 183, 198)',
                cursor: 'rgb(169, 183, 198)',
                red: '#ff0000',
                yellow: '#ffff00',
                blue: '#0000ff',
                green: '#00ff00'
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 14,
            disableStdin: true,
            cursorBlink: true,
            cursorStyle: 'block',
            scrollback: 1000
        });

        this.fitAddon = new FitAddon();
        this.term.loadAddon(this.fitAddon);
        this.term.open(this.container);
        this.fitAddon.fit();
    }

    private connectWebSocket() {
        const url = this.getAttribute('ws-url') || 'ws://localhost:8080';
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            this.dispatchEvent(new CustomEvent('connected'));
            this.displayStatus(true);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as WebSocketMessage;
                if (data.type === 'log') {
                    this.displayLog(data.data);
                }
            } catch (err) {
                console.error('Failed to parse log message:', err);
            }
        };

        this.ws.onerror = (error) => {
            this.dispatchEvent(new CustomEvent('error', { detail: error }));
            this.displayStatus(false, 'WebSocket connection error');
        };

        this.ws.onclose = () => {
            this.dispatchEvent(new CustomEvent('disconnected'));
            this.displayStatus(false);
            // Attempt to reconnect after 5 seconds
            this.reconnectTimeout = setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    private displayStatus(isConnected: boolean, error?: string) {
        if (!this.term) return;

        const color = isConnected ? '\x1b[32m' : '\x1b[31m'; // Green or Red
        const status = isConnected ? 'Connected' : error || 'Connecting...';
        this.term.writeln(`${color}=== WebSocket: ${status} ===${'\x1b[0m'}\n`);
    }

    private displayLog(log: LogEvent) {
        if (!this.term) return;

        const { icon, color } = this.getLogFormatting(log.level);
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        const reset = '\x1b[0m';

        // Format: [Time] Icon Level: Message
        this.term.writeln(`${color}[${timestamp}] ${icon} ${log.level.toUpperCase()}: ${log.message}${reset}`);

        // Display metadata if present
        if (log.metadata && Object.keys(log.metadata).length > 0) {
            Object.entries(log.metadata).forEach(([key, value]) => {
                this.term?.writeln(`${color}  ${key}: ${JSON.stringify(value)}${reset}`);
            });
        }

        this.term.writeln(''); // Add empty line for readability
        this.term.scrollToBottom();
    }

    private getLogFormatting(level: LogLevel): { icon: string; color: string } {
        switch (level.toLowerCase()) {
            case 'error':
                return { icon: '\u26D4', color: '\x1b[31m' }; // Red
            case 'warn':
                return { icon: '\u26a0', color: '\x1b[33m' }; // Yellow
            case 'info':
                return { icon: '\u2139', color: '\x1b[34m' }; // Blue
            case 'debug':
                return { icon: '\u1367', color: '\x1b[35m' }; // Magenta
            default:
                return { icon: '\u25ce', color: '\x1b[37m' }; // White
        }
    }

    private handleResize = () => {
        this.fitAddon?.fit();
    };

    private cleanup() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.term) {
            this.term.dispose();
            this.term = null;
        }

        window.removeEventListener('resize', this.handleResize);
    }
}

// Register the custom element
if (!customElements.get('log-terminal')) {
    customElements.define('log-terminal', LogTerminal);
}