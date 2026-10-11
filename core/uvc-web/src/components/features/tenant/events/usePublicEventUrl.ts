import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTenant } from '../../../../context/TenantContext';
import { buildPublicEventUrl } from '../../../../utils/SiteHost';
import { siteQueryKey } from '../profile/site/useSiteBuilder';

export const usePublicEventUrl = (eventId: string) => {
    const { currentTenant } = useTenant();
    const tenantId = currentTenant?._id;
    const siteQuery = useQuery({
        queryKey: siteQueryKey(tenantId),
        queryFn: () => SAPI.PROFILE.TENANT.getSite(tenantId),
        enabled: !!tenantId,
    });

    return buildPublicEventUrl(eventId, siteQuery.data);
};
