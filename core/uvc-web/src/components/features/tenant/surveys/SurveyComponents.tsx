import { useEffect, useMemo, useState } from 'react';
import {
    SurveyComponent,
    SurveyComponentChoice,
    SurveyComponentLikert,
    SurveyComponentNominal,
    SurveyComponentText,
    SurveyComponentType,
    SurveyMeta,
} from '@eduinteractive/uvc-api';
import {
    ActionIcon,
    Box,
    Button,
    Checkbox,
    Flex,
    Group,
    Text,
    Title,
} from '@mantine/core';
import {
    IconArrowDown,
    IconArrowUp,
    IconEdit,
    IconPlus,
    IconTrash,
} from '@tabler/icons-react';
import {
    EDIDeleteDialog,
    EDITextarea,
    EDITextInput,
} from '@eduinteractive/mantine-common';
import {
    SurveyComponentNominalScale,
    SurveyComponentTypeStrings,
} from '../../../../constants/Enums';
import { useAuth } from '../../../../context/AuthContext';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import { useTranslation } from 'react-i18next';

interface SurveyComponentsProps {
    survey: SurveyMeta;
    data: SurveyComponent[];
    isActive: boolean;
    onAdd: (previous: string | null) => void;
    onEdit: (component: SurveyComponent) => void;
    onDelete: (componentId: string) => void;
    onOrderChange: (componentId: string, direction: number) => void;
}

const SurveyComponents = (props: SurveyComponentsProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();

    const [components, setComponents] = useState<SurveyComponent[]>([]);
    const [deleteComponent, setDeleteComponent] = useState<string | null>(null);

    const hasPermission = useMemo(() => {
        return checkPermission(currentTenant!, 'survey:edit') || props.survey?.authorId === authData?._id;
    }, [currentTenant, props.survey?.authorId, authData?._id]);
    
    useEffect(() => {
        if (props.data) {
            const startComponent = props.data.find((c) => !c.previous);

            // Falls keine Startkomponente gefunden wird, leere Liste zurückgeben
            if (!startComponent) {
                setComponents([]);
            } else {
                // Erstellen der sortierten Liste
                const sortedComponents = [startComponent];
                let currentComponent = startComponent;

                while (currentComponent && currentComponent.next) {
                    const nextComponent = props.data.find(
                        (c) => c._id === currentComponent.next
                    );
                    if (nextComponent) {
                        sortedComponents.push(nextComponent);
                        currentComponent = nextComponent;
                    } else {
                        // Abbruch, falls keine nächste Komponente gefunden wird
                        break;
                    }
                }
                setComponents(sortedComponents);
            }
        }
    }, [props.data]);

    const renderComponentContent = (component: SurveyComponent) => {
        switch (component.type) {
            case SurveyComponentType.TEXT:
                return (
                    <div
                        dangerouslySetInnerHTML={{
                            __html:
                                (component as SurveyComponentText)
                                    .description || '',
                        }}
                    />
                );
            case SurveyComponentType.LIKERT:
                return (
                    <Flex direction="row" gap="sm" wrap="wrap">
                        {(component as SurveyComponentLikert).scale.labels.map(
                            (label, index) => (
                                <Button
                                    key={index}
                                    color="blue"
                                    variant="outline"
                                    size="sm"
                                    radius="sm"
                                >
                                    {label}
                                </Button>
                            )
                        )}
                    </Flex>
                );
            case SurveyComponentType.CHOICE:
                return (
                    <Flex direction="column" gap="sm">
                        {(component as SurveyComponentChoice).choices.map(
                            (label, index) => (
                                <Checkbox key={index} label={label} />
                            )
                        )}
                    </Flex>
                );
            case SurveyComponentType.OPEN:
                return (
                    <EDITextarea
                        label={t('SURVEYS.COMPONENTS.ANSWER_LABEL')}
                        placeholder={t('SURVEYS.COMPONENTS.ANSWER_PLACEHOLDER')}
                    />
                );
            case SurveyComponentType.WORDCLOUD:
                return (
                    <EDITextInput
                        label={t('SURVEYS.COMPONENTS.ANSWER_LABEL')}
                        placeholder={t('SURVEYS.COMPONENTS.ANSWER_PLACEHOLDER')}
                    />
                );
            case SurveyComponentType.NOMINAL:
                return (
                    <Flex direction="row" gap="sm" wrap="wrap">
                        {SurveyComponentNominalScale[
                            (component as SurveyComponentNominal)
                                .nominalType as keyof typeof SurveyComponentNominalScale
                        ].map((label, index) => (
                            <Button
                                key={label + index}
                                color="blue"
                                variant="outline"
                                size="sm"
                                radius="sm"
                            >
                                {label}
                            </Button>
                        ))}
                    </Flex>
                );

            default:
                return <>{t('SURVEYS.COMPONENTS.UNKNOWN_QUESTION')}</>;
        }
    };

    return (
        <Flex direction="column" gap="md" pb="xl">
            <EDIDeleteDialog
                title={t('SURVEYS.COMPONENTS.DELETE_TITLE')}
                description={t('SURVEYS.COMPONENTS.DELETE_DESCRIPTION')}
                visible={deleteComponent !== null}
                onClose={() => setDeleteComponent(null)}
                onSubmit={() => {
                    if (deleteComponent) {
                        props.onDelete(deleteComponent);
                    }
                    setDeleteComponent(null);
                }}
                type="CONFIRM"
            />
            <Flex direction="row" gap="md" align="center">
                {hasPermission && (
                    <Button
                        color="blue"
                        onClick={() => {
                            props.onAdd(null);
                        }}
                        disabled={props.isActive}
                    >
                        {t('SURVEYS.COMPONENTS.ADD_QUESTION')}
                    </Button>
                )}
                {props.isActive && hasPermission && (
                    <Text c="dimmed" size="xs">
                        {t('SURVEYS.COMPONENTS.ACTIVE_WARNING')}
                    </Text>
                )}
            </Flex>
            {components.map((component, index) => (
                <Flex
                    direction="row"
                    key={component._id}
                    gap="md"
                    p="md"
                    style={{
                        border: '1px solid #e1e1e1',
                    }}
                >
                    <Box style={{ flex: 1 }}>
                        <Title order={4}>
                            {component.title}
                            {component.required && (
                                <span style={{ color: 'red' }}>{t('SURVEYS.COMPONENTS.REQUIRED')}</span>
                            )}
                        </Title>
                        <Title order={6} c="dimmed" mb="sm">
                            {
                                SurveyComponentTypeStrings[
                                    component.type as SurveyComponentType
                                ]
                            }
                        </Title>
                        {renderComponentContent(component)}
                    </Box>
                    {!props.isActive && hasPermission && (
                        <Flex
                            direction="column"
                            gap="xs"
                            pl={10}
                            style={{
                                borderLeft: '1px solid #e1e1e1',
                                flexShrink: 1,
                            }}
                            miw={85}
                        >
                            <Group gap="xs">
                                <ActionIcon
                                    variant="subtle"
                                    size="lg"
                                    onClick={() => {
                                        props.onEdit(component);
                                    }}
                                >
                                    <IconEdit />
                                </ActionIcon>
                                <ActionIcon
                                    variant="subtle"
                                    size="lg"
                                    color="gray"
                                    onClick={() => {
                                        setDeleteComponent(component._id);
                                    }}
                                >
                                    <IconTrash />
                                </ActionIcon>
                            </Group>
                            <Group gap="xs" justify="right">
                                {index !== 0 && (
                                    <ActionIcon
                                        variant="subtle"
                                        size="lg"
                                        onClick={() =>
                                            props.onOrderChange(
                                                component._id,
                                                1
                                            )
                                        }
                                    >
                                        <IconArrowUp />
                                    </ActionIcon>
                                )}
                                {index !== components.length - 1 && (
                                    <ActionIcon
                                        variant="subtle"
                                        size="lg"
                                        onClick={() =>
                                            props.onOrderChange(
                                                component._id,
                                                -1
                                            )
                                        }
                                    >
                                        <IconArrowDown />
                                    </ActionIcon>
                                )}
                            </Group>
                            <Group justify="right">
                                <ActionIcon
                                    variant="subtle"
                                    size="lg"
                                    onClick={() => {
                                        props.onAdd(component._id);
                                    }}
                                >
                                    <IconPlus />
                                </ActionIcon>
                            </Group>
                        </Flex>
                    )}
                </Flex>
            ))}
        </Flex>
    );
};

export default SurveyComponents;
