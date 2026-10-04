import { Anchor, Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconHeartHandshake, IconMessageQuestion, IconUserPlus } from '@tabler/icons-react';
import { ProfileSupportRequest, SUPPORT_REQUEST_STATUS, SUPPORT_RESPONSE_KIND } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSite } from '../../../../context/SiteContext';
import SiteCompactCard from './SiteCompactCard';
import SupportResponseModal from '../SupportResponseModal';
import { truncate } from '../siteText';
import classes from '../site.module.css';

export type SupportRequestRef = Pick<ProfileSupportRequest, '_id' | 'title' | 'status'>;

interface SupportActionsProps {
    request: SupportRequestRef;
}

export const SupportActions = ({ request }: SupportActionsProps) => {
    const { t } = useTranslation();
    const { preview } = useSite();
    const [kind, setKind] = useState<SUPPORT_RESPONSE_KIND | undefined>();

    if (request.status === SUPPORT_REQUEST_STATUS.CLOSED) {
        return (
            <Badge color="gray" variant="light" size="lg">
                {t('SITE.PUBLIC.SUPPORT_CLOSED')}
            </Badge>
        );
    }

    return (
        <>
            <SupportResponseModal
                request={request}
                kind={kind ?? SUPPORT_RESPONSE_KIND.OFFER}
                opened={kind !== undefined}
                onClose={() => setKind(undefined)}
            />
            <Group gap="sm">
                <Button
                    color="var(--site-primary)"
                    radius="xl"
                    leftSection={<IconUserPlus size={16} />}
                    disabled={preview}
                    onClick={() => setKind(SUPPORT_RESPONSE_KIND.OFFER)}
                >
                    {t('SITE.PUBLIC.SUPPORT_OFFER')}
                </Button>
                <Button
                    color="var(--site-primary)"
                    variant="outline"
                    radius="xl"
                    leftSection={<IconMessageQuestion size={16} />}
                    disabled={preview}
                    onClick={() => setKind(SUPPORT_RESPONSE_KIND.QUESTION)}
                >
                    {t('SITE.PUBLIC.SUPPORT_QUESTION')}
                </Button>
            </Group>
        </>
    );
};

export const SiteSupportFeatured = ({ request }: { request: ProfileSupportRequest }) => {
    const { t } = useTranslation();
    const { basePath } = useSite();

    return (
        <Card radius="lg" p="var(--site-card-padding)" bg="var(--site-soft)" h="100%">
            <Stack gap="md" h="100%">
                {request.publishDate && (
                    <Text size="sm" c="dimmed">
                        {t('SITE.PUBLIC.SUPPORT_SINCE', { date: dayjs(request.publishDate).format('DD.MM.YYYY') })}
                    </Text>
                )}
                <Title order={3} fz={18} fw={650} lh={1.35} c="dark.8" className={classes.itemTitle}>
                    {request.title}
                </Title>
                <Text c="dark.6" style={{ whiteSpace: 'pre-line' }}>
                    {truncate(request.description, 500)}
                </Text>
                {request.description.length > 500 && (
                    <Anchor component={Link} to={`${basePath}/support/${request._id}`} c="var(--site-primary)" size="sm" fw={600}>
                        {t('SITE.PUBLIC.READ_MORE')}
                    </Anchor>
                )}
                <Group mt="auto">
                    <SupportActions request={request} />
                </Group>
            </Stack>
        </Card>
    );
};

export const SiteSupportCompact = ({ request, active }: { request: ProfileSupportRequest; active: boolean }) => (
    <SiteCompactCard
        icon={<IconHeartHandshake size={22} />}
        title={request.title}
        meta={request.publishDate ? dayjs(request.publishDate).format('DD.MM.YYYY') : undefined}
        active={active}
    />
);
