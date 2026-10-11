import {
    EDIMultiSelect,
    EDISelect,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { Anchor, Box, Button, Card, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconClock, IconMapPin } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SAPI, SITE_LAYOUTS, SiteLayoutPreset, SVHPublicEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SVHLoader from '../components/common/SVHLoader';
import HTTP_403 from './error/HTTP_403';
import { SiteThemeProvider, useSiteTheme } from '../components/features/site/SiteThemeContext';
import { selectedEventPalette } from '../components/features/tenant/events/eventAccent';
import PublicEventFooter from '../components/features/site/PublicEventFooter';

const eventLayout = (layout?: string): SiteLayoutPreset =>
    SITE_LAYOUTS.includes(layout as SiteLayoutPreset) ? (layout as SiteLayoutPreset) : 'compact';

const EventRegistration = () => {
    const { eventId } = useParams();
    const eventQuery = useQuery({
        queryKey: ['public-event', eventId],
        queryFn: () => SAPI.EVENT.PUBLIC.getPublicEvent({ eventId: eventId! }),
        enabled: !!eventId,
    });

    if (eventQuery.isLoading) return <SVHLoader />;
    if (!eventQuery.data || eventQuery.isError) return <HTTP_403 />;

    return (
        <SiteThemeProvider appearance={{ palette: selectedEventPalette(eventQuery.data.config.public?.accent), layout: eventLayout(eventQuery.data.config.public?.layout) }}>
            <EventRegistrationPage
                eventId={eventId!}
                event={eventQuery.data}
                onRegistered={() => eventQuery.refetch()}
            />
        </SiteThemeProvider>
    );
};

const EventRegistrationPage = ({
    eventId,
    event,
    onRegistered,
}: {
    eventId: string;
    event: SVHPublicEvent;
    onRegistered: () => void;
}) => {
    const { t } = useTranslation();
    const { vars } = useSiteTheme();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [customFields, setCustomFields] = useState<Record<string, string | string[]>>({});
    const [isFinished, setIsFinished] = useState(false);

    const createRegistrationMutation = useMutation({
        mutationFn: SAPI.EVENT.PUBLIC.createEventRegistration,
        onSuccess: () => {
            setIsFinished(true);
            onRegistered();
        },
        onError: (err) => NotificationHandler.showAxiosError(err as AxiosError),
    });

    const place = [event.place?.name, event.place?.address].filter(Boolean).join(', ');
    const full = event.spotsRemaining === 0;
    const open = event.config.registration.enabled && !full && !isFinished;
    const start = dayjs(event.startDate).locale('de');
    const end = event.endDate ? dayjs(event.endDate).locale('de') : undefined;
    const timeLabel = end && !end.isSame(start, 'day')
        ? `${start.format('dd, DD.MM.')} bis ${end.format('dd, DD.MM.YYYY')}`
        : `${start.format('dddd')}, ${start.format('HH:mm')}${end ? ` – ${end.format('HH:mm')}` : ''} Uhr`;

    const handleSubmit = () => {
        if (!firstName || !lastName || !email) {
            NotificationHandler.showError(t('PAGES.EVENT.REGISTRATION.ERRORS.FILL_ALL_FIELDS'));
            return;
        }
        createRegistrationMutation.mutate({
            eventId,
            body: {
                personal: { firstName, lastName, email },
                customFields,
            },
        });
    };

    return (
        <Box pos="relative" mih="100vh" bg="var(--site-page)" style={{ ...vars, display: 'flex', flexDirection: 'column' }}>
            <Container fluid px={{ base: 'md', sm: 'xl' }} py={{ base: 32, sm: 56 }} style={{ flex: 1 }}>
                <Stack gap="lg">
                    <Anchor component={Link} to={`/event/${eventId}`} c="var(--site-primary)" size="sm" w="fit-content">
                        <Group gap={4}>
                            <IconArrowLeft size={14} />
                            {t('PAGES.EVENT.PUBLIC.BACK')}
                        </Group>
                    </Anchor>
                    <Stack gap={6}>
                        <Title order={1} c="var(--site-primary)" fz={{ base: 28, sm: 36 }}>
                            {t('PAGES.EVENT.PUBLIC.REGISTER')}
                        </Title>
                        <Text fw={650} c="dark.8">{event.title}</Text>
                        <Group gap={6} c="dark.5" wrap="nowrap">
                            <IconClock size={16} aria-hidden style={{ flexShrink: 0 }} />
                            <Text size="sm">{timeLabel}</Text>
                        </Group>
                        {place && (
                            <Group gap={6} c="dark.5" wrap="nowrap">
                                <IconMapPin size={16} aria-hidden style={{ flexShrink: 0 }} />
                                <Text size="sm">{place}</Text>
                            </Group>
                        )}
                    </Stack>
                    <Card radius="lg" p={{ base: 'md', sm: 'xl' }} withBorder>
                        <Stack gap="sm">
                            {!event.config.registration.enabled && (
                                <>
                                    <Text fw={650}>{t('PAGES.EVENT.REGISTRATION.NO_ACCESS_TITLE')}</Text>
                                    <Text size="sm" c="dark.6">{t('PAGES.EVENT.REGISTRATION.NO_ACCESS_DESCRIPTION')}</Text>
                                </>
                            )}
                            {event.config.registration.enabled && typeof event.spotsRemaining === 'number' && !full && (
                                <Text size="sm" c="dark.5">
                                    {t('PAGES.EVENT.REGISTRATION.SPOTS', { count: event.spotsRemaining })}
                                </Text>
                            )}
                            {isFinished && <Text fw={650}>{t('PAGES.EVENT.REGISTRATION.THANKS')}</Text>}
                            {event.config.registration.enabled && full && !isFinished && (
                                <Text fw={650}>{t('PAGES.EVENT.REGISTRATION.FULL')}</Text>
                            )}
                            {open && (
                                <Grid>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <EDITextInput
                                            label={t('PAGES.EVENT.REGISTRATION.FIELDS.FIRST_NAME')}
                                            placeholder={t('PAGES.EVENT.REGISTRATION.FIELDS.FIRST_NAME_PLACEHOLDER')}
                                            value={firstName}
                                            onChange={(input) => setFirstName(input.currentTarget.value)}
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6 }}>
                                        <EDITextInput
                                            label={t('PAGES.EVENT.REGISTRATION.FIELDS.LAST_NAME')}
                                            placeholder={t('PAGES.EVENT.REGISTRATION.FIELDS.LAST_NAME_PLACEHOLDER')}
                                            value={lastName}
                                            onChange={(input) => setLastName(input.currentTarget.value)}
                                            required
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                        <EDITextInput
                                            label={t('PAGES.EVENT.REGISTRATION.FIELDS.EMAIL')}
                                            placeholder={t('PAGES.EVENT.REGISTRATION.FIELDS.EMAIL_PLACEHOLDER')}
                                            value={email}
                                            onChange={(input) => setEmail(input.currentTarget.value)}
                                            required
                                        />
                                    </Grid.Col>
                                    {(event.config.registration.fields ?? []).map((field) => {
                                        const type = atob(field.value.split('.')[0]);
                                        const label = atob(field.key);
                                        const span = type === 'multiple_choice' ? 12 : { base: 12, sm: 6 };
                                        if (type === 'text') {
                                            return (
                                                <Grid.Col key={field.key} span={span}>
                                                    <EDITextInput
                                                        label={label}
                                                        placeholder={label}
                                                        value={(customFields[field.key] as string) || ''}
                                                        onChange={(input) => setCustomFields({ ...customFields, [field.key]: input.currentTarget.value })}
                                                    />
                                                </Grid.Col>
                                            );
                                        }
                                        const data = field.value.split('.').slice(1).map((option: string) => ({
                                            label: atob(option),
                                            value: option,
                                        }));
                                        if (type === 'single_choice') {
                                            return (
                                                <Grid.Col key={field.key} span={span}>
                                                    <EDISelect
                                                        label={label}
                                                        placeholder={label}
                                                        value={(customFields[field.key] as string) || null}
                                                        data={data}
                                                        onChange={(value) => setCustomFields({ ...customFields, [field.key]: value || '' })}
                                                    />
                                                </Grid.Col>
                                            );
                                        }
                                        if (type === 'multiple_choice') {
                                            return (
                                                <Grid.Col key={field.key} span={span}>
                                                    <EDIMultiSelect
                                                        label={label}
                                                        placeholder={label}
                                                        value={(customFields[field.key] as string[]) || []}
                                                        data={data}
                                                        onChange={(value) => setCustomFields({ ...customFields, [field.key]: value })}
                                                    />
                                                </Grid.Col>
                                            );
                                        }
                                        return null;
                                    })}
                                    <Grid.Col span={12}>
                                        <Button
                                            color="var(--site-primary)"
                                            radius="xl"
                                            w="fit-content"
                                            loading={createRegistrationMutation.isPending}
                                            onClick={handleSubmit}
                                        >
                                            {t('PAGES.EVENT.REGISTRATION.SUBMIT')}
                                        </Button>
                                    </Grid.Col>
                                </Grid>
                            )}
                        </Stack>
                    </Card>
                </Stack>
            </Container>
            <PublicEventFooter tenantId={event.tenantId} fluid />
        </Box>
    );
};

export default EventRegistration;
