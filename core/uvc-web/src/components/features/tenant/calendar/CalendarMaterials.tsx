import { ActionIcon, Group, Paper, Text } from '@mantine/core';
import { IconDownload, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface CalendarMaterialsProps {
    materials: {
        title: string;
        link: string;
        mimetype: string;
    }[];
    onDownload: (link: string) => void;
    onDelete?: (link: string) => void;
}

const CalendarMaterials = (props: CalendarMaterialsProps) => {
    const { t } = useTranslation();
    
    return (
        <>
            <Text c="dimmed" size="sm" mb={5}>
                {t('CALENDAR.MATERIALS')}
            </Text>
            {props.materials.map((material) => (
                <Paper
                    withBorder
                    p="xs"
                    key={material.link}
                    style={{ borderRadius: 0 }}
                >
                    <Group justify="space-between">
                        <Text size="sm">{material.title}</Text>
                        <Group gap="xs">
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={() => props.onDownload(material.link)}
                            >
                                <IconDownload size={18} />
                            </ActionIcon>
                            {props.onDelete && (
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() =>
                                        props.onDelete!(material.link)
                                    }
                                >
                                    <IconTrash size={18} />
                                </ActionIcon>
                            )}
                        </Group>
                    </Group>
                </Paper>
            ))}
        </>
    );
};

export default CalendarMaterials;
