import { Card, Flex, Group, Progress, SimpleGrid, Stack, Table, Text, ThemeIcon, Title } from '@mantine/core';
import { BarChart, DonutChart } from '@mantine/charts';
import { ProjectPlanningProject, SAPI } from '@eduinteractive/uvc-api';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    IconAlertCircle,
    IconClockHour4,
    IconFolder,
    IconListCheck,
    IconUserOff,
} from '@tabler/icons-react';
import { useTenant } from '../../../../context/TenantContext';
import AssignedTasksTab from './AssignedTasksTab';

const remainingOpen = (project: Pick<ProjectPlanningProject, 'open' | 'overdue' | 'dueSoon'>) =>
    Math.max(project.open - project.overdue - project.dueSoon, 0);

const ProjectPlanningTab = () => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const navigate = useNavigate();

    const planningQuery = useQuery({
        queryKey: ['projectPlanning', currentTenant?._id],
        queryFn: () =>
            SAPI.PROJECT.TENANT.getProjectPlanning({
                tenantId: currentTenant!._id,
            }),
        enabled: !!currentTenant?._id,
    });

    if (planningQuery.isPending) {
        return null;
    }

    const planning = planningQuery.data;
    if (!planning || planning.projects.length === 0) {
        return (
            <Text size="sm" c="dimmed">
                {t('PROJECTS.PLANNING.EMPTY')}
            </Text>
        );
    }

    const projects = [...planning.projects].sort((a, b) => {
        if (b.overdue !== a.overdue) {
            return b.overdue - a.overdue;
        }
        if (b.dueSoon !== a.dueSoon) {
            return b.dueSoon - a.dueSoon;
        }
        return a.projectTitle.localeCompare(b.projectTitle, 'de');
    });
    const { totals } = planning;
    const remaining = remainingOpen(totals);
    const slices = [
        { name: t('PROJECTS.PLANNING.DONE'), value: totals.done, color: 'teal.6' },
        { name: t('PROJECTS.PLANNING.OVERDUE'), value: totals.overdue, color: 'red.6' },
        { name: t('PROJECTS.PLANNING.DUE_SOON'), value: totals.dueSoon, color: 'yellow.6' },
        { name: t('PROJECTS.PLANNING.REMAINING'), value: remaining, color: 'violet.6' },
    ].filter((slice) => slice.value > 0);
    const series = [
        { name: 'done', color: 'teal.6', label: t('PROJECTS.PLANNING.DONE') },
        { name: 'overdue', color: 'red.6', label: t('PROJECTS.PLANNING.OVERDUE') },
        { name: 'dueSoon', color: 'yellow.6', label: t('PROJECTS.PLANNING.DUE_SOON') },
        { name: 'remaining', color: 'violet.6', label: t('PROJECTS.PLANNING.REMAINING') },
    ];
    const figures = [
        { label: t('PROJECTS.PLANNING.PROJECTS'), value: totals.projects, color: 'violet', icon: IconFolder },
        { label: t('PROJECTS.PLANNING.OPEN'), value: totals.open, color: 'blue', icon: IconListCheck },
        { label: t('PROJECTS.PLANNING.OVERDUE'), value: totals.overdue, color: 'red', icon: IconAlertCircle },
        { label: t('PROJECTS.PLANNING.DUE_SOON'), value: totals.dueSoon, color: 'yellow', icon: IconClockHour4 },
        { label: t('PROJECTS.PLANNING.UNASSIGNED'), value: totals.unassigned, color: 'gray', icon: IconUserOff },
    ];

    return (
        <Stack gap="md">
            <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
                {figures.map((figure) => {
                    const Icon = figure.icon;
                    return (
                        <Card key={figure.label} withBorder padding="md">
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <div>
                                    <Text size="xs" c="dimmed" tt="uppercase">
                                        {figure.label}
                                    </Text>
                                    <Text size="xl" fw={700}>
                                        {figure.value}
                                    </Text>
                                </div>
                                <ThemeIcon variant="light" color={figure.color} size="lg" radius="md">
                                    <Icon size={18} stroke={1.5} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    );
                })}
            </SimpleGrid>
            {totals.tasks === 0 ? (
                <Text size="sm" c="dimmed">
                    {t('PROJECTS.PLANNING.EMPTY_CHARTS')}
                </Text>
            ) : (
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                    <Card withBorder padding="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Stack flex={1} gap="sm">
                            <Title order={6} ta="center">
                                {t('PROJECTS.PLANNING.STATUS_CHART')}
                            </Title>
                            <Flex justify="center" align="center" flex={1}>
                                <DonutChart
                                    data={slices}
                                    withTooltip
                                    withLegend
                                    legendProps={{ verticalAlign: 'bottom', align: 'center' }}
                                    styles={{ legend: { justifyContent: 'center' } }}
                                    tooltipDataSource="segment"
                                    strokeWidth={1}
                                />
                            </Flex>
                        </Stack>
                    </Card>
                    <Card withBorder padding="md" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                        <Stack flex={1} gap="sm">
                            <Title order={6} ta="center">
                                {t('PROJECTS.PLANNING.PROJECT_CHART')}
                            </Title>
                            <Flex justify="center" align="center" flex={1}>
                                <BarChart
                                    h={320}
                                    w="100%"
                                    data={projects.map((project) => ({
                                        project: project.projectTitle,
                                        done: project.done,
                                        overdue: project.overdue,
                                        dueSoon: project.dueSoon,
                                        remaining: remainingOpen(project),
                                    }))}
                                    dataKey="project"
                                    type="stacked"
                                    series={series}
                                    withLegend
                                    legendProps={{ verticalAlign: 'bottom', align: 'center' }}
                                    styles={{ legend: { justifyContent: 'center' } }}
                                    xAxisProps={{
                                        interval: 0,
                                        angle: -30,
                                        textAnchor: 'end',
                                        height: 80,
                                    }}
                                />
                            </Flex>
                        </Stack>
                    </Card>
                </SimpleGrid>
            )}
            <Card withBorder padding="md">
                <Title order={6} mb="sm">
                    {t('PROJECTS.PLANNING.PROJECT_TABLE')}
                </Title>
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('PROJECTS.PLANNING.PROJECT')}</Table.Th>
                        <Table.Th>{t('PROJECTS.PLANNING.OPEN')}</Table.Th>
                        <Table.Th>{t('PROJECTS.PLANNING.DONE')}</Table.Th>
                        <Table.Th>{t('PROJECTS.PLANNING.OVERDUE')}</Table.Th>
                        <Table.Th>{t('PROJECTS.PLANNING.DUE_SOON')}</Table.Th>
                        <Table.Th>{t('PROJECTS.PLANNING.UNASSIGNED')}</Table.Th>
                        <Table.Th>{t('PROJECTS.PLANNING.DONE_SHARE')}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {projects.map((project) => {
                        const share = project.tasks === 0 ? 0 : Math.round((project.done / project.tasks) * 100);
                        return (
                            <Table.Tr
                                key={project.projectId}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/sv/projects/${project.projectId}`)}
                            >
                                <Table.Td>
                                    <Text size="sm">{project.projectTitle}</Text>
                                </Table.Td>
                                <Table.Td>{project.open}</Table.Td>
                                <Table.Td>{project.done}</Table.Td>
                                <Table.Td>
                                    <Text size="sm" c={project.overdue > 0 ? 'red' : undefined}>
                                        {project.overdue}
                                    </Text>
                                </Table.Td>
                                <Table.Td>{project.dueSoon}</Table.Td>
                                <Table.Td>{project.unassigned}</Table.Td>
                                <Table.Td>
                                    <Group gap="xs" wrap="nowrap">
                                        <Progress value={share} color="teal" w={72} />
                                        <Text size="sm">{share}%</Text>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
            </Card>
            <AssignedTasksTab />
        </Stack>
    );
};

export default ProjectPlanningTab;
