import { useMemo, useState } from 'react';
import {
    ProjectConnector,
    ProjectSubtask,
    ProjectTask,
    WikiToc,
} from '@eduinteractive/uvc-api';
import useTenantMembers from '../../../../hooks/useTenantMembers';
import useWikis from '../../../../hooks/useWikis';
import useBudgets from '../../../../hooks/useBudgets';
import useSurveys from '../../../../hooks/useSurveys';
import useEvents from '../../../../hooks/useEvents';
import { useTenant } from '../../../../context/TenantContext';
import { EDIDeleteDialog, EDIModal } from '@eduinteractive/mantine-common';
import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Checkbox,
    Group,
    Paper,
    Table,
    Text,
} from '@mantine/core';
import CalendarMaterials from '../calendar/CalendarMaterials';
import { getValidAvatarIdentifier } from '../../../../utils/BannedIdentifiers';
import { ProjectConnectorStrings } from '../../../../constants/Enums';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { checkPermission } from '../../../../utils/Permission';
import { useAuth } from '../../../../context/AuthContext';
import ProjectSubtaskViewModal from './ProjectSubtaskViewModal';
import { useTranslation } from 'react-i18next';

interface ProjectTaskViewModalProps {
    data: ProjectTask;
    hasPermission: boolean;
    visible: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onClose: () => void;
}

const ProjectTaskViewModal = (props: ProjectTaskViewModalProps) => {
    const { t } = useTranslation();
    const tenantMembers = useTenantMembers();
    const datas = {
        wikis: useWikis(),
        budgets: useBudgets(),
        surveys: useSurveys(),
        events: useEvents(),
    };
    const { currentTenant } = useTenant();
    const { authData } = useAuth();

    const [currentSubtask, setCurrentSubtask] = useState<ProjectSubtask | null>(
        null
    );
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    const owner = useMemo(() => {
        const tenantMember = tenantMembers.find(
            (member) => member._id === props.data.owner
        );
        if (tenantMember) {
            return tenantMember.firstName + ' ' + tenantMember.lastName;
        }
        return '';
    }, [props.data, tenantMembers]);

    return (
        <EDIModal
            title={props.data.title}
            type="ALERT"
            visible={props.visible}
            onClose={props.onClose}
            mih={400}
            size="xl"
        >
            <EDIDeleteDialog
                title={t('PROJECTS.TASKS.VIEW.DELETE_TITLE')}
                description={t('PROJECTS.TASKS.VIEW.DELETE_DESCRIPTION')}
                visible={deleteDialogVisible}
                onClose={() => setDeleteDialogVisible(false)}
                onSubmit={() => {
                    setDeleteDialogVisible(false);
                    props.onDelete!();
                }}
                type="CONFIRM"
            />
            {currentSubtask && (
                <ProjectSubtaskViewModal
                    data={currentSubtask}
                    visible={true}
                    onClose={() => setCurrentSubtask(null)}
                />
            )}
            <Table mb="md">
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_TITLE')}</Table.Th>
                    <Table.Td>{props.data.title}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_DESCRIPTION')}</Table.Th>
                    <Table.Td>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: props.data.description || '',
                            }}
                        />
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_DUE_DATE')}</Table.Th>
                    <Table.Td>
                        {props.data.dueDate &&
                            new Date(props.data.dueDate).toLocaleDateString()}
                    </Table.Td>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.TASKS.VIEW.TABLE_OWNER')}</Table.Th>
                    <Table.Td>{owner}</Table.Td>
                </Table.Tr>
            </Table>
            {props.data.materials.length > 0 && (
                <CalendarMaterials
                    materials={props.data.materials}
                    onDownload={(link) => {
                        window.open(
                            `${
                                import.meta.env.VITE_KUBERNETES_HOST
                            }/api/calendar/tenant/${currentTenant?._id}/event/${props
                                .data?._id}/download/${encodeURIComponent(
                                link
                            )}`,
                            '_blank'
                        );
                    }}
                />
            )}
            {props.data.subtasks && props.data.subtasks.length > 0 && (
                <Box mt="sm">
                    <Text c="dimmed" size="sm" mb={5}>
                        {t('PROJECTS.TASKS.VIEW.SUBTASKS')}
                    </Text>
                    {props.data.subtasks?.map((subtask, index) => (
                        <Paper
                            withBorder
                            p="xs"
                            style={{ borderRadius: 0 }}
                            key={subtask._id + index}
                        >
                            <Group justify="space-between">
                                <Group gap="xs" wrap="nowrap">
                                    <Checkbox
                                        checked={subtask.done}
                                        disabled={true}
                                    />
                                    <Text size="sm">{subtask.title}</Text>
                                </Group>
                                <Group gap="xs" wrap="nowrap">
                                    {subtask.dueDate && (
                                        <Badge
                                            color="red"
                                            variant="light"
                                            size="sm"
                                            radius="xs"
                                        >
                                            {new Date(
                                                subtask.dueDate
                                            ).toLocaleDateString()}
                                        </Badge>
                                    )}
                                    {subtask.owner &&
                                        tenantMembers.find(
                                            (m) => m._id === subtask.owner
                                        ) && (
                                            <Avatar size={24} color="blue">
                                                {getValidAvatarIdentifier(
                                                    tenantMembers.find(
                                                        (m) =>
                                                            m._id ===
                                                            subtask.owner
                                                    )?.firstName,
                                                    tenantMembers.find(
                                                        (m) =>
                                                            m._id ===
                                                            subtask.owner
                                                    )?.lastName
                                                )}
                                            </Avatar>
                                        )}
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        onClick={() =>
                                            setCurrentSubtask(subtask)
                                        }
                                    >
                                        <IconEye size={24} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </Box>
            )}
            {props.data.connectors && props.data.connectors.length > 0 && (
                <Box mt="sm">
                    <Text c="dimmed" size="sm" mb={5}>
                        {t('PROJECTS.TASKS.VIEW.CONNECTORS')}
                    </Text>
                    {props.data.connectors.map((connector, index) => (
                        <Paper
                            withBorder
                            p="xs"
                            key={connector.target + index}
                            style={{ borderRadius: 0 }}
                        >
                            <Group justify="space-between" wrap="nowrap">
                                <Text size="sm">
                                    {ProjectConnectorStrings[
                                        connector.origin as keyof typeof ProjectConnectorStrings
                                    ] + ': '}
                                    {connector.origin ===
                                        ProjectConnector.BUDGET &&
                                        connector.target &&
                                        datas.budgets.find(
                                            (b) => b._id === connector.target
                                        )?.title}
                                    {connector.origin ===
                                        ProjectConnector.WIKI &&
                                        connector.target &&
                                        datas.wikis
                                            .find(
                                                (w) =>
                                                    w._id ===
                                                    connector.target.split(
                                                        ':'
                                                    )[0]
                                            )
                                            ?.tableOfContents.find(
                                                (t: WikiToc) =>
                                                    t.sectionId ===
                                                    connector.target.split(
                                                        ':'
                                                    )[1]
                                            )?.title}
                                    {connector.origin ===
                                        ProjectConnector.EVENT &&
                                        connector.target &&
                                        datas.events.find(
                                            (e) => e._id === connector.target
                                        )?.title}
                                    {connector.origin ===
                                        ProjectConnector.SURVEY &&
                                        connector.target &&
                                        datas.surveys.find(
                                            (s) => s._id === connector.target
                                        )?.title}
                                </Text>
                                <Group gap="xs" wrap="nowrap">
                                    <ActionIcon
                                        variant="subtle"
                                        color="blue"
                                        size="sm"
                                        onClick={() => {
                                            switch (connector.origin) {
                                                case ProjectConnector.BUDGET:
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/sv/budgets/${
                                                            connector.target
                                                        }`,
                                                        '_blank'
                                                    );
                                                    break;
                                                case ProjectConnector.WIKI:
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/sv/knowledge/wiki/${
                                                            connector.target.split(
                                                                ':'
                                                            )[0]
                                                        }${
                                                            connector.target.split(
                                                                ':'
                                                            )[1]
                                                                ? `?sectionId=${
                                                                      connector.target.split(
                                                                          ':'
                                                                      )[1]
                                                                  }`
                                                                : ''
                                                        }`,
                                                        '_blank'
                                                    );
                                                    break;
                                                case ProjectConnector.EVENT:
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/sv/events/${
                                                            connector.target
                                                        }`,
                                                        '_blank'
                                                    );
                                                    break;
                                                case ProjectConnector.SURVEY:
                                                    window.open(
                                                        `${
                                                            import.meta.env
                                                                .VITE_KUBERNETES_HOST
                                                        }/sv/surveys/${
                                                            connector.target
                                                        }`,
                                                        '_blank'
                                                    );
                                                    break;
                                            }
                                        }}
                                    >
                                        <IconEye size={24} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </Box>
            )}
            {(checkPermission(currentTenant!, 'project:edit') ||
                props.hasPermission ||
                props.data.owner === authData?._id) && (
                <Box mt="sm">
                    <Text c="dimmed" size="sm" mb={5}>
                        {t('PROJECTS.TASKS.VIEW.FUNCTIONS')}
                    </Text>
                    <Group gap="xs">
                        {props.onEdit && (
                            <Button variant="default" onClick={props.onEdit}>
                                <IconEdit size={24} />
                                {t('PROJECTS.TASKS.VIEW.EDIT')}
                            </Button>
                        )}
                        {props.onDelete &&
                            checkPermission(currentTenant!, 'project:edit') && (
                                <Button
                                    variant="default"
                                    onClick={() => setDeleteDialogVisible(true)}
                                >
                                    <IconTrash size={24} />
                                    {t('PROJECTS.TASKS.VIEW.DELETE')}
                                </Button>
                            )}
                    </Group>
                </Box>
            )}
        </EDIModal>
    );
};

export default ProjectTaskViewModal;
