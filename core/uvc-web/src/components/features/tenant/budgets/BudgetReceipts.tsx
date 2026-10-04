import { ActionIcon, Anchor, Button, Flex, Group, Table, Text } from '@mantine/core';
import { Budget, BudgetPosition, BudgetReceipt } from '@eduinteractive/uvc-api';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { checkPermission } from '../../../../utils/Permission';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { EDIDeleteDialog } from '@eduinteractive/mantine-common';

interface BudgetReceiptsProps {
    budget: Budget;
    receipts: BudgetReceipt[];
    positions: BudgetPosition[];
    onAdd: () => void;
    onEdit: (receipt: BudgetReceipt) => void;
    onDelete: (receiptId: string) => void;
}

const BudgetReceipts = (props: BudgetReceiptsProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();
    const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);

    const hasPermission = useMemo(() => {
        return (
            checkPermission(currentTenant!, 'budget:edit') ||
            props.budget.authorId === authData?._id
        );
    }, [currentTenant, authData, props.budget]);

    const sortedReceipts = useMemo(() => {
        return [...props.receipts].sort(
            (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
        );
    }, [props.receipts]);

    const getPositionTitle = (positionId: string) => {
        const position = props.positions.find((p) => p._id === positionId);
        if (!position) {
            return '–';
        }
        if (position.without_assignment) {
            return t('BUDGET.RECEIPT_UNASSIGNED');
        }
        return position.title;
    };

    return (
        <>
            <EDIDeleteDialog
                title={t('COMMON.DELETE_TITLE')}
                description={t('COMMON.DELETE_DESCRIPTION')}
                visible={!!receiptToDelete}
                onSubmit={() => {
                    if (receiptToDelete) {
                        props.onDelete(receiptToDelete);
                        setReceiptToDelete(null);
                    }
                }}
                onClose={() => setReceiptToDelete(null)}
                type="CONFIRM"
            />
            {hasPermission && (
                <Flex justify="flex-end" mb="md">
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={props.onAdd}
                    >
                        {t('BUDGET.RECEIPT_NEW')}
                    </Button>
                </Flex>
            )}
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>{t('BUDGET.ATTRIBUTES.DATE')}</Table.Th>
                        <Table.Th>{t('BUDGET.ATTRIBUTES.AMOUNT')}</Table.Th>
                        <Table.Th>{t('BUDGET.POSITION')}</Table.Th>
                        <Table.Th>
                            {t('COMMON.ATTRIBUTES.DESCRIPTION')}
                        </Table.Th>
                        <Table.Th>{t('BUDGET.RECEIPT_FILE')}</Table.Th>
                        {hasPermission && <Table.Th />}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {sortedReceipts.map((receipt) => (
                        <Table.Tr key={receipt._id}>
                            <Table.Td>
                                {dayjs(receipt.date).format('DD.MM.YYYY')}
                            </Table.Td>
                            <Table.Td>
                                {Number(receipt.amount).toFixed(2)} €
                            </Table.Td>
                            <Table.Td>
                                {getPositionTitle(receipt.positionId)}
                            </Table.Td>
                            <Table.Td>{receipt.description || '–'}</Table.Td>
                            <Table.Td>
                                {receipt.file?.link ? (
                                    <Anchor
                                        href={`${
                                            import.meta.env.VITE_KUBERNETES_HOST
                                        }/api/tenant/tenant/${currentTenant?._id}/budget/${props.budget._id}/receipt/${receipt._id}/download/${encodeURIComponent(
                                            receipt.file.link
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {receipt.file.title ||
                                            t('BUDGET.RECEIPT_FILE')}
                                    </Anchor>
                                ) : (
                                    '–'
                                )}
                            </Table.Td>
                            {hasPermission && (
                                <Table.Td>
                                    <Group gap="xs" justify="right">
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={() => props.onEdit(receipt)}
                                        >
                                            <IconEdit size={20} />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="subtle"
                                            color="gray"
                                            onClick={() =>
                                                setReceiptToDelete(receipt._id)
                                            }
                                        >
                                            <IconTrash size={20} />
                                        </ActionIcon>
                                    </Group>
                                </Table.Td>
                            )}
                        </Table.Tr>
                    ))}
                    {sortedReceipts.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={hasPermission ? 6 : 5}>
                                <Text c="dimmed" size="sm">
                                    {t('BUDGET.RECEIPT_EMPTY')}
                                </Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </>
    );
};

export default BudgetReceipts;
