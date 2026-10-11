import { Stack } from '@mantine/core';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { SAPI } from '@eduinteractive/uvc-api';
import SVHLoader from '../../../components/common/SVHLoader';
import EventMeta from '../../../components/features/tenant/events/EventMeta';
import { useEffect, useState } from 'react';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import EventTabs, { EVENT_TABS, EventAuthoringHeader, EventTab } from '../../../components/features/tenant/events/EventTabs';
import EventAccreditations from '../../../components/features/tenant/events/EventAccreditations';
import EventRegistrations from '../../../components/features/tenant/events/EventRegistrations';
import EventToc from '../../../components/features/tenant/events/EventToc';
import EventModulePicker, { EventModuleId } from '../../../components/features/tenant/events/EventModulePicker';
import EventSettings from '../../../components/features/tenant/events/EventSettings';
import { useTranslation } from 'react-i18next';

const TAB_ALIASES: Record<string, EventTab> = {
    toc: 'program',
    accreditations: 'checkin',
};

const resolveTab = (tab?: string): EventTab => {
    if (!tab) return 'general';
    const aliased = TAB_ALIASES[tab] ?? tab;
    return (EVENT_TABS as readonly string[]).includes(aliased) ? (aliased as EventTab) : 'general';
};

const Event = () => {
    const { eventId, tab } = useParams<{ eventId: string; tab?: string }>();
    const navigate = useNavigate();
    const { currentTenant } = useTenant();
    const [publishing, setPublishing] = useState(false);
    const { t } = useTranslation();

    const eventQuery = useQuery({
        queryKey: ['event', eventId],
        queryFn: () =>
            SAPI.EVENT.TENANT.getEvent({ tenantId: currentTenant!._id, eventId: eventId! }),
    });

    const updateEventMutation = useMutation({
        mutationFn: SAPI.EVENT.TENANT.updateEvent,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.EVENTS.SUCCESS.UPDATED')
            );
            eventQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const event = eventQuery.data?.event;
    const hasModule = Boolean(
        event?.config.toc.enabled ||
        event?.config.registration.enabled ||
        event?.config.accreditation.enabled
    );
    const requestedTab = resolveTab(tab);
    const activeTab: EventTab =
        (requestedTab === 'program' && !event?.config.toc.enabled) ||
        (requestedTab === 'registrations' && !event?.config.registration.enabled) ||
        (requestedTab === 'checkin' && !event?.config.accreditation.enabled)
            ? 'general'
            : requestedTab;

    useEffect(() => {
        if (!event || !eventId) return;
        if (!hasModule) {
            if (tab) navigate(`/sv/events/${eventId}`, { replace: true });
            return;
        }
        const moduleOff =
            (requestedTab === 'program' && !event.config.toc.enabled) ||
            (requestedTab === 'registrations' && !event.config.registration.enabled) ||
            (requestedTab === 'checkin' && !event.config.accreditation.enabled);
        const unknown = Boolean(tab) && !TAB_ALIASES[tab!] && !(EVENT_TABS as readonly string[]).includes(tab!);
        if (moduleOff || unknown || (tab && TAB_ALIASES[tab])) {
            const next = moduleOff || unknown ? 'general' : requestedTab;
            navigate(next === 'general' ? `/sv/events/${eventId}` : `/sv/events/${eventId}/${next}`, { replace: true });
        }
    }, [event, eventId, hasModule, tab, requestedTab, navigate]);

    useEffect(() => {
        if (!updateEventMutation.isPending) setPublishing(false);
    }, [updateEventMutation.isPending]);

    if (eventQuery.isLoading) {
        return <SVHLoader />;
    }

    if (!event || !eventQuery.data) {
        return <h1>{t('TENANT_PAGES.EVENTS.NOT_FOUND')}</h1>;
    }

    const save = (body: Parameters<typeof SAPI.EVENT.TENANT.updateEvent>[0]['body']) => {
        updateEventMutation.mutate({
            body,
            eventId: event._id,
            tenantId: currentTenant!._id,
        });
    };

    const activateModules = (modules: EventModuleId[]) => {
        save({
            config: {
                ...(modules.includes('program') ? { toc: { enabled: true } } : {}),
                ...(modules.includes('registration') ? { registration: { enabled: true } } : {}),
                ...(modules.includes('checkin') ? { accreditation: { enabled: true } } : {}),
            },
        });
    };

    return (
        <SVHPageWrapper p={{ base: 'md', sm: 'xl' }}>
            <Stack gap="xl">
            <EventAuthoringHeader
                event={event}
                publishing={publishing}
                spotsRemaining={
                    typeof event.config.registration.capacity === 'number'
                        ? Math.max(0, event.config.registration.capacity - eventQuery.data.registrations.length)
                        : null
                }
                onPublish={(published) => {
                    setPublishing(true);
                    save({
                        config: {
                            public: {
                                published,
                                accent: event.config.public?.accent,
                            },
                        },
                    });
                }}
            />
            {!hasModule ? (
                <EventModulePicker
                    disabled={updateEventMutation.isPending}
                    onActivate={activateModules}
                />
            ) : (
                <EventTabs
                    value={activeTab}
                    onChange={(next) => {
                        navigate(next === 'general' ? `/sv/events/${eventId}` : `/sv/events/${eventId}/${next}`);
                    }}
                    modules={{
                        program: event.config.toc.enabled,
                        registration: event.config.registration.enabled,
                        checkin: event.config.accreditation.enabled,
                    }}
                    generalTab={
                        <EventMeta
                            data={event}
                            onUpdate={save}
                        />
                    }
                    registrationTab={
                        <EventRegistrations
                            event={event}
                            registrations={eventQuery.data.registrations}
                            onUpdate={save}
                        />
                    }
                    programTab={
                        <EventToc
                            event={event}
                            onUpdate={save}
                        />
                    }
                    checkinTab={
                        <EventAccreditations
                            event={event}
                            attendees={eventQuery.data.attendees}
                            onUpdate={save}
                        />
                    }
                    settingsTab={
                        <EventSettings
                            event={event}
                            saving={updateEventMutation.isPending}
                            onUpdate={save}
                        />
                    }
                />
            )}
            </Stack>
        </SVHPageWrapper>
    );
};

export default Event;
