import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [
            react(),
            VitePWA({
                // Wie soll registriert werden? (autoUpdate oder prompt etc.)
                registerType: 'autoUpdate',
                // Nur für lokale Entwicklung (damit du offline testen kannst):
                devOptions: {
                    enabled: true,
                },
                // Ein Manifest angeben (Name, Icons, Farben etc.)
                manifest: {
                    name: 'Univocal',
                    short_name: 'Univocal',
                    start_url: '/',
                    display: 'standalone',
                    background_color: '#ffffff',
                    theme_color: '#000000',
                },
                workbox: {
                    // Hier kannst du z.B. bestimmte Dateien/Ordner vom Caching ausschließen:
                    // So werden alle Request-URLs, die '/api/' enthalten, ignoriert:
                    navigateFallbackDenylist: [/^\/api/, /^\/Shibboleth\.sso/]
                }
            })
        ],
        resolve: {
            // The workspace hoist can only expose one @mantine/core. The landing
            // app's React 19 copy wins at the repo root, while @mantine/charts
            // and @mantine/dates still bundle the React 18 copy. One context
            // has to win or MantineProvider is invisible to those components.
            dedupe: [
                'react',
                'react-dom',
                '@mantine/core',
                '@mantine/hooks',
                '@mantine/store',
            ],
        },
        server: {
            host: true,
            port: 3000,
            hmr: {
                protocol: 'ws',
                timeout: 10000,  // Verlängertes Timeout für HMR
                overlay: false,
            },
            watch: {
                usePolling: true,
                interval: 300, // Erhöhtes Polling-Intervall für reduzierte CPU-Last
            },
            allowedHosts: ['apps.univocal.local.de', 'apps.univocal.de', '.univocal.local.de', '.univocal.de']
        },
        define: {
            'process.env.VITE_KUBERNETES_HOST': JSON.stringify(env.VITE_KUBERNETES_HOST),
        },
    }
});
