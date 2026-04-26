import { useEffect, useState } from 'react';
import Login from '../components/features/auth/Login';
import Register from '../components/features/auth/Register';
import { Anchor, Alert, Text } from '@mantine/core';
import { AUTH_FORM_STATE } from '../constants/Enums';
import ForgetPassword from '../components/features/auth/ForgetPassword';
import ResetPassword from '../components/features/auth/ResetPassword';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthWrapper from '../components/features/auth/AuthWrapper';
import { useTranslation } from 'react-i18next';
import { SAPI } from '@eduinteractive/uvc-api';
import { useMutation } from '@tanstack/react-query';

interface AuthentificationProps {
    formState?: AUTH_FORM_STATE;
}

const Authentification = (props: AuthentificationProps) => {
    const [formState, setFormState] = useState<AUTH_FORM_STATE>(
        AUTH_FORM_STATE.LOGIN
    );
    const [searchParams] = useSearchParams();
    const mailParam = searchParams.get('mail');
    const statusParam = searchParams.get('status');
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { authData } = useAuth();

    const isMailExistingMutation = useMutation({
        mutationFn: (mail: string) => SAPI.AUTH.PUBLIC.isMailExisting({ body: { mail: mail as string } }),
        onSuccess: (data) => {
            if (data) {
                setFormState(AUTH_FORM_STATE.LOGIN);
            } else {
                setFormState(AUTH_FORM_STATE.REGISTER);
            }
        },
        onError: () => {
            setFormState(AUTH_FORM_STATE.REGISTER);
        },
    });

    useEffect(() => {
        if (mailParam) {
            isMailExistingMutation.mutate(mailParam);
        }
    }, [mailParam, isMailExistingMutation]);

    useEffect(() => {
        if (props.formState) {
            setFormState(props.formState);
        }
    }, [props.formState]);

    useEffect(() => {
        if (authData) {
            navigate('/');
        }
    }, [authData, navigate]);

    return (
        <AuthWrapper>
            {statusParam === '4001' && (
                <Alert color="red" variant="light" radius="md" mb="md" ta="center">
                    Die Anwendung ist für deine Hochschule nicht freigegeben (DFN-AAI: kPID).
                </Alert>
            )}
            {statusParam === '4002' && (
                <Alert color="red" variant="light" radius="md" mb="md" ta="center">
                    Die Anwendung ist für deine Hochschule nicht freigegeben (DFN-AAI: kAttr).
                </Alert>
            )}
            {formState === AUTH_FORM_STATE.LOGIN && (
                <Login onFormChange={(state) => setFormState(state)} />
            )}
            {formState === AUTH_FORM_STATE.REGISTER && (
                <Register onFormChange={(state) => setFormState(state)} mail={mailParam} />
            )}
            {formState !== AUTH_FORM_STATE.REGISTER &&
                formState !== AUTH_FORM_STATE.RESET &&
                formState !== AUTH_FORM_STATE.RESETWITHTOKEN && (
                    <>
                        <Text ta="center" mt="md">
                            {t('PAGES.AUTH.FORGOT_PASSWORD')}{' '}
                            <Anchor<'a'>
                                href="#"
                                fw={700}
                                onClick={(event) => {
                                    event.preventDefault();
                                    setFormState(AUTH_FORM_STATE.RESET);
                                }}
                            >
                                {t('PAGES.AUTH.RESET_PASSWORD')}
                            </Anchor>
                        </Text>
                    </>
                )}
            {formState === AUTH_FORM_STATE.RESET && (
                <ForgetPassword onFormChange={(state) => setFormState(state)} />
            )}
            {formState === AUTH_FORM_STATE.RESETWITHTOKEN && (
                <ResetPassword onFormChange={(state) => setFormState(state)} />
            )}
        </AuthWrapper>
    );
};

export default Authentification;
