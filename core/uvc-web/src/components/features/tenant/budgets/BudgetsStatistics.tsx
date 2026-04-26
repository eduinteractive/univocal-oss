import { Card, Flex, Text, Title, Group, NumberFormatter, Box, Table, Badge } from '@mantine/core';
import { PieChart } from '@mantine/charts';
import { EDISelect } from '@eduinteractive/mantine-common';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BudgetsStatisticsProps {
    statistics: {
        _id: string;
        title: string;
        income: number;
        expense: number;
    }[];
    currentYear: number;
    onYearChange: (year: number) => void;
}

const BudgetsStatistics = (props: BudgetsStatisticsProps) => {
    const { t } = useTranslation();
    const { statistics, currentYear, onYearChange } = props;
    const navigate = useNavigate();

    // Calculate total income and expense
    const totalIncome = statistics.reduce((sum, stat) => sum + stat.income, 0);
    const totalExpense = statistics.reduce((sum, stat) => sum + stat.expense, 0);

    // Generate year options (current year and 5 years before)
    const currentYearNum = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYearNum - i+2).map(year => ({
        value: year.toString(),
        label: year.toString()
    }));

    // Income colors - various shades of green and blue-green for positive financial data
    const incomeColors = [
        "#22C55E", // Green-500 - primary income
        "#16A34A", // Green-600 - secondary income
        "#15803D", // Green-700 - tertiary income
        "#059669", // Emerald-600 - alternative income
        "#0D9488", // Teal-600 - investment income
        "#0891B2", // Cyan-600 - other income
        "#0284C7", // Sky-600 - miscellaneous income
        "#2563EB", // Blue-600 - additional income
        "#7C3AED", // Violet-600 - special income
        "#C026D3", // Fuchsia-600 - bonus income
    ];

    // Expense colors - various shades of red, orange, and amber for financial outflows
    const expenseColors = [
        "#EF4444", // Red-500 - primary expense
        "#DC2626", // Red-600 - secondary expense
        "#B91C1C", // Red-700 - major expense
        "#F97316", // Orange-500 - operational expense
        "#EA580C", // Orange-600 - maintenance expense
        "#D97706", // Amber-600 - administrative expense
        "#CA8A04", // Yellow-600 - utility expense
        "#A16207", // Yellow-700 - other expense
        "#DC2626", // Red-600 - additional expense
        "#B91C1C", // Red-700 - miscellaneous expense
    ];

    // Prepare data for income pie chart (only sources with income > 0)
    const incomeData = statistics
        .filter(stat => stat.income > 0)
        .map((stat, index) => ({
            name: stat.title,
            value: stat.income,
            color: incomeColors[index % incomeColors.length] // Use income color palette
        }));

    // Prepare data for expense pie chart (only sources with expense > 0)
    const expenseData = statistics
        .filter(stat => stat.expense > 0)
        .map((stat, index) => ({
            name: stat.title,
            value: stat.expense,
            color: expenseColors[index % expenseColors.length] // Use expense color palette
        }));

    // Prepare table data - combine all statistics and sort by title
    const tableData = statistics
        .map(stat => ({
            _id: stat._id,
            title: stat.title,
            income: stat.income,
            expense: stat.expense,
            net: stat.income - stat.expense
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'de')); // German locale sorting

    return (
        <Box>
            {/* Year Selector */}
            <Group justify="space-between" mb="md">
                <EDISelect
                    label={t("BUDGET.ATTRIBUTES.YEAR")}
                    placeholder={t("BUDGET.ATTRIBUTES.YEAR_PLACEHOLDER")}
                    data={yearOptions}
                    value={currentYear.toString()}
                    onChange={(value) => onYearChange(parseInt(value || currentYear.toString()))}
                    w="100%"
                />
            </Group>

            {/* Charts */}
            <Flex gap="md" wrap="wrap">
            {/* Income Chart */}
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1, minWidth: 300 }}>
                <Group justify="space-between" mb="md">
                    <Title order={4}>{t("BUDGET.INCOME")}</Title>
                    <Text size="lg" fw={600} c="green">
                        <NumberFormatter value={totalIncome} thousandSeparator="." decimalSeparator="," suffix=" €" />
                    </Text>
                </Group>
                {incomeData.length > 0 ? (
                    <PieChart
                        data={incomeData}
                        size={200}
                        withTooltip
                        tooltipDataSource="segment"
                        mx="auto"
                    />
                ) : (
                    <Text c="dimmed" ta="center" py="xl">
                        {t("COMMON.DATA_EMPTY")}
                    </Text>
                )}
            </Card>

            {/* Expense Chart */}
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1, minWidth: 300 }}>
                <Group justify="space-between" mb="md">
                    <Title order={4}>{t("BUDGET.EXPENSE")}</Title>
                    <Text size="lg" fw={600} c="red">
                        <NumberFormatter value={totalExpense} thousandSeparator="." decimalSeparator="," suffix=" €" />
                    </Text>
                </Group>
                {expenseData.length > 0 ? (
                    <PieChart
                        data={expenseData}
                        size={200}
                        withTooltip
                        tooltipDataSource="segment"
                        mx="auto"
                    />
                ) : (
                    <Text c="dimmed" ta="center" py="xl">
                        {t("COMMON.DATA_EMPTY")}
                    </Text>
                )}
            </Card>
            </Flex>

            {/* Budget Positions Table */}
            <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
                <Title order={4} mb="md">{t("BUDGET.POSITIONS")}</Title>
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>{t("BUDGET.POSITION")}</Table.Th>
                            <Table.Th ta="right">{t("BUDGET.INCOME")}</Table.Th>
                            <Table.Th ta="right">{t("BUDGET.EXPENSE")}</Table.Th>
                            <Table.Th ta="right">{t("BUDGET.DIFFERENCE")}</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {tableData.map((row, index) => (
                            <Table.Tr 
                                key={index}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(`${row._id}`)}
                            >
                                <Table.Td>
                                    <Text fw={500}>{row.title}</Text>
                                </Table.Td>
                                <Table.Td ta="right">
                                    {row.income > 0 ? (
                                        <Text c="green" fw={500}>
                                            <NumberFormatter 
                                                value={row.income} 
                                                thousandSeparator="." 
                                                decimalSeparator="," 
                                                suffix=" €" 
                                            />
                                        </Text>
                                    ) : (
                                        <Text c="dimmed">-</Text>
                                    )}
                                </Table.Td>
                                <Table.Td ta="right">
                                    {row.expense > 0 ? (
                                        <Text c="red" fw={500}>
                                            <NumberFormatter 
                                                value={row.expense} 
                                                thousandSeparator="." 
                                                decimalSeparator="," 
                                                suffix=" €" 
                                            />
                                        </Text>
                                    ) : (
                                        <Text c="dimmed">-</Text>
                                    )}
                                </Table.Td>
                                <Table.Td ta="right">
                                    <Badge 
                                        color={row.net > 0 ? "green" : row.net < 0 ? "red" : "gray"}
                                        variant="light"
                                    >
                                        <NumberFormatter 
                                            value={row.net} 
                                            thousandSeparator="." 
                                            decimalSeparator="," 
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
                        {t("COMMON.DATA_EMPTY")}
                    </Text>
                )}
            </Card>
        </Box>
    );
};

export default BudgetsStatistics;