import { Text } from '@mantine/core';
import { ProfileSupportRequest, SUPPORT_REQUEST_STATUS } from '@eduinteractive/uvc-api';
import { EDIModal, EDISelect, EDITextInput, EDITextarea, NotificationHandler } from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SupportRequestModalSubmit {
    title: string;
    description: string;
    status?: SUPPORT_REQUEST_STATUS;
}

interface SupportRequestModalProps {
    opened: boolean;
    request?: ProfileSupportRequest;
    canPublish: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (data: SupportRequestModalSubmit) => void;
}

const SupportRequestModal = ({ opened, request, canPublish, loading, onClose, onSubmit }: SupportRequestModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<SUPPORT_REQUEST_STATUS>(SUPPORT_REQUEST_STATUS.DRAFT);

    useEffect(() => {
        if (!opened) return;
        setTitle(request?.title ?? '');
        setDescription(request?.description ?? '');
        setStatus(request?.status ?? SUPPORT_REQUEST_STATUS.DRAFT);
    }, [opened, request]);

    const handleSubmit = () => {
        if (!title.trim()) return NotificationHandler.showError(t('SITE.SUPPORT.TITLE_REQUIRED'));
        onSubmit({ title: title.trim(), description: description.trim(), status: canPublish ? status : undefined });
    };

    return (
        <EDIModal
            title={request ? t('SITE.SUPPORT.EDIT') : t('SITE.SUPPORT.CREATE')}
            type="DEFAULT"
            visible={opened}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            size="lg"
            isForm
        >
            <EDITextInput
                label={t('SITE.SUPPORT.TITLE')}
                placeholder={t('SITE.SUPPORT.TITLE_PLACEHOLDER')}
                value={title}
                maxLength={160}
                required
                onChange={(event) => setTitle(event.currentTarget.value)}
            />
            <EDITextarea
                label={t('SITE.SUPPORT.DESCRIPTION')}
                placeholder={t('SITE.SUPPORT.DESCRIPTION_HINT')}
                value={description}
                autosize
                minRows={5}
                maxLength={5000}
                onChange={(event) => setDescription(event.currentTarget.value)}
            />
            {canPublish ? (
                <EDISelect
                    label={t('PROFILE.OBJECTS.STATUS.TITLE')}
                    placeholder={t('PROFILE.OBJECTS.STATUS.PLACEHOLDER')}
                    value={status}
                    onChange={(value) => value && setStatus(value as SUPPORT_REQUEST_STATUS)}
                    data={[
                        { value: SUPPORT_REQUEST_STATUS.DRAFT, label: t('SITE.SUPPORT.STATUS.DRAFT') },
                        { value: SUPPORT_REQUEST_STATUS.PUBLISHED, label: t('SITE.SUPPORT.STATUS.PUBLISHED') },
                        { value: SUPPORT_REQUEST_STATUS.CLOSED, label: t('SITE.SUPPORT.STATUS.CLOSED') },
                    ]}
                />
            ) : (
                <Text size="xs" c="dimmed" mt="sm">
                    {t('SITE.INFOS.NO_PUBLISH_PERMISSION')}
                </Text>
            )}
        </EDIModal>
    );
};

export default SupportRequestModal;
