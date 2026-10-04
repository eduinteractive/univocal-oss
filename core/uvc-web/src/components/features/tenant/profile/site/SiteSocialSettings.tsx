import { Button, Card, Flex, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconBrandInstagram, IconLink } from '@tabler/icons-react';
import { ProfileSite, ProfileSiteSocialLinks } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SiteSocialSettingsProps {
    site?: ProfileSite;
    canEdit: boolean;
    saving: boolean;
    onSave: (socialLinks: ProfileSiteSocialLinks) => void;
}

const SiteSocialSettings = ({ site, canEdit, saving, onSave }: SiteSocialSettingsProps) => {
    const { t } = useTranslation();
    const [instagram, setInstagram] = useState(site?.socialLinks?.instagram ?? '');
    const [other, setOther] = useState(site?.socialLinks?.other ?? '');

    useEffect(() => {
        setInstagram(site?.socialLinks?.instagram ?? '');
        setOther(site?.socialLinks?.other ?? '');
    }, [site?.socialLinks?.instagram, site?.socialLinks?.other]);

    const dirty =
        instagram.trim() !== (site?.socialLinks?.instagram ?? '') || other.trim() !== (site?.socialLinks?.other ?? '');

    return (
        <Card withBorder radius="sm" p="xl">
            <Title order={3} c="violet" mb={4}>
                {t('SITE.SETTINGS.SOCIAL.TITLE')}
            </Title>
            <Text size="sm" c="dimmed" mb="md">
                {t('SITE.SETTINGS.SOCIAL.DESCRIPTION')}
            </Text>
            <Stack gap="sm">
                <TextInput
                    label={t('SITE.SETTINGS.SOCIAL.INSTAGRAM_LABEL')}
                    placeholder="@fachschaft"
                    leftSection={<IconBrandInstagram size={16} />}
                    value={instagram}
                    maxLength={120}
                    disabled={!canEdit}
                    onChange={(event) => setInstagram(event.currentTarget.value)}
                />
                <TextInput
                    label={t('SITE.SETTINGS.SOCIAL.OTHER_LABEL')}
                    description={t('SITE.SETTINGS.SOCIAL.OTHER_HINT')}
                    placeholder="https://discord.gg/..."
                    leftSection={<IconLink size={16} />}
                    value={other}
                    maxLength={300}
                    disabled={!canEdit}
                    onChange={(event) => setOther(event.currentTarget.value)}
                />
                <Flex justify="flex-end">
                    <Button
                        disabled={!canEdit || !dirty}
                        loading={saving}
                        onClick={() => onSave({ instagram: instagram.trim(), other: other.trim() })}
                    >
                        {t('SITE.SAVE')}
                    </Button>
                </Flex>
            </Stack>
        </Card>
    );
};

export default SiteSocialSettings;
