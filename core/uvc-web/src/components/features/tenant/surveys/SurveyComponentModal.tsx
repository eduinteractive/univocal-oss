import React, { useEffect, useState } from 'react';
import {
    SurveyComponent,
    SurveyComponentChoice,
    SurveyComponentLikert,
    SurveyComponentNominal,
    SurveyComponentNominalType,
    SurveyComponentText,
    SurveyComponentType,
} from '@eduinteractive/uvc-api';
import {
    EDIModal,
    EDINumberInput,
    EDISelect,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import classes from './SurveyComponentModal.module.css';
import {
    ActionIcon,
    Button,
    Center,
    Checkbox,
    Divider,
    Flex,
    Group,
    rem,
    SimpleGrid,
    Title,
    Tooltip,
    UnstyledButton,
} from '@mantine/core';
import { SurveyComponentIcon } from './SurveyComponentIcon';
import SVHTextEditor from '../../../common/SVHTextEditor';
import { SurveyComponentNominalTypeStings } from '../../../../constants/Enums';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const LIKERT_TEMPLATES = {
    ['LIKERT_4_STIMMT']: {
        label: 'Likert 4 - Stimmt',
        data: [
            'Stimme zu',
            'Stimme teilweise zu',
            'Stimme eher nicht zu',
            'Stimme nicht zu',
        ],
    },
    ['LIKERT_5_STIMMT']: {
        label: 'Likert 5 - Stimmt',
        data: [
            'Stimme zu',
            'Stimme teilweise zu',
            'Stimme weder zu noch nicht zu',
            'Stimme eher nicht zu',
            'Stimme nicht zu',
        ],
    },
    ['LIKERT_4_TRIFFT']: {
        label: 'Likert 4 - Trifft zu',
        data: [
            'Trifft voll zu',
            'Trifft oft zu',
            'Trifft selten zu',
            'Trifft gar nicht zu',
        ],
    },
    ['LIKERT_5_TRIFTT']: {
        label: 'Likert 5 - Trifft zu',
        data: [
            'Trifft voll zu',
            'Trifft oft zu',
            'Trifft manchmal zu',
            'Trifft selten zu',
            'Trifft gar nicht zu',
        ],
    },
    ['LIKERT_4_ZUFRIEDENHEIT']: {
        label: 'Likert 4 - Zufriedenheit',
        data: [
            'Sehr zufrieden',
            'Zufrieden',
            'Unzufrieden',
            'Sehr unzufrieden',
        ],
    },
    ['LIKERT_5_ZUFRIEDENHEIT']: {
        label: 'Likert 5 - Zufriedenheit',
        data: [
            'Sehr zufrieden',
            'Zufrieden',
            'Neutral',
            'Unzufrieden',
            'Sehr unzufrieden',
        ],
    },
    ['LIKERT_4_PLUS_MINUS']: {
        label: 'Likert 4 - Plus/Minus',
        data: ['++', '+', '-', '--'],
    },
    ['LIKERT_5_PLUS_MINUS']: {
        label: 'Likert 5 - Plus/Minus',
        data: ['++', '+', 'o', '-', '--'],
    },
};

export interface SurveyComponentModalSubmit {
    title: string;
    type: SurveyComponentType;
    required?: boolean;
    description?: string;
    scale?: {
        labels: string[];
    };
    choices?: string[];
    multiple?: boolean;
    max?: number;
    nominalType?: SurveyComponentNominalType;
}

export interface SurveyComponentModalProps {
    data?: SurveyComponent;
    visible: boolean;
    onClose: () => void;
    onSubmit: (body: SurveyComponentModalSubmit) => void;
}

const SurveyComponentModal = (props: SurveyComponentModalProps) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [type, setType] = useState<SurveyComponentType | null>(null);
    const [required, setRequired] = useState(false);
    const [description, setDescription] = useState('');
    const [labels, setLabels] = useState<string[]>([]);
    const [nominalType, setNominalType] =
        useState<SurveyComponentNominalType | null>(null);
    const [multiple, setMultiple] = useState(false);
    const [max, setMax] = useState(0);
    const [choices, setChoices] = useState<string[]>([]);

    useEffect(() => {
        if (props.visible) {
            if (props.data) {
                setTitle(props.data.title);
                setType(props.data.type as SurveyComponentType | null);
                setRequired(props.data.required || false);
                if (props.data.type === SurveyComponentType.TEXT) {
                    setDescription(
                        (props.data as SurveyComponentText).description || ''
                    );
                }
                if (props.data.type === SurveyComponentType.LIKERT) {
                    setLabels(
                        (props.data as SurveyComponentLikert).scale.labels
                    );
                }
                if (props.data.type === SurveyComponentType.CHOICE) {
                    setChoices((props.data as SurveyComponentChoice).choices);
                    setMultiple((props.data as SurveyComponentChoice).multiple);
                    setMax((props.data as SurveyComponentChoice).max || 0);
                }
                if (props.data.type === SurveyComponentType.NOMINAL) {
                    setNominalType(
                        (props.data as SurveyComponentNominal).nominalType
                    );
                }
            } else {
                setTitle('');
                setRequired(false);
                setType(null);
                setDescription('');
                setLabels([]);
                setNominalType(null);
                setMultiple(false);
                setMax(0);
                setChoices([]);
            }
        }
    }, [props.data, props.visible]);

    const handleSubmit = () => {
        if (!title) {
            return NotificationHandler.showError(t('SURVEYS.ERRORS.TITLE_REQUIRED'));
        }
        if (!type) {
            return NotificationHandler.showError(t('SURVEYS.ERRORS.TYPE_REQUIRED'));
        }
        if (type === SurveyComponentType.LIKERT && labels.length === 0) {
            return NotificationHandler.showError(
                t('SURVEYS.ERRORS.SCALE_TEMPLATE_REQUIRED')
            );
        }
        if (type === SurveyComponentType.CHOICE && choices.length === 0) {
            return NotificationHandler.showError(
                t('SURVEYS.ERRORS.OPTIONS_REQUIRED')
            );
        }
        if (type === SurveyComponentType.NOMINAL && !nominalType) {
            return NotificationHandler.showError(
                t('SURVEYS.ERRORS.SCALE_TEMPLATE_REQUIRED')
            );
        }

        props.onSubmit({
            title,
            required,
            type,
            description,
            scale: type === SurveyComponentType.LIKERT ? { labels } : undefined,
            choices: type === SurveyComponentType.CHOICE ? choices : undefined,
            multiple:
                type === SurveyComponentType.CHOICE ? multiple : undefined,
            max: type === SurveyComponentType.CHOICE ? max : undefined,
            nominalType:
                type === SurveyComponentType.NOMINAL ? nominalType! : undefined,
        });
    };

    const renderComponentType = () => {
        switch (type) {
            case SurveyComponentType.TEXT:
                return (
                    <SVHTextEditor
                        text={description}
                        onChange={(value) => setDescription(value)}
                    />
                );
            case SurveyComponentType.LIKERT:
                return (
                    <>
                        <EDISelect
                            label={t('SURVEYS.FIELDS.SCALE_TEMPLATE')}
                            placeholder={t('SURVEYS.FIELDS.SCALE_TEMPLATE_PLACEHOLDER')}
                            value={Object.keys(LIKERT_TEMPLATES).find(
                                (key) =>
                                    JSON.stringify(
                                        LIKERT_TEMPLATES[
                                            key as keyof typeof LIKERT_TEMPLATES
                                        ].data
                                    ) === JSON.stringify(labels)
                            )}
                            onChange={(value) =>
                                setLabels(
                                    LIKERT_TEMPLATES[
                                        value as keyof typeof LIKERT_TEMPLATES
                                    ].data
                                )
                            }
                            data={Object.keys(LIKERT_TEMPLATES).map((key) => ({
                                value: key,
                                label: LIKERT_TEMPLATES[
                                    key as keyof typeof LIKERT_TEMPLATES
                                ].label,
                            }))}
                            required
                        />
                    </>
                );
            case SurveyComponentType.CHOICE:
                return (
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
                                        label={`${t('SURVEYS.COMPONENTS.OPTION')} ${index + 1}`}
                                        placeholder={`${t('SURVEYS.COMPONENTS.OPTION')} ${index + 1}`}
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
                                    setChoices([...choices, t('SURVEYS.COMPONENTS.NEW_OPTION')])
                                }
                            >
                                <IconPlus />
                            </Button>
                        </Flex>
                        <Divider py={10} />
                        <Title order={6} c="dimmed">
                            {t('SURVEYS.COMPONENTS.OPTIONS_TITLE')}
                        </Title>
                        <Checkbox
                            py={10}
                            checked={multiple}
                            onChange={(e) =>
                                setMultiple(e.currentTarget.checked)
                            }
                            label={t('SURVEYS.COMPONENTS.MULTIPLE_OPTIONS')}
                        />
                        <EDINumberInput
                            label={t('SURVEYS.COMPONENTS.MAX_SELECTION')}
                            value={max}
                            onChange={(value) => {
                                if (typeof value === 'number') {
                                    setMax(value);
                                }
                            }}
                            disabled={!multiple}
                        />
                    </>
                );
            case SurveyComponentType.OPEN:
                return <></>;
            case SurveyComponentType.WORDCLOUD:
                return <></>;
            case SurveyComponentType.NOMINAL:
                return (
                    <EDISelect
                        label={t('SURVEYS.FIELDS.NOMINAL_TYPE')}
                        placeholder={t('SURVEYS.FIELDS.NOMINAL_TYPE_PLACEHOLDER')}
                        value={nominalType}
                        onChange={(value) =>
                            setNominalType(value as SurveyComponentNominalType)
                        }
                        data={Object.keys(SurveyComponentNominalTypeStings).map(
                            (key) => ({
                                value: key,
                                label: SurveyComponentNominalTypeStings[
                                    key as keyof typeof SurveyComponentNominalTypeStings
                                ],
                            })
                        )}
                        required
                    />
                );
            default:
                return t('COMMON.UNKNOWN');
        }
    };

    const renderTooltip = (
        type: SurveyComponentType,
        children: React.ReactNode
    ) => {
        switch (type) {
            case SurveyComponentType.TEXT:
                return (
                    <Tooltip label="Ein Text für zusätzliche Informationen">
                        {children}
                    </Tooltip>
                );
            case SurveyComponentType.LIKERT:
                return (
                    <Tooltip label="Eine Skala mit festen Antwortmöglichkeiten (z.B. Stimme zu, Stimme nicht zu)">
                        {children}
                    </Tooltip>
                );
            case SurveyComponentType.CHOICE:
                return (
                    <Tooltip label="Ein Auswahl von individuellen Antwortmöglichkeiten">
                        {children}
                    </Tooltip>
                );
            case SurveyComponentType.OPEN:
                return (
                    <Tooltip label="Eine offene Frage für freie Textantworten">
                        {children}
                    </Tooltip>
                );
            case SurveyComponentType.WORDCLOUD:
                return (
                    <Tooltip label="Eine offene Frage für freie Textantworten als visualisierte Wortwolke">
                        {children}
                    </Tooltip>
                );
            case SurveyComponentType.NOMINAL:
                return (
                    <Tooltip label="Eine Skala mit festen Antwortmöglichkeiten (z.B. Geschlecht, Ja/Nein)">
                        {children}
                    </Tooltip>
                );
            default:
                return t('COMMON.UNKNOWN');
        }
    };

    return (
        <EDIModal
            withoutBorder={type ? false : true}
            visible={props.visible}
            onClose={props.onClose}
            className={classes.card}
            title={props.data ? t('SURVEYS.MODAL.COMPONENT_EDIT') : t('SURVEYS.MODAL.COMPONENT_ADD')}
            type="CUSTOM"
            footer={
                type && (
                    <Group justify="right">
                        <Button variant="outline" onClick={props.onClose}>
                            {t('SURVEYS.COMPONENTS.CANCEL')}
                        </Button>
                        <Button onClick={handleSubmit} disabled={!type}>
                            {t('SURVEYS.COMPONENTS.SAVE')}
                        </Button>
                    </Group>
                )
            }
        >
            {!type && (
                <SimpleGrid cols={3}>
                    {Object.values(SurveyComponentType).map((type) => (
                        <Center key={type}>
                            {renderTooltip(
                                type,
                                <UnstyledButton
                                    className={classes.item}
                                    key={type}
                                    size={rem(2)}
                                    w={rem(120)}
                                    onClick={() => setType(type)}
                                >
                                    <SurveyComponentIcon type={type} />
                                </UnstyledButton>
                            )}
                        </Center>
                    ))}
                </SimpleGrid>
            )}
            {type && (
                <>
                    <EDITextInput
                        label={t('SURVEYS.FIELDS.QUESTION')}
                        placeholder={t('SURVEYS.FIELDS.QUESTION_PLACEHOLDER')}
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                        required
                    />
                    {renderComponentType()}
                    {type !== SurveyComponentType.TEXT && (
                        <Checkbox
                            checked={required}
                            onChange={(e) =>
                                setRequired(e.currentTarget.checked)
                            }
                            label={t('SURVEYS.COMPONENTS.REQUIRED_QUESTION')}
                            mt="md"
                        />
                    )}
                </>
            )}
        </EDIModal>
    );
};

export default SurveyComponentModal;
