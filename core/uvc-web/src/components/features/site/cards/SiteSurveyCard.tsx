import {
    Anchor,
    Box,
    Button,
    Card,
    Group,
    Progress,
    Stack,
    Text,
    ThemeIcon,
    Title,
    UnstyledButton,
} from '@mantine/core';
import { IconCheck, IconChartBar, IconClipboardList } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    PublicSiteSurvey,
    PublicSiteSurveyComponent,
    SAPI,
    SurveyComponentNominalType,
    SurveyComponentType,
    SurveyExecutionMode,
} from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSite } from '../../../../context/SiteContext';
import { SurveyComponentNominalScale } from '../../../../constants/Enums';
import SiteCompactCard from './SiteCompactCard';
import classes from '../site.module.css';

const POLL_TYPES: string[] = [
    SurveyComponentType.CHOICE,
    SurveyComponentType.LIKERT,
    SurveyComponentType.NOMINAL,
];
const POLL_MODES: string[] = [SurveyExecutionMode.DEFAULT, SurveyExecutionMode.ANONYMOUS];

const votedKey = (surveyId: string) => `uvc-voted-${surveyId}`;

const readVote = (surveyId: string): number[] | undefined => {
    try {
        const raw = localStorage.getItem(votedKey(surveyId));
        return raw ? (JSON.parse(raw) as number[]) : undefined;
    } catch {
        return undefined;
    }
};

const storeVote = (surveyId: string, selection: number[]) => {
    try {
        localStorage.setItem(votedKey(surveyId), JSON.stringify(selection));
    } catch {
        /* storage might be unavailable (private mode) */
    }
};

/** Returns the single answerable component if the survey qualifies as a Kurzfrage. */
export const getPollComponent = (entry: PublicSiteSurvey): PublicSiteSurveyComponent | undefined => {
    if (!POLL_MODES.includes(entry.survey.options.executionMode)) return undefined;
    const answerable = entry.components.filter((component) => component.type !== SurveyComponentType.TEXT);
    if (answerable.length !== 1 || !POLL_TYPES.includes(answerable[0].type)) return undefined;
    return answerable[0];
};

const getOptions = (component: PublicSiteSurveyComponent): string[] => {
    switch (component.type) {
        case SurveyComponentType.CHOICE:
            return component.choices ?? [];
        case SurveyComponentType.LIKERT:
            return component.scale?.labels ?? [];
        case SurveyComponentType.NOMINAL:
            return SurveyComponentNominalScale[component.nominalType as SurveyComponentNominalType] ?? [];
        default:
            return [];
    }
};

interface PollProps {
    entry: PublicSiteSurvey;
    component: PublicSiteSurveyComponent;
}

const SitePoll = ({ entry, component }: PollProps) => {
    const { t } = useTranslation();
    const { subdomain, preview } = useSite();
    const surveyId = entry.survey._id;
    const options = getOptions(component);
    const multiple = component.type === SurveyComponentType.CHOICE && !!component.multiple;
    const maxSelection = multiple ? component.max || options.length : 1;

    const [storedVote, setStoredVote] = useState<number[] | undefined>(() => readVote(surveyId));
    const [selection, setSelection] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const hasVoted = storedVote !== undefined;
    const resultsVisible = hasVoted || showResults;

    const resultsQuery = useQuery({
        queryKey: ['site-survey-results', subdomain, surveyId],
        queryFn: () => SAPI.PROFILE.PUBLIC.getPublicSurveyResults({ subdomain: subdomain!, surveyId }),
        enabled: resultsVisible && !!subdomain && !preview,
    });

    const voteMutation = useMutation({
        mutationFn: () =>
            SAPI.SURVEY.PUBLIC.createSurveyResult({
                surveyId,
                body: {
                    personal: {},
                    answers: {
                        [component._id]:
                            component.type === SurveyComponentType.CHOICE ? selection : selection[0],
                    },
                },
            }),
        onSuccess: () => {
            storeVote(surveyId, selection);
            setStoredVote(selection);
            resultsQuery.refetch();
        },
        onError: (error: AxiosError) => {
            if (error.response?.status === 403 && entry.survey.options.executionMode === SurveyExecutionMode.ANONYMOUS) {
                storeVote(surveyId, []);
                setStoredVote([]);
                NotificationHandler.showInfo(t('SITE.PUBLIC.POLL_ALREADY_VOTED'));
                return;
            }
            NotificationHandler.showAxiosError(error);
        },
    });

    const toggle = (index: number) => {
        if (hasVoted || preview) return;
        if (!multiple) {
            setSelection([index]);
            return;
        }
        setSelection((current) =>
            current.includes(index)
                ? current.filter((value) => value !== index)
                : current.length < maxSelection
                  ? [...current, index]
                  : current
        );
    };

    const counts = resultsQuery.data?.components.find((c) => c.componentId === component._id)?.counts ?? {};
    const total = resultsQuery.data?.total ?? 0;
    const chosen = storedVote ?? selection;

    return (
        <Stack gap="sm">
            <Text fw={700} c="var(--site-primary)">
                {component.title}
            </Text>
            {multiple && !resultsVisible && (
                <Text size="xs" c="dimmed">
                    {t('SITE.PUBLIC.POLL_MULTIPLE', { max: maxSelection })}
                </Text>
            )}
            <Stack gap={8}>
                {options.map((label, index) => {
                    const isChosen = chosen.includes(index);
                    const percent = total > 0 ? Math.round(((counts[String(index)] ?? 0) / total) * 100) : 0;
                    return (
                        <UnstyledButton
                            key={`${label}-${index}`}
                            onClick={() => toggle(index)}
                            disabled={resultsVisible || preview}
                            aria-pressed={isChosen}
                        >
                            <Box
                                p="sm"
                                bg="white"
                                style={{
                                    borderRadius: 12,
                                    border: `2px solid ${isChosen ? 'var(--site-primary)' : 'transparent'}`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                <Group justify="space-between" wrap="nowrap" gap="sm">
                                    <Group gap="sm" wrap="nowrap">
                                        <ThemeIcon
                                            size={22}
                                            radius="xl"
                                            color="var(--site-primary)"
                                            variant={isChosen ? 'filled' : 'outline'}
                                        >
                                            {isChosen ? <IconCheck size={14} /> : null}
                                        </ThemeIcon>
                                        <Text size="sm" fw={500}>
                                            {label}
                                        </Text>
                                    </Group>
                                    {resultsVisible && resultsQuery.data && (
                                        <Text size="sm" fw={700} c="var(--site-primary)">
                                            {percent}%
                                        </Text>
                                    )}
                                </Group>
                                {resultsVisible && resultsQuery.data && (
                                    <Progress
                                        mt={8}
                                        value={percent}
                                        color={isChosen ? 'var(--site-primary)' : 'var(--site-accent)'}
                                        size="sm"
                                        radius="xl"
                                        transitionDuration={400}
                                    />
                                )}
                            </Box>
                        </UnstyledButton>
                    );
                })}
            </Stack>
            <Group justify="space-between" mt={4}>
                {resultsVisible ? (
                    <Text size="sm" c="dimmed">
                        {t('SITE.PUBLIC.POLL_VOTES', { count: total })}
                    </Text>
                ) : (
                    <Anchor
                        component="button"
                        size="sm"
                        c="var(--site-primary)"
                        onClick={() => setShowResults(true)}
                        disabled={preview}
                    >
                        <Group gap={4}>
                            <IconChartBar size={14} />
                            {t('SITE.PUBLIC.POLL_SHOW_RESULTS')}
                        </Group>
                    </Anchor>
                )}
                {!hasVoted && (
                    <Button
                        color="var(--site-primary)"
                        radius="xl"
                        disabled={selection.length === 0 || preview}
                        loading={voteMutation.isPending}
                        onClick={() => voteMutation.mutate()}
                    >
                        {t('SITE.PUBLIC.POLL_SUBMIT')}
                    </Button>
                )}
                {hasVoted && (
                    <Text size="sm" c="green.8" fw={600}>
                        {t('SITE.PUBLIC.POLL_THANKS')}
                    </Text>
                )}
            </Group>
        </Stack>
    );
};

export const SiteSurveyFeatured = ({ entry }: { entry: PublicSiteSurvey }) => {
    const { t } = useTranslation();
    const { preview } = useSite();
    const poll = getPollComponent(entry);

    return (
        <Card radius="lg" p="var(--site-card-padding)" bg="var(--site-soft)" h="100%">
            <Stack gap="md">
                <Group gap="xs">
                    <Text size="xs" tt="uppercase" fw={700} c="var(--site-primary)">
                        {poll ? t('SITE.PUBLIC.POLL_LABEL') : t('SITE.PUBLIC.SURVEY_LABEL')}
                    </Text>
                </Group>
                <Title order={3} fz={18} fw={650} lh={1.35} c="dark.8" className={classes.itemTitle}>
                    {entry.survey.title}
                </Title>
                {entry.survey.description && <Text c="dark.6">{entry.survey.description}</Text>}
                {poll ? (
                    <SitePoll entry={entry} component={poll} />
                ) : (
                    <Group justify="space-between" mt="sm">
                        <Text size="sm" c="dimmed">
                            {t('SITE.PUBLIC.SURVEY_QUESTIONS', {
                                count: entry.components.filter((c) => c.type !== SurveyComponentType.TEXT).length,
                            })}
                        </Text>
                        <Button
                            color="var(--site-primary)"
                            radius="xl"
                            component={Link}
                            to={`/survey-transaction/${entry.survey._id}`}
                            disabled={preview}
                        >
                            {t('SITE.PUBLIC.SURVEY_START')}
                        </Button>
                    </Group>
                )}
            </Stack>
        </Card>
    );
};

export const SiteSurveyCompact = ({ entry, active }: { entry: PublicSiteSurvey; active: boolean }) => {
    const { t } = useTranslation();
    const poll = getPollComponent(entry);
    return (
        <SiteCompactCard
            icon={poll ? <IconChartBar size={22} /> : <IconClipboardList size={22} />}
            title={entry.survey.title}
            meta={poll ? t('SITE.PUBLIC.POLL_LABEL') : t('SITE.PUBLIC.SURVEY_LABEL')}
            active={active}
        />
    );
};
