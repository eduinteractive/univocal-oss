import { useEffect, useState } from 'react';
import { BudgetPosition, BudgetPositionType } from '@eduinteractive/uvc-api';
import {
    EDIModal,
    EDINumberInput,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import SVHTextArea from '../../../common/SVHTextArea';
import { useTranslation } from 'react-i18next';

interface BudgetPositionModalSubmitData {
    title: string;
    description: string;
    soll_amount: number;
    ist_amount: number;
    type: BudgetPositionType;
    parent?: string;
}

interface BudgetPositionModalProps {
    ist_active?: boolean;
    receipt_active?: boolean;
    data: BudgetPosition | { type: BudgetPositionType; parent?: string } | null;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: BudgetPositionModalSubmitData) => void;
}

const BudgetPositionModal = (props: BudgetPositionModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [soll_amount, setSollAmount] = useState(0);
    const [ist_amount, setIstAmount] = useState(0);

    useEffect(() => {
        if (props.data && 'title' in props.data) {
            const data = props.data as BudgetPosition;
            setTitle(data.title);
            setDescription(data.description || '');
            setSollAmount(data.soll_amount);
            setIstAmount(data.ist_amount || 0);
        } else {
            setTitle('');
            setDescription('');
            setSollAmount(0);
            setIstAmount(0);
        }
    }, [props.data]);

    const handleSubmit = () => {
        if (!title) {
            return NotificationHandler.showError(t("COMMON.ATTRIBUTES.TITLE_ERROR"));
        }
        if (ist_amount < 0) {
            return NotificationHandler.showError(t("BUDGET.ATTRIBUTES.IST_AMOUNT_ERROR"));
        }
        if (soll_amount < 0) {
            return NotificationHandler.showError(t("BUDGET.ATTRIBUTES.SOLL_AMOUNT_ERROR"));
        }
        props.onSubmit({
            title,
            description,
            soll_amount: Math.round((soll_amount + Number.EPSILON) * 100) / 100,
            ist_amount: Math.round((ist_amount + Number.EPSILON) * 100) / 100,
            type: props.data!.type,
            parent: props.data ? props.data?.parent : undefined,
        });
    };

    return (
        <EDIModal
            type="DEFAULT"
            title={
                props.data && 'title' in props.data
                    ? t('BUDGET.POSITION_EDIT')
                    : t('BUDGET.POSITION_NEW')
            }
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
        >
            <EDITextInput
                label={t("COMMON.ATTRIBUTES.TITLE")}
                placeholder={t("COMMON.ATTRIBUTES.TITLE_PLACEHOLDER")}
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                required
            />
            <SVHTextArea
                label={t("COMMON.ATTRIBUTES.DESCRIPTION")}
                placeholder={t("COMMON.ATTRIBUTES.DESCRIPTION_PLACEHOLDER")}
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                autosize
                minRows={3}
            />
            {props.data &&
                (props.data.type === BudgetPositionType.EXPENSE ||
                    props.data.type === BudgetPositionType.INCOME) && (
                    <>
                        <EDINumberInput
                            label={t("BUDGET.ATTRIBUTES.SOLL_AMOUNT")}
                            placeholder={t("BUDGET.ATTRIBUTES.SOLL_AMOUNT_PLACEHOLDER")}
                            value={soll_amount}
                            onChange={(value) =>
                                setSollAmount(
                                    typeof value === 'number' ? value : 0
                                )
                            }
                            decimalScale={2}
                            required
                            fixedDecimalScale
                        />
                        {props.ist_active && !props.receipt_active && (
                            <EDINumberInput
                                label={t("BUDGET.ATTRIBUTES.IST_AMOUNT")}
                                placeholder={t("BUDGET.ATTRIBUTES.IST_AMOUNT_PLACEHOLDER")}
                                value={ist_amount}
                                onChange={(value) =>
                                    setIstAmount(
                                        typeof value === 'number' ? value : 0
                                    )
                                }
                                decimalScale={2}
                                fixedDecimalScale
                            />
                        )}
                    </>
                )}
        </EDIModal>
    );
};

export default BudgetPositionModal;
