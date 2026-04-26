import { useState } from 'react';
import { Anchor, Button, Text, TextInput } from '@mantine/core';
import { AUTH_FORM_STATE } from '../../../constants/Enums';
import { useMutation } from '@tanstack/react-query';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { IconMail } from '@tabler/icons-react';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface ForgetPasswordProps {
    onFormChange: (state: AUTH_FORM_STATE) => void;
}

const ForgetPassword = (props: ForgetPasswordProps) => {
    const { t } = useTranslation();
    const [mail, setMail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);

    const resetPasswordMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.resetPassword,
        onSuccess: () => {
            setIsSuccess(true);
        },
        onError: NotificationHandler.showAxiosError
    });

    const resetPasswordRepeatMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.resetPasswordRepeatMail,
        onSuccess: () => {
            NotificationHandler.showSuccess(
                t("AUTH.PASSWORD_FORGET_REPEAT_SUCCESS")
            );
            setIsRepeat(true);
            setTimeout(() => {
                setIsRepeat(false);
            }, 10000);
        },
        onError: NotificationHandler.showAxiosError
    });

    return (
        <>
            {!isSuccess ? (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    resetPasswordMutation.mutate({ body: { mail } });
                }}>
                    <TextInput
                        placeholder="E-Mail-Adresse"
                        value={mail}
                        onChange={(event) => setMail(event.currentTarget.value)}
                        styles={{
                            input: {
                                border: 'none',
                                backgroundColor: '#F3F3F3',
                                borderRadius: 20,
                            },
                        }}
                        mb="sm"
                        size="lg"
                        leftSection={<IconMail />}
                    />
                    <Button
                        fullWidth
                        mt="md"
                        size="md"
                        type="submit"
                        radius="xl"
                        loading={resetPasswordMutation.isPending}
                    >
                        {t("COMMON.SEND")}
                    </Button>
                </form>
            ) : (
                <>
                    <Text ta="center" mt="md">
                        {t("AUTH.PASSWORD_FORGET_SUCCESS")}
                    </Text>
                    <Button fullWidth mt="xl" size="md" disabled={isRepeat} onClick={() => {
                        resetPasswordRepeatMutation.mutate({ body: { mail } });
                    }}>
                        { isRepeat ? t("AUTH.PASSWORD_FORGET_WAIT") : t("AUTH.PASSWORD_FORGET_REPEAT") }
                    </Button>
                </>
            )}

            <Text ta="center" mt="md">
                <Anchor<'a'>
                    href="#"
                    fw={700}
                    onClick={(event) => {
                        event.preventDefault();
                        props.onFormChange(AUTH_FORM_STATE.LOGIN);
                    }}
                >
                    {t("AUTH.FORWARD_LOGIN")}
                </Anchor>
            </Text>
        </>
    );
};

export default ForgetPassword;
