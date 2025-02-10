import type { Terminal as XTerminal } from 'xterm';
import type { FitAddon as XTermFitAddon } from 'xterm-addon-fit';

declare global {
    interface Window {
        Terminal: typeof XTerminal;
        FitAddon: typeof XTermFitAddon;
    }
}

declare module 'xterm' {
    export * from 'xterm-headless';
}

declare module 'xterm-addon-fit' {
    export * from 'xterm-addon-fit-headless';
}

export {};