import { ActionIcon, Button, Text, Tooltip } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { PROFILE_SECTION_TYPE } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useEvents from '../../../../../../hooks/useEvents';
import FeaturePicker, { FeatureItem } from '../FeaturePicker';
import { SiteBuilder } from '../useSiteBuilder';

const EventsTab = ({ builder }: { builder: SiteBuilder }) => {
    const { t } = useTranslation();
    const events = useEvents();

    const items: FeatureItem[] = [...events]
        .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())
        .map((event) => {
            const isPast = dayjs(event.endDate ?? event.startDate).isBefore(dayjs());
            return {
                id: event._id,
                title: event.title,
                meta: dayjs(event.startDate).format('DD.MM.YYYY HH:mm [Uhr]'),
                badge: isPast
                    ? { label: t('SITE.BUILDER.EVENT_PAST'), color: 'gray' }
                    : { label: t('SITE.BUILDER.EVENT_UPCOMING'), color: 'green' },
            };
        });

    return (
        <FeaturePicker
            builder={builder}
            type={PROFILE_SECTION_TYPE.EVENTS}
            items={items}
            description={t('SITE.BUILDER.EVENTS_DESCRIPTION')}
            emptyText={t('SITE.BUILDER.EVENTS_EMPTY')}
            toolbar={
                <Button component={Link} to="/sv/events">
                    <Text size="sm">{t('TENANT_PAGES.EVENTS.ADD')}</Text>
                </Button>
            }
            renderActions={(item) => (
                <Tooltip label={t('SITE.BUILDER.OPEN')} withArrow>
                    <ActionIcon variant="subtle" size="sm" component={Link} to={`/sv/events/${item.id}`}>
                        <IconExternalLink size={24} />
                    </ActionIcon>
                </Tooltip>
            )}
        />
    );
};

export default EventsTab;
