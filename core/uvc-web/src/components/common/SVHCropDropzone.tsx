import {
    ActionIcon,
    Box,
    Group,
    Image,
    Text,
    useMantineTheme,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@tabler/icons-react';
import { useState, useRef, useMemo } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

interface SVHCropDropzoneProps {
    aspectRatio?: number;
    bordered?: boolean;
    value?: null | string | File;
    onSelected: (file: File) => void;
    onRemove: () => void;
}

const SVHCropDropzone = (props: SVHCropDropzoneProps) => {
    const { t } = useTranslation();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isCropping, setIsCropping] = useState(false); // Zustandsvariable für das Cropping
    const theme = useMantineTheme();
    const cropperRef = useRef<HTMLImageElement>(null);

    const handleDrop = (files: File[]) => {
        setUploadedFile(files[0]);
        setIsCropping(true);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        props.onRemove();
        setIsCropping(false);
    };

    const handleCrop = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageElement: any = cropperRef?.current;
        const cropper: Cropper = imageElement?.cropper;
        const croppedImage = cropper.getCroppedCanvas({
            maxWidth: 750,
            maxHeight: 750,
        });
        if (props.bordered) {
            croppedImage.style.borderRadius = '50%';
        }
        croppedImage.toBlob((blob) => {
            if (blob) {
                const file = new File(
                    [blob],
                    uploadedFile?.name || 'cropped-avatar-image.png',
                    { type: 'image/png' }
                );
                setUploadedFile(file);
                setIsCropping(false);
                props.onSelected(file);
            }
        });
    };

    const generatePreviewSrc = useMemo(() => {
        if (uploadedFile) {
            return URL.createObjectURL(uploadedFile);
        } else if (props.value) {
            if (typeof props.value === 'string') {
                return `${
                    import.meta.env.VITE_KUBERNETES_HOST
                }/api/profile/image/${encodeURIComponent(
                    props.value as string
                )}`;
            }
        } else {
            return '';
        }
    }, [props.value, uploadedFile]);

    if (isCropping && uploadedFile) {
        return (
            <EDIModal
                type="DEFAULT"
                visible={true}
                onClose={() => {
                    setIsCropping(false);
                    setUploadedFile(null);
                }}
                onSubmit={handleCrop}
                size="xl"
            >
                <Box
                    mt="sm"
                    mb="sm"
                    style={{
                        border: `1px dashed ${theme.colors.gray[4]}`,
                        padding: theme.spacing.xl,
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <Cropper
                        src={URL.createObjectURL(uploadedFile)}
                        style={{
                            height: 400,
                            width: '100%',
                            borderRadius: props.bordered ? '50%' : '0%',
                        }}
                        initialAspectRatio={1}
                        aspectRatio={props.aspectRatio ? props.aspectRatio : 1}
                        viewMode={1}
                        dragMode="move"
                        zoomable={false}
                        ref={cropperRef}
                    />
                </Box>
            </EDIModal>
        );
    } else if (props.value || uploadedFile) {
        return (
            <Box pos="relative" mt="sm" mb="sm">
                <Image
                    src={generatePreviewSrc}
                    alt="Bild"
                    style={{
                        width: '100%',
                        borderRadius: props.bordered ? 10 : 0,
                    }}
                />
                <ActionIcon
                    style={{
                        position: 'absolute', // Absolute Positionierung für das Icon
                        top: -7.5, // Position von oben
                        right: -7.5, // Position von rechts
                        borderRadius: '50%', // Runder Rand
                    }}
                    variant="filled"
                    size="md"
                    onClick={handleRemoveFile}
                >
                    <IconX size={15} />
                </ActionIcon>
            </Box>
        );
    } else {
        return (
            <Dropzone
                mt="sm"
                mb="sm"
                onDrop={handleDrop}
                maxSize={5 * 1024 ** 2}
                maxFiles={1}
                accept={[...IMAGE_MIME_TYPE]}
                onReject={() =>
                    NotificationHandler.showError(
                        t("COMMON.DROPZONE_TO_BIG")
                    )
                }
            >
                <Group
                    justify="center"
                    style={{ minHeight: 50, pointerEvents: 'none' }}
                >
                    <Dropzone.Accept>
                        <IconUpload size={50} stroke={1.5} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX size={50} stroke={1.5} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconPhoto size={50} stroke={1.5} />
                    </Dropzone.Idle>
                    <div>
                        <Text ta="center" size="sm">
                            {t('COMMON.DROPZONE_IMAGE')}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                            {t('COMMON.DROPZONE_IMAGE_MAX_SIZE')}
                        </Text>
                    </div>
                </Group>
            </Dropzone>
        );
    }
};

export default SVHCropDropzone;
