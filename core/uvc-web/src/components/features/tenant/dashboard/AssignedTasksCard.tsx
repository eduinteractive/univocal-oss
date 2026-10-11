import { Badge, Card, Group, NavLink, Text, Title } from '@mantine/core';
import { SAPI } from '@eduinteractive/uvc-api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../context/TenantContext';
import { isOverdueAssignedTask, urgentAssignedTasks } from '../../../../utils/assignedTasks';

const AssignedTasksCard = () => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();

    const assignedTasksQuery = useQuery({
        queryKey: ['assignedTasks', currentTenant?._id],
        queryFn: () =>
            SAPI.PROJECT.TENANT.getAssignedTasks({
                tenantId: currentTenant!._id,
            }),
        enabled: !!currentTenant?._id,
    });

    const tasks = urgentAssignedTasks(assignedTasksQuery.data || []);

    return (
        <Card withBorder shadow="sm" mt="md">
            <Card.Section p="md" pt="xs">
                <Title order={6} c="dimmed">
                    {t('DASHBOARD.ASSIGNED_TASKS_TITLE')}
                </Title>
                {!assignedTasksQuery.isPending && tasks.length === 0 && (
                    <Text size="sm" c="dimmed" mt="sm">
                        {t('DASHBOARD.ASSIGNED_TASKS_EMPTY')}
                    </Text>
                )}
                {tasks.map((task) => {
                    const overdue = isOverdueAssignedTask(task);
                    return (
                        <Group key={task._id} justify="space-between" mt="sm" wrap="nowrap">
                            <div>
                                <Text size="sm" fw="bold">
                                    {task.title}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {task.projectTitle}
                                </Text>
                            </div>
                            {task.dueDate && (
                                <Group gap="xs" wrap="nowrap">
                                    <Text size="sm" c={overdue ? 'red' : 'dimmed'}>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </Text>
                                    {overdue && (
                                        <Badge color="red" variant="light">
                                            {t('PROJECTS.ASSIGNED.OVERDUE')}
                                        </Badge>
                                    )}
                                </Group>
                            )}
                        </Group>
                    );
                })}
                <Group justify="right" mt="md">
                    <NavLink
                        variant="outline"
                        w="max-content"
                        c="violet"
                        component={Link}
                        to="/sv/projects?tab=planning"
                        label={t('DASHBOARD.SHOW_MORE')}
                        rightSection={<IconChevronRight height={25} />}
                        style={{ paddingRight: 0 }}
                    />
                </Group>
            </Card.Section>
        </Card>
    );
};

export default AssignedTasksCard;
