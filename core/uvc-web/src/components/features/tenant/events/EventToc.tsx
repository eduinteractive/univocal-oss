import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Divider,
    Flex,
    Group,
    Paper,
    Switch,
    Text,
    Title,
} from '@mantine/core';
import { SVHEvent } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useClipboard } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import SVHTextEditor from '../../../common/SVHTextEditor';
import {
    IconCheck,
    IconDownload,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import SVHMultiDropzone from '../../../common/SVHMultiDropzone';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SVHQRPDF from '../../../common/SVHQRPDF';
import { useTranslation } from 'react-i18next';

interface EventTocSubmitData {
    config: {
        toc: {
            enabled?: boolean;
            content?: string;
            materials?: {
                title: string;
                link: string;
                mimetype: string;
            }[];
            newUploads?: File[];
        };
    };
}

interface EventTocProps {
    event: SVHEvent;
    onUpdate: (data: EventTocSubmitData) => void;
}

const EventToc = (props: EventTocProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [content, setContent] = useState(
        props.event.config.toc.content || ''
    );
    const [materials, setMaterials] = useState(
        props.event.config.toc.materials || []
    );
    const [newUploads, setNewUploads] = useState<File[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setContent(props.event.config.toc.content || '');
        setMaterials(props.event.config.toc.materials || []);
    }, [props.event]);

    const clipboard = useClipboard();

    const programLink = useMemo(
        () =>
            `${import.meta.env.VITE_KUBERNETES_HOST}/event-program/${props.event
                ?._id}`,
        [props.event]
    );

    const programQRCode = useMemo(
        () => <QRCode id="eventQR" value={programLink} size={100} />,
        [programLink]
    );

    const handleMaterialDelete = (link: string) => {
        setMaterials(materials.filter((material) => material.link !== link));
    };

    return (
        <Flex direction="column" gap="xs">
            <Group align="center" gap="xl" justify="center">
                <Flex justify="center" w={150}>
                    <Switch
                        onLabel={t('COMMON.ACTIVE')}
                        offLabel={t('COMMON.INACTIVE')}
                        size="lg"
                        checked={props.event.config.toc.enabled}
                        onChange={(e) => {
                            props.onUpdate({
                                config: {
                                    toc: {
                                        enabled: e.currentTarget.checked,
                                    },
                                },
                            });
                        }}
                    />
                </Flex>
                <Box style={{ flex: 1 }}>
                    <Text>{t('EVENTS.PROGRAM_ENABLE_TITLE')}</Text>
                    <Text size="xs" c="dimmed">
                        {t('EVENTS.PROGRAM_ENABLE_DESCRIPTION')}
                    </Text>
                </Box>
                {props.event.config.toc.enabled && (
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
                                    {t('EVENTS.PROGRAM_INFO')}
                                </Title>
                                <Flex gap="xl" mt="md" justify="space-between">
                                    <Flex direction="column" gap="sm">
                                        <Button
                                            variant="default"
                                            onClick={() => {
                                                clipboard.copy(programLink);
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
                                                    link={programLink}
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
                                        {programQRCode}
                                        <Anchor
                                            fw={600}
                                            target="_blank"
                                            ta="center"
                                            size="xs"
                                            href={programLink}
                                        >
                                            {t('EVENTS.PROGRAM_LINK')}
                                        </Anchor>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Group>
                )}
            </Group>
            <Divider my="md" />
            {props.event.config.toc.enabled && (
                <Flex direction="column">
                    <Group w="100%" align="center">
                        <Title order={6} c="dimmed">
                            {t('EVENTS.PROGRAM')}
                        </Title>
                        <Group>
                            {checkPermission(currentTenant!, 'event:edit') && (
                                <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            props.onUpdate({
                                                config: {
                                                    toc: {
                                                        content,
                                                        materials,
                                                        newUploads,
                                                    },
                                                },
                                            });
                                        }
                                        setIsEditing(!isEditing);
                                    }}
                                >
                                    {isEditing ? (
                                        <IconCheck size={24} />
                                    ) : (
                                        <IconEdit size={24} />
                                    )}
                                </ActionIcon>
                            )}
                        </Group>
                    </Group>
                    <Box w="100%" pt={isEditing ? 'xs' : 0}>
                        {isEditing ? (
                            <SVHTextEditor
                                text={content}
                                onChange={(e) => setContent(e)}
                            />
                        ) : content === '' ? (
                            <Text size="sm" c="dimmed">
                                {t('EVENTS.NO_CONTENT')}
                            </Text>
                        ) : (
                            <div
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        )}
                    </Box>
                    <Divider my="md" />
                    {(isEditing || materials.length > 0) && (
                        <Box w="100%">
                            <Title order={6} c="dimmed" mb="xs">
                                {t('EVENTS.MATERIALS')}
                            </Title>
                            {materials.map((material) => (
                                <Paper
                                    withBorder
                                    p="xs"
                                    key={material.link}
                                    style={{ borderRadius: 0 }}
                                >
                                    <Group
                                        justify="space-between"
                                        wrap="nowrap"
                                    >
                                        <Text>{material.title}</Text>
                                        <Group gap="xs" wrap="nowrap">
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={() =>
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/api/event/private/tenant/${currentTenant?._id}/event/${
                                                            props.event._id
                                                        }/download/${encodeURIComponent(
                                                            material.link
                                                        )}`,
                                                        '_blank'
                                                    )
                                                }
                                            >
                                                <IconDownload size={24} />
                                            </ActionIcon>
                                            {isEditing && (
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    onClick={() =>
                                                        handleMaterialDelete(
                                                            material.link
                                                        )
                                                    }
                                                >
                                                    <IconTrash size={24} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                            {isEditing ? (
                                <SVHMultiDropzone
                                    value={[]}
                                    onSelected={setNewUploads}
                                    onRemove={() => setNewUploads([])}
                                />
                            ) : null}
                        </Box>
                    )}
                </Flex>
            )}
        </Flex>
    );
};

export default EventToc;
