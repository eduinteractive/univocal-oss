import { useState } from 'react';
import { EDIModal, EDISelect, EDITextInput, NotificationHandler } from '@eduinteractive/mantine-common';
import { GROUP_PERMISSION_LEVELS } from '../../../constants/Enums';
import { useTranslation } from 'react-i18next';

export interface DomainMemberModalSubmitData {
    permission: number;
    email: string;
}

interface DomainMemberModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: DomainMemberModalSubmitData) => void;
}

const DomainMemberModal = (props: DomainMemberModalProps) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<number | null>(null);

    const handleSubmit = () => {
        if (!email || !permission) {
            return NotificationHandler.showError(t("COMMON.ATTRIBUTES.FILL_ALL_FIELDS"));
        }

        props.onSave({ email, permission });
    };

    return (
        <EDIModal
            title={t("ADMIN.MEMBER_INVITE")}
            type='DEFAULT'
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
        >
            <EDITextInput
                label={t("AUTH.ATTRIBUTES.EMAIL")}
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder={t("AUTH.ATTRIBUTES.EMAIL_PLACEHOLDER")}
            />
            <EDISelect
                label={t("ADMIN.ATTRIBUTES.ACCESS")}
                placeholder={t("ADMIN.ATTRIBUTES.ACCESS_PLACEHOLDER")}
                data={GROUP_PERMISSION_LEVELS.map((permission) => ({
                    value: permission.value.toString(),
                    label: permission.label,
                }))}
                onChange={(e) => {
                    if (e) {
                        setPermission(parseInt(e));
                    } else {
                        setPermission(null);
                    }
                }}
                mb="md"
                value={permission?.toString() || ''}
            />
        </EDIModal>
    );
};

export default DomainMemberModal;
