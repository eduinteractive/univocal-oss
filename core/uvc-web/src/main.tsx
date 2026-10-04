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
import '@eduinteractive/mantine-common/build/style.css';
import App from './App.tsx';
import './index.css';
import { MantineProvider } from '@mantine/core';
import { uvcTheme } from './theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import { TenantProvider } from './context/TenantContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { DatesProvider } from '@mantine/dates';
import { configureApiForSiteHost } from './utils/SiteHost';

configureApiForSiteHost();

const svhQueryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={svhQueryClient}>
            <MantineProvider theme={uvcTheme} defaultColorScheme="light">
                <TenantProvider>
                    <AuthProvider>
                        <DatesProvider
                            settings={{
                                locale: 'de',
                                firstDayOfWeek: 1,
                            }}
                        >
                            <Notifications pauseResetOnHover="notification" />
                            <App />
                        </DatesProvider>
                    </AuthProvider>
                </TenantProvider>
            </MantineProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
