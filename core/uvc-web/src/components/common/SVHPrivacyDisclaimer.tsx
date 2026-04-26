import { EDIModal } from '@eduinteractive/mantine-common';
import { ActionIcon, Text } from '@mantine/core';
import { IconShieldLock } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SVHPrivacyDisclaimer = () => {
    const { t } = useTranslation();
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

    return (
        <>
            <ActionIcon
                variant="subtle"
                color="blue"
                onClick={() => setPrivacyModalVisible(true)}
            >
                <IconShieldLock />
            </ActionIcon>
            <EDIModal
                visible={privacyModalVisible}
                onClose={() => setPrivacyModalVisible(false)}
                title={t('COMMON.PRIVACY_NOTICE')}
                type="ALERT"
            >
                <Text size="sm">{t('COMMON.PRIVACY_DESCRIPTION')}</Text>
            </EDIModal>
        </>
    );
};

export default SVHPrivacyDisclaimer;
