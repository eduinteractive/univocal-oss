import { useDroppable } from '@dnd-kit/core';
import { ActionIcon, Card, Flex, Group, TextInput, Title } from '@mantine/core';
import { IconCheck, IconEdit, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { ProjectTaskColumn as IProjectTaskColumn } from '@eduinteractive/uvc-api';
import { EDIDeleteDialog } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface ProjectTaskColumnProps {
    children: React.ReactNode;
    data: IProjectTaskColumn;
    hasPermission: boolean;
    onDelete: () => void;
    onUpdate: (column: IProjectTaskColumn) => void;
}

const ProjectTaskColumn = (props: ProjectTaskColumnProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState(props.data.title);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { setNodeRef } = useDroppable({
        id: props.data._id,
    });

    return (
        <Flex
            direction="column"
            w={300}
            align="stretch"
            p="xs"
            bg="gray.2"
            style={{ borderRadius: 10 }}
            h="100%"
            mih="80vh"
            ref={setNodeRef}
        >
            <EDIDeleteDialog
                title={t('COMMON.DELETE_TITLE')}
                description={t('PROJECTS.TASKS.COLUMN.DELETE_DESCRIPTION')}
                visible={isDeleting}
                onSubmit={() => {
                    props.onDelete();
                    setIsDeleting(false);
                }}
                onClose={() => setIsDeleting(false)}
                type="CONFIRM"
            />
            <Card shadow="xs" mb="sm" p="xs" h={50}>
                <Group
                    justify="space-between"
                    w="100%"
                    wrap="nowrap"
                    align="center"
                    h="100%"
                >
                    {!isEditing ? (
                        <Title w="100%" order={6}>
                            {props.data.title}
                        </Title>
                    ) : (
                        <TextInput
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    )}
                    {!isEditing && props.hasPermission && (
                        <Group gap="xs" wrap='nowrap'>
                            <ActionIcon
                                variant="subtle"
                                onClick={() => setIsEditing(true)}
                            >
                                <IconEdit size={24} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="gray" onClick={() => setIsDeleting(true)}>
                                <IconTrash size={24} />
                            </ActionIcon>
                        </Group>
                    )}
                    {isEditing && (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => {
                                setIsEditing(false);
                                props.onUpdate({ ...props.data, title });
                            }}
                        >
                            <IconCheck size={24} />
                        </ActionIcon>
                    )}
                </Group>
            </Card>
            {props.children}
        </Flex>
    );
};

export default ProjectTaskColumn;
