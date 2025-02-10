import React from 'react';

declare module 'react' {
    interface HTMLAttributes<T> {
        'ws-url'?: string;
    }
}

declare namespace JSX {
    interface IntrinsicElements {
        'log-terminal': any;
    }
}