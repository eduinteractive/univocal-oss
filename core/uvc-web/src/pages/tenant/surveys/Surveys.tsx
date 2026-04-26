import { Group, Text, Title } from '@mantine/core';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    SAPI,
    SurveyMeta,
} from '@eduinteractive/uvc-api';
import { useTenant } from '../../../context/TenantContext';
import { useState } from 'react';
import SurveyModal from '../../../components/features/tenant/surveys/SurveyModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import SVHFilter, { SVHFilterObject } from '../../../components/common/SVHFilter';
import SVHPrivacyDisclaimer from '../../../components/common/SVHPrivacyDisclaimer';
import { useTranslation } from 'react-i18next';

const Surveys = () => {
    const { currentTenant } = useTenant();
    const [surveyModalVisible, setSurveyModalVisible] = useState(false);
    const [currentSurvey, setCurrentSurvey] = useState<SurveyMeta | null>(null);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);
    const { t } = useTranslation();

    const surveysQuery = useQuery({
        queryKey: ['surveys', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.SURVEY.TENANT.getSurveys({
                tenantId: currentTenant!._id,
                params: metadataFilter,
            }),
    });

    const createSurveyMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.createSurvey,
        onSuccess: () => {
            surveysQuery.refetch();
            setSurveyModalVisible(false);
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.SUCCESS.CREATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateSurveyMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.updateSurvey,
        onSuccess: () => {
            surveysQuery.refetch();
            setSurveyModalVisible(false);
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteSurveyMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.deleteSurvey,
        onSuccess: () => {
            surveysQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p="md">
            <Group gap="xs">
                <Title order={3} c="blue">
                    {t('TENANT_PAGES.SURVEYS.TITLE')}
                </Title>
                <SVHPrivacyDisclaimer />
            </Group>
            <Text size="sm" mb="sm">
                {t('TENANT_PAGES.SURVEYS.DESCRIPTION')}
            </Text>
            <SurveyModal
                visible={surveyModalVisible}
                data={currentSurvey || undefined}
                onClose={() => setSurveyModalVisible(false)}
                onSubmit={(body) => {
                    if (currentSurvey) {
                        updateSurveyMutation.mutate({
                            tenantId: currentTenant!._id,
                            surveyId: currentSurvey._id,
                            body,
                        });
                    } else {
                        createSurveyMutation.mutate({
                            tenantId: currentTenant!._id,
                            body,
                        });
                    }
                    setSurveyModalVisible(false);
                }}
            />
            <SVHFilter
                value={metadataFilter || undefined}
                onFilter={(filter) => setMetadataFilter(filter)}
                onAdd={{
                    func: () => setSurveyModalVisible(true),
                    text: t('TENANT_PAGES.SURVEYS.ADD'),
                    permission: 'survey',
                }}
            />
            <SVHMetaGrid
                permissionPrefix="survey"
                data={surveysQuery.data || []}
                onDelete={(surveyId) => {
                    deleteSurveyMutation.mutate({
                        tenantId: currentTenant!._id,
                        surveyId,
                    });
                }}
                onEdit={(survey) => {
                    setCurrentSurvey(survey as SurveyMeta);
                    setSurveyModalVisible(true);
                }}
            />
        </SVHPageWrapper>
    );
};

export default Surveys;
