import {
    Button,
    Card,
    Group,
    NumberInput,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { SAPI, SVHEvent, SVHEventRegistration } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import EventCustomFields from './EventCustomFields';
import EventCustomTable from './EventCustomTable';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { checkPermission } from '../../../../utils/Permission';

interface EventRegistrationsSubmitData {
    config: {
        registration: {
            enabled?: boolean;
            capacity?: number | null;
            fields?: {
                key: string;
                value: string;
            }[];
        };
    };
}

interface EventRegistrationsProps {
    event: SVHEvent;
    registrations: SVHEventRegistration[];
    onUpdate: (data: EventRegistrationsSubmitData) => void;
}

const EventRegistrations = (props: EventRegistrationsProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const queryClient = useQueryClient();
    const canDelete =
        !!currentTenant &&
        (checkPermission(currentTenant, 'event:edit') ||
            props.event.authorId === authData?._id);
    const deleteMutation = useMutation({
        mutationFn: (registrationId: string) =>
            SAPI.EVENT.TENANT.deleteEventRegistration({
                tenantId: currentTenant!._id,
                eventId: props.event._id,
                registrationId,
            }),
        onSuccess: () => {
            NotificationHandler.showSuccess(t('EVENTS.TABLE.DELETED'));
            queryClient.invalidateQueries({
                queryKey: ['event', props.event._id],
            });
        },
        onError: NotificationHandler.showAxiosError,
    });
    const [capacity, setCapacity] = useState<number | string>(
        props.event.config.registration.capacity ?? ''
    );

    useEffect(() => {
        setCapacity(props.event.config.registration.capacity ?? '');
    }, [props.event.config.registration.capacity]);

    const savedCapacity = props.event.config.registration.capacity ?? '';
    const capacityDirty = String(capacity) !== String(savedCapacity);

    const saveCapacity = () => {
        const next = capacity === '' ? null : Number(capacity);
        if (next !== null && (!Number.isInteger(next) || next < 1)) return;
        props.onUpdate({
            config: {
                registration: {
                    capacity: next,
                },
            },
        });
    };

    return (
        <Stack gap="xl">
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb="md">
                    {t('EVENTS.SETTINGS')}
                </Title>
                <Stack gap="lg">
                    <Stack gap={8}>
                        <Text size="sm" fw={600}>{t('EVENTS.CAPACITY_LABEL')}</Text>
                        <Text size="sm" c="dimmed">{t('EVENTS.CAPACITY_HINT')}</Text>
                        <NumberInput
                            min={1}
                            allowDecimal={false}
                            value={capacity}
                            onChange={setCapacity}
                        />
                        <Text size="sm" c="dimmed">
                            {props.event.config.registration.capacity
                                ? t('EVENTS.CAPACITY_COUNT', {
                                    count: props.registrations.length,
                                    capacity: props.event.config.registration.capacity,
                                })
                                : t('EVENTS.REGISTRATION_COUNT', {
                                    count: props.registrations.length,
                                })}
                        </Text>
                        <Group justify="flex-end">
                            <Button disabled={!capacityDirty} onClick={saveCapacity}>
                                {t('SITE.SAVE')}
                            </Button>
                        </Group>
                    </Stack>
                    <Stack gap={8}>
                        <Text size="sm" fw={600}>{t('EVENTS.CUSTOM_FIELDS.TITLE')}</Text>
                        <Text size="sm" c="dimmed">{t('EVENTS.FIELDS_HINT')}</Text>
                        <EventCustomFields
                            hideTitle
                            data={{
                                fields: props.event.config.registration.fields || [],
                            }}
                            onUpdate={(fields) => {
                                props.onUpdate({
                                    config: {
                                        registration: {
                                            fields,
                                        },
                                    },
                                });
                            }}
                        />
                    </Stack>
                </Stack>
            </Card>
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.REGISTRATIONS_LIST')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.REGISTRATIONS_LIST_HINT')}
                </Text>
                <EventCustomTable
                    fields={props.event.config.registration.fields || []}
                    data={props.registrations}
                    onDelete={
                        canDelete
                            ? (registrationId) =>
                                  deleteMutation.mutate(registrationId)
                            : undefined
                    }
                />
            </Card>
        </Stack>
    );
};

export default EventRegistrations;
