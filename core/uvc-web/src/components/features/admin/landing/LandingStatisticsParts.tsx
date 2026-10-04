import type {
    LandingConversionRow,
    LandingCount,
} from '@eduinteractive/uvc-api';
import {
    Badge,
    Card,
    Group,
    Progress,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { BarsList, MatrixChart, SankeyChart } from '@mantine/charts';
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconInfoCircle,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
    WEEKDAYS,
    formatNumber,
    formatPercent,
    pathLabel,
} from './LandingStatisticsFormat';

const deltaPercent = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / previous) * 100;
};

export const KpiCard = ({
    label,
    value,
    current,
    previous,
    lowerIsBetter,
    hint,
}: {
    label: string;
    value: string;
    current: number;
    previous: number;
    lowerIsBetter?: boolean;
    hint?: string;
}) => {
    const delta = deltaPercent(current, previous);
    const improved = delta !== null && (lowerIsBetter ? delta < 0 : delta > 0);
    const worsened = delta !== null && (lowerIsBetter ? delta > 0 : delta < 0);
    return (
        <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap={4}>
                <Group gap={4} wrap="nowrap">
                    <Text size="sm" c="dimmed">
                        {label}
                    </Text>
                    {hint && (
                        <Tooltip label={hint} multiline w={260} withArrow>
                            <IconInfoCircle
                                size={14}
                                color="var(--mantine-color-dimmed)"
                            />
                        </Tooltip>
                    )}
                </Group>
                <Text size="xl" fw={700}>
                    {value}
                </Text>
                <Group gap={6}>
                    {delta === null ? (
                        <Badge variant="light" color="gray" size="sm">
                            neu
                        </Badge>
                    ) : (
                        <Badge
                            variant="light"
                            size="sm"
                            color={
                                improved ? 'teal' : worsened ? 'red' : 'gray'
                            }
                            leftSection={
                                delta >= 0 ? (
                                    <IconArrowUpRight size={12} />
                                ) : (
                                    <IconArrowDownRight size={12} />
                                )
                            }
                        >
                            {formatNumber(Math.abs(delta), 1)} %
                        </Badge>
                    )}
                    <Text size="xs" c="dimmed">
                        zum Vorzeitraum
                    </Text>
                </Group>
            </Stack>
        </Card>
    );
};

export const Panel = ({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) => (
    <Card withBorder shadow="sm" radius="md" p="lg">
        <Stack gap="sm">
            <Stack gap={2}>
                <Title order={4}>{title}</Title>
                {description && (
                    <Text size="sm" c="dimmed">
                        {description}
                    </Text>
                )}
            </Stack>
            {children}
        </Stack>
    </Card>
);

export const Empty = () => (
    <Text size="sm" c="dimmed">
        Keine Daten im Zeitraum
    </Text>
);

export const ShareRow = ({
    label,
    share,
    value,
    color = 'violet.4',
    labelWidth = 220,
}: {
    label: string;
    share: number;
    value: string;
    color?: string;
    labelWidth?: number;
}) => (
    <Group gap="xs" wrap="nowrap">
        <Tooltip label={label} openDelay={400}>
            <Text size="sm" w={labelWidth} truncate>
                {label}
            </Text>
        </Tooltip>
        <Progress value={Math.min(share, 100)} flex={1} color={color} />
        <Text size="sm" w={70} ta="right">
            {value}
        </Text>
    </Group>
);

export const CountBars = ({
    title,
    description,
    rows,
    label = (value: string) => value,
    limit = 12,
}: {
    title: string;
    description?: string;
    rows: LandingCount[];
    label?: (value: string) => string;
    limit?: number;
}) => {
    const visible = rows.slice(0, limit);
    return (
        <Panel title={title} description={description}>
            {visible.length === 0 ? (
                <Empty />
            ) : (
                <BarsList
                    data={visible.map((row) => ({
                        name: label(row.label),
                        value: row.value,
                        color: 'violet',
                    }))}
                    valueFormatter={(value) => formatNumber(value)}
                    minBarSize={96}
                    barHeight={28}
                />
            )}
        </Panel>
    );
};

export const PageFlow = ({
    rows,
    limit = 15,
}: {
    rows: { from: string; to: string; value: number }[];
    limit?: number;
}) => {
    const flows = rows.filter((row) => row.value > 0).slice(0, limit);
    if (flows.length === 0) return <Empty />;

    const sources: string[] = [];
    const targets: string[] = [];
    const sourceIndex = new Map<string, number>();
    const targetIndex = new Map<string, number>();
    for (const flow of flows) {
        if (!sourceIndex.has(flow.from)) {
            sourceIndex.set(flow.from, sources.length);
            sources.push(flow.from);
        }
        if (!targetIndex.has(flow.to)) {
            targetIndex.set(flow.to, targets.length);
            targets.push(flow.to);
        }
    }

    return (
        <SankeyChart
            height={Math.max(280, (sources.length + targets.length) * 32)}
            data={{
                nodes: [
                    ...sources.map((path) => ({
                        name: pathLabel(path),
                        color: 'violet.6',
                    })),
                    ...targets.map((path) => ({
                        name: pathLabel(path),
                        color: 'pink.6',
                    })),
                ],
                links: flows.map((flow) => ({
                    source: sourceIndex.get(flow.from) ?? 0,
                    target:
                        sources.length + (targetIndex.get(flow.to) ?? 0),
                    value: flow.value,
                })),
            }}
            valueFormatter={(value) => formatNumber(value)}
        />
    );
};

export const ConversionTable = ({
    title,
    description,
    rows,
    label = (value: string) => value,
    limit = 15,
}: {
    title: string;
    description?: string;
    rows: LandingConversionRow[];
    label?: (value: string) => string;
    limit?: number;
}) => {
    const maxRate = Math.max(1, ...rows.map((row) => row.rate));
    return (
        <Panel title={title} description={description}>
            {rows.length === 0 ? (
                <Empty />
            ) : (
                <Table.ScrollContainer minWidth={420}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Segment</Table.Th>
                                <Table.Th ta="right">Besucher</Table.Th>
                                <Table.Th ta="right">Konvertiert</Table.Th>
                                <Table.Th w={180}>Quote</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.slice(0, limit).map((row) => (
                                <Table.Tr key={row.label}>
                                    <Table.Td>{label(row.label)}</Table.Td>
                                    <Table.Td ta="right">
                                        {formatNumber(row.visitors)}
                                    </Table.Td>
                                    <Table.Td ta="right">
                                        {formatNumber(row.conversions)}
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs" wrap="nowrap">
                                            <Progress
                                                value={
                                                    (row.rate / maxRate) * 100
                                                }
                                                w={90}
                                                color="teal"
                                            />
                                            <Text size="sm">
                                                {formatPercent(row.rate)}
                                            </Text>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            )}
        </Panel>
    );
};

const HOURS = Array.from({ length: 24 }, (_, hour) =>
    String(hour).padStart(2, '0')
);

export const WeekHourHeatmap = ({
    cells,
}: {
    cells: { weekday: number; hour: number; value: number }[];
}) => {
    const values = new Map(
        cells.map((cell) => [`${cell.weekday}|${cell.hour}`, cell.value])
    );
    const data = WEEKDAYS.flatMap((weekday, dayIndex) =>
        HOURS.map((hour, hourIndex) => {
            const value = values.get(`${dayIndex + 1}|${hourIndex}`) ?? 0;
            return {
                x: hour,
                y: weekday,
                value: value === 0 ? null : value,
            };
        })
    );

    return (
        <MatrixChart
            data={data}
            xLabels={HOURS}
            yLabels={[...WEEKDAYS]}
            withXLabels
            withYLabels
            withTooltip
            withLegend
            legendLabels={['Wenig', 'Viel']}
            colors={['violet.1', 'violet.2', 'violet.4', 'violet.5', 'violet.6']}
            emptyColor="gray.1"
            cellSize={18}
            cellRadius={4}
            yLabelsWidth={28}
            xLabelsHeight={28}
            getTooltipLabel={(cell) =>
                `${cell.y}, ${cell.x}:00 Uhr: ${formatNumber(cell.value ?? 0)} Aufrufe`
            }
        />
    );
};
