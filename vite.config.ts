import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        // agent.sh's API runs in the Worker (npm run dev:api, port 8787)
        proxy: { '/api': 'http://localhost:8787' },
    },
});
