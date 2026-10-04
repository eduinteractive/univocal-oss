import { Alert, Button, Card, Flex, SegmentedControl, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { ProfileSite, ProfileSiteLegal, ProfileSiteLegalNotice, SiteLegalMode } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SVHTextEditor from '../../../../common/SVHTextEditor';
import { legalHtmlIsEmpty } from '../../../site/legalHtml';
import { IMPRINT_TEMPLATE, PRIVACY_TEMPLATE } from './siteLegalTemplates';

interface NoticeDraft {
    mode: SiteLegalMode;
    text: string;
    url: string;
}

const toDraft = (notice?: ProfileSiteLegalNotice): NoticeDraft => ({
    mode: notice?.mode === 'link' ? 'link' : 'text',
    text: notice?.text ?? '',
    url: notice?.url ?? '',
});

const sameNotice = (draft: NoticeDraft, saved?: ProfileSiteLegalNotice) =>
    draft.mode === (saved?.mode === 'link' ? 'link' : 'text') &&
    draft.text.trim() === (saved?.text ?? '') &&
    draft.url.trim() === (saved?.url ?? '');

interface SiteLegalSettingsProps {
    site?: ProfileSite;
    canEdit: boolean;
    saving: boolean;
    onSave: (legal: ProfileSiteLegal) => void;
}

const SiteLegalSettings = ({ site, canEdit, saving, onSave }: SiteLegalSettingsProps) => {
    const { t } = useTranslation();
    const [privacy, setPrivacy] = useState<NoticeDraft>(() => toDraft(site?.legal?.privacy));
    const [imprint, setImprint] = useState<NoticeDraft>(() => toDraft(site?.legal?.imprint));

    useEffect(() => {
        setPrivacy(toDraft(site?.legal?.privacy));
        setImprint(toDraft(site?.legal?.imprint));
    }, [site?.legal?.privacy, site?.legal?.imprint]);

    const dirty = !sameNotice(privacy, site?.legal?.privacy) || !sameNotice(imprint, site?.legal?.imprint);

    const notice = (kind: 'privacy' | 'imprint', draft: NoticeDraft, setDraft: (next: NoticeDraft) => void, template: string) => (
        <Stack gap="sm">
            <Text fw={600} size="sm">
                {t(`SITE.SETTINGS.LEGAL.${kind}.TITLE`)}
            </Text>
            <SegmentedControl
                fullWidth
                disabled={!canEdit}
                value={draft.mode}
                onChange={(mode) => setDraft({ ...draft, mode: mode as SiteLegalMode })}
                data={[
                    { value: 'text', label: t('SITE.SETTINGS.LEGAL.MODE_TEXT') },
                    { value: 'link', label: t('SITE.SETTINGS.LEGAL.MODE_LINK') },
                ]}
            />
            {draft.mode === 'link' ? (
                <TextInput
                    label={t('SITE.SETTINGS.LEGAL.URL_LABEL')}
                    placeholder="https://"
                    value={draft.url}
                    maxLength={300}
                    disabled={!canEdit}
                    onChange={(event) => setDraft({ ...draft, url: event.currentTarget.value })}
                />
            ) : (
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        {t(`SITE.SETTINGS.LEGAL.${kind}.TEXT_HINT`)}
                    </Text>
                    <Flex>
                        <Button
                            variant="light"
                            size="xs"
                            disabled={!canEdit}
                            onClick={() => setDraft({ ...draft, mode: 'text', text: template })}
                        >
                            {legalHtmlIsEmpty(draft.text)
                                ? t('SITE.SETTINGS.LEGAL.INSERT_TEMPLATE')
                                : t('SITE.SETTINGS.LEGAL.REPLACE_TEMPLATE')}
                        </Button>
                    </Flex>
                    <SVHTextEditor
                        text={draft.text}
                        onChange={(text) => {
                            if (!canEdit) return;
                            setDraft({ ...draft, text: legalHtmlIsEmpty(text) ? '' : text });
                        }}
                    />
                </Stack>
            )}
        </Stack>
    );

    return (
        <Card id="site-legal" withBorder radius="sm" p="xl">
            <Title order={3} c="violet" mb={4}>
                {t('SITE.SETTINGS.LEGAL.TITLE')}
            </Title>
            <Text size="sm" c="dimmed" mb="md">
                {t('SITE.SETTINGS.LEGAL.DESCRIPTION')}
            </Text>
            <Alert color="violet" variant="light" icon={<IconInfoCircle />} mb="lg">
                {t('SITE.SETTINGS.LEGAL.TEMPLATE_NOTICE')}
            </Alert>
            <Stack gap="xl">
                {notice('imprint', imprint, setImprint, IMPRINT_TEMPLATE)}
                {notice('privacy', privacy, setPrivacy, PRIVACY_TEMPLATE)}
                <Flex justify="flex-end">
                    <Button
                        disabled={!canEdit || !dirty}
                        loading={saving}
                        onClick={() =>
                            onSave({
                                imprint: { mode: imprint.mode, text: imprint.text.trim(), url: imprint.url.trim() },
                                privacy: { mode: privacy.mode, text: privacy.text.trim(), url: privacy.url.trim() },
                            })
                        }
                    >
                        {t('SITE.SAVE')}
                    </Button>
                </Flex>
            </Stack>
        </Card>
    );
};

export default SiteLegalSettings;
