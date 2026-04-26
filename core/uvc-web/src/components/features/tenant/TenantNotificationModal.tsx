import { Text } from '@mantine/core';
import { useState } from 'react';
import SVHTextArea from '../../common/SVHTextArea';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface TenantNotificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (content: string) => void;
}

const TenantNotificationModal = (props: TenantNotificationModalProps) => {
    const { t } = useTranslation();
    const [content, setContent] = useState<string>('');

    const handleSubmit = () => {
        if (!content || content === '') {
            return NotificationHandler.showError(t('TENANT.ERRORS.MESSAGE_REQUIRED'));
        }
        props.onSubmit(content);
    };

    return (
        <EDIModal
            type='DEFAULT'
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            title={t('TENANT.NOTIFICATIONS.SEND_MODAL_TITLE')}
            size="lg"
        >
            <SVHTextArea
                value={content}
                label={t('TENANT.NOTIFICATIONS.GROUP_LABEL')}
                onChange={(e) => setContent(e.currentTarget.value)}
                placeholder={t('TENANT.NOTIFICATIONS.MESSAGE_PLACEHOLDER')}
                maxLength={150}
                minRows={4}
                autosize
            />
            <Text size="xs" c="dimmed" ta="right" mb="sm">
                {t('TENANT.NOTIFICATIONS.CHARACTERS_LEFT', { count: 150 - content.length })}
            </Text>

        </EDIModal>
    );
};

export default TenantNotificationModal;
