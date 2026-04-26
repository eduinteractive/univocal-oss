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
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    Divider,
    Flex,
    Text,
    Title,
} from '@mantine/core';
import SVHTitle from '../components/common/SVHTitle';
import { Fragment, useEffect, useState } from 'react';
import {
    EDITextarea,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { SurveyComponentNominalScale } from '../constants/Enums';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

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
                return error.response?.status !== 403;
            }
            return failureCount < 3;
        },
    });

    const createSurveyResultMutation = useMutation({
        mutationFn: SAPI.SURVEY.PUBLIC.createSurveyResult,
        onSuccess: () => {
            setIsFinished(true);
            NotificationHandler.showSuccess(t('PAGES.SURVEY.SUCCESS'));
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

        let identifier: string | undefined = undefined;
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
                                    color="blue"
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
                                color="blue"
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
        const error = surveyQuery.error as AxiosError;
        if (error.response?.status === 403) {
            return <HTTP_403 title={t('COMMON.NO_ACCESS')} description={t('PAGES.SURVEY.ALREADY_COMPLETED')} />;
        }
        return <HTTP_403  />;
    }

    if (surveyQuery.data) {
        return (
            <Container h="100%" size="xl" w="100%" mt="xl" pb="xl">
                <Flex direction="column" gap="md" pb="xl">
                    <Card withBorder p="sm" radius="md" shadow="sm" w="100%">
                        <SVHTitle />
                        {isFinished && (
                            <Text size="sm" ta="center" fw="bold" pb="md">
                                {t('PAGES.SURVEY.THANKS')}
                            </Text>
                        )}
                    </Card>
                    {!isFinished && (
                        <Card
                            withBorder
                            p="xl"
                            radius="md"
                            shadow="sm"
                            w="100%"
                        >
                            <Title order={3}>
                                {surveyQuery.data.survey.title}
                            </Title>
                            <Text size="sm">
                                {surveyQuery.data.survey.description}
                            </Text>
                            <Divider mt="md" />
                            {surveyQuery.data.survey.options.executionMode ===
                                SurveyExecutionMode.TAN && (
                                <Box style={{ flex: 1 }} my="md">
                                    <Title order={4} mb="sm">
                                        {t('PAGES.SURVEY.SECTIONS.SURVEY_CODE_TITLE')}
                                    </Title>
                                    <Text size="sm">
                                        {t('PAGES.SURVEY.SECTIONS.SURVEY_CODE_DESCRIPTION')}
                                    </Text>
                                    <EDITextInput
                                        label={t('PAGES.SURVEY.FIELDS.SURVEY_CODE')}
                                        placeholder={t('PAGES.SURVEY.FIELDS.SURVEY_CODE_PLACEHOLDER')}
                                        value={tan}
                                        onChange={(event) => {
                                            const val =
                                                event.currentTarget?.value;
                                            setTan(val);
                                        }}
                                    />
                                </Box>
                            )}
                            {surveyQuery.data.survey.options.executionMode ===
                                SurveyExecutionMode.PERSONAL && (
                                <Box style={{ flex: 1 }} my="md">
                                    <Title order={4} mb="sm">
                                        {t('PAGES.SURVEY.SECTIONS.EMAIL_TITLE')}
                                    </Title>
                                    <Text size="sm">
                                        {t('PAGES.SURVEY.SECTIONS.EMAIL_DESCRIPTION')}
                                    </Text>
                                    <EDITextInput
                                        label={t('PAGES.SURVEY.FIELDS.EMAIL')}
                                        placeholder={t('PAGES.SURVEY.FIELDS.EMAIL_PLACEHOLDER')}
                                        value={email}
                                        onChange={(event) => {
                                            const val =
                                                event.currentTarget?.value;
                                            setEmail(val);
                                        }}
                                    />
                                </Box>
                            )}
                            <Divider mt="md" />
                            {components.map((component) => (
                                <Fragment key={component._id}>
                                    <Box
                                        style={{ flex: 1 }}
                                        my="xl"
                                    >
                                        <Title order={4} mb="sm">
                                            {component.title}{component.required && <span style={{color: 'red'}}> *</span>}
                                        </Title>
                                        {renderComponentContent(component)}
                                    </Box>
                                    <Divider />
                                </Fragment>
                            ))}
                            <Button w="100%" mt="md" onClick={handleSubmit}>
                                {t('PAGES.SURVEY.SUBMIT')}
                            </Button>
                        </Card>
                    )}
                </Flex>
            </Container>
        );
    }

    return null;
};

export default SurveyTransaction;
