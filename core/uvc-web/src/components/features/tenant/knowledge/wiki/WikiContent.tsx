import {
    ActionIcon,
    Box,
    Center,
    Flex,
    Group,
    Paper,
    Text,
    Title,
} from '@mantine/core';
import { WikiSection } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import SVHTextEditor from '../../../../common/SVHTextEditor';
import {
    IconCheck,
    IconDownload,
    IconEdit,
    IconTrash,
} from '@tabler/icons-react';
import SVHMultiDropzone from '../../../../common/SVHMultiDropzone';
import { useTenant } from '../../../../../context/TenantContext';
import { checkPermission } from '../../../../../utils/Permission';
import { EDIDeleteDialog } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface WikiContentSubmit {
    title: string;
    content: string;
    materials: { title: string; link: string; mimetype: string }[];
    newUploads: File[];
}

interface WikiContentProps {
    data?: WikiSection;
    onDelete: (sectionId: string) => void;
    onUpdate: (body: WikiContentSubmit) => void;
    onMaterialDownload: (link: string) => void;
}

const WikiContent = (props: WikiContentProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();

    const [deletionModal, setDeletionModal] = useState(false);
    const [content, setContent] = useState(props.data?.content || '');
    const [materials, setMaterials] = useState(props.data?.materials || []);
    const [newUploads, setNewUploads] = useState<File[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setContent(props.data?.content || '');
        setMaterials(props.data?.materials || []);
    }, [props.data]);

    const handleMaterialDelete = (link: string) => {
        setMaterials(materials.filter((material) => material.link !== link));
    };

    // Auto Save
    useEffect(() => {
        if (isEditing) {
            const timeout = setTimeout(() => {
                props.onUpdate({
                    title: props.data!.title,
                    materials,
                    content,
                    newUploads: []
                });
            }, 5000);

            return () => clearTimeout(timeout);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, isEditing]);

    if (props.data) {
        return (
            <Flex direction="column" w="100%" align="start">
                <Group
                    justify="space-between"
                    w="100%"
                    p="md"
                    align="center"
                    style={{ borderBottom: '1px solid #e1e1e1' }}
                >
                    <Title order={5}>{props.data?.title}</Title>
                    <Group>
                        <EDIDeleteDialog
                            title={t('KNOWLEDGE.WIKI.CONTENT.DELETE_TITLE')}
                            description={t('KNOWLEDGE.WIKI.CONTENT.DELETE_DESCRIPTION')}
                            visible={deletionModal}
                            onClose={() => setDeletionModal(false)}
                            onSubmit={() => {
                                props.onDelete(props.data!._id);
                                setDeletionModal(false);
                            }}
                        />
                        {checkPermission(currentTenant!, 'knowledge:edit') && (
                            <>
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() => {
                                        if (isEditing) {
                                            props.onUpdate({
                                                title: props.data!.title,
                                                materials,
                                                content,
                                                newUploads,
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
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => setDeletionModal(true)}
                                >
                                    <IconTrash size={24} />
                                </ActionIcon>
                            </>
                        )}
                    </Group>
                </Group>
                <Box p="md" pt="xs" w="100%">
                    {isEditing ? (
                        <SVHTextEditor
                            text={content}
                            onChange={(e) => setContent(e)}
                        />
                    ) : content === '' ? (
                        <Text size="sm" c="dimmed">
                            {t('KNOWLEDGE.WIKI.CONTENT.NO_CONTENT')}
                        </Text>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </Box>
                {(isEditing || materials.length > 0) && (
                    <Box p="md" w="100%">
                        <Text c="dimmed" size="sm" mb="xs">
                            {t('EVENTS.MATERIALS')}
                        </Text>
                        {materials.map((material) => (
                            <Paper
                                withBorder
                                p="xs"
                                key={material.link}
                                style={{ borderRadius: 0 }}
                            >
                                <Group justify="space-between" wrap="nowrap">
                                    <Text>{material.title}</Text>
                                    <Group gap="xs" wrap="nowrap">
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={() =>
                                                props.onMaterialDownload(
                                                    material.link
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
        );
    } else {
        return (
            <Center w="100%" mb="20%">
                <Text size="lg">{t('KNOWLEDGE.WIKI.CONTENT.PICK_CHAPTER')}</Text>
            </Center>
        );
    }
};

export default WikiContent;
