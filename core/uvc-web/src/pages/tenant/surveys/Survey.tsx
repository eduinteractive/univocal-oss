import { useMutation, useQuery } from '@tanstack/react-query';
import { useTenant } from '../../../context/TenantContext';
import { useParams } from 'react-router-dom';
import {
    SurveyComponent,
    SAPI,
} from '@eduinteractive/uvc-api';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import SurveyTabs from '../../../components/features/tenant/surveys/SurveyTabs';
import SVHLoader from '../../../components/common/SVHLoader';
import SurveyComponents from '../../../components/features/tenant/surveys/SurveyComponents';
import SurveyComponentModal from '../../../components/features/tenant/surveys/SurveyComponentModal';
import { useState } from 'react';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SurveyModal from '../../../components/features/tenant/surveys/SurveyModal';
import { useTranslation } from 'react-i18next';

const Survey = () => {
    const { surveyId } = useParams();
    const { currentTenant } = useTenant();
    const [surveyModalVisible, setSurveyModalVisible] = useState(false);
    const [componentModalVisible, setComponentModalVisible] = useState(false);
    const [currentComponent, setCurrentComponent] =
        useState<SurveyComponent | null>(null);
    const [addComponentPosition, setAddComponentPosition] = useState<
        string | null
    >(null);
    const { t } = useTranslation();

    const surveyQuery = useQuery({
        queryKey: ['survey', currentTenant!._id, surveyId],
        queryFn: () =>
            SAPI.SURVEY.TENANT.getSurvey({ tenantId: currentTenant!._id, surveyId: surveyId! }),
    });

    const updateSurveyMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.updateSurvey,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createSurveyComponentMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.createSurveyComponent,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.COMPONENTS.SUCCESS.CREATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateSurveyComponentMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.updateSurveyComponent,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.COMPONENTS.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateSurveyComponentOrderMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.updateSurveyComponentOrder,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.COMPONENTS.ORDER.SUCCESS.UPDATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteSurveyComponentMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.deleteSurveyComponent,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.COMPONENTS.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const generateSurveyCodesMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.generateSurveyCodes,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.CODES.SUCCESS.GENERATED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const resetSurveyCodesMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.resetSurveyCodes,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.CODES.SUCCESS.RESET'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteSurveyResultsMutation = useMutation({
        mutationFn: SAPI.SURVEY.TENANT.deleteSurveyResults,
        onSuccess: () => {
            surveyQuery.refetch();
            NotificationHandler.showSuccess(t('TENANT_PAGES.SURVEYS.RESULTS.SUCCESS.DELETED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    if (!surveyQuery.data) {
        return <SVHLoader />;
    }

    return (
        <SVHPageWrapper p={0}>
            <SurveyModal
                data={surveyQuery.data.survey}
                visible={surveyModalVisible}
                onClose={() => setSurveyModalVisible(false)}
                onSubmit={(body) => {
                    updateSurveyMutation.mutate({
                        tenantId: currentTenant!._id,
                        surveyId: surveyId!,
                        body,
                    });
                    setSurveyModalVisible(false);
                }}
            />
            <SurveyComponentModal
                data={currentComponent || undefined}
                visible={componentModalVisible}
                onClose={() => {
                    setCurrentComponent(null);
                    setComponentModalVisible(false);
                    setAddComponentPosition(null);
                }}
                onSubmit={(body) => {
                    if (currentComponent) {
                        updateSurveyComponentMutation.mutate({
                            tenantId: currentTenant!._id,
                            surveyId: surveyId!,
                            componentId: currentComponent._id,
                            body,
                        });
                    } else {
                        createSurveyComponentMutation.mutate({
                            tenantId: currentTenant!._id,
                            surveyId: surveyId!,
                            body: {
                                ...body,
                                previous: addComponentPosition || undefined,
                            },
                        });
                    }
                    setCurrentComponent(null);
                    setComponentModalVisible(false);
                    setAddComponentPosition(null);
                }}
            />
            <SurveyTabs
                components={surveyQuery.data.components}
                data={surveyQuery.data.survey}
                results={surveyQuery.data.results}
                questionsTab={
                    <SurveyComponents
                        survey={surveyQuery.data.survey}
                        data={surveyQuery.data.components}
                        isActive={
                            surveyQuery.data.survey.options.isActive ||
                            surveyQuery.data.results.length > 0
                        }
                        onAdd={(pos) => {
                            setAddComponentPosition(pos);
                            setComponentModalVisible(true);
                        }}
                        onEdit={(component) => {
                            setCurrentComponent(component);
                            setComponentModalVisible(true);
                        }}
                        onDelete={(componentId) => {
                            deleteSurveyComponentMutation.mutate({
                                tenantId: currentTenant!._id,
                                surveyId: surveyId!,
                                componentId,
                            });
                        }}
                        onOrderChange={(componentId, direction) => {
                            updateSurveyComponentOrderMutation.mutate({
                                tenantId: currentTenant!._id,
                                surveyId: surveyId!,
                                componentId,
                                body: { order: direction as -1 | 1 },
                            });
                        }}
                    />
                }
                onEdit={() => setSurveyModalVisible(true)}
                onGenerateCodes={(amount) => {
                    generateSurveyCodesMutation.mutate({
                        tenantId: currentTenant!._id,
                        surveyId: surveyId!,
                        body: { amount },
                    });
                }}
                onResetCodes={() => {
                    resetSurveyCodesMutation.mutate({
                        tenantId: currentTenant!._id,
                        surveyId: surveyId!,
                    });
                }}
                onUpdate={(body) => {
                    updateSurveyMutation.mutate({
                        tenantId: currentTenant!._id,
                        surveyId: surveyId!,
                        body,
                    });
                }}
                onResultsDelete={() => {
                    deleteSurveyResultsMutation.mutate({
                        tenantId: currentTenant!._id,
                        surveyId: surveyId!,
                    });
                }}
            />
        </SVHPageWrapper>
    );
};

export default Survey;
