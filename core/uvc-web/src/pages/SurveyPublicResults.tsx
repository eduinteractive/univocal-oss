import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Badge, Box, Flex, Text, Title } from '@mantine/core';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    SAPI,
    SurveyExecutionMode,
    SurveyResult,
} from '@eduinteractive/uvc-api';
import SVHLoader from '../components/common/SVHLoader';
import HTTP_403 from './error/HTTP_403';
import SurveyResults from '../components/features/tenant/surveys/SurveyResults';

const SurveyPublicResults = () => {
    const { t } = useTranslation();
    const { surveyId } = useParams();

    const resultsQuery = useQuery({
        queryKey: ['public-survey-results', surveyId],
        queryFn: () =>
            SAPI.SURVEY.PUBLIC.getPublicSurveyResults({ surveyId: surveyId! }),
        retry: (failureCount, error) => {
            if (error instanceof AxiosError) {
                return error.response?.status !== 404 && error.response?.status !== 403;
            }
            return failureCount < 3;
        },
    });

    const results = useMemo<SurveyResult[]>(() => {
        if (!resultsQuery.data) return [];
        return resultsQuery.data.results.map((result) => ({
            ...result,
            personal: { type: SurveyExecutionMode.DEFAULT },
        }));
    }, [resultsQuery.data]);

    if (resultsQuery.isLoading) {
        return <SVHLoader />;
    }

    if (resultsQuery.isError || !resultsQuery.data) {
        return (
            <HTTP_403
                title={t('PAGES.SURVEY.RESULTS_UNAVAILABLE_TITLE')}
                description={t('PAGES.SURVEY.RESULTS_UNAVAILABLE')}
            />
        );
    }

    return (
        <Flex direction="column" mih="100%">
            <Box bg="violet.6" p="md" px="xl">
                <Title order={2} c="white" mb="xs" mt="lg">
                    {resultsQuery.data.survey.title}
                </Title>
                {resultsQuery.data.survey.description && (
                    <Text size="sm" c="white" mb="md">
                        {resultsQuery.data.survey.description}
                    </Text>
                )}
                <Badge color="white" c="violet.6" size="lg" tt="none" mb="sm">
                    {t('PAGES.SURVEY.ANSWER_COUNT', {
                        count: resultsQuery.data.results.length,
                    })}
                </Badge>
            </Box>
            <Box p="md" px="xl" pb="xl">
                {resultsQuery.data.results.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">
                        {t('SURVEYS.RESULTS.NO_ANSWERS_MESSAGE')}
                    </Text>
                ) : (
                    <SurveyResults
                        data={{
                            components: resultsQuery.data.components,
                            results,
                        }}
                    />
                )}
            </Box>
        </Flex>
    );
};

export default SurveyPublicResults;
