import { ActionIcon, Flex, Group, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import { IconEdit } from '@tabler/icons-react';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import { useAuth } from '../../../../context/AuthContext';
import { Project } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface ProjectMetaProps {
    data?: Project;
    onEdit: () => void;
}

const ProjectMeta = (props: ProjectMetaProps) => {
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const { t } = useTranslation();

    return (
        <>
            <Flex direction="column">
                <Group justify="space-between" align="center">
                    <Flex direction="column">
                        <Title order={3} c="blue">
                            {props.data?.title}
                        </Title>
                    </Flex>
                    {(checkPermission(currentTenant!, 'project:edit') ||
                        props.data?.authorId === authData?._id) && (
                        <ActionIcon variant="subtle">
                            <IconEdit size={24} onClick={props.onEdit} />
                        </ActionIcon>
                    )}
                </Group>
                <Text size="sm" mb="sm">
                    {props.data?.description}
                </Text>
            </Flex>
            <Flex align="end" justify="end" direction="column" mt="sm">
                <Text size="sm" c="dimmed">
                    {t('COMMON.CREATED_AT')}: 
                    {dayjs(props.data?.createdAt).format('DD.MM.YYYY HH:mm')}
                </Text>
                <Text size="sm" c="dimmed">
                    {t('COMMON.UPDATED_AT')}: 
                    {dayjs(props.data?.updatedAt).format('DD.MM.YYYY HH:mm')}
                </Text>
            </Flex>
        </>
    );
};

export default ProjectMeta;
