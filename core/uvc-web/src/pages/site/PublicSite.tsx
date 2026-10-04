import { useQuery } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { Route, Routes, useParams } from 'react-router-dom';
import SVHLoader from '../../components/common/SVHLoader';
import SiteHome from '../../components/features/site/SiteHome';
import SiteLayout from '../../components/features/site/SiteLayout';
import { htmlToText, truncate } from '../../components/features/site/siteText';
import { SiteProvider } from '../../context/SiteContext';
import { useSiteMeta } from '../../hooks/useSiteMeta';
import { profileImageUrl } from '../../utils/SiteHost';
import SiteInfoPage from './SiteInfoPage';
import SiteLegalPage from './SiteLegalPage';
import SiteNotFound from './SiteNotFound';
import SiteSupportPage from './SiteSupportPage';

interface PublicSiteProps {
    /** Set when served from `{subdomain}.{base domain}`; otherwise read from `/g/:subdomain`. */
    hostSubdomain?: string;
}

const PublicSite = ({ hostSubdomain }: PublicSiteProps) => {
    const params = useParams();
    const subdomain = (hostSubdomain ?? params.subdomain ?? '').toLowerCase();
    const basePath = hostSubdomain ? '' : `/g/${subdomain}`;

    const siteQuery = useQuery({
        queryKey: ['public-site', subdomain],
        queryFn: () => SAPI.PROFILE.PUBLIC.getPublicSite(subdomain),
        enabled: !!subdomain,
        retry: false,
        staleTime: 60_000,
    });

    const data = siteQuery.data;
    useSiteMeta({
        title: data ? data.site.seoTitle || data.tenant.title : undefined,
        description: data
            ? data.site.seoDescription || truncate(htmlToText(data.profile.description || data.tenant.description), 160)
            : undefined,
        image: data ? profileImageUrl(data.site.logoImage || data.profile.avatarImage) : undefined,
    });

    if (siteQuery.isLoading) return <SVHLoader />;
    if (!data) return <SiteNotFound />;

    return (
        <SiteProvider subdomain={subdomain} basePath={basePath} preview={false}>
            <SiteLayout data={data}>
                <Routes>
                    <Route index element={<SiteHome data={data} />} />
                    <Route path="p/:slug" element={<SiteInfoPage site={data} />} />
                    <Route path="datenschutz" element={<SiteLegalPage site={data} kind="privacy" />} />
                    <Route path="impressum" element={<SiteLegalPage site={data} kind="imprint" />} />
                    <Route path="support/:requestId" element={<SiteSupportPage site={data} />} />
                    <Route path="*" element={<SiteNotFound homePath={basePath} />} />
                </Routes>
            </SiteLayout>
        </SiteProvider>
    );
};

export default PublicSite;
