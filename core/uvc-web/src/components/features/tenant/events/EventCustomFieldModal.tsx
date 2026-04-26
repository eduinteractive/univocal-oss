import {
    EDIModal,
    EDISelect,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { ActionIcon, Button, Divider, Flex } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EventCustomFieldModalSubmitData {
    key: string;
    value: string;
}

interface EventCustomFieldModalProps {
    data?: {
        key: string;
        value: string;
    };
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: EventCustomFieldModalSubmitData) => void;
}

const EventCustomFieldModal = (props: EventCustomFieldModalProps) => {
    const { t } = useTranslation();
    const [key, setKey] = useState('');
    const [value, setValue] = useState('text');
    const [choices, setChoices] = useState<string[]>([]);

    useEffect(() => {
        console.log(props.data);
        if (props.data) {
            console.log(atob(props.data.key));
            setKey(atob(props.data.key));
            const parsedValue = props.data.value?.split('.');
            const base64decodesValues = parsedValue.map((value) => atob(value));
            setChoices(base64decodesValues.slice(1));
            setValue(base64decodesValues[0]);
        } else {
            setKey('');
            setValue('text');
            setChoices([]);
        }
    }, [props.data]);

    const handleSubmit = () => {
        if (!key) {
            return NotificationHandler.showError(
                t('EVENTS.CUSTOM_FIELDS.ERROR_REQUIRED')
            );
        }

        if (!value) {
            return NotificationHandler.showError(
                t('EVENTS.CUSTOM_FIELDS.ERROR_TYPE_REQUIRED')
            );
        }

        const valueString = [value, ...choices]
            .map((value) => btoa(value))
            .join('.');

        if (value === 'single_choice' || value === 'multiple_choice') {
            if (choices.length === 0) {
                return NotificationHandler.showError(
                    t('EVENTS.CUSTOM_FIELDS.ERROR_CHOICE_REQUIRED')
                );
            }
        }

        props.onSubmit({ key: btoa(key), value: valueString });
    };

    return (
        <EDIModal
            visible={props.visible}
            onClose={props.onClose}
            title={t('EVENTS.CUSTOM_FIELDS.MODAL_TITLE')}
            type="DEFAULT"
            onSubmit={() => handleSubmit()}
        >
            <EDITextInput
                label={t('EVENTS.CUSTOM_FIELDS.NAME')}
                placeholder={t('EVENTS.CUSTOM_FIELDS.NAME_PLACEHOLDER')}
                value={key}
                onChange={(e) => setKey(e.currentTarget.value)}
            />
            <EDISelect
                label={t('EVENTS.CUSTOM_FIELDS.TYPE')}
                placeholder={t('EVENTS.CUSTOM_FIELDS.TYPE_PLACEHOLDER')}
                value={value}
                data={[
                    { label: t('EVENTS.CUSTOM_FIELDS.TEXT'), value: 'text' },
                    { label: t('EVENTS.CUSTOM_FIELDS.SINGLE_CHOICE'), value: 'single_choice' },
                    { label: t('EVENTS.CUSTOM_FIELDS.MULTIPLE_CHOICE'), value: 'multiple_choice' },
                ]}
                onChange={(e) => setValue((e as string) || 'text')}
            />
            {(value === 'single_choice' ||
                value === 'multiple_choice') && (
                    <>
                        <Divider />
                        <Flex direction="column" gap={0} py={10}>
                            {choices.map((choice, index) => (
                                <Flex
                                    direction="row"
                                    gap="xs"
                                    key={index}
                                    align="center"
                                >
                                    <EDITextInput
                                        key={index}
                                        label={t('EVENTS.CUSTOM_FIELDS.OPTION', { index: index + 1 })}
                                        placeholder={t('EVENTS.CUSTOM_FIELDS.OPTION', { index: index + 1 })}
                                        style={{ flexGrow: 1 }}
                                        value={choice}
                                        onChange={(e) => {
                                            const newChoices = [...choices];
                                            newChoices[index] =
                                                e.currentTarget.value;
                                            setChoices(newChoices);
                                        }}
                                    />
                                    <ActionIcon
                                        variant="subtle"
                                        size="lg"
                                        color="gray"
                                        onClick={() => {
                                            const newChoices = [...choices];
                                            newChoices.splice(index, 1);
                                            setChoices(newChoices);
                                        }}
                                    >
                                        <IconTrash />
                                    </ActionIcon>
                                </Flex>
                            ))}
                            <Button
                                w="100%"
                                variant="subtle"
                                onClick={() =>
                                    setChoices([...choices, t('EVENTS.CUSTOM_FIELDS.NEW_OPTION')])
                                }
                            >
                                <IconPlus />
                            </Button>
                        </Flex>
                        <Divider py={10} />
                    </>
                )}
        </EDIModal>
    );
};

export default EventCustomFieldModal;
