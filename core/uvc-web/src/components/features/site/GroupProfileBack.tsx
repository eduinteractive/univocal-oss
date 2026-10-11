import { ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { SAPI } from '@eduinteractive/uvc-api';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { buildSiteUrl } from '../../../utils/SiteHost';

const GroupProfileBack = ({ tenantId, preview }: { tenantId?: string; preview?: boolean }) => {
    const { t } = useTranslation();
    const profileQuery = useQuery({
        queryKey: ['public-profile', tenantId],
        queryFn: () => SAPI.PROFILE.PUBLIC.getPublicProfile(tenantId!),
        enabled: !!tenantId,
        retry: false,
    });
    const subdomain = profileQuery.data?.profile.site?.published
        ? profileQuery.data.profile.site.subdomain
        : undefined;
    if (!subdomain) return null;

    return (
        <ActionIcon
            component="a"
            href={buildSiteUrl(subdomain)}
            variant="default"
            radius="xl"
            size="lg"
            aria-label={t('PAGES.EVENT.PUBLIC.PROFILE')}
            pos="absolute"
            top={16}
            left={16}
            style={{ zIndex: 5 }}
            onClick={preview ? (click) => click.preventDefault() : undefined}
        >
            <IconArrowLeft size={18} stroke={1.5} />
        </ActionIcon>
    );
};

export default GroupProfileBack;
