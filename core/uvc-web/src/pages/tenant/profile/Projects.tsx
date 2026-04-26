import { useMutation, useQuery } from '@tanstack/react-query';
import { useTenant } from '../../../context/TenantContext';
import { useState } from 'react';
import {
    TenantProject,
    SAPI,
} from '@eduinteractive/uvc-api';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import ProfileObjectModal from '../../../components/features/tenant/profile/ProfileObjectModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import {
    PROFILE_OBJECT_STATUS,
    PROFILE_OBJECT_STATUS_STRINGS,
} from '../../../constants/Enums';
import ProfileObjectEditModal from '../../../components/features/tenant/profile/ProfileObjectEditModal';
import SVHFilter, { SVHFilterObject } from '../../../components/common/SVHFilter';
import { useTranslation } from 'react-i18next';

const Projects = () => {
    const { currentTenant } = useTenant();
    const [currentSelectedProject, setCurrentSelectedProject] =
        useState<TenantProject | null>(null);
    const [currentViewObject, setCurrentViewObject] = useState<TenantProject | null>(
        null
    );
    const [metadataFilter, setMetadataFilter] = useState<SVHFilterObject | null>(
        null
    );
    const { t } = useTranslation();

    const projectQuery = useQuery({
        queryKey: ['project', currentTenant?._id, metadataFilter],
        queryFn: () => SAPI.PROFILE.TENANT.getTenantProjects({
            tenantId: currentTenant!._id,
            params: metadataFilter
        }),
    });

    const createProjectMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.createTenantProject,
        onSuccess: () => {
            projectQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.PROJECTS.SUCCESS.CREATED'));
            setCurrentSelectedProject(null);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateProjectMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateTenantProject,
        onSuccess: () => {
            projectQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.PROFILE.PROJECTS.SUCCESS.UPDATED')
            );
            setCurrentSelectedProject(null);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteProjectMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.deleteTenantProject,
        onSuccess: () => {
            projectQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.PROJECTS.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <>
            <ProfileObjectModal
                title={t('TENANT_PAGES.PROFILE.PROJECTS.MODAL_TITLE')}
                data={currentViewObject}
                visible={!!currentViewObject}
                onClose={() => setCurrentViewObject(null)}
            />
            <ProfileObjectEditModal
                prefix={t('TENANT_PAGES.PROFILE.PROJECTS.MODAL_TITLE')}
                modalVisible={currentSelectedProject !== null}
                values={currentSelectedProject || undefined}
                onClose={() => setCurrentSelectedProject(null)}
                onSubmit={(data) => {
                    if (currentSelectedProject?._id) {
                        updateProjectMutation.mutate({
                            tenantId: currentTenant?._id,
                            projectId: currentSelectedProject._id,
                            body: data,
                        });
                    } else {
                        createProjectMutation.mutate({
                            tenantId: currentTenant?._id,
                            body: data,
                        });
                    }
                }}
            />
            <SVHFilter
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () => setCurrentSelectedProject({
                        tenantId: currentTenant?._id || '',
                        authorId: '',
                        title: '',
                        content: '',
                        status: PROFILE_OBJECT_STATUS.DRAFT,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }),
                    text: t('TENANT_PAGES.PROFILE.PROJECTS.ADD'),
                    permission: 'profile_objects',
                }}
            />
            <SVHMetaGrid
                permissionPrefix="profile_objects"
                data={projectQuery.data || []}
                prefixKey="status"
                prefixFunc={(val) =>
                    PROFILE_OBJECT_STATUS_STRINGS[val as PROFILE_OBJECT_STATUS]
                }
                imageEnabled={true}
                onEdit={(project) =>
                    setCurrentSelectedProject(project as TenantProject)
                }
                onDelete={(projectId) =>
                    deleteProjectMutation.mutate({
                        projectId,
                        tenantId: currentTenant!._id,
                    })
                }
                onOpen={(project) => setCurrentViewObject(project as TenantProject)}
            />
        </>
    );
};

export default Projects;
