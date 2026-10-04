import { Anchor, Container, Group, Stack, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { PublicSite } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SiteHtml from '../../components/features/site/SiteHtml';
import { legalHtmlIsEmpty } from '../../components/features/site/legalHtml';
import { useSite } from '../../context/SiteContext';
import { useSiteMeta } from '../../hooks/useSiteMeta';
import SiteNotFound from './SiteNotFound';

const SiteLegalPage = ({ site, kind }: { site: PublicSite; kind: 'privacy' | 'imprint' }) => {
    const { t } = useTranslation();
    const { basePath } = useSite();
    const notice = kind === 'privacy' ? site.site.legal?.privacy : site.site.legal?.imprint;
    const title = t(kind === 'privacy' ? 'SITE.PUBLIC.PRIVACY' : 'SITE.PUBLIC.IMPRINT');
    const text = notice?.mode !== 'link' && !legalHtmlIsEmpty(notice?.text) ? notice?.text : undefined;

    useSiteMeta({
        title: text ? `${title} · ${site.site.seoTitle || site.tenant.title}` : undefined,
    });

    if (!text) return <SiteNotFound homePath={basePath} />;

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
                    <Title order={1} c="var(--site-primary)" fz={{ base: 32, sm: 40 }} fw={800}>
                        {title}
                    </Title>
                    <SiteHtml html={text} />
                </Stack>
            </Stack>
        </Container>
    );
};

export default SiteLegalPage;
