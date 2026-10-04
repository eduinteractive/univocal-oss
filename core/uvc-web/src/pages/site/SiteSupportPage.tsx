import { Anchor, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PublicSite, SAPI } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import SVHLoader from '../../components/common/SVHLoader';
import { SupportActions } from '../../components/features/site/cards/SiteSupportCard';
import { truncate } from '../../components/features/site/siteText';
import { useSite } from '../../context/SiteContext';
import { useSiteMeta } from '../../hooks/useSiteMeta';
import SiteNotFound from './SiteNotFound';

const SiteSupportPage = ({ site }: { site: PublicSite }) => {
    const { t } = useTranslation();
    const { requestId } = useParams();
    const { subdomain, basePath } = useSite();

    const requestQuery = useQuery({
        queryKey: ['public-site-support', subdomain, requestId],
        queryFn: () => SAPI.PROFILE.PUBLIC.getPublicSupportRequest({ subdomain: subdomain!, requestId: requestId! }),
        enabled: !!subdomain && !!requestId,
        retry: false,
    });

    const request = requestQuery.data?.request;
    useSiteMeta({
        title: request ? `${request.title} · ${site.site.seoTitle || site.tenant.title}` : undefined,
        description: request ? truncate(request.description, 160) : undefined,
    });

    if (requestQuery.isLoading) return <SVHLoader />;
    if (!request) return <SiteNotFound homePath={basePath} title={t('SITE.PUBLIC.SUPPORT_NOT_FOUND')} />;

    return (
        <Container size="md" py={{ base: 40, sm: 64 }}>
            <Stack gap="xl">
                <Anchor component={Link} to={basePath || '/'} c="var(--site-primary)" size="sm">
                    <Group gap={4}>
                        <IconArrowLeft size={14} />
                        {t('SITE.PUBLIC.BACK_HOME')}
                    </Group>
                </Anchor>
                <Stack gap="lg" maw={720} style={{ borderTop: '2px solid var(--site-primary)', paddingTop: 28 }}>
                    <Text size="xs" tt="uppercase" fw={700} c="var(--site-primary)" lts={0.6}>
                        {t('SITE.SECTIONS.SUPPORT')}
                    </Text>
                    <Title order={1} c="var(--site-primary)" fz={{ base: 30, sm: 40 }} fw={800} style={{ letterSpacing: '-0.02em' }}>
                        {request.title}
                    </Title>
                    {request.publishDate && (
                        <Text size="sm" c="dimmed">
                            {t('SITE.PUBLIC.SUPPORT_SINCE', {
                                date: dayjs(request.publishDate).format('DD.MM.YYYY'),
                            })}
                        </Text>
                    )}
                    <Text style={{ whiteSpace: 'pre-line' }} lh={1.65}>
                        {request.description}
                    </Text>
                    <SupportActions request={request} />
                </Stack>
            </Stack>
        </Container>
    );
};

export default SiteSupportPage;
