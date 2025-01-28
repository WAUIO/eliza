import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
// import { useLogStream } from '../hooks/useLogStream';
import 'xterm/css/xterm.css';

// Function to display a single formatted message block
const displayFormattedMessage = (term: XTerm, message: string) => {
    const lines = message.split('\n');
    let messageType = '';
    let icon = '';
    let color = '';

    // Determine message type from first line
    if (lines[0].includes('[ERROR]')) {
        messageType = 'ERROR';
        icon = '\u26D4';
        color = '\x1b[31m';
    } else if (lines[0].includes('[WARN]')) {
        messageType = 'WARN';
        icon = '\u26a0';
        color = '\x1b[33m';
    }

    if (messageType) {
        // Write the entire multiline message with proper formatting
        term.writeln(`${color}${icon} ${lines.join('\n')}${'\x1b[0m'}`);
        term.writeln(''); // Add empty line after message
    }
};

export const Terminal = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    // const { logs, error } = useLogStream();

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
            disableStdin: false,
            cursorBlink: true,
            cursorStyle: 'block'
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        // Example usage with multiple separate markdown messages
        const errorMessage = `[ERROR] Database connection failed
Attempted to connect to: localhost:5432
Error details: Connection refused
Retry attempt: 3 of 5`;

        const warningMessage = `[WARN] High memory usage detected
Current usage: 85%
Threshold: 80%
Consider optimizing memory allocation`;

        // Display each message individually
        displayFormattedMessage(term, errorMessage);
        displayFormattedMessage(term, warningMessage);

        return () => {
            term.dispose();
        };
    }, []);

    return <div ref={terminalRef} className="terminal-container font-mono select-none" />;
};