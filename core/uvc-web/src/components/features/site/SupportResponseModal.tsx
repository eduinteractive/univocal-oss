import { Alert, Box, Button, Group, Modal, Stack, Text, TextInput, Textarea, ThemeIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { ProfileSupportRequest, SAPI, SUPPORT_RESPONSE_KIND } from '@eduinteractive/uvc-api';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSite } from '../../../context/SiteContext';
import { useSiteTheme } from './SiteThemeContext';

interface SupportResponseModalProps {
    request?: Pick<ProfileSupportRequest, '_id' | 'title'>;
    kind: SUPPORT_RESPONSE_KIND;
    opened: boolean;
    onClose: () => void;
}

const SupportResponseModal = ({ request, kind, opened, onClose }: SupportResponseModalProps) => {
    const { t } = useTranslation();
    const { subdomain } = useSite();
    const { vars } = useSiteTheme();
    const [sent, setSent] = useState(false);

    const form = useForm({
        initialValues: { name: '', email: '', message: '', website: '' },
        validate: {
            email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : t('SITE.PUBLIC.SUPPORT_FORM.EMAIL_INVALID')),
            message: (value) =>
                value.trim().length >= 3 ? null : t('SITE.PUBLIC.SUPPORT_FORM.MESSAGE_REQUIRED'),
        },
    });

    useEffect(() => {
        if (opened) {
            setSent(false);
            form.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);

    const mutation = useMutation({
        mutationFn: (values: typeof form.values) =>
            SAPI.PROFILE.PUBLIC.createPublicSupportResponse({
                subdomain: subdomain!,
                requestId: request!._id,
                body: {
                    kind,
                    name: values.name.trim() || undefined,
                    email: values.email.trim(),
                    message: values.message.trim(),
                    website: values.website,
                },
            }),
        onSuccess: () => setSent(true),
        onError: NotificationHandler.showAxiosError,
    });

    const isOffer = kind === SUPPORT_RESPONSE_KIND.OFFER;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            radius="lg"
            style={vars}
            title={
                <Text fw={700} c="var(--site-primary)">
                    {isOffer ? t('SITE.PUBLIC.SUPPORT_OFFER') : t('SITE.PUBLIC.SUPPORT_QUESTION')}
                </Text>
            }
        >
            {sent ? (
                <Stack align="center" gap="sm" py="lg">
                    <ThemeIcon size={56} radius="xl" color="green" variant="light">
                        <IconCircleCheck size={32} />
                    </ThemeIcon>
                    <Text fw={700} ta="center">
                        {t('SITE.PUBLIC.SUPPORT_FORM.SENT_TITLE')}
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                        {t('SITE.PUBLIC.SUPPORT_FORM.SENT_DESCRIPTION')}
                    </Text>
                    <Button color="var(--site-primary)" radius="xl" onClick={onClose}>
                        {t('COMMON.CLOSE')}
                    </Button>
                </Stack>
            ) : (
                <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                    <Stack gap="sm">
                        {request && (
                            <Text size="sm" c="dimmed">
                                {request.title}
                            </Text>
                        )}
                        <TextInput
                            label={t('SITE.PUBLIC.SUPPORT_FORM.NAME')}
                            maxLength={120}
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            label={t('SITE.PUBLIC.SUPPORT_FORM.EMAIL')}
                            type="email"
                            required
                            {...form.getInputProps('email')}
                        />
                        <Textarea
                            label={
                                isOffer
                                    ? t('SITE.PUBLIC.SUPPORT_FORM.MESSAGE_OFFER')
                                    : t('SITE.PUBLIC.SUPPORT_FORM.MESSAGE_QUESTION')
                            }
                            required
                            autosize
                            minRows={4}
                            maxLength={3000}
                            {...form.getInputProps('message')}
                        />
                        <Box
                            aria-hidden
                            style={{ position: 'absolute', left: -10000, width: 1, height: 1, overflow: 'hidden' }}
                        >
                            <input tabIndex={-1} autoComplete="off" {...form.getInputProps('website')} />
                        </Box>
                        <Alert color="var(--site-primary)" variant="light" icon={<IconInfoCircle />} p="xs">
                            <Text size="xs">{t('SITE.PUBLIC.SUPPORT_FORM.PRIVACY')}</Text>
                        </Alert>
                        <Group justify="flex-end">
                            <Button type="submit" color="var(--site-primary)" radius="xl" loading={mutation.isPending}>
                                {t('COMMON.SEND')}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </Modal>
    );
};

export default SupportResponseModal;
