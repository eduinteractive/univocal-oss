import {
    ActionIcon,
    Card,
    Group,
    Title,
} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useState } from 'react';
import ProfileDescriptionModal from './ProfileDescriptionModal';
import { Profile } from '@eduinteractive/uvc-api';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import { useTranslation } from 'react-i18next';

interface ProfileDescriptionProps {
    profile?: Profile;
    onUpdate: (description: string) => void;
}

const ProfileDescription = (props: ProfileDescriptionProps) => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <Card shadow="sm" withBorder flex={0.5}>
            <ProfileDescriptionModal
                value={props.profile?.description || ''}
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={(data) => {
                    props.onUpdate(data);
                    setModalVisible(false);
                }}
            />
            <Card.Section p="md" pt="xs">
                <Group justify="space-between" align="center">
                    <Title order={6} c="dimmed">
                        {t('PROFILE.DESCRIPTION.TITLE')}
                    </Title>
                    {checkPermission(currentTenant!, 'profile:update') && (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => setModalVisible(true)}
                        >
                            <IconEdit size={24} />
                        </ActionIcon>
                    )}
                </Group>
                <div
                    dangerouslySetInnerHTML={{
                        __html:
                            props.profile?.description ||
                            t('PROFILE.DESCRIPTION.EMPTY'),
                    }}
                />
            </Card.Section>
        </Card>
    );
};

export default ProfileDescription;
