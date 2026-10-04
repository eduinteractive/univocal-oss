import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PROFILE_SECTION_TYPE,
    ProfileSite,
    ProfileSiteSection,
    SAPI,
} from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';
import { useTenant } from '../../../../../context/TenantContext';
import { checkPermission } from '../../../../../utils/Permission';

export const MAX_FEATURED = 12;

export const siteQueryKey = (tenantId?: string) => ['profile-site', tenantId];
export const sitePreviewQueryKey = (tenantId?: string) => ['profile-site-preview', tenantId];
export const pagesQueryKey = (tenantId?: string) => ['profile-pages', tenantId];
export const supportRequestsQueryKey = (tenantId?: string) => ['profile-support-requests', tenantId];
export const supportResponsesQueryKey = (tenantId?: string) => ['profile-support-responses', tenantId];

export const useSupportRequests = (tenantId?: string) =>
    useQuery({
        queryKey: supportRequestsQueryKey(tenantId),
        queryFn: () => SAPI.PROFILE.TENANT.getSupportRequests(tenantId),
        enabled: !!tenantId,
    });

const useSiteBuilder = () => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const tenantId = currentTenant?._id;
    const queryClient = useQueryClient();
    const canEdit = !!currentTenant && checkPermission(currentTenant, 'profile:update');

    const siteQuery = useQuery({
        queryKey: siteQueryKey(tenantId),
        queryFn: () => SAPI.PROFILE.TENANT.getSite(tenantId),
        enabled: !!tenantId,
    });

    const previewQuery = useQuery({
        queryKey: sitePreviewQueryKey(tenantId),
        queryFn: () => SAPI.PROFILE.TENANT.getSitePreview(tenantId),
        enabled: !!tenantId,
    });

    const applySite = (site: ProfileSite) => {
        queryClient.setQueryData(siteQueryKey(tenantId), site);
        queryClient.invalidateQueries({ queryKey: sitePreviewQueryKey(tenantId) });
    };

    const refreshPreview = () => queryClient.invalidateQueries({ queryKey: sitePreviewQueryKey(tenantId) });

    const updateSiteMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateSite,
        onMutate: ({ body }) => {
            const previous = queryClient.getQueryData<ProfileSite>(siteQueryKey(tenantId));
            if (previous) {
                queryClient.setQueryData<ProfileSite>(siteQueryKey(tenantId), { ...previous, ...body });
            }
            return { previous };
        },
        onSuccess: applySite,
        onError: (error, _variables, context) => {
            if (context?.previous) queryClient.setQueryData(siteQueryKey(tenantId), context.previous);
            NotificationHandler.showAxiosError(error as never);
        },
    });

    const sections = siteQuery.data?.sections ?? [];

    const getSection = (type: PROFILE_SECTION_TYPE): ProfileSiteSection =>
        sections.find((section) => section.type === type) ?? { type, enabled: true, featuredIds: [] };

    const saveSections = (next: ProfileSiteSection[], successMessage?: string) =>
        updateSiteMutation.mutate(
            { tenantId, body: { sections: next } },
            {
                onSuccess: () => {
                    if (successMessage) NotificationHandler.showSuccess(successMessage);
                },
            }
        );

    const updateSection = (type: PROFILE_SECTION_TYPE, patch: Partial<ProfileSiteSection>) => {
        const exists = sections.some((section) => section.type === type);
        const next = exists
            ? sections.map((section) => (section.type === type ? { ...section, ...patch } : section))
            : [...sections, { ...getSection(type), ...patch }];
        saveSections(next);
    };

    const toggleFeatured = (type: PROFILE_SECTION_TYPE, id: string) => {
        const section = getSection(type);
        const isFeatured = section.featuredIds.includes(id);
        if (!isFeatured && section.featuredIds.length >= MAX_FEATURED) {
            NotificationHandler.showWarning(t('SITE.BUILDER.FEATURE_LIMIT', { max: MAX_FEATURED }));
            return;
        }
        updateSection(type, {
            featuredIds: isFeatured
                ? section.featuredIds.filter((featuredId) => featuredId !== id)
                : [...section.featuredIds, id],
        });
    };

    return {
        tenantId,
        canEdit,
        site: siteQuery.data,
        siteQuery,
        preview: previewQuery.data,
        previewQuery,
        applySite,
        refreshPreview,
        updateSiteMutation,
        getSection,
        saveSections,
        updateSection,
        toggleFeatured,
    };
};

export type SiteBuilder = ReturnType<typeof useSiteBuilder>;

export default useSiteBuilder;
