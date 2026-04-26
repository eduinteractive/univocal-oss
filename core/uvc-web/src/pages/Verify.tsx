import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthWrapper from '../components/features/auth/AuthWrapper';
import { Anchor, Loader, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { SAPI } from '@eduinteractive/uvc-api';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const Verify = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const verifyMailMutation = useMutation({
        mutationFn: SAPI.AUTH.PUBLIC.verifyMail,
        onSuccess: () => {
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 5000);
        },
        onError: () => {
            setIsError(true);
        },
    });

    useEffect(() => {
        if (token && !verifyMailMutation.isPending) {
            verifyMailMutation.mutate({ body: { token } });
        }
    }, [token, verifyMailMutation]);

    return (
        <AuthWrapper>
            <Title order={3} mb="sm" ta="center">
                {t('PAGES.VERIFY.TITLE')}
            </Title>
            {isSuccess && (
                <Text ta="center">{t('PAGES.VERIFY.SUCCESS')}</Text>
            )}
            {isError && (
                <Text ta="center">
                    {t('PAGES.VERIFY.ERROR')}{' '}
                    <Anchor href="mailto:support-univocal@education-interactive.de">
                        support-univocal@education-interactive.de
                    </Anchor>
                </Text>
            )}
            {!isSuccess && !isError && (
                <>
                    <Text ta="center">
                        {t('PAGES.VERIFY.LOADING')}
                    </Text>
                    <Loader ta="center" mx="auto" mt="sm" />
                </>
            )}
        </AuthWrapper>
    );
};

export default Verify;
