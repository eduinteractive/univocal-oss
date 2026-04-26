import { useEffect, useState } from 'react';
import { Budget } from '@eduinteractive/uvc-api';
import { EDINumberInput } from '@eduinteractive/mantine-common';
import { useTenant } from '../../../../context/TenantContext';
import SVHMetaModal, {
    SVHMetaModalSubmitData,
} from '../../../common/SVHMetaModal';
import { useTranslation } from 'react-i18next';

interface BudgetModalSubmitProps extends SVHMetaModalSubmitData {
    viewAccess: number;
    year?: number;
}

interface BudgetModalProps {
    data?: Budget;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: BudgetModalSubmitProps) => void;
}

const BudgetModal = (props: BudgetModalProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [year, setYear] = useState<number | undefined>(
        props.data?.year || undefined
    );

    useEffect(() => {
        if (props.data) {
            setYear(props.data.year || undefined);
        } else {
            setYear(undefined);
        }
    }, [currentTenant?.permissionLevel, props.data]);

    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        props.onSubmit({ ...data, year } as BudgetModalSubmitProps);
    };

    return (
        <SVHMetaModal
            config={{ viewAccess: true }}
            data={props.data || null}
            title={props.data ? t('BUDGET.EDIT') : t('BUDGET.CREATE')}
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
        >
            <EDINumberInput
                label={t('BUDGET.ATTRIBUTES.YEAR')}
                placeholder={t('BUDGET.ATTRIBUTES.YEAR_PLACEHOLDER')}
                value={year}
                onChange={(value) => {
                    if (value === '') {
                        setYear(undefined);
                    } else {
                        setYear(value as number);
                    }
                }}
            />
        </SVHMetaModal>
    );
};

export default BudgetModal;
