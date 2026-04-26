import React, { useEffect, useState } from 'react';
import { Table, UnstyledButton, Group, Text, Center, rem } from '@mantine/core';
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean; // Optionale Eigenschaft, um Sortierbarkeit anzugeben
}

interface ThProps {
    label: string;
    reversed: boolean;
    sorted: boolean;
    onSort: () => void;
    sortable?: boolean;
}

const Th: React.FC<ThProps> = ({
    label,
    reversed,
    sorted,
    onSort,
    sortable = true,
}) => {
    const Icon = sorted
        ? reversed
            ? IconChevronUp
            : IconChevronDown
        : IconSelector;
    return (
        <Table.Th miw={150}>
            <UnstyledButton
                onClick={sortable ? onSort : undefined}
                style={{ pointerEvents: sortable ? 'auto' : 'none' }}
            >
                <Group justify="space-between">
                    <Text fw={500} size="sm">
                        {label}
                    </Text>
                    {sortable && (
                        <Center>
                            <Icon
                                style={{
                                    width: rem(16),
                                    height: rem(16),
                                    opacity: sortable ? 1 : 0.5,
                                }}
                                stroke={1.5}
                            />
                        </Center>
                    )}
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
};

interface SVHSortTableProps<T> {
    data: T[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: Column<Record<string, any>>[];
    renderRow: (item: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SVHSortTable<T extends Record<string, any>>({
    data,
    columns,
    renderRow,
}: SVHSortTableProps<T>) {
    const { t } = useTranslation();
    const [sortedData, setSortedData] = useState<T[]>(data);
    const [sortBy, setSortBy] = useState<keyof T>('');
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const setSorting = (field: keyof T) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        const newData = sortData(data, { sortBy: field, reversed });
        setSortedData(newData);
    };

    useEffect(() => {
        const newData = sortData(data, {
            sortBy,
            reversed: reverseSortDirection,
        });
        setSortedData(newData);
    }, [data, sortBy, reverseSortDirection]);

    return (
        <Table withRowBorders withTableBorder>
            <Table.Thead>
                <Table.Tr>
                    {columns.map((column) => (
                        <Th
                            key={column.key as string}
                            label={column.label}
                            sorted={sortBy === column.key}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting(column.key as keyof T)}
                            sortable={column.sortable !== false}
                        />
                    ))}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {sortedData.length > 0 ? (
                    sortedData.map(renderRow)
                ) : (
                    <Table.Tr>
                        <Table.Td colSpan={columns.length}>
                            <Text size="sm" ta="center" fw={500}>
                                {t('COMMON.DATA_EMPTY')}
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                )}
            </Table.Tbody>
        </Table>
    );
}

function sortData<T>(
    data: T[],
    payload: { sortBy: keyof T | null; reversed: boolean }
): T[] {
    if (!payload.sortBy) {
        return data;
    }

    // Verwenden Sie sortBy nur, wenn es nicht null ist
    return [...data].sort((a, b) => {
        const aValue = getSafeProperty(a, payload.sortBy as keyof T);
        const bValue = getSafeProperty(b, payload.sortBy as keyof T);
        return payload.reversed
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
    });
}

function getSafeProperty<T, K extends keyof T>(obj: T, key: K): string {
    const value = obj[key];
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return value.toString();
    }
    return ''; // oder andere Logik, um nicht-string/number-Werte zu handhaben
}

export default SVHSortTable;
