import { ActionIcon, Group, Table, Text } from '@mantine/core';
import { Budget, BudgetPosition, BudgetReceipt } from '@eduinteractive/uvc-api';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import { useCallback, useMemo } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface BudgetGroupProps {
    ist_active?: boolean;
    receipt_active?: boolean;
    receipts?: BudgetReceipt[];
    budget: Budget;
    group: BudgetPosition;
    positions: BudgetPosition[];
    onAdd: (parent: string) => void;
    onEdit: (position: BudgetPosition) => void;
    onDelete: (positionId: string) => void;
}

const BudgetGroup = (props: BudgetGroupProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();

    const hasPermission = useMemo(() => {
        return checkPermission(currentTenant!, 'budget:edit') || props.budget.authorId === authData?._id;
    }, [currentTenant, authData, props.budget]);

    const getPositionIstAmount = useCallback((
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
    }, [props.receipts, props.receipt_active]);

    const groupSollAmount = useMemo(
        () =>
            Math.round(
                (props.positions.reduce(
                    (prev, curr) => prev + curr.soll_amount,
                    0
                ) +
                    Number.EPSILON) *
                    100
            ) / 100,
        [props.positions]
    );

    const groupIstAmount = useMemo(
        () =>
            Math.round(
                (props.positions.reduce(
                    (prev, curr) =>
                        prev + getPositionIstAmount(curr._id, curr.ist_amount),
                    0
                ) +
                    Number.EPSILON) *
                    100
            ) / 100,
        [props.positions, getPositionIstAmount]
    );

    return (
        <Table withRowBorders withTableBorder withColumnBorders>
            <colgroup>
                <col style={{ width: '55%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
            </colgroup>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>{props.group.title}</Table.Th>
                    <Table.Th>{groupSollAmount.toFixed(2)} €</Table.Th>
                    {props.ist_active && (
                        <Table.Th>{groupIstAmount.toFixed(2)} €</Table.Th>
                    )}
                    {hasPermission && (
                        <Table.Th w="100%">
                            <Group gap="xs" justify="right">
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() => props.onEdit(props.group)}
                                >
                                    <IconEdit size={24} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="subtle"
                                    color='gray'
                                    onClick={() =>
                                        props.onDelete(props.group._id)
                                    }
                                >
                                    <IconTrash size={24} />
                                </ActionIcon>
                            </Group>
                        </Table.Th>
                    )}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {props.positions.map((position) => (
                    <Table.Tr key={position._id}>
                        <Table.Td>{position.title}</Table.Td>
                        <Table.Td>
                            {(
                                Math.round(
                                    (position.soll_amount + Number.EPSILON) * 100
                                ) / 100
                            ).toFixed(2)}{' '}
                            €
                        </Table.Td>
                        {props.ist_active && (
                            <Table.Td>
                                {getPositionIstAmount(
                                    position._id,
                                    position.ist_amount
                                ).toFixed(2)}{' '}
                                €
                            </Table.Td>
                        )}
                        {hasPermission && (
                            <Table.Td>
                                <Group gap="xs" justify="right">
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={() => props.onEdit(position)}
                                    >
                                        <IconEdit size={24} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() =>
                                            props.onDelete(position._id)
                                        }
                                    >
                                        <IconTrash size={24} />
                                    </ActionIcon>
                                </Group>
                            </Table.Td>
                        )}
                    </Table.Tr>
                ))}
                <Table.Tr>
                    <Table.Td colSpan={4}>
                        <Group
                            justify={
                                props.positions.length === 0
                                    ? 'space-between'
                                    : 'right'
                            }
                        >
                            {props.positions.length === 0 && (
                                <Text size="sm">
                                    {t("COMMON.DATA_EMPTY")}
                                </Text>
                            )}
                            {hasPermission && (
                                <ActionIcon
                                    variant="subtle"
                                    onClick={() => props.onAdd(props.group._id)}
                                >
                                    <IconPlus size={24} />
                                </ActionIcon>
                            )}
                        </Group>
                    </Table.Td>
                </Table.Tr>
            </Table.Tbody>
        </Table>
    );
};

export default BudgetGroup;
