import { Service, ServiceType } from "@elizaos/core";

export type LogLevel = 'info' | 'error' | 'warn' | 'log' | 'debug' | 'assert';

export interface LogMetadata {
    agentId?: string;
    roomId?: string;
    userId?: string;
    [key: string]: any;
}

export interface LogEvent {
    level: LogLevel;
    message: string;
    metadata?: LogMetadata;
    timestamp: number;
}

export interface LogListener {
    callback: (event: LogEvent) => Promise<void>;
    priority: number;
}

export class LogEventError extends Error {
    constructor(
        message: string,
        public readonly level: LogLevel,
        public readonly originalError: Error
    ) {
        super(message);
        this.name = 'LogEventError';
    }
}

/**
 * Manages log event subscriptions and dispatching
 * Provides a centralized way for plugins to listen to logging events
 */
export class LogEventManager extends Service {
    private listeners: Map<LogLevel, Set<LogListener>> = new Map();
    private initialized = false;

    static get serviceType(): ServiceType {
        return ServiceType.LOG_INTERCEPTOR;
    }

    getInstance(): LogEventManager {
        return this;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        // Initialize listeners for all log levels
        const levels: LogLevel[] = ['info', 'error', 'warn', 'log', 'debug', 'assert'];
        levels.forEach(level => {
            this.listeners.set(level, new Set());
        });

        this.initialized = true;
    }

    /**
     * Add a listener for a specific log level
     * @param level The log level to listen for
     * @param callback The callback to execute when a log event occurs
     * @param priority Higher priority listeners are executed first (default: 0)
     * @returns A function to remove the listener
     */
    addEventListener(level: LogLevel, callback: LogListener['callback'], priority = 0): () => void {
        if (!this.initialized) {
            throw new Error('LogEventManager not initialized');
        }

        const listener: LogListener = { callback, priority };
        this.listeners.get(level)?.add(listener);

        // Return cleanup function
        return () => {
            this.listeners.get(level)?.delete(listener);
        };
    }

    /**
     * Emit a log event to all registered listeners
     * @param event The log event to emit
     * @throws LogEventError if a listener fails
     */
    async emit(event: LogEvent): Promise<void> {
        if (!this.initialized) {
            throw new Error('LogEventManager not initialized');
        }

        const listeners = Array.from(this.listeners.get(event.level) || [])
            .sort((a, b) => b.priority - a.priority);

        const errors: LogEventError[] = [];

        // Execute listeners in sequence to maintain order
        for (const { callback } of listeners) {
            try {
                await callback(event);
            } catch (error) {
                errors.push(new LogEventError(
                    `Failed to process ${event.level} log event`,
                    event.level,
                    error as Error
                ));
            }
        }

        // If any listeners failed, throw an error with all failures
        if (errors.length > 0) {
            console.error('Log event errors:', errors);
            throw errors[0]; // Throw first error but log all
        }
    }

    /**
     * Remove all listeners for a specific level
     * @param level The log level to clear listeners for
     */
    clearListeners(level: LogLevel): void {
        this.listeners.get(level)?.clear();
    }

    /**
     * Get the number of listeners for a specific level
     * @param level The log level to count listeners for
     */
    getListenerCount(level: LogLevel): number {
        return this.listeners.get(level)?.size || 0;
    }
}