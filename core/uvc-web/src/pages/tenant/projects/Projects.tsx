import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../../context/TenantContext';
import { SAPI, Project } from '@eduinteractive/uvc-api';
import SVHFilter, {
    SVHFilterObject,
} from '../../../components/common/SVHFilter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { Group, Tabs, Text, Title } from '@mantine/core';
import { IconChartBar, IconFolder } from '@tabler/icons-react';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import ProjectModal from '../../../components/features/tenant/projects/ProjectModal';
import ProjectPlanningTab from '../../../components/features/tenant/projects/ProjectPlanningTab';
import SVHPrivacyDisclaimer from '../../../components/common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

const Projects = () => {
    const { currentTenant } = useTenant();
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { t } = useTranslation();
    const tab = searchParams.get('tab') === 'projects' ? 'projects' : 'planning';

    const projectsQuery = useQuery({
        queryKey: ['projects', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.PROJECT.TENANT.getProjects({
                tenantId: currentTenant!._id,
                params: metadataFilter,
            }),
    });

    const createProjectMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.createProject,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROJECTS.SUCCESS.CREATED')
            );
            projectsQuery.refetch();
            setProjectModalVisible(false);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateProjectMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.updateProject,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROJECTS.SUCCESS.UPDATED')
            );
            projectsQuery.refetch();
            setProjectModalVisible(false);
            setCurrentProject(null);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteProjectMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.deleteProject,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROJECTS.SUCCESS.DELETED')
            );
            projectsQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p="md">
            <Group gap="xs">
                <Title order={3} c="violet">
                    {t('TENANT_PAGES.PROJECTS.TITLE')}
                </Title>
                <SVHPrivacyDisclaimer />
            </Group>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.PROJECTS.DESCRIPTION')}
            </Text>
            <Tabs
                value={tab}
                onChange={(value) => {
                    setSearchParams({ tab: value === 'projects' ? 'projects' : 'planning' });
                }}
            >
                <Tabs.List>
                    <Tabs.Tab value="planning" leftSection={<IconChartBar />}>
                        {t('PROJECTS.LIST_TABS.PLANNING')}
                    </Tabs.Tab>
                    <Tabs.Tab value="projects" leftSection={<IconFolder />}>
                        {t('PROJECTS.LIST_TABS.PROJECTS')}
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="planning" pt="md">
                    <ProjectPlanningTab />
                </Tabs.Panel>
                <Tabs.Panel value="projects" pt="md">
                    <SVHFilter
                        value={metadataFilter || undefined}
                        onFilter={(filter) => setMetadataFilter(filter)}
                        onAdd={{
                            func: () => setProjectModalVisible(true),
                            text: t('TENANT_PAGES.PROJECTS.ADD'),
                            permission: 'project',
                        }}
                    />
                    <ProjectModal
                        visible={projectModalVisible}
                        values={currentProject || undefined}
                        onClose={() => {
                            setProjectModalVisible(false);
                            setCurrentProject(null);
                        }}
                        onSubmit={(body) => {
                            if (currentProject) {
                                updateProjectMutation.mutate({
                                    body,
                                    projectId: currentProject._id,
                                    tenantId: currentTenant!._id,
                                });
                            } else {
                                createProjectMutation.mutate({
                                    tenantId: currentTenant!._id,
                                    body,
                                });
                            }
                        }}
                    />
                    <SVHMetaGrid
                        data={projectsQuery.data || []}
                        permissionPrefix="project"
                        onEdit={(project) => {
                            setCurrentProject(project as Project);
                            setProjectModalVisible(true);
                        }}
                        onDelete={(projectId) => {
                            deleteProjectMutation.mutate({
                                tenantId: currentTenant!._id,
                                projectId,
                            });
                        }}
                    />
                </Tabs.Panel>
            </Tabs>
        </SVHPageWrapper>
    );
};

export default Projects;
