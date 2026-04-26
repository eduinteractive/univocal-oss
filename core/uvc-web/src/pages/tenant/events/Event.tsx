import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { SAPI } from '@eduinteractive/uvc-api';
import SVHLoader from '../../../components/common/SVHLoader';
import EventMeta from '../../../components/features/tenant/events/EventMeta';
import { useState } from 'react';
import EventModal from '../../../components/features/tenant/events/EventModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import EventTabs from '../../../components/features/tenant/events/EventTabs';
import EventAccreditations from '../../../components/features/tenant/events/EventAccreditations';
import EventRegistrations from '../../../components/features/tenant/events/EventRegistrations';
import EventToc from '../../../components/features/tenant/events/EventToc';
import { useTranslation } from 'react-i18next';

const Event = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { currentTenant } = useTenant();
    const [eventModalVisible, setEventModalVisible] = useState(false);
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

    if (eventQuery.isLoading) {
        return <SVHLoader />;
    }

    if (!eventQuery.data) {
        return <h1>{t('TENANT_PAGES.EVENTS.NOT_FOUND')}</h1>;
    }

    return (
        <SVHPageWrapper p={0}>
            <EventModal
                visible={eventModalVisible}
                data={eventQuery.data?.event || undefined}
                onClose={() => {
                    setEventModalVisible(false);
                }}
                onSubmit={(body) => {
                    if (eventQuery.data?.event) {
                        updateEventMutation.mutate({
                            body,
                            eventId: eventQuery.data?.event._id,
                            tenantId: currentTenant!._id,
                        });
                    }
                    setEventModalVisible(false);
                }}
            />
            <EventTabs
                title={eventQuery.data?.event.title}
                generalTab={
                    <EventMeta
                        data={eventQuery.data?.event}
                        onEdit={() => setEventModalVisible(true)}
                    />
                }
                registrationTab={
                    <EventRegistrations
                        event={eventQuery.data?.event}
                        registrations={eventQuery.data?.registrations}
                        onUpdate={(body) =>
                            updateEventMutation.mutate({
                                body,
                                eventId: eventQuery.data?.event._id,
                                tenantId: currentTenant!._id,
                            })
                        }
                    />
                }
                tocTab={
                    <EventToc
                        event={eventQuery.data?.event}
                        onUpdate={(body) =>
                            updateEventMutation.mutate({
                                body,
                                eventId: eventQuery.data?.event._id,
                                tenantId: currentTenant!._id,
                            })
                        }
                    />
                }
                accreditationTab={
                    <EventAccreditations
                        event={eventQuery.data?.event}
                        attendees={eventQuery.data?.attendees}
                        onUpdate={(body) =>
                            updateEventMutation.mutate({
                                body,
                                eventId: eventQuery.data?.event._id,
                                tenantId: currentTenant!._id,
                            })
                        }
                    />
                }
            />
        </SVHPageWrapper>
    );
};

export default Event;
