import { NotificationHandler } from '@eduinteractive/mantine-common';
import { Box, Button, Group, Text, useMantineTheme } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import {
    IconImageInPicture,
    IconPhoto,
    IconTrash,
    IconUpload,
    IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SVHDropzoneProps {
    value?: string | File;
    onSelected: (file: File) => void;
    onRemove: () => void;
}

const SVHDropzone = (props: SVHDropzoneProps) => {
    const { t } = useTranslation();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const theme = useMantineTheme();

    const handleDrop = (files: File[]) => {
        setUploadedFile(files[0]);
        props.onSelected(files[0]);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        props.onRemove();
    };

    if (uploadedFile || props.value) {
        return (
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
                <IconImageInPicture size={50} stroke={1.5} />
                <Text size="md" mt="md">
                    {uploadedFile?.name || ''}
                </Text>
                <Group mt="md" justify="center">
                    <Button color="red" mt="md" onClick={handleRemoveFile}>
                        <IconTrash size={14} />
                        <Text ml="xs" size="sm">
                            {t("COMMON.DROPZONE_IMAGE_DELETE")}
                        </Text>
                    </Button>
                </Group>
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
                    style={{ minHeight: 100, pointerEvents: 'none' }}
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
                        <Text size="md" ta="center">
                            {t("COMMON.DROPZONE_IMAGE")}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                            {t("COMMON.DROPZONE_IMAGE_MAX_SIZE")}
                        </Text>
                    </div>
                </Group>
            </Dropzone>
        );
    }
};

export default SVHDropzone;
