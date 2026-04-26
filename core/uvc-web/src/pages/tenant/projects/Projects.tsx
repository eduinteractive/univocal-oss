import { useState } from 'react';
import { useTenant } from '../../../context/TenantContext';
import { SAPI, Project } from '@eduinteractive/uvc-api';
import SVHFilter, {
    SVHFilterObject,
} from '../../../components/common/SVHFilter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { Group, Text, Title } from '@mantine/core';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import ProjectModal from '../../../components/features/tenant/projects/ProjectModal';
import SVHPrivacyDisclaimer from '../../../components/common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

const Projects = () => {
    const { currentTenant } = useTenant();
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);
    const { t } = useTranslation();

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
                <Title order={3} c="blue">
                    {t('TENANT_PAGES.PROJECTS.TITLE')}
                </Title>
                <SVHPrivacyDisclaimer />
            </Group>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.PROJECTS.DESCRIPTION')}
            </Text>
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
        </SVHPageWrapper>
    );
};

export default Projects;
