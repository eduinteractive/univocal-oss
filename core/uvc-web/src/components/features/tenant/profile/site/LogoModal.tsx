import { Button, Text } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { SAPI } from '@eduinteractive/uvc-api';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SVHCropDropzone from '../../../../common/SVHCropDropzone';
import { SiteBuilder } from './useSiteBuilder';

interface LogoModalProps {
    builder: SiteBuilder;
    opened: boolean;
    onClose: () => void;
}

const LogoModal = ({ builder, opened, onClose }: LogoModalProps) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | undefined>();

    useEffect(() => {
        if (opened) setFile(undefined);
    }, [opened]);

    const uploadMutation = useMutation({
        mutationFn: SAPI.PROFILE.TENANT.updateSiteLogo,
        onSuccess: (site) => {
            builder.applySite(site);
            NotificationHandler.showSuccess(t('SITE.LOGO.UPDATED'));
            onClose();
        },
        onError: NotificationHandler.showAxiosError,
    });

    const hasLogo = !!builder.site?.logoImage;

    return (
        <EDIModal
            title={t('SITE.LOGO.TITLE')}
            type="DEFAULT"
            visible={opened}
            onClose={onClose}
            loading={uploadMutation.isPending}
            size="lg"
            isForm
            onSubmit={() => {
                if (!file) {
                    NotificationHandler.showError(t('SITE.LOGO.FILE_REQUIRED'));
                    return;
                }
                uploadMutation.mutate({ tenantId: builder.tenantId, logoImage: file });
            }}
        >
            <Text size="sm" c="dimmed" mb="sm">
                {t('SITE.LOGO.HINT')}
            </Text>
            <SVHCropDropzone aspectRatio={1} value={file} onSelected={setFile} onRemove={() => setFile(undefined)} />
            {hasLogo && (
                <Button
                    type="button"
                    variant="outline"
                    color="red"
                    mt="sm"
                    loading={builder.updateSiteMutation.isPending}
                    onClick={() =>
                        builder.updateSiteMutation.mutate(
                            { tenantId: builder.tenantId, body: { logoImage: '' } },
                            { onSuccess: onClose }
                        )
                    }
                >
                    {t('SITE.LOGO.REMOVE')}
                </Button>
            )}
        </EDIModal>
    );
};

export default LogoModal;
