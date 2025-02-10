import { defineConfig } from "vite";
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/components/LogTerminal.ts'),
            name: 'LogTerminal',
            fileName: (format) => `log-terminal.${format}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: ['xterm', 'xterm-addon-fit'],
            output: {
                globals: {
                    'xterm': 'Terminal',
                    'xterm-addon-fit': 'FitAddon'
                },
                inlineDynamicImports: true,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') return 'log-terminal.css';
                    return assetInfo.name!;
                }
            }
        }
    },
    plugins: [
        dts({
            include: ['src/components/LogTerminal.ts'],
            outDir: 'dist/types'
        })
    ],
    resolve: {
        alias: {
            '@elizaos/plugin-log-interceptor': resolve(__dirname, 'node_modules/@elizaos/plugin-log-interceptor')
        }
    }
});
