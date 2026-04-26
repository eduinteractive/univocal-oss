import { Flex } from '@mantine/core';
import ProfileDescription from '../../components/features/tenant/profile/ProfileDescription';
import ProfileMeta from '../../components/features/tenant/profile/ProfileMeta';
import { useTenant } from '../../context/TenantContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    SAPI,
} from '@eduinteractive/uvc-api';
import Projects from './profile/Projects';
import News from './profile/News';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

const Profile = () => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();

    const profileQuery = useQuery({
        queryKey: ['profile', currentTenant?._id],
        queryFn: () => SAPI.PROFILE.TENANT.getProfile(currentTenant?._id),
    });

    const profileUpdateMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateProfile,
        onSuccess: () => {
            profileQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const profileBackgroundUpdateMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateProfileBackground,
        onSuccess: () => {
            profileQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.PROFILE.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <>
            <Flex direction="column" gap="sm">
                <ProfileMeta
                    query={profileQuery}
                    profile={profileQuery.data?.profile}
                    descriptionTab={
                        <ProfileDescription
                            profile={profileQuery.data?.profile}
                            onUpdate={(description) => {
                                profileUpdateMutation.mutate({
                                    tenantId: currentTenant?._id,
                                    body: { description, avatarImage: profileQuery.data?.profile.avatarImage },
                                });
                            }}
                        />
                    }
                    projectTab={<Projects />}
                    newsTab={<News />}
                    onUpdate={(data) => {
                        profileUpdateMutation.mutate({
                            tenantId: currentTenant?._id,
                            body: data,
                        });
                    }}
                    onBackgroundUpdate={(data) => {
                        profileBackgroundUpdateMutation.mutate({
                            tenantId: currentTenant?._id,
                            body: {
                                backgroundImage: data.backgroundImage || '',
                            },
                        });
                    }}
                />
            </Flex>
        </>
    );
};

export default Profile;
