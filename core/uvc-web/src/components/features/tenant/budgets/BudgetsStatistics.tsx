import { Card, Flex, Text, Title, Group, NumberFormatter, Box, Table, Badge } from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { EDISelect } from '@eduinteractive/mantine-common';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BudgetStatistic {
    _id: string;
    title: string;
    income_soll: number;
    expense_soll: number;
    income_ist: number;
    expense_ist: number;
}

interface BudgetsStatisticsProps {
    statistics: BudgetStatistic[];
    categories: string[];
    currentCategory: string | null;
    onCategoryChange: (category: string | null) => void;
}

const incomeColors = [
    '#22C55E',
    '#16A34A',
    '#15803D',
    '#059669',
    '#0D9488',
    '#0891B2',
    '#0284C7',
    '#2563EB',
    '#7C3AED',
    '#C026D3',
];

const expenseColors = [
    '#EF4444',
    '#DC2626',
    '#B91C1C',
    '#F97316',
    '#EA580C',
    '#D97706',
    '#CA8A04',
    '#A16207',
    '#DC2626',
    '#B91C1C',
];

const roundMoney = (value: number) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const MoneyValue = (props: { value: number; color?: string }) => (
    <Text c={props.color} fw={500} component="span">
        <NumberFormatter
            value={roundMoney(props.value)}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            suffix=" €"
        />
    </Text>
);

interface StatisticsSectionProps {
    title: string;
    statistics: {
        _id: string;
        title: string;
        income: number;
        expense: number;
    }[];
}

const StatisticsSection = (props: StatisticsSectionProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const totalIncome = roundMoney(
        props.statistics.reduce((sum, stat) => sum + stat.income, 0)
    );
    const totalExpense = roundMoney(
        props.statistics.reduce((sum, stat) => sum + stat.expense, 0)
    );

    const incomeData = props.statistics
        .filter((stat) => stat.income > 0)
        .map((stat, index) => ({
            name: stat.title,
            value: roundMoney(stat.income),
            color: incomeColors[index % incomeColors.length],
        }));

    const expenseData = props.statistics
        .filter((stat) => stat.expense > 0)
        .map((stat, index) => ({
            name: stat.title,
            value: roundMoney(stat.expense),
            color: expenseColors[index % expenseColors.length],
        }));

    const tableData = props.statistics
        .map((stat) => ({
            _id: stat._id,
            title: stat.title,
            income: roundMoney(stat.income),
            expense: roundMoney(stat.expense),
            net: roundMoney(stat.income - stat.expense),
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'de'));

    return (
        <Box style={{ flex: 1, minWidth: 320 }}>
            <Title order={3} mb="md">
                {props.title}
            </Title>
            <Flex gap="md" wrap="wrap" mb="md">
                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{ flex: 1, minWidth: 260 }}
                >
                    <Group justify="space-between" mb="md">
                        <Title order={4}>{t('BUDGET.INCOME')}</Title>
                        <Text size="lg" fw={600} c="green">
                            <MoneyValue value={totalIncome} />
                        </Text>
                    </Group>
                    {incomeData.length > 0 ? (
                        <PieChart
                            data={incomeData}
                            size={180}
                            withTooltip
                            tooltipDataSource="segment"
                            mx="auto"
                        />
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            {t('COMMON.DATA_EMPTY')}
                        </Text>
                    )}
                </Card>

                <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{ flex: 1, minWidth: 260 }}
                >
                    <Group justify="space-between" mb="md">
                        <Title order={4}>{t('BUDGET.EXPENSE')}</Title>
                        <Text size="lg" fw={600} c="red">
                            <MoneyValue value={totalExpense} />
                        </Text>
                    </Group>
                    {expenseData.length > 0 ? (
                        <PieChart
                            data={expenseData}
                            size={180}
                            withTooltip
                            tooltipDataSource="segment"
                            mx="auto"
                        />
                    ) : (
                        <Text c="dimmed" ta="center" py="xl">
                            {t('COMMON.DATA_EMPTY')}
                        </Text>
                    )}
                </Card>
            </Flex>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                    {t('BUDGET.POSITIONS')}
                </Title>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t('BUDGET.POSITION')}</Table.Th>
                            <Table.Th ta="right">{t('BUDGET.INCOME')}</Table.Th>
                            <Table.Th ta="right">{t('BUDGET.EXPENSE')}</Table.Th>
                            <Table.Th ta="right">
                                {t('BUDGET.DIFFERENCE')}
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {tableData.map((row) => (
                            <Table.Tr
                                key={row._id}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`${row._id}`)}
                            >
                                <Table.Td>
                                    <Text fw={500}>{row.title}</Text>
                                </Table.Td>
                                <Table.Td ta="right">
                                    <MoneyValue value={row.income} color="green" />
                                </Table.Td>
                                <Table.Td ta="right">
                                    <MoneyValue value={row.expense} color="red" />
                                </Table.Td>
                                <Table.Td ta="right">
                                    <Badge
                                        color={
                                            row.net > 0
                                                ? 'green'
                                                : row.net < 0
                                                  ? 'red'
                                                  : 'gray'
                                        }
                                        variant="light"
                                    >
                                        <NumberFormatter
                                            value={row.net}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            decimalScale={2}
                                            fixedDecimalScale
                                            suffix=" €"
                                        />
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                {tableData.length === 0 && (
                    <Text c="dimmed" ta="center" py="xl">
                        {t('COMMON.DATA_EMPTY')}
                    </Text>
                )}
            </Card>
        </Box>
    );
};

const BudgetsStatistics = (props: BudgetsStatisticsProps) => {
    const { t } = useTranslation();
    const { statistics, categories, currentCategory, onCategoryChange } = props;

    const categoryOptions = categories.map((category) => ({
        value: category,
        label: category,
    }));

    const sollStatistics = statistics.map((stat) => ({
        _id: stat._id,
        title: stat.title,
        income: roundMoney(stat.income_soll),
        expense: roundMoney(stat.expense_soll),
    }));

    const istStatistics = statistics.map((stat) => ({
        _id: stat._id,
        title: stat.title,
        income: roundMoney(stat.income_ist),
        expense: roundMoney(stat.expense_ist),
    }));

    return (
        <Box>
            <Group justify="space-between" mb="md">
                <EDISelect
                    label={t('BUDGET.ATTRIBUTES.CATEGORY')}
                    placeholder={t('BUDGET.ATTRIBUTES.CATEGORY_PLACEHOLDER')}
                    data={categoryOptions}
                    value={currentCategory}
                    onChange={(value) => onCategoryChange(value)}
                    w="100%"
                    searchable
                    clearable
                />
            </Group>

            <Flex direction="column" gap="xl">
                <StatisticsSection
                    title={t('BUDGET.STATISTICS_SOLL')}
                    statistics={sollStatistics}
                />
                <StatisticsSection
                    title={t('BUDGET.STATISTICS_IST')}
                    statistics={istStatistics}
                />
            </Flex>
        </Box>
    );
};

export default BudgetsStatistics;
