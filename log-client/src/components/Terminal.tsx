import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useLogStream } from '../hooks/useLogStream';
import { LogEvent } from '@elizaos/plugin-log-interceptor';
import 'xterm/css/xterm.css';

// Function to format log level with color and icon
const getLogFormatting = (level: string): { icon: string; color: string } => {
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
};

// Function to display a formatted log entry
const displayLogEntry = (term: XTerm, log: LogEvent) => {
    const { icon, color } = getLogFormatting(log.level);
    const timestamp = new Date(log.timestamp).toLocaleTimeString();
    const reset = '\x1b[0m';

    // Format: [Time] Icon Level: Message
    term.writeln(`${color}[${timestamp}] ${icon} ${log.level.toUpperCase()}: ${log.message}${reset}`);

    // Display metadata if present
    if (log.metadata && Object.keys(log.metadata).length > 0) {
        Object.entries(log.metadata).forEach(([key, value]) => {
            term.writeln(`${color}  ${key}: ${JSON.stringify(value)}${reset}`);
        });
    }

    term.writeln(''); // Add empty line for readability
};

export const Terminal = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<XTerm | null>(null);
    const { logs, error, isConnected } = useLogStream();
    const lastLogRef = useRef<number>(0);

    useEffect(() => {
        if (!terminalRef.current) return;

        const term = new XTerm({
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

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        termRef.current = term;

        // Display connection status
        const connectionColor = isConnected ? '\x1b[32m' : '\x1b[31m'; // Green or Red
        const status = isConnected ? 'Connected' : error || 'Connecting...';
        term.writeln(`${connectionColor}=== WebSocket: ${status} ===${'\x1b[0m'}\n`);

        return () => {
            term.dispose();
            termRef.current = null;
        };
    }, [isConnected, error]);

    // Handle new logs
    useEffect(() => {
        const term = termRef.current;
        if (!term || !logs.length) return;

        // Display only new logs
        logs.slice(lastLogRef.current).forEach(log => {
            displayLogEntry(term, log);
        });
        lastLogRef.current = logs.length;

        // Auto-scroll to bottom
        term.scrollToBottom();
    }, [logs]);

    return (
        <div className="terminal-wrapper h-full">
            <div ref={terminalRef} className="terminal-container font-mono select-none h-full" />
        </div>
    );
};