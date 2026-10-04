import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconClock, IconListDetails, IconUserPlus } from '@tabler/icons-react';
import { PublicSiteEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSite } from '../../../../context/SiteContext';
import SiteCompactCard from './SiteCompactCard';
import SiteDateBlock from './SiteDateBlock';
import { truncate } from '../siteText';
import classes from '../site.module.css';

// eslint-disable-next-line react-refresh/only-export-components
export const formatEventDate = (event: PublicSiteEvent) => {
    const start = dayjs(event.startDate);
    const end = event.endDate ? dayjs(event.endDate) : undefined;
    const date = start.format('DD.MM.YYYY');
    const time = `${start.format('HH:mm')}${end && end.isSame(start, 'day') ? ` – ${end.format('HH:mm')}` : ''} Uhr`;
    if (end && !end.isSame(start, 'day')) {
        return `${date} – ${end.format('DD.MM.YYYY')}`;
    }
    return `${date} | ${time}`;
};

const formatEventTime = (event: PublicSiteEvent) => {
    const start = dayjs(event.startDate).locale('de');
    const end = event.endDate ? dayjs(event.endDate).locale('de') : undefined;
    if (end && !end.isSame(start, 'day')) {
        return `${start.format('dd, DD.MM.')} bis ${end.format('dd, DD.MM.YYYY')}`;
    }
    const range = `${start.format('HH:mm')}${end ? ` – ${end.format('HH:mm')}` : ''} Uhr`;
    return `${start.format('dddd')}, ${range}`;
};

const isPastEvent = (event: PublicSiteEvent) => dayjs(event.endDate ?? event.startDate).isBefore(dayjs());

export const SiteEventFeatured = ({ event }: { event: PublicSiteEvent }) => {
    const { t } = useTranslation();
    const { preview } = useSite();
    const isPast = isPastEvent(event);

    return (
        <Card radius="lg" p="var(--site-card-padding)" bg="var(--site-soft)" h="100%">
            <Stack gap="md" h="100%">
                <Group wrap="nowrap" align="flex-start" gap="md">
                    <SiteDateBlock date={event.startDate} filled={!isPast} />
                    <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                        <Title order={3} fz={18} fw={650} lh={1.35} c="dark.8" className={classes.itemTitle}>
                            {event.title}
                        </Title>
                        <Group gap={6} c="dark.5" wrap="nowrap">
                            <IconClock size={16} aria-hidden style={{ flexShrink: 0 }} />
                            <Text size="sm" fw={500} c="dark.5">
                                {formatEventTime(event)}
                            </Text>
                            {isPast && (
                                <Badge size="sm" variant="light" color="gray" radius="sm">
                                    {t('SITE.PUBLIC.EVENT_PAST')}
                                </Badge>
                            )}
                        </Group>
                    </Stack>
                </Group>
                {event.description && (
                    <Text c="dark.6" style={{ whiteSpace: 'pre-line' }}>
                        {truncate(event.description, 600)}
                    </Text>
                )}
                {((event.registrationEnabled && !isPast) || event.programEnabled) && (
                    <Group gap="sm" mt="auto">
                        {event.registrationEnabled && !isPast && (
                            <Button
                                color="var(--site-primary)"
                                radius="xl"
                                leftSection={<IconUserPlus size={16} />}
                                component={Link}
                                to={`/event-registration/${event._id}`}
                                disabled={preview}
                            >
                                {t('SITE.PUBLIC.EVENT_REGISTER')}
                            </Button>
                        )}
                        {event.programEnabled && (
                            <Button
                                color="var(--site-primary)"
                                variant="outline"
                                radius="xl"
                                leftSection={<IconListDetails size={16} />}
                                component={Link}
                                to={`/event-program/${event._id}`}
                                disabled={preview}
                            >
                                {t('SITE.PUBLIC.EVENT_PROGRAM')}
                            </Button>
                        )}
                    </Group>
                )}
            </Stack>
        </Card>
    );
};

const MiniDate = ({ date }: { date: Date }) => {
    const value = dayjs(date).locale('de');
    return (
        <Stack gap={0} align="center" className={classes.dateBlock}>
            <Text fz={15} fw={800} lh={1} c="inherit">
                {value.format('D')}
            </Text>
            <Text fz={9} fw={700} tt="uppercase" lh={1.2} c="inherit">
                {value.format('MMM').replace('.', '')}
            </Text>
        </Stack>
    );
};

export const SiteEventCompact = ({ event, active }: { event: PublicSiteEvent; active: boolean }) => (
    <SiteCompactCard
        icon={<MiniDate date={event.startDate} />}
        title={event.title}
        meta={formatEventDate(event)}
        active={active}
    />
);
