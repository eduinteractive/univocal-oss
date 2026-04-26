import {
    ActionIcon,
    Box,
    Button,
    Center,
    Flex,
    Group,
    Loader,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { Wiki, WikiToc } from '@eduinteractive/uvc-api';
import {
    IconArrowDown,
    IconArrowUp,
    IconCheck,
    IconEdit,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import WikiToCAddButton from './WikiToCAddButton';
import {
    EDIModal,
    EDISelect,
    EDITextInput,
    NotificationHandler,
} from '@eduinteractive/mantine-common';
import { useTenant } from '../../../../../context/TenantContext';
import { checkPermission } from '../../../../../utils/Permission';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../../../../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface WikiNavigationAddSubmit {
    title: string;
    index: number;
}

interface WikiNavigationDeleteSubmit {
    sectionId: string;
}

interface WikiNavigationEditSubmit {
    sectionId: string;
    title: string;
}

interface WikiNavigationEditToCSubmit {
    tableOfContents: WikiToc[];
}

interface WikiNavigationProps {
    data?: Wiki;
    onAdd: (body: WikiNavigationAddSubmit) => void;
    onEdit: (body: WikiNavigationEditSubmit) => void;
    onEditWiki: () => void;
    onEditWikiToC: (body: WikiNavigationEditToCSubmit) => void;
    onDelete: (body: WikiNavigationDeleteSubmit) => void;
    onOpen: (sectionId: string) => void;
}

const WikiNavigation = (props: WikiNavigationProps) => {
    const { currentTenant } = useTenant();
    const { authData } = useAuth();
    const matchMedia = useMediaQuery('(max-width: 48em)');
    const { t } = useTranslation();

    const [tocData, setTocData] = useState<WikiToc[]>([]);
    const [editingSection, setEditingSection] = useState<WikiToc | null>(null);
    const [editingAllowed, setEditingAllowed] = useState<boolean>(false);
    const [newSectionTitle, setNewSectionTitle] = useState<string>('');
    const [currentChapter, setCurrentChapter] = useState<string>('');

    const hasPermission = useMemo(() => {
            return checkPermission(currentTenant!, 'knowledge:edit') || props.data?.authorId === authData?._id;
        }, [currentTenant, props.data?.authorId, authData?._id]);

    useEffect(() => {
        setTocData(props.data?.tableOfContents || []);
    }, [props.data]);

    const handleAddSection = (index?: number) => {
        if (editingSection) return;
        const newSection = { title: '' };
        const newData = [...tocData];
        if (index === undefined) {
            newData.push(newSection);
        } else {
            newData.splice(index, 0, newSection);
        }
        setTocData(newData);
        setEditingSection(newSection);
    };

    const handleSaveSection = (section: WikiToc, index: number) => {
        section.title = newSectionTitle;
        if (!section.title) {
            return NotificationHandler.showError(
                t('KNOWLEDGE.WIKI.NAV.ERROR_SECTION_NAME_REQUIRED')
            );
        }
        setTocData([...tocData]);
        setEditingSection(null);
        if (section.sectionId) {
            props.onEdit({
                sectionId: section.sectionId,
                title: section.title,
            });
        } else {
            props.onAdd({
                title: section.title,
                index: index,
            });
        }
    };

    const handleEditSection = (section: WikiToc) => {
        setEditingSection(section);
        setNewSectionTitle(section.title);
    };

    const renderSection = (section: WikiToc, index: number) => {
        return (
            <Flex key={index} direction="column">
                <Group
                    className="edi_gray_hover"
                    justify="space-between"
                    gap="xs"
                    style={{
                        borderTop:
                            index === 0 || editingAllowed
                                ? '0.5px solid #e1e1e1'
                                : 'none',
                        borderBottom: '0.5px solid #e1e1e1',
                    }}
                    py="sm"
                    px="sm"
                    onClick={() => {
                        if (!editingAllowed) {
                            props.onOpen(section.sectionId!);
                        }
                    }}
                >
                    {editingSection === section &&
                    editingAllowed &&
                    hasPermission ? (
                        <TextInput
                            value={newSectionTitle}
                            onChange={(e) =>
                                setNewSectionTitle(e.currentTarget.value)
                            }
                            style={{ flex: 1 }}
                        />
                    ) : (
                        <Title order={6} mt="0" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {section.title}
                        </Title>
                    )}
                    {hasPermission && (
                        <>
                            {editingSection !== section && editingAllowed ? (
                                <Group wrap="nowrap" gap="xs">
                                    {index !== 0 && !editingSection && (
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newData = [...tocData];
                                                const temp = newData[index];
                                                newData[index] =
                                                    newData[index - 1];
                                                newData[index - 1] = temp;
                                                props.onEditWikiToC({
                                                    tableOfContents: newData,
                                                });
                                            }}
                                        >
                                            <IconArrowUp size={24} />
                                        </ActionIcon>
                                    )}
                                    {index !== tocData.length - 1 &&
                                        !editingSection && (
                                            <ActionIcon
                                                variant="subtle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newData = [
                                                        ...tocData,
                                                    ];
                                                    const temp = newData[index];
                                                    newData[index] =
                                                        newData[index + 1];
                                                    newData[index + 1] = temp;
                                                    props.onEditWikiToC({
                                                        tableOfContents:
                                                            newData,
                                                    });
                                                }}
                                            >
                                                <IconArrowDown size={24} />
                                            </ActionIcon>
                                        )}
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditSection(section);
                                        }}
                                    >
                                        <IconEdit size={24} />
                                    </ActionIcon>
                                </Group>
                            ) : (
                                editingAllowed && (
                                    <>
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={() =>
                                                handleSaveSection(
                                                    section,
                                                    index
                                                )
                                            }
                                        >
                                            <IconCheck size={20} />
                                        </ActionIcon>
                                    </>
                                )
                            )}
                        </>
                    )}
                </Group>
            </Flex>
        );
    };

    if (!matchMedia) {
        return (
            <Flex
                direction="column"
                style={{
                    width: '300px',
                    height: '100%',
                    borderRight: '1px solid #e1e1e1',
                    position: 'relative',
                }}
            >
                <Box p="sm">
                    <Flex
                        justify="space-between"
                        direction="row"
                        align="center"
                    >
                        <Box>
                            <Title order={4} mt="0">
                                {props.data?.title || (
                                    <Center>
                                        <Loader />
                                    </Center>
                                )}
                            </Title>
                            <Text size="sm" c="dimmed">
                                {props.data?.description || ''}
                            </Text>
                        </Box>
                        {hasPermission && (
                            <ActionIcon
                                variant="subtle"
                                onClick={() => props.onEditWiki()}
                            >
                                <IconEdit size={24} />
                            </ActionIcon>
                        )}
                    </Flex>
                    {hasPermission && (
                        <>
                            {!editingAllowed ? (
                                <Button
                                    variant="light"
                                    size="compact-sm"
                                    fullWidth
                                    mt="md"
                                    mb="md"
                                    onClick={() =>
                                        setEditingAllowed(!editingAllowed)
                                    }
                                >
                                    {t('KNOWLEDGE.WIKI.NAV.EDIT_SECTIONS')}
                                </Button>
                            ) : (
                                <Button
                                    variant="light"
                                    size="compact-sm"
                                    fullWidth
                                    mt="md"
                                    mb="md"
                                    onClick={() => {
                                        if (editingSection) {
                                            // Revert changes
                                            setEditingSection(null);
                                            setNewSectionTitle('');
                                            setTocData(
                                                props.data?.tableOfContents ||
                                                    []
                                            );
                                        }
                                        setEditingAllowed(!editingAllowed);
                                    }}
                                >
                                    {t('KNOWLEDGE.WIKI.NAV.STOP_EDIT')}
                                </Button>
                            )}
                        </>
                    )}
                </Box>
                {!editingSection && editingAllowed && tocData.length >= 1 && (
                    <WikiToCAddButton onAdd={() => handleAddSection(0)} />
                )}
                {tocData.map((section, index) => (
                    <div key={index}>
                        {renderSection(section, index)}
                        {!editingSection && editingAllowed && (
                            <WikiToCAddButton
                                onAdd={() => handleAddSection(index + 1)}
                            />
                        )}
                    </div>
                ))}
                {!editingSection && editingAllowed && tocData.length === 0 && (
                    <WikiToCAddButton onAdd={() => handleAddSection()} />
                )}
            </Flex>
        );
    } else {
        return (
            <Flex
                direction="column"
                gap="sm"
                p="sm"
                style={{ borderBottom: '1px solid #e1e1e1' }}
            >
                <Flex justify="space-between" direction="row" align="center">
                    <Box>
                        <Title order={4} mt="0">
                            {props.data?.title || (
                                <Center>
                                    <Loader />
                                </Center>
                            )}
                        </Title>
                        <Text size="sm" c="dimmed">
                            {props.data?.description || ''}
                        </Text>
                    </Box>
                    {hasPermission && (
                        <ActionIcon
                            variant="subtle"
                            onClick={() => props.onEditWiki()}
                        >
                            <IconEdit size={24} />
                        </ActionIcon>
                    )}
                </Flex>
                <EDISelect
                    label={t('KNOWLEDGE.WIKI.NAV.SELECT_CHAPTER')}
                    placeholder={t('KNOWLEDGE.WIKI.NAV.SELECT_CHAPTER')}
                    value={currentChapter}
                    data={tocData.map((section) => ({
                        label: section.title,
                        value: section.sectionId || 'NEW',
                    }))}
                    onChange={(value) => {
                        if (value) {
                            setCurrentChapter(value);
                            props.onOpen(value);
                        }
                    }}
                />
                <EDIModal
                    visible={!!editingSection}
                    onClose={() => setEditingSection(null)}
                    title={t('KNOWLEDGE.WIKI.NAV.EDIT_SECTION_MODAL_TITLE')}
                    onSubmit={() => {
                        if (editingSection) {
                            handleSaveSection(
                                editingSection,
                                tocData.indexOf(editingSection)
                            );
                        }
                    }}
                >
                    <EDITextInput
                        label={t('KNOWLEDGE.WIKI.NAV.SECTION_NAME')}
                        value={newSectionTitle}
                        placeholder={t('KNOWLEDGE.WIKI.NAV.SECTION_NAME_PLACEHOLDER')}
                        onChange={(e) =>
                            setNewSectionTitle(e.currentTarget.value)
                        }
                    />
                </EDIModal>
                {!editingAllowed && !editingSection && checkPermission(currentTenant!, "knowledge:edit") && (
                    <WikiToCAddButton onAdd={() => handleAddSection()} />
                )}
            </Flex>
        );
    }
};

export default WikiNavigation;
