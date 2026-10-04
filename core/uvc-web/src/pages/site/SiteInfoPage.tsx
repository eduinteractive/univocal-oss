import { Anchor, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { PublicSite, SAPI } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import SVHLoader from '../../components/common/SVHLoader';
import SiteHtml from '../../components/features/site/SiteHtml';
import { htmlToText, truncate } from '../../components/features/site/siteText';
import { useSite } from '../../context/SiteContext';
import { useSiteMeta } from '../../hooks/useSiteMeta';
import SiteNotFound from './SiteNotFound';

const SiteInfoPage = ({ site }: { site: PublicSite }) => {
    const { t } = useTranslation();
    const { slug } = useParams();
    const { subdomain, basePath } = useSite();

    const pageQuery = useQuery({
        queryKey: ['public-site-page', subdomain, slug],
        queryFn: () => SAPI.PROFILE.PUBLIC.getPublicSitePage({ subdomain: subdomain!, slug: slug! }),
        enabled: !!subdomain && !!slug,
        retry: false,
    });

    const page = pageQuery.data?.page;
    useSiteMeta({
        title: page ? `${page.title} · ${site.site.seoTitle || site.tenant.title}` : undefined,
        description: page ? truncate(htmlToText(page.content), 160) : undefined,
    });

    if (pageQuery.isLoading) return <SVHLoader />;
    if (!page) return <SiteNotFound homePath={basePath} title={t('SITE.PUBLIC.PAGE_NOT_FOUND')} />;

    return (
        <Container size="md" py={{ base: 40, sm: 64 }}>
            <Stack gap="xl">
                <Anchor component={Link} to={basePath || '/'} c="var(--site-primary)" size="sm">
                    <Group gap={4}>
                        <IconArrowLeft size={14} />
                        {t('SITE.PUBLIC.BACK_HOME')}
                    </Group>
                </Anchor>
                <Stack gap="lg" maw={720}>
                    <Text size="sm" c="dimmed">
                        {t('SITE.PUBLIC.UPDATED_AT', {
                            date: dayjs(page.updatedAt ?? page.publishDate).format('DD.MM.YYYY'),
                        })}
                    </Text>
                    <Title order={1} c="var(--site-primary)" fz={{ base: 32, sm: 44 }} fw={800} style={{ letterSpacing: '-0.02em' }}>
                        {page.title}
                    </Title>
                    <SiteHtml html={page.content} />
                </Stack>
            </Stack>
        </Container>
    );
};

export default SiteInfoPage;
