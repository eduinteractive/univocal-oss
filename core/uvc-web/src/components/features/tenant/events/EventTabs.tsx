import { ActionIcon, Anchor, Badge, Box, Button, Group, Menu, Modal, ScrollArea, Tabs, Text, Title } from "@mantine/core";
import { IconCertificate, IconCheck, IconClipboard, IconDots, IconExternalLink, IconEye, IconFileDescription, IconLink, IconPhoto, IconQrcode, IconRegistered, IconRocket, IconSettings, IconWorldOff } from "@tabler/icons-react";
import { SVHEvent, SVHPublicEvent } from "@eduinteractive/uvc-api";
import { NotificationHandler } from "@eduinteractive/mantine-common";
import { useClipboard } from "@mantine/hooks";
import { PDFDownloadLink } from "@react-pdf/renderer";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import PublicEvent from "../../../../pages/PublicEvent";
import SVHQRPDF from "../../../common/SVHQRPDF";
import EventCertificatePDF from "./EventCertificatePDF";
import { usePublicEventUrl } from "./usePublicEventUrl";
import { useTenant } from "../../../../context/TenantContext";

export const EVENT_TABS = ["general", "program", "registrations", "checkin", "settings"] as const;
export type EventTab = (typeof EVENT_TABS)[number];

interface EventAuthoringHeaderProps {
    event: SVHEvent;
    publishing?: boolean;
    onPublish: (published: boolean) => void;
    spotsRemaining: number | null;
}

export const EventAuthoringHeader = (props: EventAuthoringHeaderProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const clipboard = useClipboard();
    const captureRef = useRef<HTMLDivElement>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const published = props.event.config.public?.published !== false;
    const publicUrl = usePublicEventUrl(props.event._id);
    const dates = `${dayjs(props.event.startDate).format('DD.MM.YYYY HH:mm')}${props.event.endDate ? ` – ${dayjs(props.event.endDate).format('DD.MM.YYYY HH:mm')}` : ''}`;
    const previewEvent: SVHPublicEvent = {
        tenantId: props.event.tenantId,
        title: props.event.title,
        description: props.event.description,
        startDate: props.event.startDate,
        endDate: props.event.endDate,
        place: props.event.place,
        spotsRemaining: props.spotsRemaining,
        config: props.event.config,
    };

    const handleSharePicGeneration = () => {
        if (!captureRef.current) return;
        html2canvas(captureRef.current, {
            width: 1080,
            height: 1080,
            scale: 1,
        }).then((canvas) => {
            const link = document.createElement('a');
            link.download = 'event-sharepic-instagram.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    return (
        <>
            <div
                ref={captureRef}
                style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    width: '1080px',
                    height: '1080px',
                    backgroundColor: '#228be6',
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
                <div
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '30px',
                        borderRadius: '15px',
                        maxWidth: '800px',
                        marginBottom: '20px',
                    }}
                >
                    <h1 style={{ color: '#1A73E8', fontSize: '4rem', fontWeight: 'bold', marginBottom: '20px' }}>
                        {props.event.title}
                    </h1>
                    <p style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>
                        {props.event.description}
                    </p>
                    <p style={{ color: '#555', fontSize: '1.2rem' }}>
                        {dayjs(props.event.startDate).format('DD.MM.YYYY HH:mm')}
                        {props.event.endDate && ` - ${dayjs(props.event.endDate).format('DD.MM.YYYY HH:mm')}`}
                    </p>
                </div>
            </div>
            <Modal
                opened={previewOpen}
                onClose={() => setPreviewOpen(false)}
                fullScreen
                title={t('EVENTS.PREVIEW')}
                styles={{
                    header: { borderBottom: '1px solid lightgrey' },
                    body: { padding: 0 },
                }}
            >
                <PublicEvent previewEvent={previewEvent} previewEventId={props.event._id} />
            </Modal>
            <Group
                justify="space-between"
                gap="md"
                align="flex-start"
                w={{
                    base: 'calc(100% + (var(--mantine-spacing-md) * 2))',
                    sm: 'calc(100% + (var(--mantine-spacing-xl) * 2))',
                }}
                mx={{ base: 'calc(var(--mantine-spacing-md) * -1)', sm: 'calc(var(--mantine-spacing-xl) * -1)' }}
                px={{ base: 'md', sm: 'xl' }}
                pb="md"
                style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            >
                <Box>
                    <Group gap="sm" mb={4}>
                        <Title order={3} c="violet">
                            {props.event.title}
                        </Title>
                        {published ? (
                            <Badge color="green" variant="light" radius="sm">
                                {t('EVENTS.STATUS_LIVE')}
                            </Badge>
                        ) : (
                            <Badge color="gray" variant="light" radius="sm">
                                {t('EVENTS.STATUS_DRAFT')}
                            </Badge>
                        )}
                    </Group>
                    <Text size="sm" c="dimmed">{dates}</Text>
                    <Anchor href={publicUrl} target="_blank" rel="noopener noreferrer" size="sm" c="violet">
                        <Group gap={4}>
                            {publicUrl.replace(/^https?:\/\//, '')}
                            <IconExternalLink size={14} />
                        </Group>
                    </Anchor>
                </Box>
                <Group gap="sm">
                    <Button
                        variant="default"
                        radius="md"
                        leftSection={<IconEye size={16} />}
                        onClick={() => setPreviewOpen(true)}
                    >
                        {t('EVENTS.PREVIEW')}
                    </Button>
                    <Button
                        color={published ? 'gray' : 'violet'}
                        variant={published ? 'light' : 'filled'}
                        radius="md"
                        leftSection={published ? <IconWorldOff size={16} /> : <IconRocket size={16} />}
                        loading={props.publishing}
                        onClick={() => props.onPublish(!published)}
                    >
                        {published ? t('EVENTS.UNPUBLISH') : t('EVENTS.PUBLISH')}
                    </Button>
                    <Menu position="bottom-end">
                        <Menu.Target>
                            <ActionIcon variant="default" radius="md" size="lg" aria-label={t('COMMON.ACTIONS')}>
                                <IconDots size={16} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconLink size={16} />}
                                onClick={() => {
                                    clipboard.copy(publicUrl);
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
                                        link={publicUrl}
                                        generationNotice={t('COMMON.GENERATION_NOTICE')}
                                    />
                                }
                                fileName="QR-Code.pdf"
                            >
                                <Menu.Item component="div" leftSection={<IconQrcode size={16} />} closeMenuOnClick={false}>
                                    {t('EVENTS.PRINT_QR')}
                                </Menu.Item>
                            </PDFDownloadLink>
                            <Menu.Item
                                leftSection={<IconPhoto size={16} />}
                                onClick={handleSharePicGeneration}
                            >
                                {t('EVENTS.META.GENERATE_SHAREPIC')}
                            </Menu.Item>
                            {currentTenant && (
                                <PDFDownloadLink
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                    document={
                                        <EventCertificatePDF
                                            event={props.event}
                                            tenant={currentTenant}
                                            labels={{
                                                title: t('EVENTS.CERTIFICATE.TITLE'),
                                                description: t('EVENTS.CERTIFICATE.DESCRIPTION', {
                                                    title: props.event.title,
                                                    date: dayjs(props.event.startDate).format('DD.MM.YYYY'),
                                                }),
                                                generatedAt: t('EVENTS.CERTIFICATE.GENERATED_AT', {
                                                    date: dayjs(new Date()).format('DD.MM.YYYY'),
                                                }),
                                            }}
                                        />
                                    }
                                    fileName={t('EVENTS.CERTIFICATE.DOWNLOAD_FILENAME')}
                                >
                                    <Menu.Item component="div" leftSection={<IconCertificate size={16} />} closeMenuOnClick={false}>
                                        {t('EVENTS.META.GENERATE_CERTIFICATE')}
                                    </Menu.Item>
                                </PDFDownloadLink>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>
        </>
    );
};

interface EventTabsProps {
    value: EventTab;
    onChange: (tab: EventTab) => void;
    modules: {
        program: boolean;
        registration: boolean;
        checkin: boolean;
    };
    generalTab: React.ReactNode;
    programTab: React.ReactNode;
    registrationTab: React.ReactNode;
    checkinTab: React.ReactNode;
    settingsTab: React.ReactNode;
}

const EventTabs = (props: EventTabsProps) => {
    const { t } = useTranslation();
    return (
        <Tabs value={props.value} onChange={(value) => {
            if (value && (EVENT_TABS as readonly string[]).includes(value)) {
                props.onChange(value as EventTab);
            }
        }} color="violet">
            <ScrollArea type="never" offsetScrollbars={false}>
                <Tabs.List style={{ flexWrap: 'nowrap' }}>
                    <Tabs.Tab value="general" leftSection={<IconFileDescription size={16} />}>
                        {t('EVENTS.GENERAL')}
                    </Tabs.Tab>
                    {props.modules.program && (
                        <Tabs.Tab value="program" leftSection={<IconClipboard size={16} />}>
                            {t('EVENTS.TOC')}
                        </Tabs.Tab>
                    )}
                    {props.modules.registration && (
                        <Tabs.Tab value="registrations" leftSection={<IconRegistered size={16} />}>
                            {t('EVENTS.REGISTRATIONS')}
                        </Tabs.Tab>
                    )}
                    {props.modules.checkin && (
                        <Tabs.Tab value="checkin" leftSection={<IconCheck size={16} />}>
                            {t('EVENTS.ACCREDITATIONS')}
                        </Tabs.Tab>
                    )}
                    <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
                        {t('EVENTS.SETTINGS')}
                    </Tabs.Tab>
                </Tabs.List>
            </ScrollArea>
            <Tabs.Panel value="general" pt="xl" pb={80}>
                {props.generalTab}
            </Tabs.Panel>
            {props.modules.program && (
                <Tabs.Panel value="program" pt="xl" pb={80}>
                    {props.programTab}
                </Tabs.Panel>
            )}
            {props.modules.registration && (
                <Tabs.Panel value="registrations" pt="xl" pb={80}>
                    {props.registrationTab}
                </Tabs.Panel>
            )}
            {props.modules.checkin && (
                <Tabs.Panel value="checkin" pt="xl" pb={80}>
                    {props.checkinTab}
                </Tabs.Panel>
            )}
            <Tabs.Panel value="settings" pt="xl" pb={80}>
                {props.settingsTab}
            </Tabs.Panel>
        </Tabs>
    );
};

export default EventTabs;
