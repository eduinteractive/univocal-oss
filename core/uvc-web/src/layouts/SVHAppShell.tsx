import { AppShell } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import SVHNavigation from './SVHNavigation';
import { Outlet } from 'react-router-dom';
import { createContext, useContext } from 'react';
import SVHHeader from './SVHHeader';

export const SidebarContext = createContext({
    mobileOpened: false,
    desktopOpened: false,
    toggleMobile: () => {},
    toggleDesktop: () => {},
});

// Erstellen des Providers, der den Kontext an untergeordnete Komponenten weitergibt
export const SidebarProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    return (
        <SidebarContext.Provider
            value={{
                mobileOpened: mobileOpened,
                desktopOpened: desktopOpened,
                toggleMobile: toggleMobile,
                toggleDesktop: toggleDesktop,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

const SVHAppShell = () => {
    const matchMedia = useMediaQuery('(max-width: 48em)');
    const { mobileOpened, desktopOpened } = useContext(SidebarContext);

    return (
        <AppShell
            padding={0}
            navbar={{
                width: desktopOpened
                    ? { base: 240, desktop: 240, lg: 240 }
                    : 60,
                breakpoint: 'sm',
                collapsed: {
                    mobile: !mobileOpened,
                    desktop: false,
                },
            }}
            h="100%"
            header={{
                height: matchMedia ? 60 : 0,
            }}
        >
            {matchMedia && <SVHHeader />}
            <SVHNavigation />
            <AppShell.Main h="100%">
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default SVHAppShell;
