import { Text } from '@mantine/core';
import { PROFILE_OBJECT_STATUS, ProfilePage } from '@eduinteractive/uvc-api';
import { EDIModal, EDISelect, EDITextInput, NotificationHandler } from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SVHTextEditor from '../../../../common/SVHTextEditor';
import { slugify } from '../../../site/siteText';

export interface InfoPageModalSubmit {
    title: string;
    slug: string;
    content: string;
    status?: PROFILE_OBJECT_STATUS;
}

interface InfoPageModalProps {
    opened: boolean;
    page?: ProfilePage;
    canPublish: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (data: InfoPageModalSubmit) => void;
}

const InfoPageModal = ({ opened, page, canPublish, loading, onClose, onSubmit }: InfoPageModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [slugTouched, setSlugTouched] = useState(false);
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<PROFILE_OBJECT_STATUS>(PROFILE_OBJECT_STATUS.DRAFT);

    useEffect(() => {
        if (!opened) return;
        setTitle(page?.title ?? '');
        setSlug(page?.slug ?? '');
        setSlugTouched(!!page);
        setContent(page?.content ?? '');
        setStatus(page?.status ?? PROFILE_OBJECT_STATUS.DRAFT);
    }, [opened, page]);

    const handleTitle = (value: string) => {
        setTitle(value);
        if (!slugTouched) setSlug(slugify(value));
    };

    const handleSubmit = () => {
        if (!title.trim()) return NotificationHandler.showError(t('SITE.INFOS.TITLE_REQUIRED'));
        onSubmit({
            title: title.trim(),
            slug: slug || slugify(title),
            content,
            status: canPublish ? status : undefined,
        });
    };

    return (
        <EDIModal
            title={page ? t('SITE.INFOS.EDIT') : t('SITE.INFOS.CREATE')}
            type="DEFAULT"
            visible={opened}
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            size="xl"
            isForm
        >
            <EDITextInput
                label={t('SITE.INFOS.TITLE')}
                placeholder={t('SITE.INFOS.TITLE_PLACEHOLDER')}
                value={title}
                maxLength={160}
                required
                onChange={(event) => handleTitle(event.currentTarget.value)}
            />
            <EDITextInput
                label={t('SITE.INFOS.SLUG')}
                placeholder={t('SITE.INFOS.SLUG_DESCRIPTION')}
                leftSection={
                    <Text c="dimmed" style={{ marginTop: 19 }}>
                        /p/
                    </Text>
                }
                leftSectionWidth={48}
                value={slug}
                onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.currentTarget.value));
                }}
            />
            <SVHTextEditor text={content} onChange={setContent} />
            {canPublish ? (
                <EDISelect
                    label={t('PROFILE.OBJECTS.STATUS.TITLE')}
                    placeholder={t('PROFILE.OBJECTS.STATUS.PLACEHOLDER')}
                    value={status}
                    onChange={(value) => value && setStatus(value as PROFILE_OBJECT_STATUS)}
                    data={[
                        { value: PROFILE_OBJECT_STATUS.DRAFT, label: t('PROFILE.OBJECTS.STATUS.DRAFT') },
                        { value: PROFILE_OBJECT_STATUS.PUBLISHED, label: t('PROFILE.OBJECTS.STATUS.PUBLISHED') },
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

export default InfoPageModal;
