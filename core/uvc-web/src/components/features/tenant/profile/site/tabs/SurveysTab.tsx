import { ActionIcon, Button, Text, Tooltip } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { PROFILE_SECTION_TYPE, SurveyExecutionMode } from '@eduinteractive/uvc-api';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useSurveys from '../../../../../../hooks/useSurveys';
import FeaturePicker, { FeatureItem } from '../FeaturePicker';
import { SiteBuilder } from '../useSiteBuilder';

const SurveysTab = ({ builder }: { builder: SiteBuilder }) => {
    const { t } = useTranslation();
    const surveys = useSurveys();

    const items: FeatureItem[] = [...surveys]
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .map((survey) => ({
            id: survey._id,
            title: survey.title,
            meta: t(`SITE.BUILDER.SURVEY_MODE.${survey.options.executionMode}`),
            badge: survey.options.isActive
                ? { label: t('COMMON.ACTIVE'), color: 'green' }
                : { label: t('COMMON.INACTIVE'), color: 'gray' },
            unavailableReason: !survey.options.isActive
                ? t('SITE.BUILDER.SURVEY_INACTIVE_HINT')
                : survey.options.executionMode === SurveyExecutionMode.TAN ||
                    survey.options.executionMode === SurveyExecutionMode.PERSONAL
                  ? t('SITE.BUILDER.SURVEY_RESTRICTED_HINT')
                  : undefined,
        }));

    return (
        <FeaturePicker
            builder={builder}
            type={PROFILE_SECTION_TYPE.SURVEYS}
            items={items}
            description={t('SITE.BUILDER.SURVEYS_DESCRIPTION')}
            emptyText={t('SITE.BUILDER.SURVEYS_EMPTY')}
            toolbar={
                <Button component={Link} to="/sv/surveys">
                    <Text size="sm">{t('TENANT_PAGES.SURVEYS.ADD')}</Text>
                </Button>
            }
            renderActions={(item) => (
                <Tooltip label={t('SITE.BUILDER.OPEN')} withArrow>
                    <ActionIcon variant="subtle" size="sm" component={Link} to={`/sv/surveys/${item.id}`}>
                        <IconExternalLink size={24} />
                    </ActionIcon>
                </Tooltip>
            )}
        />
    );
};

export default SurveysTab;
