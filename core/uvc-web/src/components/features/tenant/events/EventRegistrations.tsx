import {
    Anchor,
    Box,
    Button,
    Divider,
    Flex,
    Group,
    Switch,
    Text,
    Title,
} from '@mantine/core';
import { SVHEvent, SVHEventRegistration } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useClipboard } from '@mantine/hooks';
import { useMemo } from 'react';
import QRCode from 'react-qr-code';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EventCustomFields from './EventCustomFields';
import EventCustomTable from './EventCustomTable';
import SVHQRPDF from '../../../common/SVHQRPDF';
import { useTranslation } from 'react-i18next';

interface EventRegistrationsSubmitData {
    config: {
        registration: {
            enabled?: boolean;
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
    const clipboard = useClipboard();

    const checkInLink = useMemo(
        () =>
            `${import.meta.env.VITE_KUBERNETES_HOST}/event-registration/${props
                .event?._id}`,
        [props.event]
    );

    const checkInQRCode = useMemo(
        () => <QRCode id="eventQR" value={checkInLink} size={100} />,
        [checkInLink]
    );

    return (
        <Flex direction="column" gap="xs">
            <Group align="center" gap="xl" justify="center">
                <Flex justify="center" w={150}>
                    <Switch
                        onLabel={t('COMMON.ACTIVE')}
                        offLabel={t('COMMON.INACTIVE')}
                        size="lg"
                        checked={props.event.config.registration.enabled}
                        onChange={(e) => {
                            props.onUpdate({
                                config: {
                                    registration: {
                                        enabled: e.currentTarget.checked,
                                    },
                                },
                            });
                        }}
                    />
                </Flex>
                <Box style={{ flex: 1 }}>
                    <Text>{t('EVENTS.REGISTRATION_ENABLE_TITLE')}</Text>
                    <Text size="xs" c="dimmed">
                        {t('EVENTS.REGISTRATION_ENABLE_DESCRIPTION')}
                    </Text>
                </Box>
                {props.event.config.registration.enabled && (
                    <Group
                        align="flex-start"
                        gap="sm"
                        p="md"
                        bg="gray.0"
                        style={{
                            border: 'calc(0.125rem*var(--mantine-scale)) solid var(--mantine-color-gray-3)',
                        }}
                        mt="md"
                        w={400}
                    >
                        <Flex direction="column" gap="sm" w="100%">
                            <Flex direction="column">
                                <Title order={6} c="dimmed">
                                    {t('EVENTS.REGISTRATION_INFO')}
                                </Title>
                                <Flex gap="xl" mt="md" justify="space-between">
                                    <Flex direction="column" gap="sm">
                                        <Button
                                            variant="default"
                                            onClick={() => {
                                                clipboard.copy(checkInLink);
                                                NotificationHandler.showInfo(
                                                    t('COMMON.COPY_LINK_SUCCESS')
                                                );
                                            }}
                                        >
                                            {t('COMMON.COPY_LINK')}
                                        </Button>
                                        <PDFDownloadLink
                                            document={
                                                <SVHQRPDF
                                                    title={props.event.title}
                                                    link={checkInLink}
                                                    generationNotice={t('COMMON.GENERATION_NOTICE')}
                                                />
                                            }
                                            fileName="QR-Code.pdf"
                                        >
                                            <Button variant="default">
                                                {t('EVENTS.PROGRAM_PDF')}
                                            </Button>
                                        </PDFDownloadLink>
                                    </Flex>
                                    <Flex
                                        direction="column"
                                        gap="sm"
                                        align="center"
                                    >
                                        {checkInQRCode}
                                        <Anchor
                                            fw={600}
                                            target="_blank"
                                            ta="center"
                                            size="xs"
                                            href={checkInLink}
                                        >
                                            {t('EVENTS.REGISTRATION_LINK')}
                                        </Anchor>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Group>
                )}
            </Group>
            <Divider my="md" />
            {props.event.config.registration.enabled && (
                <>
                    <EventCustomFields
                        data={{
                            fields:
                                props.event.config.registration.fields || [],
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
                    <Divider my="md" />
                    <EventCustomTable
                        fields={props.event.config.registration.fields || []}
                        data={props.registrations}
                    />
                </>
            )}
        </Flex>
    );
};

export default EventRegistrations;
