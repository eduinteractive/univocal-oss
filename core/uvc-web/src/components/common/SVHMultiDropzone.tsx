import { Box, Button, Group, Text, useMantineTheme } from '@mantine/core';
import {
    Dropzone,
    IMAGE_MIME_TYPE,
    MS_EXCEL_MIME_TYPE,
    MS_WORD_MIME_TYPE,
    PDF_MIME_TYPE,
} from '@mantine/dropzone';
import { IconCheck, IconFiles, IconTrash, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SVHMultiDropzoneProps {
    value?: File[];
    onSelected: (files: File[]) => void;
    onRemove: () => void;
}

const SVHMultiDropzone = (props: SVHMultiDropzoneProps) => {
    const { t } = useTranslation();
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const theme = useMantineTheme();

    const handleDrop = (files: File[]) => {
        setUploadedFiles(files);
        props.onSelected(files);
    };

    const handleRemoveFile = () => {
        setUploadedFiles([]);
        props.onRemove();
    };

    if (uploadedFiles.length > 0) {
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
                <IconFiles size={50} stroke={1.5} />
                <Text size="md">
                    {uploadedFiles.length}{' '}
                    {t('COMMON.MULTIDROPZONE_FILES_UPLOADED')}
                </Text>
                <Group justify="center">
                    <Button color="red" mt="xs" onClick={handleRemoveFile}>
                        <IconTrash size={14} />
                        <Text ml="xs" size="sm">
                            {t('COMMON.MULTIDROPZONE_FILES_DELETE')}
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
                accept={[
                    ...IMAGE_MIME_TYPE,
                    ...PDF_MIME_TYPE,
                    ...MS_WORD_MIME_TYPE,
                    ...MS_EXCEL_MIME_TYPE,
                ]}
            >
                <Group
                    justify="center"
                    style={{ minHeight: 100, pointerEvents: 'none' }}
                >
                    <Dropzone.Accept>
                        <IconCheck size={50} stroke={1.5} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX size={50} stroke={1.5} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        <IconFiles size={50} stroke={1.5} />
                    </Dropzone.Idle>
                    <div>
                        <Text size="md" ta="center">
                            {t('COMMON.MULTIDROPZONE_FILES')}
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                            {t('COMMON.MULTIDROPZONE_FILES_MAX_SIZE')}
                        </Text>
                    </div>
                </Group>
            </Dropzone>
        );
    }
};

export default SVHMultiDropzone;
