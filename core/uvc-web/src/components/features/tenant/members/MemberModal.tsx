import { TenantUser } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { EDIModal, EDISelect, EDITextInput, NotificationHandler } from '@eduinteractive/mantine-common';
import { TagsInput, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { GROUP_PERMISSION_LEVELS } from '../../../../constants/Enums';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import classes from '../../../common/SVHInput.module.css';

const BADGE_LIMIT = 8;
const BADGE_MAX_LENGTH = 40;

const normalizeBadgeDraft = (tags: string[]) => {
    const seen = new Set<string>();
    const next: string[] = [];
    for (const raw of tags) {
        const label = raw.trim().replace(/\s+/g, ' ');
        if (!label || label.length > BADGE_MAX_LENGTH) {
            continue;
        }
        const key = label.toLowerCase();
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        if (next.length >= BADGE_LIMIT) {
            break;
        }
        next.push(label);
    }
    return next;
};

export interface MemberModalSubmitData {
    permission: number;
    email: string;
}

interface MemberModalProps {
    user: TenantUser | null;
    onClose: () => void;
    onSave: (permission: number | null, email: string, badges: string[]) => void;
}

const MemberModal = (props: MemberModalProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<number | null>(null);
    const [badges, setBadges] = useState<string[]>([]);
    const isExistingMember = !!props.user?._id;
    const canEditPermission = !!currentTenant && checkPermission(currentTenant, 'member:administration');
    const canEditBadges = isExistingMember && !!currentTenant && checkPermission(currentTenant, 'member:badges');

    useEffect(() => {
        if (props.user) {
            setPermission(props.user.group_permission);
            setBadges(props.user.badges ?? []);
            setEmail('');
        } else {
            setPermission(null);
            setBadges([]);
            setEmail('');
        }
    }, [props.user]);

    return (
        <EDIModal
            title={isExistingMember ? t('MEMBERS.MODAL.EDIT') : t('MEMBERS.MODAL.INVITE')}
            type='DEFAULT'
            visible={props.user !== null}
            onClose={props.onClose}
            onSubmit={() => {
                if (!isExistingMember) {
                    if (permission !== null) {
                        props.onSave(permission, email, []);
                    }
                    return;
                }
                props.onSave(permission, email, badges);
            }}
            isForm
        >
            <EDITextInput
                disabled={isExistingMember}
                label={isExistingMember ? t('MEMBERS.MODAL.MEMBER') : t('COMMON.CONTACT.EMAIL')}
                value={isExistingMember ? `${props.user?.firstName || ''} ${props.user?.lastName || ''}` : email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder={t('COMMON.CONTACT.EMAIL')}
            />
            {canEditPermission && (
                <EDISelect
                    label={t('ADMIN.ATTRIBUTES.ACCESS')}
                    placeholder={t('ADMIN.ATTRIBUTES.ACCESS_PLACEHOLDER')}
                    data={GROUP_PERMISSION_LEVELS.map((permissionLevel) => ({
                        value: permissionLevel.value.toString(),
                        label: permissionLevel.label,
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
            )}
            {canEditBadges && (
                <>
                    <TagsInput
                        classNames={classes}
                        label={t('MEMBERS.MODAL.BADGES')}
                        placeholder={t('MEMBERS.MODAL.BADGES_PLACEHOLDER')}
                        value={badges}
                        onChange={(tags) => {
                            const tooLong = tags.some((tag) => tag.trim().replace(/\s+/g, ' ').length > BADGE_MAX_LENGTH);
                            if (tooLong) {
                                NotificationHandler.showError(t('MEMBERS.MODAL.BADGES_TOO_LONG'));
                            }
                            setBadges(normalizeBadgeDraft(tags));
                        }}
                        maxTags={BADGE_LIMIT}
                        acceptValueOnBlur
                        clearable
                    />
                    <Text size="xs" c="dimmed" mt={4} mb="md">
                        {t('MEMBERS.MODAL.BADGES_HINT')}
                    </Text>
                </>
            )}
        </EDIModal>
    );
};

export default MemberModal;
