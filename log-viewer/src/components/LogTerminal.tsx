import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

export function LogTerminal() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'http://localhost:3001/log-terminal.es.js';
        script.type = 'module';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <>
            <Helmet>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
                <script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
            </Helmet>

            <log-terminal
                ws-url="ws://localhost:8081"
                style={{ width: '100%', height: '100vh' }}
            />
        </>
    );
}