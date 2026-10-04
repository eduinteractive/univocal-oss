import React from 'react';
import ReactDOM from 'react-dom/client';
import './lang/i18n';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/charts/styles.css';
import 'dayjs/locale/de';
import 'cropperjs/dist/cropper.css';
import '@eduinteractive/mantine-common/build/style.css';
import App from './App.tsx';
import './index.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { TenantProvider } from './context/TenantContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { DatesProvider } from '@mantine/dates';
import { configureApiForSiteHost } from './utils/SiteHost';

configureApiForSiteHost();

const svhQueryClient = new QueryClient();

const svhTheme = createTheme({
    colors: {
        navy: [
            '#ecebfb',
            '#d3d2f2',
            '#a6a3e6',
            '#7773da',
            '#514cd0',
            '#3a34c9',
            '#2d27c6',
            '#211daf',
            '#1b199d',
            '#15148a',
        ],
        lavender: [
            '#f5f4ff',
            '#eceaff',
            '#dcd8ff',
            '#c6c0fb',
            '#ada5f5',
            '#9b91f0',
            '#9187ee',
            '#7f74d4',
            '#7166bd',
            '#6157a7',
        ],
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={svhQueryClient}>
            <MantineProvider theme={svhTheme} defaultColorScheme="light">
                <TenantProvider>
                    <AuthProvider>
                        <DatesProvider
                            settings={{
                                locale: 'de',
                                firstDayOfWeek: 1,
                                timezone: 'Europe/Berlin',
                            }}
                        >
                            <Notifications />
                            <App />
                        </DatesProvider>
                    </AuthProvider>
                </TenantProvider>
            </MantineProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
