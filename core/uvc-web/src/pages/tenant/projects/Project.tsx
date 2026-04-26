import { useMutation, useQuery } from '@tanstack/react-query';
import {
    SAPI,
} from '@eduinteractive/uvc-api';
import { useState } from 'react';
import { useTenant } from '../../../context/TenantContext';
import { useParams } from 'react-router-dom';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHLoader from '../../../components/common/SVHLoader';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import ProjectModal from '../../../components/features/tenant/projects/ProjectModal';
import ProjectTabs from '../../../components/features/tenant/projects/ProjectTabs';
import ProjectMeta from '../../../components/features/tenant/projects/ProjectMeta';
import ProjectTasks from '../../../components/features/tenant/projects/ProjectTasks';
import { useTranslation } from 'react-i18next';

const Project = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { currentTenant } = useTenant();
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const { t } = useTranslation();

    const projectQuery = useQuery({
        queryKey: ['project', projectId],
        queryFn: () =>
            SAPI.PROJECT.TENANT.getProject({ tenantId: currentTenant!._id, projectId: projectId! }),
    });

    const updateProjectMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.updateProject,
        onSuccess: (_data, variables) => {
            if (!variables.body.columns) {
                NotificationHandler.showSuccess(
                    t('TENANT_PAGES.PROJECTS.SUCCESS.UPDATED')
                );
            }
            projectQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createTaskMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.createTask,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROJECTS.TASKS.SUCCESS.CREATED')
            );
            projectQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateTaskMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.updateTask,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROJECTS.TASKS.SUCCESS.UPDATED')
            );
            projectQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteTaskMutation = useMutation({
        mutationFn: SAPI.PROJECT.TENANT.deleteTask,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROJECTS.TASKS.SUCCESS.DELETED')
            );
            projectQuery.refetch();
        },
        onError: NotificationHandler.showAxiosError,
    });

    if (projectQuery.isLoading) {
        return <SVHLoader />;
    }

    return (
        <SVHPageWrapper p={0}>
            <ProjectModal
                visible={projectModalVisible}
                values={projectQuery.data || undefined}
                onClose={() => {
                    setProjectModalVisible(false);
                }}
                onSubmit={(body) => {
                    if (projectQuery.data) {
                        updateProjectMutation.mutate({
                            body,
                            projectId: projectQuery.data?._id,
                            tenantId: currentTenant!._id,
                        });
                    }
                    setProjectModalVisible(false);
                }}
            />
            <ProjectTabs
                title={projectQuery.data?.title}
                generalTab={
                    <ProjectMeta
                        data={projectQuery.data}
                        onEdit={() => setProjectModalVisible(true)}
                    />
                }
                tasksTab={
                    projectQuery.data && (
                        <ProjectTasks
                            data={projectQuery.data}
                            onProjectUpdate={(data) => {
                                updateProjectMutation.mutate({
                                    body: data,
                                    projectId: projectQuery.data!._id,
                                    tenantId: currentTenant!._id,
                                });
                            }}
                            onTaskCreate={(colId, body) => {
                                createTaskMutation.mutate({
                                    body: {
                                        ...body,
                                        colId,
                                    },
                                    projectId: projectQuery.data!._id,
                                    tenantId: currentTenant!._id,
                                });
                            }}
                            onTaskUpdate={(taskId, body) => {
                                updateTaskMutation.mutate({
                                    body,
                                    projectId: projectQuery.data!._id,
                                    taskId,
                                    tenantId: currentTenant!._id,
                                });
                            }}
                            onTaskDelete={(taskId) => {
                                deleteTaskMutation.mutate({
                                    projectId: projectQuery.data!._id,
                                    taskId,
                                    tenantId: currentTenant!._id,
                                });
                            }}
                        />
                    )
                }
            />
        </SVHPageWrapper>
    );
};

export default Project;
