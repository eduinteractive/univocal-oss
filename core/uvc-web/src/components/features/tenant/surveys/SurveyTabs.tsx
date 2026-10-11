import {
    ActionIcon,
    Anchor,
    Badge,
    Box,
    Button,
    Card,
    Flex,
    Group,
    SimpleGrid,
    Switch,
    Tabs,
    Text,
    ThemeIcon,
    Title,
    Tooltip,
    UnstyledButton,
} from '@mantine/core';
import {
    SurveyComponent,
    SurveyExecutionMode,
    SurveyMeta,
    SurveyResult,
} from '@eduinteractive/uvc-api';
import {
    IconChevronDown,
    IconChevronUp,
    IconClipboardText,
    IconDownload,
    IconEdit,
    IconExternalLink,
    IconFileDescription,
    IconLink,
    IconPlus,
    IconPresentation,
    IconPrinter,
    IconQuestionMark,
    IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import QRCode from 'react-qr-code';
import { SURVEY_EXECUTION_MODE_STRINGS } from '../../../../constants/Enums';
import { useEffect, useMemo, useState } from 'react';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SurveyCodesPDF from './SurveyCodesPDF';
import {
    EDIDeleteDialog,
    EDIModal,
    EDINumberInput,
    EDISelect,
    EDIStatisticsCards,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import SurveyResultsCSV from './SurveyResultsCSV';
import { useAuth } from '../../../../context/AuthContext';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import SurveyResults from './SurveyResults';
import SVHQRPDF from '../../../common/SVHQRPDF';
import SVHTabs from '../../../common/SVHTabs';
import SVHDateTimePicker from '../../../common/SVHDateTimePicker';
import { useTranslation } from 'react-i18next';

interface SurveyTabsSubmitData {
    options: {
        isActive?: boolean;
        executionMode?: SurveyExecutionMode;
        startDate?: Date | null;
        endDate?: Date | null;
        redirectionUrl?: string | null;
        showQuestionNumbers?: boolean;
        resultsSharing?: boolean;
    };
}

interface SurveyTabsProps {
    data: SurveyMeta;
    results: SurveyResult[];
    components: SurveyComponent[];
    questionsTab: React.ReactNode;
    onEdit: () => void;
    onGenerateCodes: (amount: number) => void;
    onResetCodes: () => void;
    onResultsDelete: () => void;
    onUpdate: (data: SurveyTabsSubmitData) => void;
}

const SurveyTabs = (props: SurveyTabsProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();
    const clipboard = useClipboard();
    const [tanOpened, { toggle }] = useDisclosure(false);
    const [genAmount, setGenAmount] = useState(0);
    const [genModalVisible, setGenModalVisible] = useState(false);
    const [isExecutionActve, setIsExecutionActive] = useState(false);
    const [executionMode, setExecutionMode] = useState<SurveyExecutionMode>(
        SurveyExecutionMode.DEFAULT
    );
    const [resultDelete, setResultDelete] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [redirectionUrl, setRedirectionUrl] = useState('');
    const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);

    const hasPermission = useMemo(() => {
        return (
            checkPermission(currentTenant!, 'survey:edit') ||
            props.data?.authorId === authData?._id
        );
    }, [currentTenant, authData, props.data]);

    const surveyLink = useMemo(
        () =>
            `${import.meta.env.VITE_KUBERNETES_HOST}/survey-transaction/${
                props.data?._id
            }`,
        [props.data]
    );

    const resultsLink = useMemo(
        () => `${surveyLink}/results`,
        [surveyLink]
    );

    const surveyTANs = useMemo(
        () => props.data.options.tans,
        [props.data.options.tans]
    );

    const surveyQRCode = useMemo(
        () => <QRCode id="surveyQR" value={surveyLink} size={72} />,
        [surveyLink]
    );

    useEffect(() => {
        setIsExecutionActive(props.data?.options.isActive);
        setExecutionMode(
            props.data?.options.executionMode || SurveyExecutionMode.DEFAULT
        );
        setStartDate(
            props.data?.options.startDate
                ? new Date(props.data.options.startDate)
                : null
        );
        setEndDate(
            props.data?.options.endDate
                ? new Date(props.data.options.endDate)
                : null
        );
        setRedirectionUrl(props.data?.options.redirectionUrl || '');
        setShowQuestionNumbers(props.data?.options.showQuestionNumbers !== false);
    }, [props.data]);

    const optionsUnchanged =
        executionMode === props.data.options.executionMode &&
        (startDate?.getTime() ?? null) ===
            (props.data.options.startDate
                ? new Date(props.data.options.startDate).getTime()
                : null) &&
        (endDate?.getTime() ?? null) ===
            (props.data.options.endDate
                ? new Date(props.data.options.endDate).getTime()
                : null) &&
        (redirectionUrl.trim() || '') ===
            (props.data.options.redirectionUrl || '') &&
        showQuestionNumbers === (props.data.options.showQuestionNumbers !== false);

    const handleOptionsSave = () => {
        if (!executionMode) {
            return NotificationHandler.showError(
                t('SURVEYS.ERRORS.EXECUTION_MODE_REQUIRED')
            );
        }
        if (startDate && endDate && startDate > endDate) {
            return NotificationHandler.showError(
                t('SURVEYS.EXECUTION.START_END_ERROR')
            );
        }
        props.onUpdate({
            options: {
                executionMode,
                startDate,
                endDate,
                redirectionUrl: redirectionUrl.trim() || null,
                showQuestionNumbers,
            },
        });
    };

    return (
        <SVHTabs defaultValue="questions" title={props.data?.title}>
            <Tabs.List>
                <Tabs.Tab value="questions" leftSection={<IconQuestionMark />}>
                    {t('SURVEYS.TABS.QUESTIONS')}
                </Tabs.Tab>
                {hasPermission && (
                    <Tabs.Tab
                        value="execution"
                        leftSection={<IconClipboardText />}
                    >
                        {t('SURVEYS.TABS.EXECUTION')}
                    </Tabs.Tab>
                )}
                <Tabs.Tab value="results" leftSection={<IconPresentation />}>
                    {t('SURVEYS.TABS.RESULTS')}
                </Tabs.Tab>
                <Tabs.Tab value="general" leftSection={<IconFileDescription />}>
                    {t('SURVEYS.TABS.DESCRIPTION')}
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general" p="md">
                <Flex justify="space-between">
                    <Flex direction="column" gap={0}>
                        <Title order={3}>{props.data?.title}</Title>
                        <Text size="sm">{props.data?.description}</Text>
                    </Flex>
                    {hasPermission && (
                        <ActionIcon variant="subtle">
                            <IconEdit size={24} onClick={props.onEdit} />
                        </ActionIcon>
                    )}
                </Flex>
                <Flex align="end" justify="end" direction="column" mt="sm">
                    <Text size="sm" c="dimmed">
                        {t('COMMON.CREATED_AT')}{' '}
                        {dayjs(props.data?.createdAt).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {t('COMMON.UPDATED_AT')}{' '}
                        {dayjs(props.data?.updatedAt).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                    </Text>
                </Flex>
            </Tabs.Panel>

            {hasPermission && (
                <Tabs.Panel value="execution" p="md">
                    <Title order={5} c="violet.6" mb="sm">
                        {t('SURVEYS.EXECUTION.GENERAL_SETTINGS')}
                    </Title>
                    <Card padding="md" radius="md" bg="violet.0">
                        <Group align="flex-start" wrap="nowrap" gap="md">
                            <Switch
                                size="sm"
                                checked={isExecutionActve}
                                onChange={(e) => {
                                    setIsExecutionActive(e.target.checked);
                                    props.onUpdate({
                                        options: {
                                            isActive: e.target.checked,
                                        },
                                    });
                                }}
                            />
                            <Box style={{ flex: 1 }}>
                                <Text size="sm" fw={600} c="violet.6">
                                    {t('SURVEYS.EXECUTION.ACTIVATE')}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {t('SURVEYS.EXECUTION.ACTIVATE_DESCRIPTION')}
                                </Text>
                            </Box>
                        </Group>
                    </Card>
                    {props.data.options.isActive && (
                        <Card padding="md" radius="md" bg="violet.0" mt="md">
                            <Flex align="center" gap="md" wrap="wrap">
                                <Box
                                    bg="white"
                                    p={6}
                                    style={{ borderRadius: 10, lineHeight: 0, flexShrink: 0 }}
                                >
                                    {surveyQRCode}
                                </Box>
                                <Box style={{ flex: '1 1 180px' }}>
                                    <Text fw={600} c="violet.6" size="sm">
                                        {t('SURVEYS.EXECUTION.INFO_TITLE')}
                                    </Text>
                                    <Anchor
                                        size="xs"
                                        c="dimmed"
                                        target="_blank"
                                        href={surveyLink}
                                    >
                                        {t('SURVEYS.EXECUTION.LINK_TO_SURVEY')}
                                    </Anchor>
                                </Box>
                                <Group gap={4} wrap="nowrap">
                                        <Tooltip label={t('SURVEYS.EXECUTION.COPY_LINK')}>
                                            <ActionIcon
                                                variant="subtle"
                                                color="violet"
                                                size="lg"
                                                onClick={() => {
                                                    clipboard.copy(surveyLink);
                                                    NotificationHandler.showInfo(
                                                        t('SURVEYS.EXECUTION.COPY_LINK_SUCCESS')
                                                    );
                                                }}
                                            >
                                                <IconLink size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <PDFDownloadLink
                                            style={{ display: 'inline-flex', textDecoration: 'none' }}
                                            document={
                                                <SVHQRPDF
                                                    link={surveyLink}
                                                    title={props.data.title}
                                                    generationNotice={t('COMMON.GENERATION_NOTICE')}
                                                />
                                            }
                                            fileName={t('SURVEYS.PDF.QR_CODE_FILENAME')}
                                        >
                                            <Tooltip label={t('SURVEYS.EXECUTION.QR_CODE_PRINT')}>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="violet"
                                                    size="lg"
                                                    component="span"
                                                >
                                                    <IconPrinter size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </PDFDownloadLink>
                                        {props.data.options.executionMode ===
                                            SurveyExecutionMode.TAN && (
                                            <>
                                                <PDFDownloadLink
                                                    style={{ display: 'inline-flex', textDecoration: 'none' }}
                                                    document={
                                                        <SurveyCodesPDF
                                                            survey={props.data}
                                                            link={surveyLink}
                                                            labels={{
                                                                codeLabel: t('SURVEYS.PDF.CODE_LABEL'),
                                                                tanLabel: t('SURVEYS.PDF.TAN_LABEL'),
                                                                generatedAt: t('SURVEYS.PDF.GENERATED_AT'),
                                                                generatedIn: t('SURVEYS.PDF.GENERATED_IN'),
                                                            }}
                                                        />
                                                    }
                                                    fileName={t('SURVEYS.PDF.CODES_FILENAME')}
                                                >
                                                    <Tooltip label={t('SURVEYS.EXECUTION.CODES_DOWNLOAD')}>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="violet"
                                                            size="lg"
                                                            component="span"
                                                        >
                                                            <IconDownload size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </PDFDownloadLink>
                                                <EDIModal
                                                    title={t('SURVEYS.EXECUTION.CODES_GENERATE_MODAL_TITLE')}
                                                    onSubmit={() => {
                                                        if (genAmount < 1) {
                                                            return NotificationHandler.showError(
                                                                t('SURVEYS.ERRORS.CODES_AMOUNT_MIN')
                                                            );
                                                        }
                                                        props.onGenerateCodes(genAmount);
                                                        setGenModalVisible(false);
                                                    }}
                                                    onClose={() => setGenModalVisible(false)}
                                                    visible={genModalVisible}
                                                    type="DEFAULT"
                                                >
                                                    <EDINumberInput
                                                        label={t('SURVEYS.EXECUTION.CODES_AMOUNT_LABEL')}
                                                        value={genAmount}
                                                        onChange={(value) =>
                                                            setGenAmount(value as number)
                                                        }
                                                        min={1}
                                                    />
                                                </EDIModal>
                                                <Tooltip label={t('SURVEYS.EXECUTION.CODES_GENERATE')}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="violet"
                                                        size="lg"
                                                        onClick={() => setGenModalVisible(true)}
                                                    >
                                                        <IconPlus size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                                <Tooltip label={t('SURVEYS.EXECUTION.CODES_DELETE')}>
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        size="lg"
                                                        onClick={() => {
                                                            props.onResetCodes();
                                                        }}
                                                    >
                                                        <IconTrash size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </>
                                        )}
                                </Group>
                            </Flex>
                            {props.data.options.executionMode ===
                                SurveyExecutionMode.TAN && (
                                <Box mt="md">
                                    <UnstyledButton
                                        onClick={toggle}
                                        c="violet.6"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text size="sm" fw={500} mr={4}>
                                            {t('SURVEYS.EXECUTION.CODES_SHOW')}
                                        </Text>
                                        {tanOpened ? (
                                            <IconChevronUp size={16} />
                                        ) : (
                                            <IconChevronDown size={16} />
                                        )}
                                    </UnstyledButton>
                                    {tanOpened && (
                                        <Group gap={6} mt="sm">
                                            {surveyTANs?.length === 0 && (
                                                <Text c="dimmed" size="sm">
                                                    {t('SURVEYS.EXECUTION.CODES_EMPTY')}
                                                </Text>
                                            )}
                                            {surveyTANs?.map((tan) => (
                                                <Badge
                                                    key={tan.code}
                                                    variant="white"
                                                    color="violet"
                                                    size="sm"
                                                    tt="none"
                                                    td={tan.isUsed ? 'line-through' : undefined}
                                                    c={tan.isUsed ? 'dimmed' : 'violet.6'}
                                                >
                                                    {tan.code}
                                                </Badge>
                                            ))}
                                        </Group>
                                    )}
                                </Box>
                            )}
                        </Card>
                    )}
                    <Title order={5} c="violet.6" mt="xl" mb="sm">
                        {t('SURVEYS.EXECUTION.ADDITIONAL_SETTINGS')}
                    </Title>
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        <Card padding="md" radius="md" bg="violet.0">
                            <Flex direction="column" gap="xs">
                                <Text size="sm" fw={600} c="violet.6">
                                    {t('SURVEYS.EXECUTION.SECTION_ACCESS')}
                                </Text>
                                <EDISelect
                                    label={t('SURVEYS.FIELDS.EXECUTION_MODE')}
                                    placeholder={t('SURVEYS.FIELDS.EXECUTION_MODE_PLACEHOLDER')}
                                    value={executionMode}
                                    onChange={(value) =>
                                        setExecutionMode(value as SurveyExecutionMode)
                                    }
                                    required
                                    data={Object.keys(SURVEY_EXECUTION_MODE_STRINGS)
                                        .filter(
                                            (key) =>
                                                key !== SurveyExecutionMode.PERSONAL ||
                                                executionMode === SurveyExecutionMode.PERSONAL
                                        )
                                        .map((key) => ({
                                            value: key,
                                            label: SURVEY_EXECUTION_MODE_STRINGS[
                                                key as SurveyExecutionMode
                                            ],
                                        }))}
                                />
                                <Group
                                    grow
                                    preventGrowOverflow={false}
                                    align="flex-start"
                                >
                                    <SVHDateTimePicker
                                        label={t('SURVEYS.EXECUTION.START_DATE')}
                                        placeholder={t('SURVEYS.EXECUTION.START_DATE_PLACEHOLDER')}
                                        value={startDate}
                                        onChange={setStartDate}
                                        valueFormat="DD.MM.YYYY HH:mm"
                                        clearable
                                    />
                                    <SVHDateTimePicker
                                        label={t('SURVEYS.EXECUTION.END_DATE')}
                                        placeholder={t('SURVEYS.EXECUTION.END_DATE_PLACEHOLDER')}
                                        value={endDate}
                                        onChange={setEndDate}
                                        valueFormat="DD.MM.YYYY HH:mm"
                                        clearable
                                    />
                                </Group>
                            </Flex>
                        </Card>
                        <Card padding="md" radius="md" bg="violet.0">
                            <Flex direction="column" gap="xs">
                                <Text size="sm" fw={600} c="violet.6">
                                    {t('SURVEYS.EXECUTION.SECTION_DISPLAY')}
                                </Text>
                                <EDITextInput
                                    label={t('SURVEYS.EXECUTION.REDIRECTION_URL')}
                                    placeholder={t('SURVEYS.EXECUTION.REDIRECTION_URL_PLACEHOLDER')}
                                    value={redirectionUrl}
                                    onChange={(event) =>
                                        setRedirectionUrl(event.currentTarget.value)
                                    }
                                    rightSectionPointerEvents="all"
                                    rightSection={
                                        <Tooltip
                                            label={t('SURVEYS.EXECUTION.REDIRECTION_URL_TOOLTIP')}
                                            multiline
                                            w={240}
                                        >
                                            <ThemeIcon radius="xl" size="sm" color="violet">
                                                <IconQuestionMark size={14} />
                                            </ThemeIcon>
                                        </Tooltip>
                                    }
                                />
                                <Switch
                                    mt="xs"
                                    size="sm"
                                    label={t('SURVEYS.EXECUTION.SHOW_QUESTION_NUMBERS')}
                                    description={t('SURVEYS.EXECUTION.SHOW_QUESTION_NUMBERS_DESCRIPTION')}
                                    checked={showQuestionNumbers}
                                    onChange={(event) =>
                                        setShowQuestionNumbers(event.currentTarget.checked)
                                    }
                                />
                            </Flex>
                        </Card>
                    </SimpleGrid>
                    <Group justify="flex-end" mt="md">
                        <Button onClick={handleOptionsSave} disabled={optionsUnchanged}>
                            {t('SURVEYS.EXECUTION.SAVE')}
                        </Button>
                    </Group>
                </Tabs.Panel>
            )}
            <Tabs.Panel value="questions" p="md">
                {props.questionsTab}
            </Tabs.Panel>

            <Tabs.Panel value="results" p="md">
                <Title order={4} c="violet.6" mb="xs">
                    {t('SURVEYS.RESULTS.SECTION_GENERAL')}
                </Title>
                <Flex direction="row" gap="md" align="flex-start" mb="md">
                    {hasPermission && (
                        <EDIDeleteDialog
                            title={t('SURVEYS.RESULTS.DELETE_TITLE')}
                            description={t('SURVEYS.RESULTS.DELETE_DESCRIPTION')}
                            onClose={() => setResultDelete(false)}
                            onSubmit={() => {
                                setResultDelete(false);
                                props.onResultsDelete();
                            }}
                            visible={resultDelete}
                            type="CONFIRM"
                        />
                    )}
                    <EDIStatisticsCards
                        data={[
                            {
                                title: t('SURVEYS.RESULTS.COUNT_TITLE'),
                                value: props.results.length || 0,
                                icon: <IconClipboardText />,
                            },
                        ]}
                        cols={1}
                        mt={1}
                    />
                    <Flex direction="column" gap="sm">
                        <SurveyResultsCSV
                            results={props.results}
                            components={props.components}
                        >
                            <Button variant="default">
                                {t('SURVEYS.RESULTS.DOWNLOAD')}
                            </Button>
                        </SurveyResultsCSV>
                        {hasPermission && (
                            <Button
                                variant="default"
                                onClick={() => setResultDelete(true)}
                            >
                                {t('SURVEYS.RESULTS.DELETE')}
                            </Button>
                        )}
                    </Flex>
                </Flex>
                {hasPermission && (
                    <Box bg="violet.0" p="md" mb="md" style={{ borderRadius: 16 }}>
                        <Title order={4} c="violet.6" mb="xs">
                            {t('SURVEYS.RESULTS.SECTION_PUBLISHING')}
                        </Title>
                        <Flex direction="row" gap="md" align="center">
                            <Switch
                                onLabel={t('COMMON.ACTIVE')}
                                offLabel={t('COMMON.INACTIVE')}
                                size="lg"
                                checked={!!props.data.options.resultsSharing}
                                onChange={(event) =>
                                    props.onUpdate({
                                        options: {
                                            resultsSharing: event.currentTarget.checked,
                                        },
                                    })
                                }
                            />
                            <Box style={{ flex: 1 }}>
                                <Text fw={500} size="sm">
                                    {t('SURVEYS.RESULTS.SHARING')}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {t('SURVEYS.RESULTS.SHARING_DESCRIPTION')}
                                </Text>
                            </Box>
                            {props.data.options.resultsSharing && (
                                <Group gap="xs">
                                    <ActionIcon
                                        variant="subtle"
                                        color="violet"
                                        component="a"
                                        href={resultsLink}
                                        target="_blank"
                                    >
                                        <IconExternalLink />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="subtle"
                                        color="violet"
                                        onClick={() => {
                                            clipboard.copy(resultsLink);
                                            NotificationHandler.showInfo(
                                                t('SURVEYS.RESULTS.COPY_RESULTS_LINK_SUCCESS')
                                            );
                                        }}
                                    >
                                        <IconLink />
                                    </ActionIcon>
                                </Group>
                            )}
                        </Flex>
                    </Box>
                )}
                <SurveyResults
                    data={{
                        components: props.components,
                        results: props.results,
                    }}
                />
            </Tabs.Panel>
        </SVHTabs>
    );
};

export default SurveyTabs;
