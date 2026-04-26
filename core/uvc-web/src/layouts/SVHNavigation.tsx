import {
    AppShell,
    UnstyledButton,
    Group,
    Text,
    rem,
    Flex,
    Menu,
    Avatar,
    Burger,
    ActionIcon,
    useMantineColorScheme,
    ScrollArea,
    Indicator,
    ThemeIcon,
    Box,
    Image,
} from '@mantine/core';
import {
    IconHome,
    IconUsersGroup,
    IconSettings,
    IconArrowsLeftRight,
    IconLogout,
    IconChevronRight,
    IconMail,
    IconSun,
    IconMoon,
    IconMessage,
    IconDashboard,
    IconUsers,
    IconUserSquareRounded,
    IconMessages,
    IconCalendar,
    IconMoneybag,
    IconLibrary,
    IconNetwork,
    IconClipboard,
    IconTimelineEvent,
    IconBucket,
    IconCompass,
    IconAlertCircle,
    IconShield,
    IconSectionSign,
    IconFileText,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { useContext, useEffect, useMemo } from 'react';
import { deepCopy } from '../utils/DataMiddleware';
import SVHNavLinksGroup from '../components/common/SVHNavLinksGroup';
import { PERMISSION_LEVEL, UserContact } from '@eduinteractive/uvc-api';
import { checkPermission } from '../utils/Permission';
import { useSocket } from '../context/SocketContext';
import { getValidAvatarIdentifier } from '../utils/BannedIdentifiers';
import { useNavigate } from 'react-router-dom';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { SidebarContext } from './SVHAppShell';
import NotificationPopover from '../components/common/SVHNotificationPopover';
import { getMemberRoleLabel } from '../utils/Parser';
import { useMediaQuery } from '@mantine/hooks';
import LOGO from '../assets/logo.png';
import LOGO_WHITE from '../assets/logo.png';
import { useTranslation } from 'react-i18next';

const navigationLinks = Object.freeze([
    { icon: IconHome, label: 'Startseite', link: '/', visible: false },
    {
        icon: IconUsersGroup,
        label: 'Meine SV',
        link: '/sv',
        links: [
            { label: 'Dashboard', link: '/sv/dashboard', icon: IconDashboard },
            { label: 'Mitglieder', link: '/sv/members', icon: IconUsers },
            { label: 'Projekte', link: '/sv/projects', icon: IconBucket },
            { label: 'Wissen', link: '/sv/knowledge', icon: IconLibrary },
            { label: 'Umfragen', link: '/sv/surveys', icon: IconClipboard },
            { label: 'Kalender', link: '/sv/calendar', icon: IconCalendar },
            {
                label: 'SV-Profil',
                link: '/sv/profile',
                icon: IconUserSquareRounded,
            },
            {
                label: 'Gruppenchat',
                link: '/sv/chat',
                indicator: '',
                icon: IconMessages,
            },
            {
                label: 'Veranstaltungen',
                link: '/sv/events',
                icon: IconTimelineEvent,
            },
            { label: 'Finanzen', link: '/sv/budgets', icon: IconMoneybag },
            {
                label: 'Einstellungen',
                link: '/sv/settings',
                icon: IconSettings,
            },
        ],
        visible: false,
    },
    {
        icon: IconCompass,
        label: 'Entdecken',
        link: '/discover',
        visible: true,
        links: [
            {
                icon: IconUsersGroup,
                label: 'Offene Gruppen',
                link: '/discover/tenants',
            },
        ],
    },
    {
        icon: IconNetwork,
        label: 'SV-Administration',
        link: '/d_admin',
        color: 'red',
        visible: true,
        links: [
            {
                icon: IconNetwork,
                label: 'Domains',
                color: 'red',
                link: '/d_admin/domains',
            },
        ],
    },
    {
        icon: IconSettings,
        label: 'Administration',
        link: '/admin',
        links: [
            {
                label: 'Dashboard',
                link: '/admin/dashboard',
                color: 'red',
                icon: IconDashboard,
            },
            {
                label: 'Meldungen',
                link: '/admin/reports',
                color: 'red',
                icon: IconAlertCircle,
            },
            {
                label: 'Benutzer*innen',
                link: '/admin/users',
                color: 'red',
                icon: IconUsers,
            },
            {
                label: 'Tenants',
                link: '/admin/tenants',
                color: 'red',
                icon: IconUsersGroup,
            },
            {
                label: 'Domains',
                link: '/admin/domains',
                color: 'red',
                icon: IconNetwork,
            },
        ],
        visible: true,
        color: 'red',
    },
]);

const SVHNavigation = () => {
    const matchMedia = useMediaQuery('(max-width: 48em)');
    const socket = useSocket();
    const navigate = useNavigate();
    const { authData } = useAuth();
    const { currentTenant, setCurrentTenant } = useTenant();
    const { mobileOpened, desktopOpened, toggleDesktop, toggleMobile } =
        useContext(SidebarContext);
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const { t } = useTranslation();

    const groupQuery = useQuery({
        queryKey: ['usergroups', authData?.groups],
        queryFn: () => SAPI.TENANT.PRIVATE.getUserTenants(),
    });

    const logoutMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.logout,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('AUTH.LOGOUT_SUCCESS'));
            window.location.reload();
        },
    });

    const unseenGroupMessageCount = useQuery({
        queryKey: ['unseenGroupMessageCount', currentTenant?._id],
        queryFn: () =>
            SAPI.CHAT.PRIVATE.getGroupChatUnseenCount(currentTenant?._id),
        refetchInterval: 10000 * 6,
    });

    const unseenPrivateMessageCount = useQuery({
        queryKey: ['unseenPrivateMessageCount'],
        queryFn: () => SAPI.CHAT.PRIVATE.getPrivateChatsUnseenCount(),
        refetchInterval: 10000 * 6,
    });

    const userNotificationsQuery = useQuery({
        queryKey: ['userNotifications'],
        queryFn: () => SAPI.TENANT.PRIVATE.getUserNotifications(),
    });

    const markNotificationAsSeenMutation = useMutation({
        mutationFn: SAPI.TENANT.PRIVATE.markNotficationsAsSeen,
        onSuccess: () => userNotificationsQuery.refetch(),
    });

    const navItems = useMemo(() => {
        let linksCopy = deepCopy(navigationLinks);
        const tenantLinks = linksCopy.find((link) => link.label === 'Meine SV');

        if (currentTenant) {
            if (!currentTenant.tenant?.integrations.dashboard) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'SV-Profil'
                );
            }
            if (!currentTenant.tenant?.integrations.calendar) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Kalender'
                );
            }
            if (!currentTenant.tenant?.integrations.survey) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Umfragen'
                );
            }
            if (!currentTenant.tenant?.integrations.chat) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Gruppenchat'
                );
            }
            if (!currentTenant.tenant?.integrations.budget) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Finanzen'
                );
            }
            if (!currentTenant.tenant?.integrations.knowledge) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Wissen'
                );
            }
            if (!currentTenant.tenant?.integrations.event) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Veranstaltungen'
                );
            }
            if (!currentTenant.tenant?.integrations.project) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Projekte'
                );
            }
            if (!checkPermission(currentTenant, 'tenant:administration')) {
                tenantLinks!.links = tenantLinks!.links?.filter(
                    (link) => link.label !== 'Administration'
                );
            }
        } else {
            linksCopy = linksCopy.filter((link) => link.label !== 'Meine SV');
        }

        if (authData?.domains?.length === 0) {
            linksCopy = linksCopy.filter(
                (link) => link.label !== 'SV-Administration'
            );
        }

        if (
            authData &&
            authData?.permissionLevel < PERMISSION_LEVEL.SV_HUB_MODERATION
        ) {
            linksCopy = linksCopy.filter(
                (link) => link.label !== 'Administration'
            );
        }

        if (tenantLinks?.links?.find((link) => link.label === 'Chat')) {
            const unreadCount = unseenGroupMessageCount.data?.unreadCount;
            const unreadCountIndicator =
                unreadCount !== 0 && unreadCount !== undefined
                    ? unreadCount.toString()
                    : '';
            (
                tenantLinks.links.find((link) => link.label === 'Chat')! as {
                    indicator?: string;
                }
            ).indicator = unreadCountIndicator;
        }

        const userLinks = linksCopy.find(
            (link) => link.label === 'Mein Bereich'
        );

        if (userLinks?.links?.find((link) => link.label === 'Chats')) {
            const unreadCount = unseenPrivateMessageCount.data?.unreadCount;
            const unreadCountIndicator =
                unreadCount !== 0 && unreadCount !== undefined
                    ? unreadCount.toString()
                    : '';
            (
                userLinks.links.find((link) => link.label === 'Chats')! as {
                    indicator?: string;
                }
            ).indicator = unreadCountIndicator;
        }

        return linksCopy;
    }, [
        authData,
        currentTenant,
        unseenGroupMessageCount.data?.unreadCount,
        unseenPrivateMessageCount.data?.unreadCount,
    ]);

    useEffect(() => {
        if (socket) {
            socket.on('newGroupMessage', () => {
                unseenGroupMessageCount.refetch();
            });
            socket.on('markedGAsSeen', () => {
                unseenGroupMessageCount.refetch();
            });
            socket.on('markedPAsSeen', () => {
                unseenPrivateMessageCount.refetch();
            });
            socket.on('newPrivateMessage', () => {
                unseenPrivateMessageCount.refetch();
            });
        }

        return () => {
            if (socket) {
                socket.off('newGroupMessage');
                socket.off('markedGAsSeen');
                socket.off('markedPAsSeen');
                socket.off('newPrivateMessage');
            }
        };
    }, [socket, unseenGroupMessageCount, unseenPrivateMessageCount]);

    return (
        <AppShell.Navbar>
            {!matchMedia && (
                <Flex
                    align="center"
                    justify={mobileOpened || desktopOpened ? 'start' : 'center'}
                    h={60}
                    px="md"
                    py="sm"
                >
                    <Burger
                        opened={mobileOpened}
                        onClick={toggleMobile}
                        hiddenFrom="sm"
                        size="sm"
                        color="blue"
                    />
                    <Burger
                        opened={desktopOpened}
                        onClick={toggleDesktop}
                        visibleFrom="sm"
                        size="sm"
                        color="blue"
                    />
                    {(mobileOpened || desktopOpened) && (
                        <Box h={30} mb="sm" mt="sm" pl="sm">
                            {colorScheme === 'dark' ? (
                                <Image
                                    src={LOGO_WHITE}
                                    alt="Univocal Logo"
                                    h="100%"
                                    w="auto"
                                    fit="contain"
                                />
                            ) : (
                                <Image
                                    src={LOGO}
                                    alt="Univocal Logo"
                                    h="100%"
                                    w="auto"
                                    fit="contain"
                                />
                            )}
                        </Box>
                    )}
                </Flex>
            )}
            <Menu
                width={220}
                offset={0}
                position={matchMedia ? 'bottom' : 'right'}
                withArrow
            >
                <Menu.Target>
                    <UnstyledButton className="groupButton">
                        {(mobileOpened || desktopOpened) && (
                            <Group justify="center">
                                <Flex flex={1} gap={0} direction="column">
                                    <Text size="xs" fw={500}>
                                        {currentTenant?.tenant?.title}
                                    </Text>

                                    <Text c="dimmed" size="xs">
                                        {getMemberRoleLabel(
                                            currentTenant?.permissionLevel
                                        )}
                                    </Text>
                                </Flex>
                                {groupQuery.data &&
                                    groupQuery.data?.length > 1 && (
                                        <IconArrowsLeftRight
                                            style={{
                                                width: rem(20),
                                                height: rem(20),
                                            }}
                                        />
                                    )}
                            </Group>
                        )}
                        {!mobileOpened && !desktopOpened && (
                            <Group justify="center">
                                <ThemeIcon variant="subtle">
                                    <IconUsersGroup size={20} />
                                </ThemeIcon>
                            </Group>
                        )}
                    </UnstyledButton>
                </Menu.Target>
                {groupQuery.data && groupQuery.data?.length > 1 && (
                    <Menu.Dropdown>
                        <Menu.Label>{t('NAV.SWITCH_GROUP')}</Menu.Label>
                        {groupQuery.data?.map((group) => (
                            <Menu.Item
                                key={group._id}
                                onClick={() => {
                                    const authGroup = authData?.groups.find(
                                        (authGroup) =>
                                            authGroup._id === group._id
                                    );
                                    if (authGroup) {
                                        setCurrentTenant({
                                            ...authGroup,
                                            tenant: group,
                                        });
                                        localStorage.setItem(
                                            'currentTenant',
                                            group._id
                                        );
                                    } else {
                                        setCurrentTenant(null);
                                        localStorage.removeItem(
                                            'currentTenant'
                                        );
                                    }
                                }}
                                color={
                                    currentTenant?._id === group._id
                                        ? 'blue'
                                        : undefined
                                }
                            >
                                {group.title}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                )}
            </Menu>
            <ScrollArea.Autosize flex={1}>
                {navItems?.map((navItem) => (
                    <SVHNavLinksGroup
                        {...navItem}
                        key={navItem.label}
                        onNavigate={() => {
                            if (matchMedia) {
                                toggleMobile();
                            }
                        }}
                        translateLabel={(label) => {
                            const map: Record<string, string> = {
                                Startseite: 'NAV.HOME',
                                'Meine SV': 'NAV.MY_SV',
                                Dashboard: 'NAV.DASHBOARD',
                                Mitglieder: 'NAV.MEMBERS',
                                Projekte: 'NAV.PROJECTS',
                                Wissen: 'NAV.KNOWLEDGE',
                                Umfragen: 'NAV.SURVEYS',
                                Kalender: 'NAV.CALENDAR',
                                'SV-Profil': 'NAV.PROFILE',
                                Gruppenchat: 'NAV.GROUP_CHAT',
                                Veranstaltungen: 'NAV.EVENTS',
                                Finanzen: 'NAV.BUDGETS',
                                Einstellungen: 'NAV.SETTINGS',
                                Entdecken: 'NAV.DISCOVER',
                                'Offene Gruppen': 'NAV.OPEN_TENANTS',
                                'SV-Administration': 'NAV.SV_ADMIN',
                                Domains: 'NAV.DOMAINS',
                                Administration: 'NAV.ADMIN',
                                Tenants: 'NAV.TENANTS',
                            };
                            return t(map[label] || label);
                        }}
                    />
                ))}
            </ScrollArea.Autosize>
            <Group
                style={{
                    borderTop: '1px solid var(--mantine-color-gray-3)',
                }}
                py="sm"
                px="md"
                justify="space-evenly"
            >
                <ActionIcon
                    variant="subtle"
                    onClick={() =>
                        setColorScheme(
                            colorScheme === 'dark' ? 'light' : 'dark'
                        )
                    }
                >
                    {colorScheme === 'dark' ? <IconSun /> : <IconMoon />}
                </ActionIcon>
                <NotificationPopover
                    data={userNotificationsQuery.data}
                    onNotificationClick={() =>
                        markNotificationAsSeenMutation.mutate()
                    }
                />
                <Indicator
                    processing={
                        unseenPrivateMessageCount.data?.unreadCount !== 0
                    }
                    disabled={unseenPrivateMessageCount.data?.unreadCount === 0}
                    size={10}
                    mt={5}
                >
                    <ActionIcon
                        variant="subtle"
                        onClick={() => {
                            navigate('/user/chat');
                            toggleMobile();
                        }}
                    >
                        <IconMessage />
                    </ActionIcon>
                </Indicator>
            </Group>
            <Menu position={matchMedia ? 'top' : 'right'}>
                <Menu.Target>
                    <UnstyledButton
                        className="groupButton"
                        style={{ borderBottom: 'none', overflow: 'hidden' }}
                        w="100%"
                    >
                        <Group
                            gap={10}
                            wrap="nowrap"
                            justify="center"
                            w="100%"
                            px="sm"
                        >
                            <Avatar size={34} radius="xl" bg="blue">
                                <Text size="xs" ta="center" c="white" mt={3}>
                                    {getValidAvatarIdentifier(
                                        (authData?.contact as UserContact)
                                            .first_name,
                                        (authData?.contact as UserContact)
                                            .last_name
                                    )}
                                </Text>
                            </Avatar>
                            {(mobileOpened || desktopOpened) && (
                                <Flex direction="column" wrap="wrap" maw="100%">
                                    <Text size="xs" fw={500}>
                                        {
                                            (authData?.contact as UserContact)
                                                .first_name
                                        }{' '}
                                        {
                                            (authData?.contact as UserContact)
                                                .last_name
                                        }
                                    </Text>
                                    <Text
                                        maw="100%"
                                        size="xs"
                                        c="dimmed"
                                        style={{
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {authData?.mail}
                                    </Text>
                                </Flex>
                            )}
                            <ThemeIcon hiddenFrom="sm" variant="subtle">
                                <IconChevronRight
                                    style={{
                                        width: rem(14),
                                        height: rem(14),
                                    }}
                                    stroke={1.5}
                                />
                            </ThemeIcon>
                        </Group>
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t('NAV.SETTINGS')}</Menu.Label>
                    <Menu.Item
                        leftSection={
                            <IconSettings
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                }}
                                stroke={1.5}
                            />
                        }
                        onClick={() => navigate('/user')}
                    >
                        {t('NAV.ACCOUNT')}
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconMail
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                }}
                                stroke={1.5}
                            />
                        }
                        onClick={() => navigate('/user/invitations')}
                    >
                        {t('NAV.INVITATIONS')}
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconShield
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                }}
                                stroke={1.5}
                            />
                        }
                        onClick={() =>
                            window.open(
                                'https://www.univocal.de/datenschutz',
                                '_blank'
                            )
                        }
                    >
                        {t('NAV.PRIVACY')}
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconSectionSign
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                }}
                                stroke={1.5}
                            />
                        }
                        onClick={() =>
                            window.open(
                                'https://www.univocal.de/impressum',
                                '_blank'
                            )
                        }
                    >
                        {t('NAV.IMPRINT')}
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconFileText
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                }}
                                stroke={1.5}
                            />
                        }
                        onClick={() =>
                            window.open(
                                'https://www.univocal.de/impressum',
                                '_blank'
                            )
                        }
                    >
                        {t('NAV.TERMS_OF_USE')}
                    </Menu.Item>
                    <Menu.Item
                        leftSection={
                            <IconLogout
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                }}
                                stroke={1.5}
                            />
                        }
                        onClick={() => logoutMutation.mutate()}
                    >
                        {t('NAV.LOGOUT')}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </AppShell.Navbar>
    );
};

export default SVHNavigation;
