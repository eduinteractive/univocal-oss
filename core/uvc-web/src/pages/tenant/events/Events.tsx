import { Group, Text, Title } from '@mantine/core';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    SAPI,
    SVHEvent,
} from '@eduinteractive/uvc-api';
import { useTenant } from '../../../context/TenantContext';
import EventModal from '../../../components/features/tenant/events/EventModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import SVHFilter, {
    SVHFilterObject,
} from '../../../components/common/SVHFilter';
import SVHPrivacyDisclaimer from '../../../components/common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

const Events = () => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [currentEvent, setCurrentEvent] = useState<SVHEvent | null>(null);
    const [eventModalVisible, setEventModalVisible] = useState(false);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);

    const eventsQuery = useQuery({
        queryKey: ['events', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.EVENT.TENANT.getEvents({
                tenantId: currentTenant!._id,
                params: metadataFilter,
            }),
    });

    const createEventMutation = useMutation({
        mutationFn: SAPI.EVENT.TENANT.createEvent,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.EVENTS.SUCCESS.CREATED')
            );
            eventsQuery.refetch();
            setEventModalVisible(false);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateEventMutation = useMutation({
        mutationFn: SAPI.EVENT.TENANT.updateEvent,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.EVENTS.SUCCESS.UPDATED')
            );
            eventsQuery.refetch();
            setEventModalVisible(false);
            setCurrentEvent(null);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteEventMutation = useMutation({
        mutationFn: SAPI.EVENT.TENANT.deleteEvent,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.EVENTS.SUCCESS.DELETED')
            );
            eventsQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p="md">
            <Group gap="xs">
                <Title order={3} c="blue">
                    {t('TENANT_PAGES.EVENTS.TITLE')}
                </Title>
                <SVHPrivacyDisclaimer />
            </Group>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.EVENTS.DESCRIPTION')}
            </Text>
            <SVHFilter
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () => setEventModalVisible(true),
                    text: t('TENANT_PAGES.EVENTS.ADD'),
                    permission: 'event',
                }}
            />
            <EventModal
                visible={eventModalVisible}
                data={currentEvent || undefined}
                onClose={() => {
                    setEventModalVisible(false);
                    setCurrentEvent(null);
                }}
                onSubmit={(body) => {
                    if (currentEvent) {
                        updateEventMutation.mutate({
                            body,
                            eventId: currentEvent._id,
                            tenantId: currentTenant!._id,
                        });
                    } else {
                        createEventMutation.mutate({
                            tenantId: currentTenant!._id,
                            body,
                        });
                    }
                }}
            />
            <SVHMetaGrid
                data={eventsQuery.data || []}
                permissionPrefix="event"
                onEdit={(event) => {
                    setCurrentEvent(event as SVHEvent);
                    setEventModalVisible(true);
                }}
                onDelete={(eventId) => {
                    deleteEventMutation.mutate({
                        tenantId: currentTenant!._id,
                        eventId,
                    });
                }}
            />
        </SVHPageWrapper>
    );
};

export default Events;
