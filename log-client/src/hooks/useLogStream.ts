import { useState, useEffect } from 'react';
import { TeeLog } from '@elizaos/plugin-tee-log';

export const useLogStream = () => {
    const [logs, setLogs] = useState<TeeLog[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('http://localhost:3000/tee/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: {},
                        page: 1,
                        pageSize: 50
                    })
                });

                const data = await response.json();
                setLogs(data.logs.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch logs');
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);

        return () => clearInterval(interval);
    }, []);

    return { logs, error };
};
