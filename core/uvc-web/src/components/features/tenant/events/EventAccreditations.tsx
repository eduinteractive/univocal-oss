import { ActionIcon, Card, Group, Menu, Stack, Text, Title } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconDotsVertical, IconExternalLink, IconLink, IconQrcode } from '@tabler/icons-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import { SAPI, SVHEvent, SVHEventAttendee } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import SVHQRPDF from '../../../common/SVHQRPDF';
import EventCustomFields from './EventCustomFields';
import EventCustomTable from './EventCustomTable';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { checkPermission } from '../../../../utils/Permission';

interface EventAccreditationsSubmitData {
    config: {
        accreditation: {
            enabled?: boolean;
            fields?: {
                key: string;
                value: string;
            }[];
        };
    };
}

interface EventAccreditationsProps {
    event: SVHEvent;
    attendees: SVHEventAttendee[];
    onUpdate: (data: EventAccreditationsSubmitData) => void;
}

const EventAccreditations = (props: EventAccreditationsProps) => {
    const { t } = useTranslation();
    const clipboard = useClipboard();
    const { currentTenant } = useTenant();
    const checkInUrl = `${import.meta.env.VITE_KUBERNETES_HOST}/event-checkin/${props.event._id}`;
    const { authData } = useAuth();
    const queryClient = useQueryClient();
    const canDelete =
        !!currentTenant &&
        (checkPermission(currentTenant, 'event:edit') ||
            props.event.authorId === authData?._id);
    const deleteMutation = useMutation({
        mutationFn: (attendeeId: string) =>
            SAPI.EVENT.TENANT.deleteEventAttendee({
                tenantId: currentTenant!._id,
                eventId: props.event._id,
                attendeeId,
            }),
        onSuccess: () => {
            NotificationHandler.showSuccess(t('EVENTS.TABLE.DELETED'));
            queryClient.invalidateQueries({
                queryKey: ['event', props.event._id],
            });
        },
        onError: NotificationHandler.showAxiosError,
    });
    return (
        <Stack gap="xl">
            <Card withBorder radius="sm" p="xl">
                <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
                    <Title order={3} c="violet">
                        {t('EVENTS.SETTINGS')}
                    </Title>
                    <Menu position="bottom-end">
                        <Menu.Target>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                aria-label={t('COMMON.ACTIONS')}
                            >
                                <IconDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconExternalLink size={16} />}
                                onClick={() => window.open(checkInUrl, '_blank', 'noopener,noreferrer')}
                            >
                                {t('EVENTS.CHECKIN_OPEN')}
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconLink size={16} />}
                                onClick={() => {
                                    clipboard.copy(checkInUrl);
                                    NotificationHandler.showInfo(t('COMMON.COPY_LINK_SUCCESS'));
                                }}
                            >
                                {t('EVENTS.COPY_PUBLIC_LINK')}
                            </Menu.Item>
                            <PDFDownloadLink
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                document={
                                    <SVHQRPDF
                                        title={props.event.title}
                                        link={checkInUrl}
                                        generationNotice={t('COMMON.GENERATION_NOTICE')}
                                    />
                                }
                                fileName="Check-In-QR.pdf"
                            >
                                <Menu.Item component="div" leftSection={<IconQrcode size={16} />} closeMenuOnClick={false}>
                                    {t('EVENTS.PRINT_QR')}
                                </Menu.Item>
                            </PDFDownloadLink>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
                <Stack gap={8}>
                    <Text size="sm" fw={600}>{t('EVENTS.CUSTOM_FIELDS.TITLE')}</Text>
                    <Text size="sm" c="dimmed">{t('EVENTS.FIELDS_HINT')}</Text>
                    <EventCustomFields
                        hideTitle
                        data={{
                            fields: props.event.config.accreditation.fields || [],
                        }}
                        onUpdate={(fields) => {
                            props.onUpdate({
                                config: {
                                    accreditation: {
                                        fields,
                                    },
                                },
                            });
                        }}
                    />
                </Stack>
            </Card>
            <Card withBorder radius="sm" p="xl">
                <Title order={3} c="violet" mb={4}>
                    {t('EVENTS.CHECKINS_LIST')}
                </Title>
                <Text size="sm" c="dimmed" mb="md">
                    {t('EVENTS.CHECKINS_LIST_HINT')}
                </Text>
                <EventCustomTable
                    fields={props.event.config.accreditation.fields || []}
                    data={props.attendees}
                    onDelete={
                        canDelete
                            ? (attendeeId) => deleteMutation.mutate(attendeeId)
                            : undefined
                    }
                />
            </Card>
        </Stack>
    );
};

export default EventAccreditations;
