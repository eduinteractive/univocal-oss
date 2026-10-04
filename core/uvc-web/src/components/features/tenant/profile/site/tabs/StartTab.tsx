import { ActionIcon, Button, Card, Grid, Group, SegmentedControl, Stack, Text, Tooltip } from '@mantine/core';
import {
    IconAddressBook,
    IconCamera,
    IconDeviceDesktop,
    IconDeviceMobile,
    IconEdit,
    IconPhoto,
    IconPhotoEdit,
} from '@tabler/icons-react';
import { useState, type JSX } from 'react';
import { useTranslation } from 'react-i18next';
import SVHLoader from '../../../../../common/SVHLoader';
import SectionManager from '../SectionManager';
import SitePreviewCanvas, { PreviewDevice } from '../SitePreviewCanvas';
import { SetupAction, SetupStep } from '../setupChecklist';
import { SiteBuilder } from '../useSiteBuilder';
import { MAX_GALLERY_IMAGES } from '../GalleryModal';
import SetupTab from './SetupTab';

export type StartModal = 'logo' | 'description' | 'gallery' | 'contacts' | 'background';

interface StartTabProps {
    builder: SiteBuilder;
    steps: SetupStep[];
    onOpenModal: (modal: StartModal) => void;
    onNavigate: (tab: string) => void;
    onSetupAction: (action: SetupAction, tab?: string) => void;
}

const StartTab = ({ builder, steps, onOpenModal, onNavigate, onSetupAction }: StartTabProps) => {
    const { t } = useTranslation();
    const [device, setDevice] = useState<PreviewDevice>('desktop');
    const canEdit = builder.canEdit;
    const data = builder.preview;

    const editButton = (label: string, icon: JSX.Element, modal: StartModal) => (
        <Tooltip label={label} withArrow>
            <ActionIcon variant="filled" color="violet" radius="md" onClick={() => onOpenModal(modal)} aria-label={label}>
                {icon}
            </ActionIcon>
        </Tooltip>
    );

    return (
        <Grid gap={{ base: 'lg', lg: 32 }}>
            <Grid.Col span={{ base: 12, lg: 8 }}>
                <Stack gap="md">
                    <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                            {t('SITE.BUILDER.CANVAS_HINT')}
                        </Text>
                        <SegmentedControl
                            size="xs"
                            radius="md"
                            value={device}
                            onChange={(value) => setDevice(value as PreviewDevice)}
                            data={[
                                {
                                    value: 'desktop',
                                    label: (
                                        <Group gap={4} wrap="nowrap">
                                            <IconDeviceDesktop size={14} />
                                            {t('SITE.BUILDER.DESKTOP')}
                                        </Group>
                                    ),
                                },
                                {
                                    value: 'mobile',
                                    label: (
                                        <Group gap={4} wrap="nowrap">
                                            <IconDeviceMobile size={14} />
                                            {t('SITE.BUILDER.MOBILE')}
                                        </Group>
                                    ),
                                },
                            ]}
                        />
                    </Group>
                    {!data ? (
                        <Card withBorder radius="sm" mih={300}>
                            <SVHLoader />
                        </Card>
                    ) : (
                        <SitePreviewCanvas
                            data={data}
                            device={device}
                            editable
                            logoAction={canEdit && editButton(t('SITE.LOGO.TITLE'), <IconCamera size={16} />, 'logo')}
                            descriptionAction={
                                canEdit && (
                                    <Group gap="md" wrap="nowrap">
                                        {editButton(t('SITE.BUILDER.EDIT_DESCRIPTION'), <IconEdit size={16} />, 'description')}
                                        {editButton(t('SITE.BUILDER.EDIT_CONTACTS'), <IconAddressBook size={16} />, 'contacts')}
                                        {editButton(t('SITE.BUILDER.EDIT_BACKGROUND'), <IconPhoto size={16} />, 'background')}
                                    </Group>
                                )
                            }
                            galleryAction={
                                canEdit && (
                                    <Group justify="flex-end">
                                        <Button
                                            size="xs"
                                            variant="light"
                                            color="violet"
                                            radius="md"
                                            leftSection={<IconPhotoEdit size={14} />}
                                            onClick={() => onOpenModal('gallery')}
                                        >
                                            {t('SITE.GALLERY.MANAGE', {
                                                count: data.site.galleryImages.length,
                                                max: MAX_GALLERY_IMAGES,
                                            })}
                                        </Button>
                                    </Group>
                                )
                            }
                        />
                    )}
                </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="lg" style={{ position: 'sticky', top: 24 }}>
                    <SetupTab steps={steps} onAction={onSetupAction} compact />
                    <SectionManager builder={builder} onNavigate={onNavigate} />
                </Stack>
            </Grid.Col>
        </Grid>
    );
};

export default StartTab;
