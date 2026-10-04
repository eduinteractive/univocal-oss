import type {
    LandingConversionRow,
    LandingCount,
} from '@eduinteractive/uvc-api';
import {
    Badge,
    Box,
    Card,
    Group,
    Progress,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
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
    color = 'blue.5',
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
    const max = Math.max(1, ...visible.map((row) => row.value));
    return (
        <Panel title={title} description={description}>
            {visible.length === 0 ? (
                <Empty />
            ) : (
                <Stack gap={6}>
                    {visible.map((row) => (
                        <ShareRow
                            key={row.label}
                            label={label(row.label)}
                            share={(row.value / max) * 100}
                            value={formatNumber(row.value)}
                            color="blue.3"
                            labelWidth={180}
                        />
                    ))}
                </Stack>
            )}
        </Panel>
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

const HEAT_COLORS = ['blue.0', 'blue.2', 'blue.4', 'blue.6', 'blue.8'];

export const WeekHourHeatmap = ({
    cells,
}: {
    cells: { weekday: number; hour: number; value: number }[];
}) => {
    const values = new Map(
        cells.map((cell) => [`${cell.weekday}|${cell.hour}`, cell.value])
    );
    const max = Math.max(1, ...cells.map((cell) => cell.value));
    const colorFor = (value: number) =>
        value === 0
            ? 'gray.1'
            : HEAT_COLORS[
                  Math.min(
                      HEAT_COLORS.length - 1,
                      Math.floor((value / max) * HEAT_COLORS.length)
                  )
              ];
    const hours = Array.from({ length: 24 }, (_, hour) => hour);

    return (
        <Box style={{ overflowX: 'auto' }}>
            <Box
                style={{
                    display: 'grid',
                    gridTemplateColumns: '32px repeat(24, minmax(22px, 1fr))',
                    gap: 3,
                    minWidth: 640,
                }}
            >
                <span />
                {hours.map((hour) => (
                    <Text key={hour} size="xs" c="dimmed" ta="center">
                        {String(hour).padStart(2, '0')}
                    </Text>
                ))}
                {WEEKDAYS.map((weekday, dayIndex) => [
                    <Text key={weekday} size="xs" c="dimmed">
                        {weekday}
                    </Text>,
                    ...hours.map((hour) => {
                        const value =
                            values.get(`${dayIndex + 1}|${hour}`) ?? 0;
                        return (
                            <Tooltip
                                key={`${weekday}-${hour}`}
                                label={`${weekday}, ${String(hour).padStart(2, '0')}:00 Uhr: ${formatNumber(value)} Aufrufe`}
                            >
                                <Box
                                    h={22}
                                    bg={colorFor(value)}
                                    style={{ borderRadius: 4 }}
                                />
                            </Tooltip>
                        );
                    }),
                ])}
            </Box>
            <Group gap={4} mt="xs" justify="flex-end">
                <Text size="xs" c="dimmed">
                    Wenig
                </Text>
                {HEAT_COLORS.map((color) => (
                    <Box
                        key={color}
                        w={14}
                        h={14}
                        bg={color}
                        style={{ borderRadius: 3 }}
                    />
                ))}
                <Text size="xs" c="dimmed">
                    Viel
                </Text>
            </Group>
        </Box>
    );
};
