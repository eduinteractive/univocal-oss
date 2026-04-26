import { useMutation } from '@tanstack/react-query';
import { AUTH_FORM_STATE, PASSWORD_REGEX } from '../../../constants/Enums';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Text } from '@mantine/core';
import { useState } from 'react';
import {
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface ResetPasswordProps {
    onFormChange: (state: AUTH_FORM_STATE) => void;
}

const ResetPassword = (props: ResetPasswordProps) => {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const resetPasswordMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.resetPasswordWithToken,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('AUTH.PASSWORD_RESET_SUCCESS'));
            props.onFormChange(AUTH_FORM_STATE.LOGIN);
            navigate('/auth');
        },
        onError: NotificationHandler.showAxiosError,
    });

    const handleSubmit = () => {
        if (!PASSWORD_REGEX.test(password)) {
            return NotificationHandler.showError(
                t('AUTH.ATTRIBUTES.PASSWORD_ERROR_STRENGTH')
            );
        }

        if (password !== passwordRepeat) {
            return NotificationHandler.showError(
                t('AUTH.ATTRIBUTES.PASSWORD_ERROR_MISMATCH')
            );
        }

        if (!token) {
            return NotificationHandler.showError(
                t("AUTH.ATTRIBUTES.TOKEN_ERROR")
            );
        }

        resetPasswordMutation.mutate({ token, body: { password } });
    };

    return (
        <>
            <Text size="md" mb="md" ta="center">
                {t("AUTH.PASSWORD_RESET_NOTICE")}:
            </Text>
            <EDITextInput
                label={t("AUTH.ATTRIBUTES.PASSWORD")}
                placeholder={t("AUTH.ATTRIBUTES.PASSWORD_PLACEHOLDER")}
                size="md"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                type="password"
            />
            <EDITextInput
                label={t("AUTH.ATTRIBUTES.PASSWORD_REPEAT")}
                placeholder={t("AUTH.ATTRIBUTES.PASSWORD_REPEAT_PLACEHOLDER")}
                size="md"
                value={passwordRepeat}
                onChange={(event) =>
                    setPasswordRepeat(event.currentTarget.value)
                }
                type="password"
            />
            <Button fullWidth mt="xl" size="md" onClick={handleSubmit}>
                {t("AUTH.PASSWORD_RESET_BUTTON")}
            </Button>
        </>
    );
};

export default ResetPassword;
