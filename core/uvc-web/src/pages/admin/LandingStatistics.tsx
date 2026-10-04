import {
    SAPI,
    type LandingGranularity,
    type LandingSummary,
} from '@eduinteractive/uvc-api';
import {
    Alert,
    Badge,
    Button,
    Card,
    Group,
    Loader,
    Progress,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Tabs,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import { BarChart, DonutChart, FunnelChart, LineChart } from '@mantine/charts';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
    IconAlertCircle,
    IconDownload,
    IconRefresh,
} from '@tabler/icons-react';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import {
    ConversionTable,
    CountBars,
    Empty,
    KpiCard,
    PageFlow,
    Panel,
    ShareRow,
    WeekHourHeatmap,
} from '../../components/features/admin/landing/LandingStatisticsParts';
import {
    CTA_LABELS,
    DEVICE_LABELS,
    INTERACTION_LABELS,
    RECENCY_LABELS,
    REFERRER_LABELS,
    SECTION_LABELS,
    TIME_BUCKET_LABELS,
    countryLabel,
    formatDuration,
    formatMs,
    formatNumber,
    formatPercent,
    languageLabel,
    pathLabel,
    regionLabel,
    sourceLabel,
} from '../../components/features/admin/landing/LandingStatisticsFormat';

const GRANULARITY_SELECT = [
    { label: 'Täglich (14 Tage)', value: 'daily' },
    { label: 'Wöchentlich (8 Wochen)', value: 'weekly' },
    { label: 'Monatlich (12 Monate)', value: 'monthly' },
];

const VITAL_INFO: Record<string, { label: string; unit: 'ms' | 'score' }> = {
    LCP: { label: 'Largest Contentful Paint', unit: 'ms' },
    INP: { label: 'Interaction to Next Paint', unit: 'ms' },
    CLS: { label: 'Cumulative Layout Shift', unit: 'score' },
    FCP: { label: 'First Contentful Paint', unit: 'ms' },
    TTFB: { label: 'Time to First Byte', unit: 'ms' },
};

const DONUT_COLORS = [
    'violet.6',
    'pink.6',
    'yellow.6',
    'violet.3',
    'pink.3',
    'gray.5',
];
const FUNNEL_COLORS = ['violet.6', 'violet.5', 'violet.4', 'violet.3', 'pink.6'];
const TOOLTIP_PROPS = { wrapperStyle: { zIndex: 1000 } };

const dayString = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getDateRange = (granularity: LandingGranularity) => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (granularity === 'daily') {
        from.setDate(from.getDate() - 13);
    } else if (granularity === 'weekly') {
        const isoWeekday = from.getDay() || 7;
        from.setDate(from.getDate() - (isoWeekday - 1) - 7 * 7);
    } else {
        from.setMonth(from.getMonth() - 11, 1);
    }
    return { from: dayString(from), to: dayString(now) };
};

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error);
};

const formatBucket = (value: string, granularity: LandingGranularity) => {
    if (granularity === 'monthly') {
        const [year, month] = value.split('-');
        if (!year || !month) return value;
        return new Date(
            Date.UTC(Number(year), Number(month) - 1, 1)
        ).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        ...(granularity === 'daily' ? { weekday: 'short' } : {}),
    });
};

const toDonut = (
    rows: { label: string; value: number }[],
    label: (value: string) => string
) =>
    rows.slice(0, DONUT_COLORS.length).map((row, index) => ({
        name: label(row.label),
        value: row.value,
        color: DONUT_COLORS[index],
    }));

const downloadJson = (data: LandingSummary, from: string, to: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `landing-statistik_${from}_${to}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

const Overview = ({
    data,
    granularity,
}: {
    data: LandingSummary;
    granularity: LandingGranularity;
}) => {
    const { totals, previousTotals: prev } = data;
    const returningShare =
        totals.uniqueVisitors === 0
            ? 0
            : (totals.returningVisitors / totals.uniqueVisitors) * 100;
    const prevReturningShare =
        prev.uniqueVisitors === 0
            ? 0
            : (prev.returningVisitors / prev.uniqueVisitors) * 100;
    const funnelBase = data.conversion.funnel[0]?.value ?? 0;

    return (
        <Stack>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
                <KpiCard
                    label="Besucher"
                    value={formatNumber(totals.uniqueVisitors)}
                    current={totals.uniqueVisitors}
                    previous={prev.uniqueVisitors}
                    hint="Eindeutige Besucher pro Tag, ermittelt über den gehashten Adress-Schlüssel. Über mehrere Tage summiert."
                />
                <KpiCard
                    label="Seitenaufrufe"
                    value={formatNumber(totals.pageViews)}
                    current={totals.pageViews}
                    previous={prev.pageViews}
                    hint="Jede Seite zählt pro Besucher und Tag einmal."
                />
                <KpiCard
                    label="CTA-Conversion"
                    value={formatPercent(totals.conversionRate)}
                    current={totals.conversionRate}
                    previous={prev.conversionRate}
                    hint="Anteil der Besucher, die mindestens einmal auf Login, GitHub oder das SaaS-Angebot geklickt haben."
                />
                <KpiCard
                    label="Absprungrate"
                    value={formatPercent(totals.bounceRate)}
                    current={totals.bounceRate}
                    previous={prev.bounceRate}
                    lowerIsBetter
                    hint="Anteil der Besucher, die nur eine Seite angesehen haben."
                />
                <KpiCard
                    label="Seiten pro Besuch"
                    value={formatNumber(totals.pagesPerVisitor, 2)}
                    current={totals.pagesPerVisitor}
                    previous={prev.pagesPerVisitor}
                />
                <KpiCard
                    label="Ø Verweildauer pro Seite"
                    value={formatDuration(totals.avgTimeOnPage)}
                    current={totals.avgTimeOnPage}
                    previous={prev.avgTimeOnPage}
                    hint="Nur Zeit mit sichtbarem Tab, gedeckelt auf 30 Minuten."
                />
                <KpiCard
                    label="Funktionen-Aufrufe"
                    value={formatNumber(totals.featureViews)}
                    current={totals.featureViews}
                    previous={prev.featureViews}
                />
                <KpiCard
                    label="Wiederkehrende Besucher"
                    value={formatPercent(returningShare)}
                    current={returningShare}
                    previous={prevReturningShare}
                    hint="Besucher, die in den letzten 30 Tagen schon einmal da waren."
                />
            </SimpleGrid>

            <Panel title="Verlauf">
                <LineChart
                    h={320}
                    data={data.series}
                    dataKey="date"
                    series={[
                        {
                            name: 'uniqueVisitors',
                            color: 'violet.6',
                            label: 'Besucher',
                        },
                        {
                            name: 'pageViews',
                            color: 'pink.6',
                            label: 'Seitenaufrufe',
                        },
                        {
                            name: 'ctaClicks',
                            color: 'yellow.6',
                            label: 'CTA-Klicks',
                        },
                        {
                            name: 'conversions',
                            color: 'teal.6',
                            label: 'Konvertierte Besucher',
                        },
                        {
                            name: 'campaignViews',
                            color: 'violet.3',
                            label: 'Kampagnenaufrufe',
                        },
                    ]}
                    curveType="monotone"
                    withLegend
                    tooltipProps={TOOLTIP_PROPS}
                    gridAxis="xy"
                    xAxisProps={{
                        tickFormatter: (value) =>
                            formatBucket(String(value), granularity),
                    }}
                    yAxisProps={{ domain: [0, 'auto'] }}
                />
            </Panel>

            <SimpleGrid cols={{ base: 1, lg: 2 }}>
                <Panel
                    title="Funnel"
                    description="Besucher je Tag, die den jeweiligen Schritt erreicht haben."
                >
                    {funnelBase ? (
                        <Group align="center" wrap="nowrap" gap="xl">
                            <FunnelChart
                                size={240}
                                withTooltip
                                data={data.conversion.funnel.map(
                                    (step, index) => ({
                                        name: step.label,
                                        value: step.value,
                                        color: FUNNEL_COLORS[index] ?? 'gray.5',
                                    })
                                )}
                            />
                            <Stack gap={6}>
                                {data.conversion.funnel.map((step, index) => (
                                    <Group
                                        key={step.label}
                                        gap="xs"
                                        wrap="nowrap"
                                    >
                                        <Badge
                                            color={FUNNEL_COLORS[index]}
                                            variant="filled"
                                            size="sm"
                                            circle
                                        >
                                            {index + 1}
                                        </Badge>
                                        <Text size="sm" fw={600}>
                                            {step.label}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            {formatNumber(step.value)} ·{' '}
                                            {formatPercent(
                                                (step.value / funnelBase) * 100
                                            )}
                                        </Text>
                                    </Group>
                                ))}
                            </Stack>
                        </Group>
                    ) : (
                        <Empty />
                    )}
                </Panel>
                <Panel title="Neue und wiederkehrende Besucher">
                    <BarChart
                        h={260}
                        data={data.series}
                        dataKey="date"
                        type="stacked"
                        series={[
                            {
                                name: 'newVisitors',
                                color: 'violet.6',
                                label: 'Neu',
                            },
                            {
                                name: 'returningVisitors',
                                color: 'pink.6',
                                label: 'Wiederkehrend',
                            },
                        ]}
                        withLegend
                        tooltipProps={TOOLTIP_PROPS}
                        xAxisProps={{
                            tickFormatter: (value) =>
                                formatBucket(String(value), granularity),
                        }}
                    />
                </Panel>
            </SimpleGrid>

            <Panel
                title="Aufrufe nach Wochentag und Uhrzeit"
                description="Deutsche Ortszeit. Je dunkler, desto mehr Seitenaufrufe."
            >
                {data.timing.heatmap.length === 0 ? (
                    <Empty />
                ) : (
                    <WeekHourHeatmap cells={data.timing.heatmap} />
                )}
            </Panel>
        </Stack>
    );
};

const PagesTab = ({ data }: { data: LandingSummary }) => {
    const sectionsByPage = useMemo(() => {
        const groups = new Map<
            string,
            LandingSummary['engagement']['sections']
        >();
        for (const row of data.engagement.sections) {
            groups.set(row.path, [...(groups.get(row.path) ?? []), row]);
        }
        return Array.from(groups.entries());
    }, [data.engagement.sections]);

    return (
        <Stack>
            <Panel
                title="Seiten im Detail"
                description="Einstiege, Ausstiegsquote, Verweildauer, Scrolltiefe und Klickverhalten je Seite."
            >
                {data.pages.length === 0 ? (
                    <Empty />
                ) : (
                    <Table.ScrollContainer minWidth={980}>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Seite</Table.Th>
                                    <Table.Th ta="right">Aufrufe</Table.Th>
                                    <Table.Th ta="right">Einstiege</Table.Th>
                                    <Table.Th ta="right">Ausstieg</Table.Th>
                                    <Table.Th ta="right">Ø Zeit</Table.Th>
                                    <Table.Th w={200}>
                                        Scrolltiefe 25 / 50 / 75 / 100
                                    </Table.Th>
                                    <Table.Th ta="right">CTA-Klicks</Table.Th>
                                    <Table.Th ta="right">Klickrate</Table.Th>
                                    <Table.Th ta="right">Navigation</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.pages.map((row) => (
                                    <Table.Tr key={row.path}>
                                        <Table.Td fw={600}>
                                            {pathLabel(row.path)}
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatNumber(row.value)}
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatNumber(row.entries)}
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatPercent(row.exitRate)}
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatDuration(row.avgTime)}
                                        </Table.Td>
                                        <Table.Td>
                                            <Tooltip
                                                label={`25 %: ${formatPercent(row.scroll25)} · 50 %: ${formatPercent(row.scroll50)} · 75 %: ${formatPercent(row.scroll75)} · 100 %: ${formatPercent(row.scroll100)}`}
                                            >
                                                <Group gap={3} wrap="nowrap">
                                                    {[
                                                        row.scroll25,
                                                        row.scroll50,
                                                        row.scroll75,
                                                        row.scroll100,
                                                    ].map((value, index) => (
                                                        <Progress
                                                            key={index}
                                                            value={value}
                                                            w={44}
                                                            color={
                                                                [
                                                                    'violet.3',
                                                                    'violet.4',
                                                                    'violet.6',
                                                                    'pink.6',
                                                                ][index]
                                                            }
                                                        />
                                                    ))}
                                                </Group>
                                            </Tooltip>
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatNumber(row.ctaClicks)}
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatPercent(row.clickRate)}
                                        </Table.Td>
                                        <Table.Td ta="right">
                                            {formatNumber(row.navClicks)}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Table.ScrollContainer>
                )}
            </Panel>

            <SimpleGrid cols={{ base: 1, lg: 2 }}>
                <Panel
                    title="Seitenfluss"
                    description="Von welcher Seite Besucher zur nächsten Seite wechseln."
                >
                    <PageFlow rows={data.engagement.transitions} />
                </Panel>
                <Panel
                    title="Seiten pro Besuch"
                    description="Verteilung der Anzahl verschiedener Seiten je Besucher und Tag."
                >
                    <BarChart
                        h={300}
                        data={data.engagement.depth}
                        dataKey="label"
                        series={[
                            {
                                name: 'value',
                                color: 'violet.6',
                                label: 'Besucher',
                            },
                        ]}
                        tooltipProps={TOOLTIP_PROPS}
                    />
                </Panel>
                <Panel
                    title="Verweildauer"
                    description="Sichtbare Zeit je Seitenaufruf."
                >
                    <BarChart
                        h={260}
                        data={data.engagement.timeBuckets.map((row) => ({
                            label: TIME_BUCKET_LABELS[row.label] ?? row.label,
                            value: row.value,
                        }))}
                        dataKey="label"
                        series={[
                            {
                                name: 'value',
                                color: 'pink.6',
                                label: 'Aufrufe',
                            },
                        ]}
                        tooltipProps={TOOLTIP_PROPS}
                    />
                </Panel>
                <Panel
                    title="Scrolltiefe"
                    description="Anteil der Seitenaufrufe, die die jeweilige Tiefe erreicht haben."
                >
                    <BarChart
                        h={260}
                        data={data.engagement.scrollDepth.map((row) => ({
                            label: `${row.label} %`,
                            share: row.share,
                        }))}
                        dataKey="label"
                        series={[
                            {
                                name: 'share',
                                color: 'violet.6',
                                label: 'Anteil in %',
                            },
                        ]}
                        yAxisProps={{ domain: [0, 100] }}
                        valueFormatter={(value) => formatPercent(value)}
                        tooltipProps={TOOLTIP_PROPS}
                    />
                </Panel>
            </SimpleGrid>

            <Panel
                title="Gesehene Abschnitte"
                description="Anteil der Seitenaufrufe, in denen ein Abschnitt mindestens zu einem Drittel sichtbar war."
            >
                {sectionsByPage.length === 0 ? (
                    <Empty />
                ) : (
                    <SimpleGrid cols={{ base: 1, lg: 3 }}>
                        {sectionsByPage.map(([path, rows]) => (
                            <Stack key={path} gap={6}>
                                <Text fw={700} size="sm">
                                    {pathLabel(path)}
                                </Text>
                                {rows.map((row) => (
                                    <ShareRow
                                        key={row.key}
                                        label={
                                            SECTION_LABELS[row.key] ?? row.key
                                        }
                                        share={row.share}
                                        value={formatPercent(row.share)}
                                        labelWidth={160}
                                    />
                                ))}
                            </Stack>
                        ))}
                    </SimpleGrid>
                )}
            </Panel>
        </Stack>
    );
};

const VisitorsTab = ({ data }: { data: LandingSummary }) => {
    const { visitors, totals } = data;
    return (
        <Stack>
            <SimpleGrid cols={{ base: 1, md: 3 }}>
                <Panel title="Geräte">
                    {visitors.devices.length === 0 ? (
                        <Empty />
                    ) : (
                        <DonutChart
                            mx="auto"
                            withLabels
                            withLabelsLine
                            withTooltip
                            tooltipDataSource="segment"
                            data={toDonut(
                                visitors.devices,
                                (value) => DEVICE_LABELS[value] ?? value
                            )}
                        />
                    )}
                </Panel>
                <Panel title="Neu oder wiederkehrend">
                    {totals.uniqueVisitors === 0 ? (
                        <Empty />
                    ) : (
                        <DonutChart
                            mx="auto"
                            withLabels
                            withLabelsLine
                            withTooltip
                            tooltipDataSource="segment"
                            data={[
                                {
                                    name: 'Neu',
                                    value: totals.newVisitors,
                                    color: 'violet.6',
                                },
                                {
                                    name: 'Wiederkehrend',
                                    value: totals.returningVisitors,
                                    color: 'pink.6',
                                },
                            ]}
                        />
                    )}
                </Panel>
                <CountBars
                    title="Letzter Besuch der Wiederkehrenden"
                    rows={visitors.recency}
                    label={(value) => RECENCY_LABELS[value] ?? value}
                />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
                <CountBars
                    title="Länder"
                    rows={data.countries.map((row) => ({
                        label: row.country,
                        value: row.value,
                    }))}
                    label={countryLabel}
                    limit={15}
                />
                <CountBars
                    title="Regionen"
                    rows={visitors.regions}
                    label={regionLabel}
                    limit={15}
                />
                <CountBars
                    title="Sprachen"
                    rows={visitors.languages}
                    label={languageLabel}
                />
                <CountBars title="Browser" rows={visitors.browsers} />
                <CountBars title="Betriebssysteme" rows={visitors.os} />
            </SimpleGrid>
        </Stack>
    );
};

const AcquisitionTab = ({ data }: { data: LandingSummary }) => {
    const { acquisition, conversion } = data;
    return (
        <Stack>
            <ConversionTable
                title="Quellen und CTA-Quote"
                description="Herkunft beim ersten Aufruf des Tages. Kampagne vor UTM vor Verweis."
                rows={acquisition.sources}
                label={sourceLabel}
                limit={25}
            />
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
                <Panel title="Herkunftsart">
                    {data.referrers.length === 0 ? (
                        <Empty />
                    ) : (
                        <DonutChart
                            mx="auto"
                            withLabels
                            withLabelsLine
                            withTooltip
                            tooltipDataSource="segment"
                            data={toDonut(
                                data.referrers.map((row) => ({
                                    label: row.referrer,
                                    value: row.value,
                                })),
                                (value) => REFERRER_LABELS[value] ?? value
                            )}
                        />
                    )}
                </Panel>
                <CountBars
                    title="Verweisende Websites"
                    rows={acquisition.referrerHosts}
                    limit={15}
                />
                <CountBars
                    title="Kampagnen (morig)"
                    rows={data.campaigns.map((row) => ({
                        label: row.morigin,
                        value: row.value,
                    }))}
                />
                <CountBars title="UTM-Quelle" rows={acquisition.utmSources} />
                <CountBars title="UTM-Medium" rows={acquisition.utmMediums} />
                <CountBars
                    title="UTM-Kampagne"
                    rows={acquisition.utmCampaigns}
                />
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
                <ConversionTable
                    title="CTA-Quote nach Einstiegsseite"
                    rows={conversion.byEntry}
                    label={pathLabel}
                />
                <ConversionTable
                    title="CTA-Quote nach Gerät"
                    rows={conversion.byDevice}
                    label={(value) => DEVICE_LABELS[value] ?? value}
                />
                <ConversionTable
                    title="CTA-Quote nach Land"
                    rows={conversion.byCountry}
                    label={countryLabel}
                />
                <Stack>
                    <CountBars
                        title="Erster CTA-Klick nach Stelle"
                        rows={conversion.byCta}
                        label={(value) => CTA_LABELS[value] ?? value}
                    />
                    <CountBars
                        title="Gesehene Seiten vor dem CTA-Klick"
                        rows={conversion.byDepth}
                        label={(value) =>
                            `${value} ${value === '1' ? 'Seite' : 'Seiten'}`
                        }
                    />
                </Stack>
            </SimpleGrid>
        </Stack>
    );
};

const InteractionTab = ({ data }: { data: LandingSummary }) => (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
        <CountBars
            title="Alle CTA-Klicks nach Stelle"
            rows={data.ctas.map((row) => ({
                label: row.cta,
                value: row.value,
            }))}
            label={(value) => CTA_LABELS[value] ?? value}
        />
        <CountBars
            title="Interne Navigation"
            description="Geklickte Links innerhalb der Website."
            rows={data.engagement.navTargets}
            label={pathLabel}
            limit={20}
        />
        <CountBars
            title="Geöffnete FAQ-Fragen"
            rows={data.engagement.faq}
            limit={20}
        />
        <CountBars title="Externe Links" rows={data.engagement.outbound} />
        <CountBars
            title="Menüs und Anwendungsbeispiele"
            rows={data.engagement.interactions}
            label={(value) => INTERACTION_LABELS[value] ?? value}
        />
    </SimpleGrid>
);

const TechnicalTab = ({ data }: { data: LandingSummary }) => {
    const { vitals, vitalsByPage, errors, bots } = data.technical;
    const allHits = data.totals.pageViews + data.totals.botHits;
    const botShare = allHits === 0 ? 0 : (data.totals.botHits / allHits) * 100;
    return (
        <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}>
                {vitals.map((vital) => {
                    const info = VITAL_INFO[vital.name];
                    const all =
                        vital.good + vital.needsImprovement + vital.poor;
                    const share = (value: number) =>
                        all === 0 ? 0 : (value / all) * 100;
                    return (
                        <Panel
                            key={vital.name}
                            title={vital.name}
                            description={info.label}
                        >
                            <Text size="xl" fw={700}>
                                {vital.count === 0
                                    ? '–'
                                    : info.unit === 'ms'
                                      ? formatMs(vital.avg)
                                      : formatNumber(vital.avg, 3)}
                            </Text>
                            <Progress.Root size="lg">
                                <Tooltip
                                    label={`Gut: ${formatPercent(share(vital.good))}`}
                                >
                                    <Progress.Section
                                        value={share(vital.good)}
                                        color="teal"
                                    />
                                </Tooltip>
                                <Tooltip
                                    label={`Verbesserungswürdig: ${formatPercent(share(vital.needsImprovement))}`}
                                >
                                    <Progress.Section
                                        value={share(vital.needsImprovement)}
                                        color="yellow"
                                    />
                                </Tooltip>
                                <Tooltip
                                    label={`Schlecht: ${formatPercent(share(vital.poor))}`}
                                >
                                    <Progress.Section
                                        value={share(vital.poor)}
                                        color="red"
                                    />
                                </Tooltip>
                            </Progress.Root>
                            <Text size="xs" c="dimmed">
                                {formatNumber(vital.count)} Messungen, Wert oben
                                ist der Durchschnitt
                            </Text>
                        </Panel>
                    );
                })}
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 3 }}>
                <Panel title="LCP gut nach Seite">
                    {vitalsByPage.length === 0 ? (
                        <Empty />
                    ) : (
                        <Stack gap={6}>
                            {vitalsByPage.map((row) => (
                                <ShareRow
                                    key={row.path}
                                    label={pathLabel(row.path)}
                                    share={row.lcpGood}
                                    value={formatPercent(row.lcpGood)}
                                    color={
                                        row.lcpGood >= 75 ? 'teal' : 'orange'
                                    }
                                    labelWidth={140}
                                />
                            ))}
                        </Stack>
                    )}
                </Panel>
                <CountBars
                    title="Skriptfehler nach Seite"
                    description={`${formatNumber(data.totals.clientErrors)} Fehler im Zeitraum`}
                    rows={errors.map((row) => ({
                        label: row.path,
                        value: row.value,
                    }))}
                    label={pathLabel}
                />
                <CountBars
                    title="Bots und Crawler"
                    description={`${formatNumber(data.totals.botHits)} Zugriffe, ${formatPercent(botShare)} aller Zugriffe. Nicht in den übrigen Zahlen enthalten.`}
                    rows={bots}
                />
            </SimpleGrid>
        </Stack>
    );
};

const LandingStatistics = () => {
    const [granularity, setGranularity] = useState<LandingGranularity>('daily');
    const dateRange = useMemo(() => getDateRange(granularity), [granularity]);

    const summaryQuery = useQuery({
        queryKey: ['landingSummary', granularity, dateRange.from, dateRange.to],
        queryFn: () =>
            SAPI.STATISTICS.ADMIN.getLandingSummary({
                query: { ...dateRange, granularity },
            }),
        refetchInterval: 60_000,
    });

    const data = summaryQuery.data;

    return (
        <SVHPageWrapper p="md">
            <Stack gap="lg" pb="xl">
                <Group justify="space-between" align="flex-end">
                    <Stack gap={4}>
                        <Title order={3} c="violet">
                            Landing-Statistiken
                        </Title>
                        <Text size="sm" c="dimmed">
                            Cookielos und ohne Klartext-IP. Jede Seite und jeder
                            Klick zählt pro Besucher einmal am Tag; Bots werden
                            getrennt erfasst.
                        </Text>
                    </Stack>
                    <Group gap="xs">
                        <Tooltip label="Wird jede Minute aktualisiert">
                            <Button
                                variant="subtle"
                                leftSection={<IconRefresh size={16} />}
                                loading={summaryQuery.isFetching}
                                onClick={() => summaryQuery.refetch()}
                            >
                                Aktualisieren
                            </Button>
                        </Tooltip>
                        <Button
                            variant="light"
                            leftSection={<IconDownload size={16} />}
                            disabled={!data}
                            onClick={() =>
                                data &&
                                downloadJson(data, dateRange.from, dateRange.to)
                            }
                        >
                            JSON exportieren
                        </Button>
                    </Group>
                </Group>

                <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Select
                        label="Zeitraum"
                        value={granularity}
                        onChange={(value) =>
                            setGranularity(
                                (value as LandingGranularity) || 'daily'
                            )
                        }
                        data={GRANULARITY_SELECT}
                        allowDeselect={false}
                        w={240}
                    />
                </Card>

                {summaryQuery.isLoading && (
                    <Group justify="center" mt="xl">
                        <Loader size="lg" />
                    </Group>
                )}
                {summaryQuery.error && (
                    <Alert
                        icon={<IconAlertCircle />}
                        title="Fehler"
                        color="red"
                    >
                        {getErrorMessage(summaryQuery.error)}
                    </Alert>
                )}
                {data && (
                    <Tabs defaultValue="overview" keepMounted={false}>
                        <Tabs.List mb="md">
                            <Tabs.Tab value="overview">Überblick</Tabs.Tab>
                            <Tabs.Tab value="pages">
                                Seiten und Inhalte
                            </Tabs.Tab>
                            <Tabs.Tab value="visitors">Besucher</Tabs.Tab>
                            <Tabs.Tab value="acquisition">
                                Herkunft und Conversion
                            </Tabs.Tab>
                            <Tabs.Tab value="interaction">Interaktion</Tabs.Tab>
                            <Tabs.Tab value="technical">Technik</Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="overview">
                            <Overview data={data} granularity={granularity} />
                        </Tabs.Panel>
                        <Tabs.Panel value="pages">
                            <PagesTab data={data} />
                        </Tabs.Panel>
                        <Tabs.Panel value="visitors">
                            <VisitorsTab data={data} />
                        </Tabs.Panel>
                        <Tabs.Panel value="acquisition">
                            <AcquisitionTab data={data} />
                        </Tabs.Panel>
                        <Tabs.Panel value="interaction">
                            <InteractionTab data={data} />
                        </Tabs.Panel>
                        <Tabs.Panel value="technical">
                            <TechnicalTab data={data} />
                        </Tabs.Panel>
                    </Tabs>
                )}
            </Stack>
        </SVHPageWrapper>
    );
};

export default LandingStatistics;
