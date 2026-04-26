import { ActionIcon, Center, Flex, Group, Paper, Text, Title } from '@mantine/core';
import { useState } from 'react';
import EventCustomFieldModal from './EventCustomFieldModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface EventCustomFieldSubmitData {
    key: string;
    value: string;
}

interface EventCustomFieldsProps {
    data: {
        fields: {
            key: string;
            value: string;
        }[];
    };
    onUpdate: (data: EventCustomFieldSubmitData[]) => void;
}

const EventCustomFields = (props: EventCustomFieldsProps) => {
    const { t } = useTranslation();
    const [customFieldModalVisible, setCustomFieldModalVisible] =
        useState(false);
    const [currentCustomField, setCurrentCustomField] = useState<{
        key: string;
        value: string;
    } | null>(null);

    return (
        <Flex direction="column">
            <EventCustomFieldModal
                visible={customFieldModalVisible}
                onClose={() => setCustomFieldModalVisible(false)}
                data={currentCustomField || undefined}
                onSubmit={(data) => {
                    if (!currentCustomField) {
                        if (
                            props.data.fields.find(
                                (val) => val.key === data.key
                            )
                        ) {
                            return NotificationHandler.showError(
                                t('EVENTS.CUSTOM_FIELDS.ERROR_DUPLICATE')
                            );
                        }
                        props.onUpdate([...(props.data.fields || []), data]);
                    } else {
                        const newFields = props.data.fields?.map((field) => {
                            if (field.key === currentCustomField.key) {
                                return data;
                            }
                            return field;
                        });
                        props.onUpdate(newFields);
                    }
                    setCustomFieldModalVisible(false);
                }}
            />
            <Title order={6} c="dimmed" mb="xs">
                {t('EVENTS.CUSTOM_FIELDS.TITLE')}
            </Title>
            <Paper withBorder p="xs" style={{ borderRadius: 0 }}>
                <Group justify="space-between" wrap="nowrap">
                    <Text size="sm">{t('EVENTS.CUSTOM_FIELDS.DEFAULT_NAME')}</Text>
                    <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="subtle" disabled>
                            <IconEdit size={24} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" disabled>
                            <IconTrash size={24} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Paper>
            <Paper withBorder p="xs" style={{ borderRadius: 0 }}>
                <Group justify="space-between" wrap="nowrap">
                    <Text size="sm">{t('EVENTS.CUSTOM_FIELDS.DEFAULT_EMAIL')}</Text>
                    <Group gap="xs" wrap="nowrap">
                        <ActionIcon variant="subtle" disabled>
                            <IconEdit size={24} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" disabled>
                            <IconTrash size={24} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Paper>
            {props.data.fields?.map((field) => (
                <Paper withBorder p="xs" style={{ borderRadius: 0 }}>
                    <Group justify="space-between" wrap="nowrap">
                        <Text size="sm">{atob(field.key)}</Text>
                        <Group gap="xs" wrap="nowrap">
                            <ActionIcon
                                variant="subtle"
                                onClick={() => {
                                    setCurrentCustomField(field);
                                    setCustomFieldModalVisible(true);
                                }}
                            >
                                <IconEdit size={24} />
                            </ActionIcon>
                            <ActionIcon
                                variant="subtle"
                                onClick={() =>
                                    props.onUpdate(
                                        props.data.fields?.filter(
                                            (f) => f.key !== field.key
                                        )
                                    )
                                }
                            >
                                <IconTrash size={24} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </Paper>
            ))}
            <Center mt="xs">
                <ActionIcon
                    variant="subtle"
                    onClick={() => {
                        setCurrentCustomField(null);
                        setCustomFieldModalVisible(true);
                    }}
                >
                    <IconPlus size={24} />
                </ActionIcon>
            </Center>
        </Flex>
    );
};

export default EventCustomFields;
