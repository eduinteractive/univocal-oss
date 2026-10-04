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
import { useState, useRef, useMemo, useEffect } from 'react';
import Cropper from 'cropperjs';
import { EDIModal, NotificationHandler } from '@eduinteractive/mantine-common';
import { useTranslation } from 'react-i18next';

const MAX_OUTPUT_SIZE = 750;

const buildCropperTemplate = (aspectRatio: number) =>
    '<cropper-canvas background style="height: 400px; width: 100%;">' +
    '<cropper-image initial-center-size="contain"></cropper-image>' +
    '<cropper-shade hidden></cropper-shade>' +
    `<cropper-selection initial-coverage="0.8" aspect-ratio="${aspectRatio}" movable resizable outlined>` +
    '<cropper-grid role="grid" bordered covered></cropper-grid>' +
    '<cropper-crosshair centered></cropper-crosshair>' +
    '<cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>' +
    '<cropper-handle action="n-resize"></cropper-handle>' +
    '<cropper-handle action="e-resize"></cropper-handle>' +
    '<cropper-handle action="s-resize"></cropper-handle>' +
    '<cropper-handle action="w-resize"></cropper-handle>' +
    '<cropper-handle action="ne-resize"></cropper-handle>' +
    '<cropper-handle action="nw-resize"></cropper-handle>' +
    '<cropper-handle action="se-resize"></cropper-handle>' +
    '<cropper-handle action="sw-resize"></cropper-handle>' +
    '</cropper-selection>' +
    '</cropper-canvas>';

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
    const imageRef = useRef<HTMLImageElement>(null);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const cropperRef = useRef<Cropper | null>(null);
    const aspectRatio = props.aspectRatio ? props.aspectRatio : 1;

    const cropSource = useMemo(
        () => (isCropping && uploadedFile ? URL.createObjectURL(uploadedFile) : ''),
        [isCropping, uploadedFile]
    );

    useEffect(() => {
        return () => {
            if (cropSource) URL.revokeObjectURL(cropSource);
        };
    }, [cropSource]);

    useEffect(() => {
        if (!cropSource || !imageRef.current || !container) return;

        const cropper = new Cropper(imageRef.current, {
            container,
            template: buildCropperTemplate(aspectRatio),
        });
        cropperRef.current = cropper;

        const cropperCanvas = cropper.getCropperCanvas();
        const cropperImage = cropper.getCropperImage();
        const cropperSelection = cropper.getCropperSelection();

        // Keep the selection inside the image bounds (equivalent to cropperjs 1 `viewMode: 1`).
        const handleSelectionChange = (event: Event) => {
            if (!cropperCanvas || !cropperImage) return;
            const { x, y, width, height } = (
                event as CustomEvent<{ x: number; y: number; width: number; height: number }>
            ).detail;
            const canvasRect = cropperCanvas.getBoundingClientRect();
            const imageRect = cropperImage.getBoundingClientRect();
            const left = imageRect.left - canvasRect.left;
            const top = imageRect.top - canvasRect.top;
            if (
                x < left ||
                y < top ||
                x + width > left + imageRect.width ||
                y + height > top + imageRect.height
            ) {
                event.preventDefault();
            }
        };

        cropperSelection?.addEventListener('change', handleSelectionChange);

        return () => {
            cropperSelection?.removeEventListener('change', handleSelectionChange);
            cropper.destroy();
            cropperRef.current = null;
        };
    }, [cropSource, aspectRatio, container]);

    const handleDrop = (files: File[]) => {
        setUploadedFile(files[0]);
        setIsCropping(true);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        props.onRemove();
        setIsCropping(false);
    };

    const handleCrop = async () => {
        const cropper = cropperRef.current;
        const selection = cropper?.getCropperSelection();
        const cropperImage = cropper?.getCropperImage();
        if (!selection || !cropperImage) return;

        // Export at the image's natural resolution, capped like cropperjs 1 `maxWidth`/`maxHeight`.
        const naturalScale =
            cropperImage.$image.naturalWidth /
            cropperImage.getBoundingClientRect().width;
        let width = selection.width * naturalScale;
        let height = selection.height * naturalScale;
        const downscale = Math.min(1, MAX_OUTPUT_SIZE / width, MAX_OUTPUT_SIZE / height);
        width = Math.round(width * downscale);
        height = Math.round(height * downscale);

        const croppedImage = await selection.$toCanvas({ width, height });
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
                    <div
                        ref={setContainer}
                        style={{
                            height: 400,
                            width: '100%',
                            overflow: 'hidden',
                            borderRadius: props.bordered ? '50%' : '0%',
                        }}
                    >
                        <img ref={imageRef} src={cropSource} alt="" />
                    </div>
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
