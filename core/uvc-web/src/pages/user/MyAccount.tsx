import {
    Button,
    Fieldset,
    Flex,
    Group,
    Text,
    Title,
} from '@mantine/core';
import { useAuth } from '../../context/AuthContext';
import { SAPI } from '@eduinteractive/uvc-api';
import { UserContact } from '@eduinteractive/uvc-api';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import SVHPageWrapper from '../../components/common/SVHPageWrapper';
import {
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { PASSWORD_REGEX } from '../../constants/Enums';
import { useTranslation } from 'react-i18next';

const MyAccount = () => {
    const { t } = useTranslation();
    const { authData } = useAuth();

    const [oldPassword, setOldPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>('');

    const changePasswordMutation = useMutation({
        mutationFn: SAPI.AUTH.PRIVATE.changePassword,
        onSuccess: () =>
            NotificationHandler.showSuccess(
                t('PAGES.USER.MY_ACCOUNT.SUCCESS')
            ),
        onError: NotificationHandler.showAxiosError,
    });

    const handlePasswordSubmit = () => {
        if (newPassword !== newPasswordRepeat) {
            return NotificationHandler.showError(
                t('PAGES.USER.MY_ACCOUNT.ERRORS.PASSWORDS_DONT_MATCH')
            );
        }

        if (newPassword === '' || oldPassword === '') {
            return NotificationHandler.showError(
                t('PAGES.USER.MY_ACCOUNT.ERRORS.FILL_ALL_FIELDS')
            );
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            NotificationHandler.showError(
                t('PAGES.USER.MY_ACCOUNT.ERRORS.PASSWORD_REQUIREMENTS')
            );
            return;
        }

        changePasswordMutation.mutate({
            body: {
                oldpassword: oldPassword,
                newpassword: newPassword,
            },
        });
        setOldPassword('');
        setNewPassword('');
        setNewPasswordRepeat('');
    };

    return (
        <SVHPageWrapper p="md">
            <Title order={3} c="blue" mb="sm">
                {t('PAGES.USER.MY_ACCOUNT.TITLE')}
            </Title>
            <Flex mt="lg" justify="space-between" gap="sm">
                <Fieldset
                    legend={t('PAGES.USER.MY_ACCOUNT.PERSONAL_INFO')}
                    style={{ flexGrow: 0.5 }}
                >
                    <Group justify="space-between" align='flex-start'>
                        <Flex direction="column" gap="sm" flex={1}>
                            <Text size="sm" mt="sm">
                                {t('PAGES.USER.MY_ACCOUNT.FIELDS.FIRST_LAST_NAME')} <br />
                                {
                                    (authData?.contact as UserContact)?.first_name
                                }{' '}
                                {(authData?.contact as UserContact)?.last_name}
                            </Text>
                            <Text mt="sm" size="sm">
                                {t('PAGES.USER.MY_ACCOUNT.FIELDS.EMAIL')} <br /> {authData?.mail}
                            </Text>
                        </Flex>
                    </Group>
                </Fieldset>
                <Fieldset
                    legend={t('PAGES.USER.MY_ACCOUNT.PASSWORD_UPDATE')}
                    style={{ flexGrow: 0.5 }}
                >
                    <EDITextInput
                        label={t('PAGES.USER.MY_ACCOUNT.FIELDS.OLD_PASSWORD')}
                        placeholder={t('PAGES.USER.MY_ACCOUNT.FIELDS.OLD_PASSWORD_PLACEHOLDER')}
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.currentTarget.value)}
                        required
                    />
                    <EDITextInput
                        label={t('PAGES.USER.MY_ACCOUNT.FIELDS.NEW_PASSWORD')}
                        placeholder={t('PAGES.USER.MY_ACCOUNT.FIELDS.NEW_PASSWORD_PLACEHOLDER')}
                        type="password"
                        mt="sm"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.currentTarget.value)}
                        required
                    />
                    <EDITextInput
                        label={t('PAGES.USER.MY_ACCOUNT.FIELDS.CONFIRM_PASSWORD')}
                        placeholder={t('PAGES.USER.MY_ACCOUNT.FIELDS.CONFIRM_PASSWORD_PLACEHOLDER')}
                        type="password"
                        mt="sm"
                        value={newPasswordRepeat}
                        onChange={(e) =>
                            setNewPasswordRepeat(e.currentTarget.value)
                        }
                        required
                    />
                    <Button mt="xs" onClick={handlePasswordSubmit}>
                        {t('PAGES.USER.MY_ACCOUNT.BUTTONS.SAVE')}
                    </Button>
                </Fieldset>
            </Flex>
        </SVHPageWrapper>
    );
};

export default MyAccount;
