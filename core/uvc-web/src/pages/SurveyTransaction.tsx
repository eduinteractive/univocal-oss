import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
    SAPI,
    SurveyComponent,
    SurveyComponentChoice,
    SurveyComponentLikert,
    SurveyComponentNominal,
    SurveyComponentText,
    SurveyComponentType,
    SurveyExecutionMode,
} from '@eduinteractive/uvc-api';
import SVHLoader from '../components/common/SVHLoader';
import HTTP_403 from './error/HTTP_403';
import {
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Flex,
    Group,
    Text,
    Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import {
    EDITextarea,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { SurveyComponentNominalScale } from '../constants/Enums';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const redirectHref = (url: string) =>
    url.includes('https://') || url.includes('http://') ? url : `https://${url}`;

const SurveyTransaction = () => {
    const { t } = useTranslation();
    const { surveyId } = useParams();
    const [components, setComponents] = useState<SurveyComponent[]>([]);
    const [result, setResult] = useState<{ [key: string]: unknown }>({});
    const [isFinished, setIsFinished] = useState(false);
    const [tan, setTan] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    // Für anonyme Umfragen wird die Visitor-ID serverseitig über Cookies verwaltet
    const surveyQuery = useQuery({
        queryKey: ['survey', surveyId],
        queryFn: () => SAPI.SURVEY.PUBLIC.getPublicSurvey({ surveyId: surveyId! }),
        retry: (failureCount, error) => {
            if (error instanceof AxiosError) {
                const status = error.response?.status;
                return status !== 403 && status !== 404;
            }
            return failureCount < 3;
        },
    });

    const createSurveyResultMutation = useMutation({
        mutationFn: SAPI.SURVEY.PUBLIC.createSurveyResult,
        onSuccess: () => {
            setIsFinished(true);
        },
        onError: NotificationHandler.showAxiosError,
    });

    // Visitor-ID wird jetzt serverseitig über Cookies verwaltet
    // Kein useEffect mehr nötig

    useEffect(() => {
        if (surveyQuery.data) {
            const startComponent = surveyQuery.data.components.find(
                (c) => !c.previous
            );

            // Falls keine Startkomponente gefunden wird, leere Liste zurückgeben
            if (!startComponent) {
                setComponents([]);
            } else {
                // Erstellen der sortierten Liste
                const sortedComponents = [startComponent];
                let currentComponent = startComponent;

                while (currentComponent && currentComponent.next) {
                    const nextComponent = surveyQuery.data.components.find(
                        (c) => c._id === currentComponent.next
                    );
                    if (nextComponent) {
                        sortedComponents.push(nextComponent);
                        currentComponent = nextComponent;
                    } else {
                        // Abbruch, falls keine nächste Komponente gefunden wird
                        break;
                    }
                }

                sortedComponents.forEach((component) => {
                    if (component.type !== SurveyComponentType.TEXT) {
                        setResult((prev) => ({
                            ...prev,
                            [component._id]: null,
                        }));
                    }
                });

                setComponents(sortedComponents);
            }
        }
    }, [surveyQuery.data]);

    const redirectionUrl = surveyQuery.data?.survey.options.redirectionUrl;

    useEffect(() => {
        if (!isFinished || !redirectionUrl) return;
        const timer = setTimeout(() => {
            if (redirectionUrl.includes('http://')) return;
            window.location.href = redirectHref(redirectionUrl);
        }, 5000);
        return () => clearTimeout(timer);
    }, [isFinished, redirectionUrl]);

    const questionNumbers = useMemo(() => {
        const numbers = new Map<string, number>();
        let count = 0;
        components.forEach((component) => {
            if (component.type !== SurveyComponentType.TEXT) {
                count += 1;
                numbers.set(component._id, count);
            }
        });
        return numbers;
    }, [components]);

    const handleSubmit = () => {
        for (const key in result) {
            if (result[key] === null && 
                components.find((c) => c._id === key)?.required
            ) {
                return NotificationHandler.showError(
                    t('PAGES.SURVEY.ERRORS.FILL_REQUIRED_FIELDS')
                );
            }
        }

        let identifier: string | undefined;
        if (
            surveyQuery.data?.survey.options.executionMode ===
            SurveyExecutionMode.TAN
        ) {
            if (!tan) {
                return NotificationHandler.showError(
                    t('PAGES.SURVEY.ERRORS.ENTER_SURVEY_CODE')
                );
            }
            identifier = tan;
        } else if (
            surveyQuery.data?.survey.options.executionMode ===
            SurveyExecutionMode.ANONYMOUS
        ) {
            // Für anonyme Umfragen wird die Visitor-ID serverseitig über Cookies verwaltet
            // identifier wird vom Server automatisch aus dem Cookie gelesen
            identifier = undefined;
        } else if (
            surveyQuery.data?.survey.options.executionMode ===
            SurveyExecutionMode.PERSONAL
        ) {
            if (!email || !email.includes('@')) {
                return NotificationHandler.showError(
                    t('PAGES.SURVEY.ERRORS.ENTER_EMAIL')
                );
            }
            identifier = email;
        } else {
            identifier = undefined;
        }
        createSurveyResultMutation.mutate({
            surveyId: surveyId!,
            body: {
                personal: {
                    identifier,
                },
                answers: result,
            },
        });
    };

    const renderComponentContent = (component: SurveyComponent) => {
        switch (component.type) {
            case SurveyComponentType.TEXT:
                return (
                    <div
                        dangerouslySetInnerHTML={{
                            __html:
                                (component as SurveyComponentText)
                                    .description || '',
                        }}
                    />
                );
            case SurveyComponentType.LIKERT:
                return (
                    <Flex direction="row" gap="sm" wrap="wrap">
                        {(component as SurveyComponentLikert).scale.labels.map(
                            (label, index) => (
                                <Button
                                    key={index}
                                    color="violet"
                                    variant={
                                        (result[component._id] as number) ===
                                        index
                                            ? 'filled'
                                            : 'outline'
                                    }
                                    size="sm"
                                    radius="sm"
                                    onClick={() => {
                                        setResult((prev) => ({
                                            ...prev,
                                            [component._id]: index,
                                        }));
                                    }}
                                >
                                    {label}
                                </Button>
                            )
                        )}
                    </Flex>
                );
            case SurveyComponentType.CHOICE:
                return (
                    <Flex direction="column" gap="sm">
                        {(component as SurveyComponentChoice).choices.map(
                            (label, index) => (
                                <Checkbox
                                    key={index}
                                    label={label}
                                    checked={
                                        result[component._id]
                                            ? (
                                                  result[
                                                      component._id
                                                  ] as number[]
                                              ).includes(index)
                                            : false
                                    }
                                    onChange={(event) => {
                                        setResult((prev) => {
                                            const currentResult = prev[
                                                component._id as keyof typeof prev
                                            ] as number[];
                                            if (event.target.checked) {
                                                if (currentResult !== null) {
                                                    // Überprüfe, ob multiple Auswahl erlaubt ist und ob max entweder null (unbegrenzt) oder nicht überschritten wurde
                                                    if (
                                                        (
                                                            component as SurveyComponentChoice
                                                        ).multiple &&
                                                        ((
                                                            component as SurveyComponentChoice
                                                        ).max === 0 ||
                                                            currentResult.length <
                                                                (
                                                                    component as SurveyComponentChoice
                                                                ).max!)
                                                    ) {
                                                        return {
                                                            ...prev,
                                                            [component._id]: [
                                                                ...(currentResult ||
                                                                    []),
                                                                index,
                                                            ],
                                                        };
                                                    } else {
                                                        // Wenn keine multiple Auswahl erlaubt ist oder max überschritten wurde
                                                        return {
                                                            ...prev,
                                                            [component._id]: [
                                                                index,
                                                            ],
                                                        };
                                                    }
                                                } else {
                                                    // Erste Auswahl
                                                    return {
                                                        ...prev,
                                                        [component._id]: [
                                                            index,
                                                        ],
                                                    };
                                                }
                                            } else {
                                                // Deselektieren der Option
                                                return {
                                                    ...prev,
                                                    [component._id]:
                                                        currentResult?.filter(
                                                            (i) => i !== index
                                                        ),
                                                };
                                            }
                                        });
                                    }}
                                />
                            )
                        )}
                    </Flex>
                );
            case SurveyComponentType.OPEN:
                return (
                    <EDITextarea
                        label={t('PAGES.SURVEY.FIELDS.ANSWER')}
                        placeholder={t('PAGES.SURVEY.FIELDS.ANSWER_PLACEHOLDER')}
                        value={(result[component._id] as string) || ''}
                        onChange={(event) => {
                            const val = event.currentTarget?.value;
                            setResult((prev) => ({
                                ...prev,
                                [component._id]: val,
                            }));
                        }}
                    />
                );
            case SurveyComponentType.WORDCLOUD:
                return (
                    <EDITextInput
                        label={t('PAGES.SURVEY.FIELDS.ANSWER')}
                        placeholder={t('PAGES.SURVEY.FIELDS.ANSWER_PLACEHOLDER')}
                        value={(result[component._id] as string) || ''}
                        onChange={(event) => {
                            const val = event.currentTarget?.value;
                            setResult((prev) => ({
                                ...prev,
                                [component._id]: val,
                            }));
                        }}
                    />
                );
            case SurveyComponentType.NOMINAL:
                return (
                    <Flex direction="row" gap="sm" wrap="wrap">
                        {SurveyComponentNominalScale[
                            (component as SurveyComponentNominal)
                                .nominalType as keyof typeof SurveyComponentNominalScale
                        ].map((label, index) => (
                            <Button
                                key={label + index}
                                color="violet"
                                variant={
                                    result[component._id] === index
                                        ? 'filled'
                                        : 'outline'
                                }
                                size="sm"
                                radius="sm"
                                onClick={() => {
                                    setResult((prev) => ({
                                        ...prev,
                                        [component._id]: index,
                                    }));
                                }}
                            >
                                {label}
                            </Button>
                        ))}
                    </Flex>
                );

            default:
                return <>{t('PAGES.SURVEY.UNKNOWN_QUESTION')}</>;
        }
    };

    if (surveyQuery.isLoading) {
        return <SVHLoader />;
    }

    if (surveyQuery.isError) {
        const error = surveyQuery.error as AxiosError<{ error?: { message?: string } }>;
        const message = error.response?.data?.error?.message;
        if (error.response?.status === 403) {
            return (
                <HTTP_403
                    title={t('ERROR_PAGES.HTTP_403.TITLE')}
                    description={message || t('PAGES.SURVEY.ALREADY_COMPLETED')}
                />
            );
        }
        return <HTTP_403 description={message} />;
    }

    if (surveyQuery.data) {
        const showQuestionNumbers =
            surveyQuery.data.survey.options.showQuestionNumbers !== false;
        return (
            <Flex direction="column" mih="100%">
                <Box bg="violet.6" p="md" px="xl">
                    <Title order={2} c="white" mb="xs" mt="lg">
                        {surveyQuery.data.survey.title}
                    </Title>
                    {surveyQuery.data.survey.description && (
                        <Text size="sm" c="white" mb="md">
                            {surveyQuery.data.survey.description}
                        </Text>
                    )}
                    <Badge color="white" c="violet.6" size="lg" tt="none" mb="sm">
                        {t('PAGES.SURVEY.QUESTION_COUNT', {
                            count: questionNumbers.size,
                        })}
                    </Badge>
                </Box>
                <Box p="md" pt="xs" px="xl" pb="xl">
                    {isFinished ? (
                        <Flex direction="column" align="center" py="xl">
                            <Title order={3} ta="center" c="violet.6">
                                {t('PAGES.SURVEY.THANKS')}
                            </Title>
                            {redirectionUrl && (
                                <>
                                    <Title order={4} ta="center" mt="md" c="violet.6">
                                        {t('PAGES.SURVEY.REDIRECTION_TITLE')}
                                    </Title>
                                    <Text ta="center" mt="xs">
                                        {t('PAGES.SURVEY.REDIRECTION_DESCRIPTION')}
                                    </Text>
                                    <Text
                                        component="a"
                                        href={redirectHref(redirectionUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        ta="center"
                                        mt="sm"
                                        c="violet.6"
                                    >
                                        {redirectionUrl}
                                    </Text>
                                </>
                            )}
                        </Flex>
                    ) : (
                        <>
                            {surveyQuery.data.survey.options.executionMode ===
                                SurveyExecutionMode.TAN && (
                                <Card radius="md" p="lg" my="md" shadow="sm">
                                    <Title order={4} mb="sm">
                                        {t('PAGES.SURVEY.SECTIONS.SURVEY_CODE_TITLE')}
                                    </Title>
                                    <Text size="sm" mb="sm">
                                        {t('PAGES.SURVEY.SECTIONS.SURVEY_CODE_DESCRIPTION')}
                                    </Text>
                                    <EDITextInput
                                        label={t('PAGES.SURVEY.FIELDS.SURVEY_CODE')}
                                        placeholder={t('PAGES.SURVEY.FIELDS.SURVEY_CODE_PLACEHOLDER')}
                                        value={tan}
                                        onChange={(event) => {
                                            setTan(event.currentTarget?.value);
                                        }}
                                    />
                                </Card>
                            )}
                            {surveyQuery.data.survey.options.executionMode ===
                                SurveyExecutionMode.PERSONAL && (
                                <Card radius="md" p="lg" my="md" shadow="sm">
                                    <Title order={4} mb="sm">
                                        {t('PAGES.SURVEY.SECTIONS.EMAIL_TITLE')}
                                    </Title>
                                    <Text size="sm" mb="sm">
                                        {t('PAGES.SURVEY.SECTIONS.EMAIL_DESCRIPTION')}
                                    </Text>
                                    <EDITextInput
                                        label={t('PAGES.SURVEY.FIELDS.EMAIL')}
                                        placeholder={t('PAGES.SURVEY.FIELDS.EMAIL_PLACEHOLDER')}
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.currentTarget?.value);
                                        }}
                                    />
                                </Card>
                            )}
                            {components.map((component) => (
                                <Card
                                    key={component._id}
                                    radius="md"
                                    p="lg"
                                    my="md"
                                    shadow="sm"
                                >
                                    <Group gap="xs" align="center" mb="md">
                                        {showQuestionNumbers &&
                                            questionNumbers.has(component._id) && (
                                                <Badge color="violet" size="lg" circle>
                                                    {questionNumbers.get(component._id)}
                                                </Badge>
                                            )}
                                        <Title order={4}>
                                            {component.title}
                                            {component.required && (
                                                <span style={{ color: 'red' }}> *</span>
                                            )}
                                        </Title>
                                    </Group>
                                    {renderComponentContent(component)}
                                </Card>
                            ))}
                            <Group justify="flex-end" mt="md">
                                <Button
                                    radius="xl"
                                    onClick={handleSubmit}
                                    loading={createSurveyResultMutation.isPending}
                                >
                                    {t('PAGES.SURVEY.SUBMIT')}
                                </Button>
                            </Group>
                        </>
                    )}
                </Box>
            </Flex>
        );
    }

    return null;
};

export default SurveyTransaction;
