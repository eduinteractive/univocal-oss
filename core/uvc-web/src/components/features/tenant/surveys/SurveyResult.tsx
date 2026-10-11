/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ActionIcon,
    Box,
    Card,
    Center,
    Group,
    Menu,
    Overlay,
    Table,
    Text,
    Title,
} from '@mantine/core';
import {
    BarChart,
    DonutChart,
    PieChart,
    RadarChart,
    WaffleChart,
} from '@mantine/charts';
import WordCloud from 'react-d3-cloud';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    IconChartBar,
    IconChartDonut,
    IconChartPie,
    IconChartRadar,
    IconDownload,
    IconGridDots,
    IconTable,
} from '@tabler/icons-react';
import html2canvas from 'html2canvas';
import { SurveyComponentWithResults } from './SurveyResults';
import {
    SurveyComponentChoice,
    SurveyComponentLikert,
    SurveyComponentNominal,
    SurveyComponentType,
} from '@eduinteractive/uvc-api';
import { SurveyComponentNominalScale } from '../../../../constants/Enums';
import { useTranslation } from 'react-i18next';

enum SurveyResultView {
    TABLE = 'TABLE',
    CHART = 'CHART',
}

enum SurveyChartType {
    BAR = 'BAR',
    PIE = 'PIE',
    DONUT = 'DONUT',
    RADAR = 'RADAR',
    WAFFLE = 'WAFFLE',
}

const CHART_COLORS = [
    'violet.6',
    'pink.6',
    'yellow.6',
    'grape.6',
    'indigo.6',
    'cyan.6',
    'teal.6',
    'orange.6',
    'lime.6',
    'red.6',
];

const SINGLE_CHART_TYPES = [
    SurveyChartType.BAR,
    SurveyChartType.PIE,
    SurveyChartType.DONUT,
    SurveyChartType.RADAR,
    SurveyChartType.WAFFLE,
];

const MULTI_CHOICE_CHART_TYPES = [SurveyChartType.BAR, SurveyChartType.RADAR];

const formatCountWithPercent = (count: number, total: number) => {
    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
    return `${count} (${percent}%)`;
};

const countIndex = (results: unknown[], index: number) =>
    results.reduce<number>(
        (acc, result) => acc + (result === index ? 1 : 0),
        0
    );

const countChoice = (results: unknown[], index: number) =>
    results.reduce<number>((acc, result) => {
        if (Array.isArray(result)) {
            return acc + result.filter((entry) => entry === index).length;
        }
        return acc + (result === index ? 1 : 0);
    }, 0);

const chartTypeIcon = (type: SurveyChartType) => {
    switch (type) {
        case SurveyChartType.BAR:
            return <IconChartBar size={16} />;
        case SurveyChartType.PIE:
            return <IconChartPie size={16} />;
        case SurveyChartType.DONUT:
            return <IconChartDonut size={16} />;
        case SurveyChartType.RADAR:
            return <IconChartRadar size={16} />;
        case SurveyChartType.WAFFLE:
            return <IconGridDots size={16} />;
    }
};

interface SurveyResultProps {
    data: SurveyComponentWithResults;
}

const SurveyResult = (props: SurveyResultProps): React.ReactNode => {
    const { t } = useTranslation();
    const [view, setView] = useState<SurveyResultView>(SurveyResultView.CHART);
    const [chartType, setChartType] = useState<SurveyChartType>(SurveyChartType.BAR);

    const chartRef = useRef<HTMLDivElement>(null);
    const totalAnswers = props.data.results.length;

    const isMultipleChoice =
        props.data.type === SurveyComponentType.CHOICE &&
        !!(props.data as unknown as SurveyComponentChoice).multiple;

    const availableChartTypes = useMemo(() => {
        if (
            props.data.type === SurveyComponentType.LIKERT ||
            props.data.type === SurveyComponentType.NOMINAL
        ) {
            return SINGLE_CHART_TYPES;
        }
        if (props.data.type === SurveyComponentType.CHOICE) {
            return isMultipleChoice ? MULTI_CHOICE_CHART_TYPES : SINGLE_CHART_TYPES;
        }
        return [];
    }, [props.data.type, isMultipleChoice]);

    useEffect(() => {
        if (
            availableChartTypes.length > 0 &&
            !availableChartTypes.includes(chartType)
        ) {
            setChartType(SurveyChartType.BAR);
        }
    }, [availableChartTypes, chartType]);

    const categoricalChartData = useMemo(() => {
        if (props.data.type === SurveyComponentType.LIKERT) {
            return (props.data as unknown as SurveyComponentLikert).scale.labels.map(
                (label, index) => ({
                    label,
                    name: label,
                    value: countIndex(props.data.results, index),
                    color: CHART_COLORS[index % CHART_COLORS.length],
                })
            );
        }
        if (props.data.type === SurveyComponentType.CHOICE) {
            return (props.data as unknown as SurveyComponentChoice).choices.map(
                (choice, index) => ({
                    label: choice,
                    name: choice,
                    value: countChoice(props.data.results, index),
                    color: CHART_COLORS[index % CHART_COLORS.length],
                })
            );
        }
        if (props.data.type === SurveyComponentType.NOMINAL) {
            return SurveyComponentNominalScale[
                (props.data as unknown as SurveyComponentNominal).nominalType
            ].map((label, index) => ({
                label,
                name: label,
                value: countIndex(props.data.results, index),
                color: CHART_COLORS[index % CHART_COLORS.length],
            }));
        }
        return [];
    }, [props.data]);

    const handleDownloadPng = async () => {
        if (!chartRef.current) return;
        const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#FFFFFF',
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'chart.png';
        link.click();
    };

    const renderCategoricalChart = () => {
        const data = categoricalChartData;
        const percent = (value: number) => formatCountWithPercent(value, totalAnswers);

        switch (chartType) {
            case SurveyChartType.PIE:
                return (
                    <Center mt="xl" mb="lg">
                        <PieChart
                            data={data}
                            withLabels
                            withTooltip
                            withLegend
                            labelsType="percent"
                            size={220}
                            valueFormatter={percent}
                        />
                    </Center>
                );
            case SurveyChartType.DONUT:
                return (
                    <Center mt="xl" mb="lg">
                        <DonutChart
                            data={data}
                            withLabels
                            withTooltip
                            withLegend
                            size={220}
                            valueFormatter={percent}
                        />
                    </Center>
                );
            case SurveyChartType.RADAR:
                return (
                    <RadarChart
                        mt="xl"
                        mb="lg"
                        h={280}
                        w="100%"
                        data={data}
                        dataKey="label"
                        series={[
                            {
                                name: 'value',
                                color: 'violet.6',
                                label: t('SURVEYS.RESULTS.ANSWERS'),
                            },
                        ]}
                        withPolarGrid
                        withPolarAngleAxis
                        withPolarRadiusAxis
                        withTooltip
                    />
                );
            case SurveyChartType.WAFFLE:
                return (
                    <Center mt="xl" mb="lg">
                        <WaffleChart
                            data={data}
                            total={Math.max(totalAnswers, 1)}
                            withLegend
                            withTooltip
                            getTooltipLabel={(cell) =>
                                `${cell.name}: ${percent(cell.value)}`
                            }
                        />
                    </Center>
                );
            case SurveyChartType.BAR:
            default:
                return (
                    <BarChart
                        mt="xl"
                        mb="lg"
                        h={180}
                        w="100%"
                        data={data}
                        dataKey="label"
                        series={[
                            {
                                name: 'value',
                                color: 'violet.6',
                                label: t('SURVEYS.RESULTS.ANSWERS'),
                            },
                        ]}
                        withBarValueLabel
                        valueFormatter={percent}
                        valueLabelProps={{
                            formatter: (value) => percent(Number(value)),
                        }}
                        yAxisProps={{
                            tickMargin: 10,
                            tickSize: 10,
                            interval: 1,
                            tickFormatter: (value: number) =>
                                Math.floor(value).toString(),
                            domain: [0, Math.max(totalAnswers, 1)],
                        }}
                    />
                );
        }
    };

    const renderChartComponent = () => {
        return (
            <>
                {availableChartTypes.length > 0 && renderCategoricalChart()}
                {props.data.type === SurveyComponentType.OPEN && (
                    <Group mih={150} align="flex-start">
                        {props.data.results.map((result: any, index: number) =>
                            result ? (
                                <Text
                                    key={index}
                                    mt="sm"
                                    size="xs"
                                    style={{
                                        display: 'flex',
                                        borderRadius: 5,
                                    }}
                                    px="xs"
                                    py={2.5}
                                    bg="gray.2"
                                >
                                    {result as string}
                                </Text>
                            ) : null
                        )}
                    </Group>
                )}
                {props.data.type === SurveyComponentType.WORDCLOUD && (
                    <Box mah={300}>
                        <WordCloud
                            padding={10}
                            width={300}
                            height={100}
                            fontSize={(word) => {
                                const wordCounts = props.data.results.reduce(
                                    (
                                        acc: Record<string, number>,
                                        result: unknown
                                    ) => {
                                        if (typeof result === 'string') {
                                            acc[result] =
                                                (acc[result] || 0) + 1; // Zähle das Wort
                                        }
                                        return acc;
                                    },
                                    {}
                                );

                                // Umwandlung in ein Array von Objekten
                                const words = Object.entries(wordCounts).map(
                                    ([text, value]) => ({ text, value })
                                );

                                // Schritt 2: Finde die maximale Häufigkeit, um die relative Schriftgröße zu berechnen
                                const maxValue = Math.max(
                                    ...words.map((word: any) => word.value)
                                );

                                const normalizedSize =
                                    (word.value / maxValue) * (30 - 10) + 10;
                                return Math.min(
                                    30,
                                    Math.max(10, normalizedSize)
                                );
                            }}
                            data={Object.entries(
                                props.data.results.reduce(
                                    (
                                        acc: Record<string, number>,
                                        result: unknown
                                    ) => {
                                        if (typeof result === 'string') {
                                            acc[result] =
                                                (acc[result] || 0) + 1; // Zähle das Wort
                                        }
                                        return acc;
                                    },
                                    {}
                                )
                            ).map(([text, value]: any) => ({ text, value }))}
                        />
                    </Box>
                )}
            </>
        );
    };

    const renderTableComponent = () => {
        const naCount = props.data.results.reduce(
            (acc: number, result: any) => {
                // Increment count if the result matches the current index (Likert scale response)
                return (
                    acc +
                    (result === null ||
                    result === '' ||
                    result === undefined
                        ? 1
                        : 0)
                );
            },
            0
        );
        if (props.data.type === SurveyComponentType.LIKERT) {
            const results = (
                props.data as unknown as SurveyComponentLikert
            ).scale.labels.map((label, index) => {
                const count = props.data.results.reduce(
                    (acc: number, result: any) => {
                        // Increment count if the result matches the current index (Likert scale response)
                        return acc + (result === index ? 1 : 0);
                    },
                    0
                );
                return {
                    label, // Label for the bar chart (e.g., 'Strongly Agree')
                    value: count, // Count of how many times this label was chosen
                };
            });
            results.push({
                label: t('SURVEYS.RESULTS.NO_ANSWER'),
                value: naCount,
            });
            results.push({
                label: t('SURVEYS.RESULTS.ANSWERS'),
                value: props.data.results.length,
            });
            return (
                <Table
                    withColumnBorders
                    withRowBorders
                    withTableBorder
                    striped
                    my="md"
                >
                    <Table.Tbody>
                        {results.map((result, index) => (
                            <Table.Tr
                                key={index}
                                style={{
                                    borderBottom:
                                        index === results.length - 3
                                            ? '2px solid #dee2e6'
                                            : 'none',
                                }}
                            >
                                <Table.Td w="50%">{result.label}</Table.Td>
                                <Table.Td w="50%">
                                    {index === results.length - 1
                                        ? result.value
                                        : formatCountWithPercent(
                                              result.value,
                                              totalAnswers
                                          )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            );
        }

        if (props.data.type === SurveyComponentType.CHOICE) {
            const results = (
                props.data as unknown as SurveyComponentChoice
            ).choices.map((choice, index) => {
                // Calculate the count of how many times this choice was selected
                const count = countChoice(props.data.results, index);
                return {
                    label: choice, // Label für das BarChart (z.B. 'Wahl A')
                    value: count, // Anzahl, wie oft diese Wahlmöglichkeit gewählt wurde
                };
            });

            results.push({
                label: t('SURVEYS.RESULTS.NO_ANSWER'),
                value: naCount,
            });

            results.push({
                label: t('SURVEYS.RESULTS.ANSWERS'),
                value: props.data.results.length,
            });

            return (
                <Table
                    withColumnBorders
                    withRowBorders
                    withTableBorder
                    striped
                    my="md"
                >
                    <Table.Tbody>
                        {results.map((result, index) => (
                            <Table.Tr
                                key={index}
                                style={{
                                    borderBottom:
                                        index === results.length - 3
                                            ? '2px solid #dee2e6'
                                            : 'none',
                                }}
                            >
                                <Table.Td w="50%">{result.label}</Table.Td>
                                <Table.Td w="50%">
                                    {index === results.length - 1
                                        ? result.value
                                        : formatCountWithPercent(
                                              result.value,
                                              totalAnswers
                                          )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            );
        }

        if (props.data.type === SurveyComponentType.OPEN) {
            const results = [
                ...props.data.results
                    .filter((result: any) => result)
                    .map((result: any) => result),
            ];

            results.push(`${t('SURVEYS.RESULTS.NO_ANSWER')}: ${naCount}`);

            results.push(`${t('SURVEYS.RESULTS.ANSWERS')}: ${props.data.results.length}`);

            return (
                <Table
                    withColumnBorders
                    withRowBorders
                    withTableBorder
                    striped
                    my="md"
                >
                    <Table.Tbody>
                        {results.map((result, index) => (
                            <Table.Tr
                                key={index}
                                style={{
                                    borderBottom:
                                        index === results.length - 3
                                            ? '2px solid #dee2e6'
                                            : 'none',
                                }}
                            >
                                <Table.Td w="50%">{result as string}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            );
        }

        if (props.data.type === SurveyComponentType.WORDCLOUD) {
            const results = Object.entries(
                props.data.results.reduce(
                    (acc: Record<string, number>, result: any) => {
                        if (result) {
                            acc[result as string] =
                                (acc[result as string] || 0) + 1; // Zähle das Wort
                        }
                        return acc;
                    },
                    {}
                )
            ).map(([text, value]) => ({ text, value: Number(value) }));

            results.push({
                text: t('SURVEYS.RESULTS.NO_ANSWER'),
                value: naCount,
            });

            results.push({
                text: t('SURVEYS.RESULTS.ANSWERS'),
                value: props.data.results.length,
            });

            return (
                <Table
                    withColumnBorders
                    withRowBorders
                    withTableBorder
                    striped
                    my="md"
                >
                    <Table.Tbody>
                        {results.map((result, index) => (
                            <Table.Tr
                                key={index}
                                style={{
                                    borderBottom:
                                        index === results.length - 3
                                            ? '2px solid #dee2e6'
                                            : 'none',
                                }}
                            >
                                <Table.Td w="50%">{result.text}</Table.Td>
                                <Table.Td w="50%">
                                    {index >= results.length - 2
                                        ? result.value
                                        : formatCountWithPercent(
                                              result.value,
                                              totalAnswers
                                          )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            );
        }

        if (props.data.type === SurveyComponentType.NOMINAL) {
            const results = SurveyComponentNominalScale[
                (props.data as unknown as SurveyComponentNominal).nominalType
            ].map((label: string, index: number) => {
                const count = props.data.results.reduce(
                    (acc: number, result: any) => {
                        // Increment count if the result matches the current index (Likert scale response)
                        return acc + (result === index ? 1 : 0);
                    },
                    0
                );
                return {
                    label, // Label for the bar chart (e.g., 'Strongly Agree')
                    value: count, // Count of how many times this label was chosen
                };
            });
            results.push({
                label: t('SURVEYS.RESULTS.NO_ANSWER'),
                value: naCount,
            });
            results.push({
                label: t('SURVEYS.RESULTS.ANSWERS'),
                value: props.data.results.length,
            });
            return (
                <Table
                    withColumnBorders
                    withRowBorders
                    withTableBorder
                    striped
                    my="md"
                >
                    <Table.Tbody>
                        {results.map((result, index) => (
                            <Table.Tr
                                key={index}
                                style={{
                                    borderBottom:
                                        index === results.length - 3
                                            ? '2px solid #dee2e6'
                                            : 'none',
                                }}
                            >
                                <Table.Td w="50%">{result.label}</Table.Td>
                                <Table.Td w="50%">
                                    {index === results.length - 1
                                        ? result.value
                                        : formatCountWithPercent(
                                              result.value,
                                              totalAnswers
                                          )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            );
        }

        return null;
    };

    if (props.data.type === SurveyComponentType.TEXT) return null;

    return (
        <Card
            shadow="xs"
            padding="md"
            radius={25}
            my="md"
            mih={200}
            ref={chartRef}
            bg="white"
            w="100%"
        >
            <Box>
                <Title order={5} c="edi-color">
                    {props.data.title}
                </Title>
                {view === SurveyResultView.CHART && renderChartComponent()}
                {view === SurveyResultView.TABLE && renderTableComponent()}
            </Box>
            <Group justify="space-between" align="end" flex={1}>
                <Group>
                    <ActionIcon
                        variant={view === SurveyResultView.TABLE ? 'light' : 'subtle'}
                        size="md"
                        onClick={() => setView(SurveyResultView.TABLE)}
                    >
                        <IconTable />
                    </ActionIcon>
                    {availableChartTypes.length > 0 ? (
                        <Menu shadow="md" width={220} position="top-start">
                            <Menu.Target>
                                <ActionIcon
                                    variant={
                                        view === SurveyResultView.CHART
                                            ? 'light'
                                            : 'subtle'
                                    }
                                    size="md"
                                    onClick={() => setView(SurveyResultView.CHART)}
                                >
                                    <IconChartPie />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>{t('SURVEYS.RESULTS.CHART_TYPE')}</Menu.Label>
                                {availableChartTypes.map((type) => (
                                    <Menu.Item
                                        key={type}
                                        leftSection={chartTypeIcon(type)}
                                        onClick={() => {
                                            setChartType(type);
                                            setView(SurveyResultView.CHART);
                                        }}
                                    >
                                        {t(`SURVEYS.RESULTS.CHART_${type}`)}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>
                    ) : (
                        <ActionIcon
                            variant={view === SurveyResultView.CHART ? 'light' : 'subtle'}
                            size="md"
                            onClick={() => setView(SurveyResultView.CHART)}
                        >
                            <IconChartPie />
                        </ActionIcon>
                    )}
                    <ActionIcon
                        variant="subtle"
                        size="md"
                        onClick={handleDownloadPng}
                    >
                        <IconDownload />
                    </ActionIcon>
                </Group>
                <Text c="dimmed" size="sm" mt="sm">
                    {props.data.results.length} {t('SURVEYS.RESULTS.ANSWERS')}
                </Text>
            </Group>
            {props.data.results.length === 0 && (
                <>
                    <Overlay color="#000" backgroundOpacity={0.5} blur={10} />
                    <Text
                        ta="center"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 201,
                        }}
                        c="white"
                        fw="bold"
                    >
                        {t('SURVEYS.RESULTS.QUESTION')} {props.data.title} <br />
                        <br />
                        <span style={{ fontWeight: 500 }}>
                            {t('SURVEYS.RESULTS.NO_ANSWERS_MESSAGE')}
                        </span>
                    </Text>
                </>
            )}
        </Card>
    );
};

export default SurveyResult;
