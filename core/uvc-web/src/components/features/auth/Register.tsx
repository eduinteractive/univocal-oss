import {
    Anchor,
    Button,
    Checkbox,
    Stepper,
    Text,
    TextInput,
    Alert,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AUTH_FORM_STATE, PASSWORD_REGEX } from '../../../constants/Enums';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { IconLock, IconMail, IconUser, IconAlertCircle, IconLockOpen } from '@tabler/icons-react';
import { SAPI } from '@eduinteractive/uvc-api';
import { useTranslation } from 'react-i18next';

const MAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

interface RegisterProps {
    mail: string | null; 
    onFormChange: (state: AUTH_FORM_STATE) => void;
}

const Register = (props: RegisterProps) => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    // Decode URL-encoded mail parameter
    const initialMail = props.mail ? decodeURIComponent(props.mail) : '';
    const isMailFromParam = !!props.mail;
    const [mail, setMail] = useState(initialMail);
    const [mailLocked, setMailLocked] = useState(isMailFromParam);
    const [showMailWarning, setShowMailWarning] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [terms, setTerms] = useState(false);

    // Update mail if prop changes
    useEffect(() => {
        if (props.mail) {
            const decodedMail = decodeURIComponent(props.mail);
            setMail(decodedMail);
            setMailLocked(true);
        }
    }, [props.mail]);

    const registerMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.register,
        onSuccess: () => {
            NotificationHandler.showSuccess(t('AUTH.REGISTER_SUCCESS'));
            setActiveStep(2);
        },
        onError: NotificationHandler.showAxiosError,
    });

    const nextStep = () => setActiveStep((current) => current + 1);
    const prevStep = () => setActiveStep((current) => current - 1);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Validation checks
        if (activeStep === 0 && !MAIL_REGEX.test(mail)) {
            return NotificationHandler.showError(
                t('AUTH.ATTRIBUTES.EMAIL_ERROR')
            );
        }

        if (activeStep === 0 && !PASSWORD_REGEX.test(password)) {
            return NotificationHandler.showError(
                t("AUTH.ATTRIBUTES.PASSWORD_ERROR_STRENGTH")
            );
        }

        if (activeStep === 0 && password !== passwordRepeat) {
            return NotificationHandler.showError(
                t("AUTH.ATTRIBUTES.PASSWORD_ERROR_MISMATCH")
            );
        }

        if (activeStep === 1 && !terms) {
            return NotificationHandler.showError(
                t("AUTH.ATTRIBUTES.TERMS_ERROR")
            );
        }

        if (activeStep === 1) {
            registerMutation.mutate({
                body: {
                    mail,
                    password,
                    contact: {
                        first_name: firstName,
                        last_name: lastName,
                    },
                },
            });
        } else {
            nextStep();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stepper active={activeStep} onStepClick={setActiveStep}>
                <Stepper.Step label={t("AUTH.REGISTER_ACCOUNT")} allowStepSelect={false}>
                    {/* Accountdaten Form */}
                    {showMailWarning && mailLocked && (
                        <Alert
                            icon={<IconAlertCircle />}
                            title={t("AUTH.ATTRIBUTES.EMAIL_LOCKED_WARNING_TITLE")}
                            color="yellow"
                            mb="sm"
                            onClose={() => setShowMailWarning(false)}
                            withCloseButton
                        >
                            {t("AUTH.ATTRIBUTES.EMAIL_LOCKED_WARNING")}
                        </Alert>
                    )}
                    <TextInput
                        placeholder={t("AUTH.ATTRIBUTES.EMAIL")}
                        value={mail}
                        onChange={(e) => {
                            const newValue = e.currentTarget.value;
                            if (mailLocked && newValue !== mail) {
                                setShowMailWarning(true);
                                return;
                            }
                            setMail(newValue);
                        }}
                        onFocus={() => {
                            if (mailLocked) {
                                setShowMailWarning(true);
                            }
                        }}
                        readOnly={mailLocked}
                        required
                        styles={{
                            input: {
                                border: 'none',
                                backgroundColor: mailLocked ? '#E9ECEF' : '#F3F3F3',
                                borderRadius: 20,
                                cursor: mailLocked ? 'not-allowed' : 'text',
                            },
                        }}
                        mb="sm"
                        size="lg"
                        leftSection={<IconMail />}
                        rightSection={
                            mailLocked ? (
                                <IconLockOpen
                                    size={18}
                                    style={{ cursor: 'pointer', color: 'var(--mantine-color-gray-6)' }}
                                    onClick={() => {
                                        if (window.confirm(t("AUTH.ATTRIBUTES.EMAIL_UNLOCK_CONFIRM"))) {
                                            setMailLocked(false);
                                            setShowMailWarning(false);
                                        }
                                    }}
                                />
                            ) : null
                        }
                    />
                    <TextInput
                        placeholder={t("AUTH.ATTRIBUTES.PASSWORD")}
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        type="password"
                        required
                        styles={{
                            input: {
                                border: 'none',
                                backgroundColor: '#F3F3F3',
                                borderRadius: 20,
                            },
                        }}
                        mb="sm"
                        size="lg"
                        leftSection={<IconLock />}
                    />
                    <TextInput
                        placeholder={t("AUTH.ATTRIBUTES.PASSWORD_REPEAT")}
                        value={passwordRepeat}
                        onChange={(e) =>
                            setPasswordRepeat(e.currentTarget.value)
                        }
                        type="password"
                        required
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
                </Stepper.Step>
                <Stepper.Step label={t("AUTH.REGISTER_PERSONAL")} allowStepSelect={false}>
                    {/* Persönliche Daten Form */}
                    <TextInput
                        placeholder={t("AUTH.ATTRIBUTES.FIRST_NAME")}
                        value={firstName}
                        onChange={(e) => setFirstName(e.currentTarget.value)}
                        required
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
                        placeholder={t("AUTH.ATTRIBUTES.LAST_NAME")}
                        value={lastName}
                        onChange={(e) => setLastName(e.currentTarget.value)}
                        required
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
                    <Checkbox
                        label={
                            <Text>
                                {t("AUTH.ATTRIBUTES.TERMS_PRE")}{' '}
                                <a
                                    href="https://univocal.de/nutzungsbedingungen"
                                    target="_blank"
                                >
                                    {t("AUTH.ATTRIBUTES.TERMS")}
                                </a>{' '}
                                {t("AUTH.ATTRIBUTES.TERMS_AFT")}
                            </Text>
                        }
                        checked={terms}
                        onChange={(event) =>
                            setTerms(event.currentTarget.checked)
                        }
                        required
                        mt="md"
                        mb="sm"
                    />
                </Stepper.Step>
            </Stepper>
            {activeStep !== 2 && (
                <Button
                    fullWidth
                    mt="lg"
                    type="submit"
                    mb="sm"
                    radius="xl"
                    loading={registerMutation.isPending}
                >
                    {activeStep === 1 ? t("AUTH.REGISTER_BUTTON") : t("COMMON.NEXT")}
                </Button>
            )}
            {activeStep > 0 && activeStep < 2 && (
                <Button
                    variant="default"
                    fullWidth
                    mb="lg"
                    onClick={prevStep}
                    radius="xl"
                >
                    {t("COMMON.BACK")}
                </Button>
            )}
            {activeStep === 2 && (
                <Text ta="center" mt="md">
                    {t("AUTH.REGISTER_NOTICE")}
                </Text>
            )}
            {activeStep !== 2 && (
                <Text ta="center" mt="md">
                    {t("AUTH.REGISTER_LOGIN_FORWARD")}{' '}
                    <Anchor<'a'>
                        href="#"
                        fw={700}
                        onClick={(event) => {
                            event.preventDefault();
                            props.onFormChange(AUTH_FORM_STATE.LOGIN);
                        }}
                    >
                        {t("AUTH.REGISTER_LOGIN_FORWARD_ANCHOR")}
                    </Anchor>
                </Text>
            )}
        </form>
    );
};

export default Register;
