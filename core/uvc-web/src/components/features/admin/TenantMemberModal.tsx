import { Autocomplete, Flex, Text } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { GROUP_PERMISSION_LEVELS } from '../../../constants/Enums';
import {
    EDIModal,
    EDISelect,
} from '@eduinteractive/mantine-common';
import { TenantUser, User } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

export interface TenantMemberModalSubmit {
    mail: string;
    permissionLevel: number;
}

interface TenantMemberModalProps {
    user: TenantUser | null;
    users: User[];
    modalVisible: boolean;
    onSubmit: (values: TenantMemberModalSubmit) => void;
    onClose: () => void;
}

const TenantMemberModal = (props: TenantMemberModalProps) => {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const [permission, setPermission] = useState<number | null>(null);

    const mailOptions = useMemo(
        () => props.users.map((u) => u.mail),
        [props.users]
    );

    // Include current value in data when it's a custom email so the input is never "invalid" and submit works
    const autocompleteData = useMemo(() => {
        const trimmed = (value ?? '').trim();
        if (trimmed && !mailOptions.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
            return [trimmed, ...mailOptions];
        }
        return mailOptions;
    }, [mailOptions, value]);

    const userByMail = useMemo(() => {
        const map: Record<string, User> = {};
        props.users.forEach((u) => {
            map[u.mail.toLowerCase()] = u;
        });
        return map;
    }, [props.users]);

    useEffect(() => {
        if (props.user) {
            const mail = props.user.mail ?? props.users.find((u) => u._id === props.user!._id)?.mail ?? '';
            setValue(mail);
            setPermission(props.user.group_permission);
        } else {
            setValue('');
            setPermission(null);
        }
    }, [props.user, props.users]);

    return (
        <EDIModal
            title={
                props.user ? t('ADMIN.MEMBER_EDIT') : t('ADMIN.MEMBER_CREATE')
            }
            type="DEFAULT"
            size="md"
            visible={props.modalVisible}
            onClose={props.onClose}
            onSubmit={() => {
                const mail = (value ?? '').trim();
                if (mail && permission !== null) {
                    props.onSubmit({
                        mail,
                        permissionLevel: permission,
                    });
                }
            }}
        >
            <Autocomplete
                label={t('ADMIN.ATTRIBUTES.MEMBER')}
                placeholder={t('ADMIN.ATTRIBUTES.MEMBER_PLACEHOLDER')}
                data={autocompleteData}
                value={value}
                onChange={setValue}
                mb="md"
                disabled={props.user !== null}
                filter={({ options, search, limit }) => {
                    const lower = search.trim().toLowerCase();
                    return options
                        .filter(
                            (opt) =>
                                (opt as { value: string }).value
                                    .toLowerCase()
                                    .includes(lower)
                        )
                        .slice(0, limit);
                }}
                limit={8}
                maxDropdownHeight={280}
                renderOption={({ option }) => {
                    const user = userByMail[option.value.toLowerCase()];
                    if (!user) return <Text size="sm">{option.value}</Text>;
                    return (
                        <Flex wrap="nowrap" direction="column">
                            <Text size="sm" ml={0} pl={0}>
                                {user.firstName} {user.lastName}
                            </Text>
                            <Text c="dimmed" size="xs">
                                {user.mail}
                            </Text>
                        </Flex>
                    );
                }}
                comboboxProps={{
                    position: 'bottom-start',
                    positionDependencies: [value],
                }}
            />
            <EDISelect
                key={props.user ? `permission-${props.user._id}` : 'permission-new'}
                label={t("ADMIN.ATTRIBUTES.ACCESS")}
                placeholder={t("ADMIN.ATTRIBUTES.ACCESS_PLACEHOLDER")}
                data={GROUP_PERMISSION_LEVELS.map((p) => ({
                    value: p.value.toString(),
                    label: p.label,
                }))}
                onChange={(e) => {
                    if (e !== null && e !== undefined) {
                        setPermission(parseInt(String(e), 10));
                    } else {
                        setPermission(null);
                    }
                }}
                mb="md"
                value={permission !== null ? String(permission) : ''}
            />
        </EDIModal>
    );
};

export default TenantMemberModal;
