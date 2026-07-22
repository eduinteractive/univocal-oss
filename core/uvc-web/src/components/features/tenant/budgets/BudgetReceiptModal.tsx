import { useEffect, useMemo, useState } from 'react';
import {
    BudgetPosition,
    BudgetPositionType,
    BudgetReceipt,
} from '@eduinteractive/uvc-api';
import {
    EDIModal,
    EDINumberInput,
    EDISelect,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { Box, Button, Group, Text, useMantineTheme } from '@mantine/core';
import {
    Dropzone,
    IMAGE_MIME_TYPE,
    MS_EXCEL_MIME_TYPE,
    MS_WORD_MIME_TYPE,
    PDF_MIME_TYPE,
} from '@mantine/dropzone';
import {
    IconCheck,
    IconFile,
    IconTrash,
    IconX,
} from '@tabler/icons-react';
import SVHTextArea from '../../../common/SVHTextArea';
import SVHDateInput from '../../../common/SVHDateInput';
import { useTranslation } from 'react-i18next';

export interface BudgetReceiptModalSubmitData {
    positionId?: string;
    amount: number;
    description?: string;
    date: Date | string;
    file?: { title: string; link: string; mimetype: string };
    newFile?: File;
}

interface BudgetReceiptModalProps {
    data: BudgetReceipt | null;
    positions: BudgetPosition[];
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: BudgetReceiptModalSubmitData) => void;
}

const BudgetReceiptModal = (props: BudgetReceiptModalProps) => {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const [positionId, setPositionId] = useState<string | null>(null);
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | null>(new Date());
    const [newFile, setNewFile] = useState<File | undefined>(undefined);
    const [file, setFile] = useState<{ title: string; link: string; mimetype: string } | undefined>(props.data?.file || undefined);
    
    useEffect(() => {
        if (!props.visible) {
            return;
        }
        if (props.data) {
            const position = props.positions.find(
                (p) => p._id === props.data!.positionId
            );
            setPositionId(
                position && !position.without_assignment
                    ? props.data.positionId
                    : null
            );
            setAmount(props.data.amount);
            setDescription(props.data.description || '');
            setDate(props.data.date ? new Date(props.data.date) : new Date());
            setNewFile(undefined);
            setFile(props.data.file || undefined);
        } else {
            setPositionId(null);
            setAmount(0);
            setDescription('');
            setDate(new Date());
            setNewFile(undefined);
            setFile(undefined);
        }
    }, [props.visible, props.data, props.positions]);

    const positionOptions = useMemo(() => {
        const groups = props.positions.filter(
            (p) =>
                p.type === BudgetPositionType.GROUP_INCOME ||
                p.type === BudgetPositionType.GROUP_EXPENSE
        );

        const toOption = (position: BudgetPosition) => {
            const group = groups.find((g) => g._id === position.parent);
            return {
                value: position._id,
                label: group
                    ? `${group.title} › ${position.title}`
                    : position.title,
            };
        };

        const sortByLabel = (
            a: { label: string },
            b: { label: string }
        ) => a.label.localeCompare(b.label, 'de');

        const incomeItems = props.positions
            .filter(
                (p) =>
                    p.type === BudgetPositionType.INCOME &&
                    p.parent &&
                    !p.without_assignment
            )
            .map(toOption)
            .sort(sortByLabel);

        const expenseItems = props.positions
            .filter(
                (p) =>
                    p.type === BudgetPositionType.EXPENSE &&
                    p.parent &&
                    !p.without_assignment
            )
            .map(toOption)
            .sort(sortByLabel);

        return [
            ...(incomeItems.length > 0
                ? [{ group: t('BUDGET.INCOME'), items: incomeItems }]
                : []),
            ...(expenseItems.length > 0
                ? [{ group: t('BUDGET.EXPENSE'), items: expenseItems }]
                : []),
        ];
    }, [props.positions, t]);

    const handleSubmit = () => {
        if (amount < 0) {
            return NotificationHandler.showError(
                t('BUDGET.ATTRIBUTES.AMOUNT_ERROR')
            );
        }
        if (!date) {
            return NotificationHandler.showError(
                t('BUDGET.ATTRIBUTES.DATE_ERROR')
            );
        }
        const resolvedPositionId =
            positionId || props.data?.positionId || undefined;
        if (props.data && !resolvedPositionId) {
            return NotificationHandler.showError(
                t('BUDGET.ATTRIBUTES.POSITION_ERROR')
            );
        }
        props.onSubmit({
            positionId: resolvedPositionId,
            amount: Math.round((amount + Number.EPSILON) * 100) / 100,
            description: description || undefined,
            date,
            file: file || undefined,
            newFile,
        });
    };

    const handleRemoveFile = () => {
        setNewFile(undefined);
        setFile(undefined);
    };

    return (
        <EDIModal
            type="DEFAULT"
            title={
                props.data ? t('BUDGET.RECEIPT_EDIT') : t('BUDGET.RECEIPT_NEW')
            }
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
        >
            <EDINumberInput
                label={t('BUDGET.ATTRIBUTES.AMOUNT')}
                placeholder={t('BUDGET.ATTRIBUTES.AMOUNT_PLACEHOLDER')}
                value={amount}
                onChange={(value) =>
                    setAmount(typeof value === 'number' ? value : 0)
                }
                decimalScale={2}
                required
                fixedDecimalScale
            />
            <SVHDateInput
                label={t('BUDGET.ATTRIBUTES.DATE')}
                placeholder={t('BUDGET.ATTRIBUTES.DATE_PLACEHOLDER')}
                value={date}
                onChange={(value) => setDate(value)}
                required
            />
            <EDISelect
                label={t('BUDGET.POSITION')}
                placeholder={t('BUDGET.ATTRIBUTES.POSITION_PLACEHOLDER')}
                data={positionOptions}
                value={positionId}
                onChange={(value) => setPositionId(value)}
                clearable
                searchable
            />
            <SVHTextArea
                label={t('COMMON.ATTRIBUTES.DESCRIPTION')}
                placeholder={t('COMMON.ATTRIBUTES.DESCRIPTION_PLACEHOLDER')}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                autosize
                minRows={3}
            />
            {newFile || file ? (
                <Box
                    mt="sm"
                    mb="sm"
                    style={{
                        border: `1px dashed ${theme.colors.gray[4]}`,
                        padding: theme.spacing.xl,
                        textAlign: 'center',
                    }}
                >
                    <IconFile size={50} stroke={1.5} />
                    <Text size="md" mt="md">
                        {newFile ? newFile.name : file?.title}
                    </Text>
                    <Group mt="md" justify="center">
                        <Button color="red" onClick={handleRemoveFile}>
                            <IconTrash size={14} />
                            <Text ml="xs" size="sm">
                                {t('COMMON.MULTIDROPZONE_FILES_DELETE')}
                            </Text>
                        </Button>
                    </Group>
                </Box>
            ) : (
                <Dropzone
                    mt="sm"
                    mb="sm"
                    onDrop={(files) => setNewFile(files[0])}
                    maxSize={5 * 1024 ** 2}
                    maxFiles={1}
                    accept={[
                        ...IMAGE_MIME_TYPE,
                        ...PDF_MIME_TYPE,
                        ...MS_WORD_MIME_TYPE,
                        ...MS_EXCEL_MIME_TYPE,
                    ]}
                    onReject={() =>
                        NotificationHandler.showError(
                            t('COMMON.DROPZONE_TO_BIG')
                        )
                    }
                >
                    <Group
                        justify="center"
                        style={{ minHeight: 100, pointerEvents: 'none' }}
                    >
                        <Dropzone.Accept>
                            <IconCheck size={50} stroke={1.5} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX size={50} stroke={1.5} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconFile size={50} stroke={1.5} />
                        </Dropzone.Idle>
                        <div>
                            <Text size="md" ta="center">
                                {t('COMMON.MULTIDROPZONE_FILES')}
                            </Text>
                            <Text size="sm" c="dimmed" ta="center">
                                {t('COMMON.MULTIDROPZONE_FILES_MAX_SIZE')}
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
            )}
        </EDIModal>
    );
};

export default BudgetReceiptModal;
