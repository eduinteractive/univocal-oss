import {
    ActionIcon,
    Anchor,
    Box,
    Button,
    Flex,
    Group,
    Switch,
    Tabs,
    Text,
    Title,
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
    IconEdit,
    IconFileDescription,
    IconPresentation,
    IconQuestionMark,
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
    EDIStatisticsCards,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import SurveyResultsCSV from './SurveyResultsCSV';
import { useAuth } from '../../../../context/AuthContext';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import SurveyResults from './SurveyResults';
import SVHQRPDF from '../../../common/SVHQRPDF';
import SVHTabs from '../../../common/SVHTabs';
import { useTranslation } from 'react-i18next';

interface SurveyTabsSubmitData {
    options: {
        isActive: boolean;
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
    const [resultDelete, setResultDelete] = useState(false);

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

    const surveyTANs = useMemo(
        () => props.data.options.tans,
        [props.data.options.tans]
    );

    const surveyQRCode = useMemo(
        () => <QRCode id="surveyQR" value={surveyLink} size={100} />,
        [surveyLink]
    );

    useEffect(() => {
        setIsExecutionActive(props.data?.options.isActive);
    }, [props.data]);

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
                    <Group align="center" gap="xl" justify="center">
                        <Flex justify="center" w={150}>
                            <Switch
                                onLabel={t('COMMON.ACTIVE')}
                                offLabel={t('COMMON.INACTIVE')}
                                size="lg"
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
                        </Flex>
                        <Box style={{ flex: 1 }}>
                            <Text>{t('SURVEYS.EXECUTION.ACTIVATE')}</Text>
                            <Text size="xs" c="dimmed">
                                {t('SURVEYS.EXECUTION.ACTIVATE_DESCRIPTION')}
                            </Text>
                        </Box>
                    </Group>
                    {props.data.options.isActive && (
                        <Group
                            align="flex-start"
                            gap="sm"
                            p="md"
                            bg="gray.0"
                            style={{
                                border: 'calc(0.125rem*var(--mantine-scale)) solid var(--mantine-color-gray-3)',
                            }}
                            mt="md"
                            w="100%"
                        >
                            <Flex direction="column" gap="sm" w="100%">
                                <Flex
                                    direction="row"
                                    gap="xl"
                                    justify="space-between"
                                    flex={1}
                                    pr="xl"
                                >
                                    <Flex direction="column">
                                        <Title order={6} c="dimmed">
                                            {t('SURVEYS.EXECUTION.INFO_TITLE')}
                                        </Title>
                                        <Text size="sm">
                                            {t('SURVEYS.EXECUTION.SURVEY_ID')} {props.data?._id}
                                        </Text>
                                        <Text size="sm">
                                            {t('SURVEYS.EXECUTION.SURVEY_MODE')}{' '}
                                            {
                                                SURVEY_EXECUTION_MODE_STRINGS[
                                                    props.data?.options
                                                        .executionMode
                                                ]
                                            }
                                        </Text>
                                        <Group wrap="wrap" gap="sm" mt="md">
                                            <Button
                                                variant="default"
                                                onClick={() => {
                                                    clipboard.copy(surveyLink);
                                                    NotificationHandler.showInfo(
                                                        t('SURVEYS.EXECUTION.COPY_LINK_SUCCESS')
                                                    );
                                                }}
                                            >
                                                {t('SURVEYS.EXECUTION.COPY_LINK')}
                                            </Button>
                                            <PDFDownloadLink
                                                document={
                                                    <SVHQRPDF
                                                        link={surveyLink}
                                                        title={props.data.title}
                                                        generationNotice={t('COMMON.GENERATION_NOTICE')}
                                                    />
                                                }
                                                fileName={t('SURVEYS.PDF.QR_CODE_FILENAME')}
                                            >
                                                <Button variant="default">
                                                    {t('SURVEYS.EXECUTION.QR_CODE_PRINT')}
                                                </Button>
                                            </PDFDownloadLink>
                                            {props.data.options
                                                .executionMode ===
                                                SurveyExecutionMode.TAN && (
                                                <>
                                                    <PDFDownloadLink
                                                        document={
                                                            <SurveyCodesPDF
                                                                survey={
                                                                    props.data
                                                                }
                                                                link={
                                                                    surveyLink
                                                                }
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
                                                        <Button variant="default">
                                                            {t('SURVEYS.EXECUTION.CODES_DOWNLOAD')}
                                                        </Button>
                                                    </PDFDownloadLink>
                                                    <EDIModal
                                                        title={t('SURVEYS.EXECUTION.CODES_GENERATE_MODAL_TITLE')}
                                                        onSubmit={() => {
                                                            if (genAmount < 1) {
                                                                return NotificationHandler.showError(
                                                                    t('SURVEYS.ERRORS.CODES_AMOUNT_MIN')
                                                                );
                                                            }
                                                            props.onGenerateCodes(
                                                                genAmount
                                                            );
                                                            setGenModalVisible(
                                                                false
                                                            );
                                                        }}
                                                        onClose={() =>
                                                            setGenModalVisible(
                                                                false
                                                            )
                                                        }
                                                        visible={
                                                            genModalVisible
                                                        }
                                                        type="DEFAULT"
                                                    >
                                                        <EDINumberInput
                                                            label={t('SURVEYS.EXECUTION.CODES_AMOUNT_LABEL')}
                                                            value={genAmount}
                                                            onChange={(value) =>
                                                                setGenAmount(
                                                                    value as number
                                                                )
                                                            }
                                                            min={1}
                                                        />
                                                    </EDIModal>
                                                    <Button
                                                        variant="default"
                                                        onClick={() =>
                                                            setGenModalVisible(
                                                                true
                                                            )
                                                        }
                                                    >
                                                        {t('SURVEYS.EXECUTION.CODES_GENERATE')}
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        onClick={() => {
                                                            props.onResetCodes();
                                                        }}
                                                    >
                                                        {t('SURVEYS.EXECUTION.CODES_DELETE')}
                                                    </Button>
                                                </>
                                            )}
                                        </Group>
                                        {props.data.options.executionMode ===
                                            SurveyExecutionMode.TAN && (
                                            <>
                                                <UnstyledButton
                                                    onClick={toggle}
                                                    mt="md"
                                                    c="dimmed"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent:
                                                            'flex-start',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <Text size="sm" mr={5}>
                                                        {t('SURVEYS.EXECUTION.CODES_SHOW')}
                                                    </Text>
                                                    {tanOpened ? (
                                                        <IconChevronUp />
                                                    ) : (
                                                        <IconChevronDown />
                                                    )}
                                                </UnstyledButton>
                                                {tanOpened && (
                                                    <Flex
                                                        direction="row"
                                                        gap="sm"
                                                        wrap="wrap"
                                                        justify="stretch"
                                                        mt="sm"
                                                    >
                                                        {surveyTANs?.length ===
                                                            0 && (
                                                            <Text
                                                                c="dimmed"
                                                                size="sm"
                                                            >
                                                                {t('SURVEYS.EXECUTION.CODES_EMPTY')}
                                                            </Text>
                                                        )}
                                                        {surveyTANs?.map(
                                                            (tan) => (
                                                                <Text
                                                                    key={
                                                                        tan.code
                                                                    }
                                                                    c="dimmed"
                                                                    size="xs"
                                                                    td={
                                                                        tan.isUsed
                                                                            ? 'line-through'
                                                                            : ''
                                                                    }
                                                                >
                                                                    {tan.code}
                                                                </Text>
                                                            )
                                                        )}
                                                    </Flex>
                                                )}
                                            </>
                                        )}
                                    </Flex>
                                    <Flex direction="column" gap="sm">
                                        {surveyQRCode}
                                        <Anchor
                                            fw={600}
                                            target="_blank"
                                            ta="center"
                                            size="xs"
                                            href={surveyLink}
                                        >
                                            {t('SURVEYS.EXECUTION.LINK_TO_SURVEY')}
                                        </Anchor>
                                    </Flex>
                                </Flex>
                            </Flex>
                        </Group>
                    )}
                </Tabs.Panel>
            )}
            <Tabs.Panel value="questions" p="md">
                {props.questionsTab}
            </Tabs.Panel>

            <Tabs.Panel value="results" p="md">
                <Flex direction="row" gap="xl">
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
