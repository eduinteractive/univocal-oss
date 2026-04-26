import { EDIModal, EDISelect } from '@eduinteractive/mantine-common';
import { useState } from 'react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { GROUP_PERMISSION_LEVELS } from '../../constants/Enums';

interface SVHViewAccessEditProps {
    initial: number | null;
    value: number;
    onChange: (value: number) => void;
}

const SVHViewAccessEdit = (props: SVHViewAccessEditProps) => {
    const { t } = useTranslation();
    const [newValue, setNewValue] = useState<null | number>(null);

    return (
        <>
            <EDIModal
                visible={newValue !== null}
                title={t('COMMON.VIEW_ACCESS_EDIT_TITLE')}
                type="DEFAULT"
                onClose={() => setNewValue(null)}
                onSubmit={() => {
                    if (newValue !== null) {
                        props.onChange(newValue);
                        setNewValue(null);
                    }
                }}
            >
                <Text size="sm">
                    {props.initial && props.initial < newValue!
                        ? t('COMMON.VIEW_ACCESS_LESS_NOTICE')
                        : t('COMMON.VIEW_ACCESS_HIGH_NOTICE')}
                </Text>
            </EDIModal>
            <EDISelect
                label={t('COMMON.ATTRIBUTES.VIEW_ACCESS')}
                placeholder={t('COMMON.ATTRIBUTES.VIEW_ACCESS_PLACEHOLDER')}
                value={props.value.toString()}
                onChange={(value) => {
                    if (value === null) return;
                    if (
                        props.initial === null ||
                        props.initial === undefined ||
                        props.initial === parseInt(value as string)
                    ) {
                        props.onChange(parseInt(value as string));
                    } else {
                        setNewValue(parseInt(value as string));
                    }
                }}
                data={GROUP_PERMISSION_LEVELS.map((key) => ({
                    value: key.value.toString(),
                    label: key.label,
                }))}
                required
            />
        </>
    );
};

export default SVHViewAccessEdit;
