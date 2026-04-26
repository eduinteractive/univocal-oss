import { ActionIcon, Button, Flex, Group, Text, Title } from '@mantine/core';
import html2canvas from 'html2canvas';
import { SVHEvent } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { IconEdit } from '@tabler/icons-react';
import { useRef } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EventCertificatePDF from './EventCertificatePDF';
import { useTenant } from '../../../../context/TenantContext';
import { useTranslation } from 'react-i18next';

interface EventMetaProps {
    data?: SVHEvent;
    onEdit: () => void;
}

const EventMeta = (props: EventMetaProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const captureRef = useRef<HTMLDivElement>(null);

    const handleSharePicGeneration = () => {
        if (captureRef.current) {
            html2canvas(captureRef.current, {
                width: 1080,
                height: 1080,
                scale: 1, // Optional: Verdoppelt die Auflösung des Bildes
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = 'event-sharepic-instagram.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };

    return (
        <>
            <Flex direction="column">
                <Group justify="space-between" align="center">
                    <Flex direction="column">
                        <Title order={6} c="dimmed">
                            {dayjs(props.data?.startDate).format(
                                'DD.MM.YYYY HH:mm'
                            )}
                            {props.data?.endDate &&
                                ` - ${dayjs(props.data?.endDate).format(
                                    'DD.MM.YYYY HH:mm'
                                )}`}
                        </Title>
                        <Title order={3} c="blue">
                            {props.data?.title}
                        </Title>
                    </Flex>
                    <ActionIcon variant="subtle">
                        <IconEdit size={24} onClick={props.onEdit} />
                    </ActionIcon>
                </Group>
                <Text size="sm" mb="sm">
                    {props.data?.description}
                </Text>
            </Flex>
            <div
                ref={captureRef}
                style={{
                    position: 'absolute',
                    top: '-9999px', // Platzierung außerhalb des sichtbaren Bereichs
                    left: '-9999px',
                    width: '1080px',
                    height: '1080px',
                    backgroundColor: '#228be6',
                    //backgroundImage: 'url("https://dummyimage.com/1080?blur=3")', // Hintergrundbild kann dynamisch oder statisch sein
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '40px',
                    boxSizing: 'border-box',
                }}
            >
                {/* Großer Titel */}
                <div
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Halbtransparentes Overlay
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '800px',
                        marginBottom: '20px',
                    }}
                >
                    <h1
                        style={{
                            color: '#1A73E8', // Auffällige Farbe für den Titel
                            fontSize: '4rem', // Sehr große Schrift
                            fontWeight: 'bold',
                            marginBottom: '20px',
                        }}
                    >
                        {props.data?.title}
                    </h1>
                    {/* Event Beschreibung */}
                    <p
                        style={{
                            color: '#333',
                            fontSize: '1.5rem',
                            marginBottom: '20px',
                        }}
                    >
                        {props.data?.description}
                    </p>

                    {/* Event Datum */}
                    <p
                        style={{
                            color: '#555',
                            fontSize: '1.2rem',
                        }}
                    >
                        {dayjs(props.data?.startDate).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                        {props.data?.endDate &&
                            ` - ${dayjs(props.data?.endDate).format(
                                'DD.MM.YYYY HH:mm'
                            )}`}
                    </p>
                </div>
            </div>
            <Flex direction="row" gap="sm" mt="xs">
                <Button
                    onClick={handleSharePicGeneration}
                    variant="default"
                    size="sm"
                >
                    {t('EVENTS.META.GENERATE_SHAREPIC')}
                </Button>
                <PDFDownloadLink
                    document={
                        <EventCertificatePDF
                            event={props.data as SVHEvent}
                            tenant={currentTenant!}
                        />
                    }
                    fileName={t('EVENTS.CERTIFICATE.DOWNLOAD_FILENAME')}
                >
                    <Button variant="default">{t('EVENTS.META.GENERATE_CERTIFICATE')}</Button>
                </PDFDownloadLink>
            </Flex>
            <Flex align="end" justify="end" direction="column" mt="sm">
                <Text size="sm" c="dimmed">
                    {t('EVENTS.META.CREATED_AT')}: 
                    {dayjs(props.data?.createdAt).format('DD.MM.YYYY HH:mm')}
                </Text>
                <Text size="sm" c="dimmed">
                    {t('EVENTS.META.UPDATED_AT')}: 
                    {dayjs(props.data?.updatedAt).format('DD.MM.YYYY HH:mm')}
                </Text>
            </Flex>
        </>
    );
};

export default EventMeta;
