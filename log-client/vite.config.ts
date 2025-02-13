import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['src/components/Terminal.tsx', 'src/hooks/useLogStream.ts'],
            outDir: 'dist'
        })
    ],
    clearScreen: false,
    build: {
        outDir: "dist",
        minify: true,
        cssMinify: true,
        sourcemap: false,
        cssCodeSplit: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'LogTerminal',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'es' : ''}.js`
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'xterm', 'xterm-addon-fit'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    xterm: 'Terminal',
                    'xterm-addon-fit': 'FitAddon'
                }
            }
        }
    },
    resolve: {
        alias: {
            "@": "/src"
        },
    },
});
