import { ActionIcon, Box, Group, Image, Stack, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhotoPlus, IconTrash } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';
import { profileImageUrl } from '../../../../../utils/SiteHost';
import SortableList from './SortableList';
import { SiteBuilder } from './useSiteBuilder';

export const MAX_GALLERY_IMAGES = 12;

interface GalleryModalProps {
    builder: SiteBuilder;
    opened: boolean;
    onClose: () => void;
}

const GalleryModal = ({ builder, opened, onClose }: GalleryModalProps) => {
    const { t } = useTranslation();
    const images = builder.site?.galleryImages ?? [];
    const remaining = MAX_GALLERY_IMAGES - images.length;

    const uploadMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.addSiteGalleryImages,
        onSuccess: (site) => {
            builder.applySite(site);
            NotificationHandler.showSuccess(t('SITE.GALLERY.UPLOADED'));
        },
        onError: NotificationHandler.showAxiosError,
    });

    const saveOrder = (next: string[]) =>
        builder.updateSiteMutation.mutate({ tenantId: builder.tenantId, body: { galleryImages: next } });

    const handleDrop = (files: File[]) => {
        if (files.length > remaining) {
            NotificationHandler.showWarning(t('SITE.GALLERY.LIMIT', { max: MAX_GALLERY_IMAGES }));
        }
        const accepted = files.slice(0, Math.max(0, remaining));
        if (accepted.length > 0) uploadMutation.mutate({ tenantId: builder.tenantId, images: accepted });
    };

    return (
        <EDIModal title={t('SITE.GALLERY.TITLE')} type="ALERT" visible={opened} onClose={onClose} size="xl">
            <Stack gap="md">
                {remaining > 0 && (
                    <Dropzone
                        onDrop={handleDrop}
                        onReject={() => NotificationHandler.showError(t('COMMON.DROPZONE_TO_BIG'))}
                        accept={IMAGE_MIME_TYPE}
                        maxSize={5 * 1024 ** 2}
                        loading={uploadMutation.isPending}
                        multiple
                    >
                        <Group justify="center" gap="md" mih={110} style={{ pointerEvents: 'none' }}>
                            <IconPhotoPlus size={42} stroke={1.5} color="var(--mantine-color-navy-9)" />
                            <div>
                                <Text fw={600}>{t('SITE.GALLERY.DROP')}</Text>
                                <Text size="sm" c="dimmed">
                                    {t('SITE.GALLERY.DROP_HINT', { remaining, max: MAX_GALLERY_IMAGES })}
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                )}
                {images.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center">
                        {t('SITE.GALLERY.EMPTY')}
                    </Text>
                ) : (
                    <>
                        <Text size="xs" c="dimmed">
                            {t('SITE.GALLERY.REORDER_HINT')}
                        </Text>
                        <SortableList
                            layout="grid"
                            items={images}
                            getId={(image) => image}
                            disabled={!builder.canEdit}
                            onReorder={saveOrder}
                            renderItem={(image, handle) => (
                                <Box pos="relative">
                                    <Image src={profileImageUrl(image)} h={110} radius="md" fit="cover" />
                                    <Group pos="absolute" top={4} left={4} right={4} justify="space-between">
                                        <Box bg="white" style={{ borderRadius: 6 }}>
                                            {handle}
                                        </Box>
                                        {builder.canEdit && (
                                            <ActionIcon
                                                color="red"
                                                variant="filled"
                                                size="sm"
                                                onClick={() => saveOrder(images.filter((item) => item !== image))}
                                                aria-label={t('COMMON.DELETE')}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Box>
                            )}
                        />
                    </>
                )}
            </Stack>
        </EDIModal>
    );
};

export default GalleryModal;
