import { Button, Card, Stack, Text, Title } from '@mantine/core';
import { IconArrowRight, IconFileText } from '@tabler/icons-react';
import { PublicSitePage } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSite } from '../../../../context/SiteContext';
import SiteCompactCard from './SiteCompactCard';
import { htmlToText, truncate } from '../siteText';
import classes from '../site.module.css';

const pageDate = (page: PublicSitePage) => dayjs(page.publishDate ?? page.updatedAt).format('DD.MM.YYYY');

export const SiteInfoFeatured = ({ page }: { page: PublicSitePage }) => {
    const { t } = useTranslation();
    const { basePath, preview } = useSite();

    return (
        <Card radius="lg" p="var(--site-card-padding)" bg="var(--site-soft)" h="100%">
            <Stack gap="md" h="100%">
                <Text size="sm" c="dimmed">
                    {pageDate(page)}
                </Text>
                <Title order={3} fz={18} fw={650} lh={1.35} c="dark.8" className={classes.itemTitle}>
                    {page.title}
                </Title>
                <Text c="dark.6">{truncate(htmlToText(page.content), 420)}</Text>
                <Button
                    mt="auto"
                    w="fit-content"
                    color="var(--site-primary)"
                    radius="xl"
                    rightSection={<IconArrowRight size={16} />}
                    component={Link}
                    to={`${basePath}/p/${page.slug}`}
                    disabled={preview}
                >
                    {t('SITE.PUBLIC.READ_MORE')}
                </Button>
            </Stack>
        </Card>
    );
};

export const SiteInfoCompact = ({ page, active }: { page: PublicSitePage; active: boolean }) => (
    <SiteCompactCard icon={<IconFileText size={22} />} title={page.title} meta={pageDate(page)} active={active} />
);
