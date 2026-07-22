import { Flex, Group, Table } from '@mantine/core';
import BudgetGroupButton from './BudgetGroupButton';
import { Budget, BudgetPosition, BudgetPositionType, BudgetReceipt } from '@eduinteractive/uvc-api';
import { useEffect, useMemo, useState } from 'react';
import BudgetGroupList from './BudgetGroupList';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export interface BudgetGroupsWithPosition {
    group: BudgetPosition;
    positions: BudgetPosition[];
}

interface BudgetGroupsProps {
    ist_active?: boolean;
    receipt_active?: boolean;
    receipts?: BudgetReceipt[];
    budget: Budget;
    positions: BudgetPosition[];
    onAdd: (type: BudgetPositionType, parent?: string) => void;
    onEdit: (position: BudgetPosition) => void;
    onDelete: (positionId: string) => void;
}

const BudgetGroups = (props: BudgetGroupsProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();

    const [incomeGroups, setIncomeGroups] = useState<
        BudgetGroupsWithPosition[]
    >([]);
    const [expenseGroups, setExpenseGroups] = useState<
        BudgetGroupsWithPosition[]
    >([]);

    const hasPermission = useMemo(() => {
        return checkPermission(currentTenant!, 'budget:edit') || props.budget.authorId === authData?._id;
    }, [currentTenant, authData, props.budget]);

    const getPositionIstAmount = (
        positionId: string,
        ist_amount: number | undefined
    ) => {
        if (props.receipt_active) {
            return Math.round(
                ((props.receipts || [])
                    .filter((receipt) => receipt.positionId === positionId)
                    .reduce((sum, receipt) => sum + receipt.amount, 0) +
                    Number.EPSILON) *
                    100
            ) / 100;
        }
        return Math.round(((ist_amount || 0) + Number.EPSILON) * 100) / 100;
    };

    const incomeSollValue = useMemo(
        () =>
            props.positions
                .reduce((prev, curr) => {
                    if (
                        curr.type === BudgetPositionType.INCOME &&
                        curr.parent
                    ) {
                        return prev + curr.soll_amount;
                    } else {
                        return prev;
                    }
                }, 0)
                .toFixed(2),
        [props.positions]
    );

    const incomeIstValue = useMemo(
        () =>
            props.positions
                .reduce((prev, curr) => {
                    if (
                        curr.type === BudgetPositionType.INCOME &&
                        curr.parent
                    ) {
                        return (
                            prev +
                            getPositionIstAmount(curr._id, curr.ist_amount)
                        );
                    } else {
                        return prev;
                    }
                }, 0)
                .toFixed(2),
        [props.positions, props.receipts, props.receipt_active]
    );

    const expenseSollValue = useMemo(
        () =>
            props.positions
                .reduce((prev, curr) => {
                    if (
                        curr.type === BudgetPositionType.EXPENSE &&
                        curr.parent
                    ) {
                        return prev + (curr.soll_amount || 0);
                    } else {
                        return prev;
                    }
                }, 0)
                .toFixed(2),
        [props.positions]
    );

    const expenseIstValue = useMemo(
        () =>
            props.positions
                .reduce((prev, curr) => {
                    if (
                        curr.type === BudgetPositionType.EXPENSE &&
                        curr.parent
                    ) {
                        return (
                            prev +
                            getPositionIstAmount(curr._id, curr.ist_amount)
                        );
                    } else {
                        return prev;
                    }
                }, 0)
                .toFixed(2),
        [props.positions, props.receipts, props.receipt_active]
    );

    useEffect(() => {
        const incomeGroups: BudgetGroupsWithPosition[] = [];
        const expenseGroups: BudgetGroupsWithPosition[] = [];

        props.positions.forEach((position) => {
            if (position.type === BudgetPositionType.GROUP_INCOME) {
                incomeGroups.push({
                    group: position,
                    positions: props.positions.filter(
                        (p) => p.parent === position._id
                    ),
                });
            } else if (position.type === BudgetPositionType.GROUP_EXPENSE) {
                expenseGroups.push({
                    group: position,
                    positions: props.positions.filter(
                        (p) => p.parent === position._id
                    ),
                });
            }
        });

        const sortUnassignedLast = (
            a: BudgetGroupsWithPosition,
            b: BudgetGroupsWithPosition
        ) =>
            Number(!!a.group.without_assignment) -
            Number(!!b.group.without_assignment);

        incomeGroups.sort(sortUnassignedLast);
        expenseGroups.sort(sortUnassignedLast);

        setIncomeGroups(incomeGroups);
        setExpenseGroups(expenseGroups);
    }, [props.positions]);

    return (
        <Flex direction="column" gap="md" pb="xl">
            <Table withRowBorders withTableBorder withColumnBorders bg="gray.2">
                <colgroup>
                    <col style={{ width: '55%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                </colgroup>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t("BUDGET.GROUP_TITLE")}</Table.Th>
                        <Table.Th>{t("BUDGET.GROUP_SOLL_AMOUNT")}</Table.Th>
                        {props.ist_active && <Table.Th>{t("BUDGET.GROUP_IST_AMOUNT")}</Table.Th>}
                        {hasPermission && (
                            <Table.Th w="100%">
                                <Group justify="right">{t("COMMON.ACTIONS")}</Group>
                            </Table.Th>
                        )}
                    </Table.Tr>
                </Table.Thead>
            </Table>
            <Table
                mt="xs"
                withRowBorders
                withTableBorder
                withColumnBorders
                style={{
                    borderBottomWidth: 2.5,
                    borderBottomColor: 'green',
                }}
                bg="green.1"
            >
                <colgroup>
                    <col style={{ width: '55%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                </colgroup>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td fw="bold">{t("BUDGET.INCOME")}</Table.Td>
                        <Table.Td>{incomeSollValue} €</Table.Td>
                        {props.ist_active && (
                            <Table.Td>{incomeIstValue} €</Table.Td>
                        )}
                        <Table.Td></Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
            <BudgetGroupList
                ist_active={props.ist_active}
                receipt_active={props.receipt_active}
                receipts={props.receipts}
                budget={props.budget}
                data={incomeGroups}
                onAdd={(parent) =>
                    props.onAdd(BudgetPositionType.INCOME, parent)
                }
                onEdit={props.onEdit}
                onDelete={props.onDelete}
            />
            {hasPermission && (
                <BudgetGroupButton
                    title={t("BUDGET.INCOME_NEW")}
                    onAdd={() => props.onAdd(BudgetPositionType.GROUP_INCOME)}
                />
            )}
            <Table
                mt="xs"
                withTableBorder
                withColumnBorders
                style={{
                    borderBottomWidth: 2.5,
                    borderBottomColor: 'red',
                }}
                bg="red.1"
            >
                <colgroup>
                    <col style={{ width: '55%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                </colgroup>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td fw="bold">{t("BUDGET.EXPENSE")}</Table.Td>
                        <Table.Td>{expenseSollValue} €</Table.Td>
                        {props.ist_active && (
                            <Table.Td>{expenseIstValue} €</Table.Td>
                        )}
                        <Table.Td></Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
            <BudgetGroupList
                ist_active={props.ist_active}
                receipt_active={props.receipt_active}
                receipts={props.receipts}
                budget={props.budget}
                data={expenseGroups}
                onAdd={(parent) =>
                    props.onAdd(BudgetPositionType.EXPENSE, parent)
                }
                onEdit={props.onEdit}
                onDelete={props.onDelete}
            />
            {hasPermission && (
                <BudgetGroupButton
                    title={t("BUDGET.EXPENSE_NEW")}
                    onAdd={() => props.onAdd(BudgetPositionType.GROUP_EXPENSE)}
                />
            )}
            <Table
                mt="xs"
                withRowBorders
                withTableBorder
                withColumnBorders
                style={{
                    borderBottomWidth: 2.5,
                    borderBottomColor: 'gray',
                }}
                bg="gray.1"
            >
                <colgroup>
                    <col style={{ width: '55%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                </colgroup>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td fw="bold">{t("BUDGET.TOTAL")}</Table.Td>
                        <Table.Td fw="bold">
                            {(
                                parseFloat(incomeSollValue) -
                                parseFloat(expenseSollValue)
                            ).toFixed(2)}{' '}
                            €
                        </Table.Td>
                        {props.ist_active && (
                            <Table.Td fw="bold">
                                {(
                                    parseFloat(incomeIstValue) -
                                    parseFloat(expenseIstValue)
                                ).toFixed(2)}{' '}
                                €
                            </Table.Td>
                        )}
                        <Table.Td></Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </Flex>
    );
};

export default BudgetGroups;
