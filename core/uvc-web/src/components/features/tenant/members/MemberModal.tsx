import { TenantUser } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { EDIModal, EDISelect, EDITextInput } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';
import { GROUP_PERMISSION_LEVELS } from '../../../../constants/Enums';

export interface MemberModalSubmitData {
    permission: number;
    email: string;
}

interface MemberModalProps {
    user: TenantUser | null;
    onClose: () => void;
    onSave: (permission: number, email: string) => void;
}

const MemberModal = (props: MemberModalProps) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<number | null>(null);

    useEffect(() => {
        if (props.user) {
            setPermission(props.user.group_permission);
        } else {
            setPermission(null);
        }
    }, [props.user]);

    return (
        <EDIModal
            title={props.user?._id !== '' ? t('MEMBERS.MODAL.EDIT') : t('MEMBERS.MODAL.INVITE')}
            type='DEFAULT'
            visible={props.user !== null}
            onClose={props.onClose}
            onSubmit={() =>
                permission !== null ? props.onSave(permission, email) : null
            }
            isForm
        >
            <EDITextInput
                disabled={props.user?._id !== ''}
                label={props.user?._id !== '' ? t('MEMBERS.MODAL.MEMBER') : t('COMMON.CONTACT.EMAIL')}
                value={props.user?._id !== '' ? `${props.user?.firstName || ''} ${props.user?.lastName || ''}` : email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder={t('COMMON.CONTACT.EMAIL')}
            />
            <EDISelect
                label={t('ADMIN.ATTRIBUTES.ACCESS')}
                placeholder={t('ADMIN.ATTRIBUTES.ACCESS_PLACEHOLDER')}
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

export default MemberModal;
