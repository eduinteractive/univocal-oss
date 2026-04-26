import { Button, Text, Anchor, TextInput } from '@mantine/core';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AUTH_FORM_STATE } from '../../../constants/Enums';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { eventEmitter } from '../../../context/AuthContext';
import { IconLock, IconUser } from '@tabler/icons-react';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

interface LoginProps {
    onFormChange: (state: AUTH_FORM_STATE) => void;
}

const Login = (props: LoginProps) => {
    const { t } = useTranslation();
    const [mail, setMail] = useState('');
    const [password, setPassword] = useState('');

    const loginMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.login,
        onSuccess: async () => {
            t("AUTH.LOGIN_SUCCESS")
            eventEmitter.emit('refreshAuth');
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                loginMutation.mutate({ body: { mail, password } })
            }}
        >
            <TextInput
                placeholder={t("AUTH.ATTRIBUTES.EMAIL")}
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
                leftSection={<IconUser />}
            />
            <TextInput
                placeholder={t("AUTH.ATTRIBUTES.PASSWORD")}
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                type="password"
                styles={{
                    input: {
                        border: 'none',
                        backgroundColor: '#F3F3F3',
                        borderRadius: 20,
                    },
                }}
                size="lg"
                leftSection={<IconLock />}
                mb="xs"
            />
            <Button fullWidth mt="md" mb="lg" size="md" type="submit" radius="xl" loading={loginMutation.isPending}>
                {t("AUTH.LOGIN_BUTTON")}
            </Button>

            <Button
                fullWidth
                mb="lg"
                size="md"
                type="button"
                radius="xl"
                variant="filled"
                color="violet"
                onClick={() => {
                    // Vollständiger Redirect ist notwendig, damit Shibboleth den SAML-Flow sauber starten kann.
                    window.location.href = '/api/auth/public/dfn/login';
                }}
            >
                Mit Hochschulaccount anmelden
            </Button>

            <Text ta="center" mt="md">
                {t("AUTH.REGISTER_FORWARD")}{' '}
                <Anchor<'a'>
                    href="#"
                    fw={700}
                    onClick={(event) => {
                        event.preventDefault();
                        props.onFormChange(AUTH_FORM_STATE.REGISTER);
                    }}
                >
                    {t("AUTH.REGISTER_FORWARD_ANCHOR")}
                </Anchor>
            </Text>
        </form>
    );
};

export default Login;
