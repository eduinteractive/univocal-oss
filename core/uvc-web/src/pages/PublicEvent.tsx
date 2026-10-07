import { Anchor, Box, Button, Card, Container, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconClock, IconDownload, IconFileText, IconMapPin } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { SAPI, SITE_LAYOUTS, SiteLayoutPreset, SVHEventSession, SVHPublicEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SVHLoader from '../components/common/SVHLoader';
import { useSite } from '../context/SiteContext';
import HTTP_403 from './error/HTTP_403';
import SiteDateBlock from '../components/features/site/cards/SiteDateBlock';
import siteClasses from '../components/features/site/site.module.css';
import SiteHtml from '../components/features/site/SiteHtml';
import { SiteSectionShell } from '../components/features/site/SiteSection';
import { SiteThemeProvider, useSiteTheme } from '../components/features/site/SiteThemeContext';
import { selectedEventPalette } from '../components/features/tenant/events/eventAccent';
import { getApiOrigin } from '../utils/SiteHost';
import SessionDescription from '../components/features/tenant/events/SessionDescription';
import PublicEventFooter from '../components/features/site/PublicEventFooter';
import GroupProfileBack from '../components/features/site/GroupProfileBack';

interface PublicEventProps {
    previewEvent?: SVHPublicEvent;
    previewEventId?: string;
    previewCoverUrl?: string | null;
}

const eventLayout = (layout?: string): SiteLayoutPreset =>
    SITE_LAYOUTS.includes(layout as SiteLayoutPreset) ? (layout as SiteLayoutPreset) : 'compact';

const materialExtension = (link: string) => {
    const raw = link.split('/').pop() || '';
    let name = raw;
    try {
        name = decodeURIComponent(raw);
    } catch {
        name = raw;
    }
    const extension = name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toUpperCase();
    return extension && extension.length <= 5 ? extension : 'DATEI';
};

const PublicEvent = (props: PublicEventProps) => {
    const params = useParams();
    const eventId = props.previewEventId ?? params.eventId;
    const eventQuery = useQuery({
        queryKey: ['public-event', eventId],
        queryFn: () => SAPI.EVENT.PUBLIC.getPublicEvent({ eventId: eventId! }),
        enabled: !props.previewEvent && !!eventId,
    });
    const event = props.previewEvent ?? eventQuery.data;

    if (!props.previewEvent && eventQuery.isLoading) return <SVHLoader />;
    if (!event || (!props.previewEvent && eventQuery.isError)) return <HTTP_403 />;

    return (
        <SiteThemeProvider appearance={{ palette: selectedEventPalette(event.config.public?.accent), layout: eventLayout(event.config.public?.layout) }}>
            <PublicEventPage
                event={event}
                eventId={eventId}
                preview={!!props.previewEvent}
                previewCoverUrl={props.previewCoverUrl}
            />
        </SiteThemeProvider>
    );
};

const PublicEventPage = ({
    event,
    eventId,
    preview,
    previewCoverUrl,
}: {
    event: SVHPublicEvent;
    eventId?: string;
    preview: boolean;
    previewCoverUrl?: string | null;
}) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { mobile } = useSite();
    const { vars, layout, layoutTokens } = useSiteTheme();

    useEffect(() => {
        if (!location.hash) return;
        document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, [location.hash]);

    const sessionsByDay = useMemo(() => {
        const sessions = [...(event.config.toc.sessions ?? [])].sort(
            (a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf()
        );
        const groups: { day: string; sessions: SVHEventSession[] }[] = [];
        sessions.forEach((session) => {
            const day = dayjs(session.start).locale('de').format('YYYY-MM-DD');
            const current = groups.find((group) => group.day === day);
            if (current) current.sessions.push(session);
            else groups.push({ day, sessions: [session] });
        });
        return groups;
    }, [event.config.toc.sessions]);

    const place = [event.place?.name, event.place?.address].filter(Boolean).join(', ');
    const coverKey = event.config.public?.coverKey;
    const coverUrl = previewCoverUrl
        || (coverKey
            ? `${getApiOrigin()}/api/event/public/event/${eventId}/download/${encodeURIComponent(coverKey)}`
            : null);
    const start = dayjs(event.startDate).locale('de');
    const end = event.endDate ? dayjs(event.endDate).locale('de') : undefined;
    const timeLabel = end && !end.isSame(start, 'day')
        ? `${start.format('dd, DD.MM.')} bis ${end.format('dd, DD.MM.YYYY')}`
        : `${start.format('dddd')}, ${start.format('HH:mm')}${end ? ` – ${end.format('HH:mm')}` : ''} Uhr`;

    const mediaStyle = {
        background: coverUrl
            ? `center / cover no-repeat url("${coverUrl}")`
            : 'var(--site-hero-gradient)',
    };
    const bannerHeight = mobile ? layoutTokens.bannerHeight.base : layoutTokens.bannerHeight;
    const heroCopy = (tone: 'light' | 'dark') => (
        <Stack gap="sm" style={{ flex: 1, minWidth: mobile ? 0 : 240 }}>
            <Title
                order={1}
                c={tone === 'dark' ? 'white' : 'var(--site-primary)'}
                fz={mobile ? 28 : { base: 24, sm: tone === 'dark' ? 44 : 30 }}
            >
                {event.title}
            </Title>
            <Group gap={6} c={tone === 'dark' ? 'rgba(255,255,255,0.88)' : 'dark.5'} wrap="nowrap">
                <IconClock size={16} aria-hidden style={{ flexShrink: 0 }} />
                <Text size="sm" fw={500}>{timeLabel}</Text>
            </Group>
            {place && (
                <Group gap={6} c={tone === 'dark' ? 'rgba(255,255,255,0.88)' : 'dark.5'} wrap="nowrap">
                    <IconMapPin size={16} aria-hidden style={{ flexShrink: 0 }} />
                    <Text size="sm">{place}</Text>
                </Group>
            )}
            {event.description && (
                <Text c={tone === 'dark' ? 'rgba(255,255,255,0.92)' : 'dark.6'} style={{ whiteSpace: 'pre-line' }}>
                    {event.description}
                </Text>
            )}
            {event.config.registration.enabled && eventId && (
                <Button
                    component={Link}
                    to={`/event-registration/${eventId}`}
                    color={tone === 'dark' ? 'white' : 'var(--site-primary)'}
                    c={tone === 'dark' ? 'var(--site-primary)' : undefined}
                    variant={tone === 'dark' ? 'white' : 'filled'}
                    radius="xl"
                    w="fit-content"
                    onClick={preview ? (click) => click.preventDefault() : undefined}
                >
                    {t('PAGES.EVENT.PUBLIC.REGISTER')}
                </Button>
            )}
        </Stack>
    );

    return (
        <Box pos="relative" mih={preview ? undefined : '100vh'} bg="var(--site-page)" style={{ ...vars, display: 'flex', flexDirection: 'column' }}>
            <GroupProfileBack tenantId={event.tenantId} preview={preview} />
            <Box style={{ flex: 1 }}>
                {layoutTokens.heroStyle === 'overlay' && (
                    <Box pos="relative" mih={bannerHeight} className={siteClasses.heroOverlay} style={mediaStyle}>
                        <Box className={siteClasses.heroOverlayScrim} aria-hidden />
                        <Container size="lg" pos="relative" style={{ zIndex: 1 }} py={mobile ? 36 : { base: 36, sm: 56 }}>
                            <Group align="flex-start" gap="lg" wrap="nowrap">
                                <SiteDateBlock date={event.startDate} />
                                {heroCopy('dark')}
                            </Group>
                        </Container>
                    </Box>
                )}
                {layoutTokens.heroStyle === 'split' && (
                    <Container size="lg" mt="lg" mb="md">
                        <Group
                            align="stretch"
                            gap={0}
                            wrap={mobile ? 'wrap' : 'nowrap'}
                            className={siteClasses.heroSplit}
                        >
                            <Box className={siteClasses.heroSplitBrand} p={{ base: 'lg', sm: 'xl' }} style={{ flex: 1 }}>
                                <Group align="flex-start" gap="lg" wrap="wrap">
                                    <SiteDateBlock date={event.startDate} filled />
                                    {heroCopy('light')}
                                </Group>
                            </Box>
                            <Box
                                mih={mobile ? 180 : layoutTokens.bannerHeight}
                                className={siteClasses.heroSplitMedia}
                                style={{ ...mediaStyle, flex: mobile ? undefined : 1, width: mobile ? '100%' : undefined }}
                            />
                        </Group>
                    </Container>
                )}
                {layoutTokens.heroStyle === 'overlap' && (
                    <>
                        <Box h={bannerHeight} style={mediaStyle} />
                        <Container size="lg">
                            <Card
                                radius="var(--site-radius)"
                                p={{ base: 'md', sm: 'lg' }}
                                mt={mobile ? -28 : layoutTokens.cardOverlap}
                                shadow="sm"
                                withBorder
                            >
                                <Group align="flex-start" gap="lg" wrap="wrap">
                                    <SiteDateBlock date={event.startDate} filled />
                                    {heroCopy('light')}
                                </Group>
                            </Card>
                        </Container>
                    </>
                )}
                <Container
                    size="lg"
                    mt={layout === 'compact' ? 'md' : layoutTokens.heroStyle === 'overlay' ? 0 : 'lg'}
                    pt={layoutTokens.heroStyle === 'overlay' ? 'xl' : undefined}
                    pb="xl"
                >
                    <Stack gap={layoutTokens.sectionGap}>
                        {event.config.toc.enabled && (
                            <SiteSectionShell id="program" title={t('PAGES.EVENT.PUBLIC.PROGRAM')} elevated>
                                <Stack gap="md">
                                    {event.config.toc.content && <SiteHtml html={event.config.toc.content} />}
                                    {sessionsByDay.map((group) => (
                                        <Stack key={group.day} gap="xs">
                                            <Text size="sm" fw={700} c="dark.5">
                                                {dayjs(group.day).locale('de').format('dddd, D. MMMM')}
                                            </Text>
                                            {group.sessions.map((session) => (
                                                <Card key={session.id} radius="md" bg="var(--site-soft)" p="md">
                                                    <Group align="flex-start" wrap="nowrap" gap="md">
                                                        <Text fw={700} c="var(--site-primary)" style={{ flexShrink: 0 }}>
                                                            {dayjs(session.start).format('HH:mm')}
                                                            {session.end ? `–${dayjs(session.end).format('HH:mm')}` : ''}
                                                        </Text>
                                                        <Stack gap={2}>
                                                            <Text fw={650} c="dark.8">{session.title}</Text>
                                                            {session.place && <Text size="sm" c="dark.5">{session.place}</Text>}
                                                            <SessionDescription html={session.description} c="dark.6" />
                                                        </Stack>
                                                    </Group>
                                                </Card>
                                            ))}
                                        </Stack>
                                    ))}
                                    {(event.config.toc.materials?.length ?? 0) > 0 && (
                                        <Stack gap="sm">
                                            <Text fw={700} c="var(--site-primary)">{t('PAGES.EVENT.PUBLIC.MATERIALS')}</Text>
                                            {event.config.toc.materials?.map((material) => (
                                                <Anchor
                                                    key={material.link}
                                                    href={`${getApiOrigin()}/api/event/public/event/${eventId}/download/${encodeURIComponent(material.link)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    underline="never"
                                                    c="inherit"
                                                >
                                                    <Card radius="md" bg="var(--site-soft)" p="md">
                                                        <Group wrap="nowrap" gap="sm">
                                                            <ThemeIcon size={40} radius="md" variant="light" color="var(--site-primary)">
                                                                <IconFileText size={20} />
                                                            </ThemeIcon>
                                                            <Box style={{ flex: 1, minWidth: 0 }}>
                                                                <Text fw={650} c="dark.8" lineClamp={2}>{material.title}</Text>
                                                                <Text size="sm" c="dimmed">{materialExtension(material.link)}</Text>
                                                            </Box>
                                                            <IconDownload size={18} color="var(--site-primary)" aria-hidden />
                                                        </Group>
                                                    </Card>
                                                </Anchor>
                                            ))}
                                        </Stack>
                                    )}
                                </Stack>
                            </SiteSectionShell>
                        )}
                    </Stack>
                </Container>
            </Box>
            <PublicEventFooter tenantId={event.tenantId} />
        </Box>
    );
};

export default PublicEvent;
