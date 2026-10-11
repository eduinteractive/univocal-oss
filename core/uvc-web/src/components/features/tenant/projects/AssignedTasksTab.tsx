import { Badge, Card, Group, Table, Text, Title } from '@mantine/core';
import { SAPI } from '@eduinteractive/uvc-api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../context/TenantContext';
import {
    isCompletedAssignedTask,
    isOverdueAssignedTask,
    sortAssignedTasks,
} from '../../../../utils/assignedTasks';

const AssignedTasksTab = () => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const navigate = useNavigate();

    const assignedTasksQuery = useQuery({
        queryKey: ['assignedTasks', currentTenant?._id],
        queryFn: () =>
            SAPI.PROJECT.TENANT.getAssignedTasks({
                tenantId: currentTenant!._id,
            }),
        enabled: !!currentTenant?._id,
    });

    const tasks = sortAssignedTasks(assignedTasksQuery.data || []);

    if (assignedTasksQuery.isPending) {
        return null;
    }

    if (tasks.length === 0) {
        return (
            <Card withBorder padding="md">
                <Title order={6} mb="sm">
                    {t('PROJECTS.LIST_TABS.ASSIGNED')}
                </Title>
                <Text size="sm" c="dimmed">
                    {t('PROJECTS.ASSIGNED.EMPTY')}
                </Text>
            </Card>
        );
    }

    return (
        <Card withBorder padding="md">
            <Title order={6} mb="sm">
                {t('PROJECTS.LIST_TABS.ASSIGNED')}
            </Title>
        <Table highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{t('PROJECTS.ASSIGNED.TASK')}</Table.Th>
                    <Table.Th>{t('PROJECTS.ASSIGNED.PROJECT')}</Table.Th>
                    <Table.Th>{t('PROJECTS.ASSIGNED.COLUMN')}</Table.Th>
                    <Table.Th>{t('PROJECTS.ASSIGNED.DUE_DATE')}</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {tasks.map((task) => {
                    const overdue = isOverdueAssignedTask(task);
                    const completed = isCompletedAssignedTask(task);
                    return (
                        <Table.Tr
                            key={task._id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/sv/projects/${task.projectId}?task=${task._id}`)}
                        >
                            <Table.Td>
                                <Text size="sm" c={completed ? 'dimmed' : undefined}>
                                    {task.title}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm" c={completed ? 'dimmed' : undefined}>
                                    {task.projectTitle}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm" c="dimmed">
                                    {task.columnTitle}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                {task.dueDate ? (
                                    <Group gap="xs" wrap="nowrap">
                                        <Text size="sm" c={overdue ? 'red' : completed ? 'dimmed' : undefined}>
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </Text>
                                        {overdue && (
                                            <Badge color="red" variant="light">
                                                {t('PROJECTS.ASSIGNED.OVERDUE')}
                                            </Badge>
                                        )}
                                    </Group>
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        {t('PROJECTS.ASSIGNED.NO_DATE')}
                                    </Text>
                                )}
                            </Table.Td>
                        </Table.Tr>
                    );
                })}
            </Table.Tbody>
        </Table>
        </Card>
    );
};

export default AssignedTasksTab;
