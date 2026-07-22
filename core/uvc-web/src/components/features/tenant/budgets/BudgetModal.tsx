import { useEffect, useState } from 'react';
import { Budget } from '@eduinteractive/uvc-api';
import { ActionIcon, Popover, TagsInput, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTenant } from '../../../../context/TenantContext';
import SVHMetaModal, {
    SVHMetaModalSubmitData,
} from '../../../common/SVHMetaModal';
import { useTranslation } from 'react-i18next';
import classes from '../../../common/SVHInput.module.css';

interface BudgetModalSubmitProps extends SVHMetaModalSubmitData {
    viewAccess: number;
    category?: string;
}

interface BudgetModalProps {
    data?: Budget;
    categories?: string[];
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: BudgetModalSubmitProps) => void;
}

const BudgetModal = (props: BudgetModalProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [category, setCategory] = useState<string>(
        props.data?.category || ''
    );
    const [infoOpened, setInfoOpened] = useState(false);

    useEffect(() => {
        if (props.data) {
            setCategory(props.data.category || '');
        } else {
            setCategory('');
        }
    }, [currentTenant?.permissionLevel, props.data]);

    const handleSubmit = (data: SVHMetaModalSubmitData) => {
        props.onSubmit({
            ...data,
            category: category.trim() || undefined,
        } as BudgetModalSubmitProps);
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
            <TagsInput
                classNames={classes}
                my={10}
                label={t('BUDGET.ATTRIBUTES.CATEGORY')}
                placeholder={t('BUDGET.ATTRIBUTES.CATEGORY_PLACEHOLDER')}
                data={props.categories || []}
                value={category ? [category] : []}
                onChange={(tags) => setCategory(tags[tags.length - 1] || '')}
                maxTags={1}
                clearable
                rightSection={
                    <Popover
                        width={280}
                        position="bottom-end"
                        withArrow
                        shadow="md"
                        opened={infoOpened}
                        onChange={setInfoOpened}
                    >
                        <Popover.Target>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                onClick={() => setInfoOpened((open) => !open)}
                                aria-label={t('BUDGET.ATTRIBUTES.CATEGORY')}
                            >
                                <IconInfoCircle size={18} />
                            </ActionIcon>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                                {t('BUDGET.ATTRIBUTES.CATEGORY_DESCRIPTION')}
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                }
            />
        </SVHMetaModal>
    );
};

export default BudgetModal;
