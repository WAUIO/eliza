import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isLibBuild = mode === 'lib';

    return {
        plugins: [
            react(),
            viteCompression({
                algorithm: "brotliCompress",
                ext: ".br",
                threshold: 1024,
            }),
            isLibBuild && dts({
                include: ['src/components/LogTerminal.ts'],
                outDir: 'dist/types'
            })
        ].filter(Boolean),
        clearScreen: false,
        build: isLibBuild ? {
            lib: {
                entry: resolve(__dirname, 'src/components/LogTerminal.ts'),
                name: 'LogTerminal',
                fileName: (format) => `log-terminal.${format}.js`,
                formats: ['es', 'umd']
            },
            rollupOptions: {
                external: ['react', 'react-dom'],
                output: {
                    globals: {
                        react: 'React',
                        'react-dom': 'ReactDOM'
                    }
                }
            }
        } : {
            outDir: "dist/app",
            minify: true,
            cssMinify: true,
            sourcemap: false,
            cssCodeSplit: true,
            rollupOptions: {
                external: ['/dist/log-terminal.es.js']
            }
        },
        resolve: {
            alias: {
                "@": "/src",
                "xterm": resolve(__dirname, "node_modules/xterm"),
                "xterm-addon-fit": resolve(__dirname, "node_modules/xterm-addon-fit")
            }
        }
    };
});
