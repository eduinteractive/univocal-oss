import { useEffect, useState } from 'react';
import {
    EDIColorInput,
    EDIModal,
    EDISelect,
    EDITextInput,
} from '@eduinteractive/mantine-common';
import SVHDateInput from '../../../common/SVHDateInput';
import useTenantMembers from '../../../../hooks/useTenantMembers';
import SVHTextEditor from '../../../common/SVHTextEditor';
import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Checkbox,
    Group,
    Paper,
    Tabs,
    Text,
} from '@mantine/core';
import {
    IconEdit,
    IconEye,
    IconListDetails,
    IconPlugConnected,
    IconPlus,
    IconSettings,
    IconTrash,
} from '@tabler/icons-react';
import ProjectSubtaskModal from './ProjectSubtaskModal';
import { ProjectConnector, ProjectSubtask, WikiToc } from '@eduinteractive/uvc-api';
import { getValidAvatarIdentifier } from '../../../../utils/BannedIdentifiers';
import CalendarMaterials from '../calendar/CalendarMaterials';
import { useTenant } from '../../../../context/TenantContext';
import SVHMultiDropzone from '../../../common/SVHMultiDropzone';
import useWikis from '../../../../hooks/useWikis';
import useBudgets from '../../../../hooks/useBudgets';
import useSurveys from '../../../../hooks/useSurveys';
import useEvents from '../../../../hooks/useEvents';
import ProjectConnectorModal from './ProjectConnectorModal';
import { ProjectConnectorStrings } from '../../../../constants/Enums';
import { useTranslation } from 'react-i18next';

export interface ProjectTaskModalSubmitData {
    title: string;
    description?: string;
    color?: string;
    dueDate?: Date | string;
    owner?: string;
    subtasks?: {
        _id: string;
        title: string;
        description?: string;
        dueDate?: string;
        owner?: string;
        done?: boolean;
    }[];
    materials: {
        title: string;
        link: string;
        mimetype: string;
    }[];
    connectors?: {
        origin: string;
        target: string;
    }[];
    newUploads?: File[];
}

interface ProjectTaskModalProps {
    values?: ProjectTaskModalSubmitData & { _id?: string };
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectTaskModalSubmitData) => void;
}

const ProjectTaskModal = (props: ProjectTaskModalProps) => {
    const { t } = useTranslation();
    const tenantMembers = useTenantMembers();
    const datas = {
        wikis: useWikis(),
        budgets: useBudgets(),
        surveys: useSurveys(),
        events: useEvents(),
    };

    const { currentTenant } = useTenant();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState<string | null>();
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [owner, setOwner] = useState<string | null>(null);
    const [subtasks, setSubtasks] = useState<ProjectSubtask[]>([]);
    const [materials, setMaterials] = useState<
        {
            title: string;
            link: string;
            mimetype: string;
        }[]
    >([]);
    const [newUploads, setNewUploads] = useState<File[]>([]);
    const [connectors, setConnectors] = useState<
        {
            origin: string;
            target: string;
        }[]
    >([]);

    const [subtaskModalVisible, setSubtaskModalVisible] = useState(false);
    const [currentSubtask, setCurrentSubtask] = useState<ProjectSubtask | null>(
        null
    );
    const [currentSubtaskIndex, setCurrentSubtaskIndex] = useState<number | null>(
        null
    );

    const [connectorModalVisible, setConnectorModalVisible] = useState(false);

    useEffect(() => {
        if (props.values) {
            setTitle(props.values.title);
            setDescription(props.values.description || '');
            setColor(props.values.color || '');
            setDueDate(
                props.values.dueDate ? new Date(props.values.dueDate) : null
            );
            setOwner(props.values.owner || null);
            setSubtasks(props.values.subtasks || []);
            setMaterials(props.values.materials);
            setNewUploads([]);
            setConnectors(props.values.connectors || []);
        } else {
            setTitle('');
            setDescription('');
            setColor('');
            setDueDate(null);
            setOwner(null);
            setSubtasks([]);
            setMaterials([]);
            setNewUploads([]);
            setConnectors([]);
        }
    }, [props.values, props.visible]);

    const handleSubmit = () => {
        props.onSubmit({
            title,
            description: description,
            color: color || '',
            dueDate: dueDate || '',
            owner: owner || '',
            subtasks,
            materials,
            newUploads,
            connectors,
        });
    };

    const handleDelete = (link: string) => {
        const newMaterials = materials.filter(
            (material) => material.link !== link
        );
        setMaterials(newMaterials);
    };

    return (
        <EDIModal
            title={props.values ? t('PROJECTS.TASKS.MODAL.EDIT') : t('PROJECTS.TASKS.MODAL.CREATE')}
            type="DEFAULT"
            visible={props.visible}
            onClose={props.onClose}
            onSubmit={handleSubmit}
            isForm
            mih={400}
            size="xl"
        >
            <ProjectSubtaskModal
                values={currentSubtask || undefined}
                visible={subtaskModalVisible}
                onClose={() => setSubtaskModalVisible(false)}
                onSubmit={(data) => {
                    if (currentSubtask) {
                        setSubtasks(
                            subtasks.map((s, index) =>
                                index === currentSubtaskIndex
                                    ? data
                                    : s
                            )
                        );
                    } else {
                        setSubtasks([...subtasks, data]);
                    }
                    setSubtaskModalVisible(false);
                    setCurrentSubtask(null);
                }}
            />
            <Tabs defaultValue="general" styles={{}}>
                <Tabs.List>
                    <Tabs.Tab value="general" leftSection={<IconSettings />}>
                        {t('PROJECTS.TASKS.TABS.GENERAL')}
                    </Tabs.Tab>
                    <Tabs.Tab value="tasks" leftSection={<IconListDetails />}>
                        {t('PROJECTS.TASKS.TABS.SUBTASKS')}
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="connectors"
                        leftSection={<IconPlugConnected />}
                    >
                        {t('PROJECTS.TASKS.TABS.CONNECTORS')}
                    </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="general">
                    <EDITextInput
                        label={t('PROJECTS.TASKS.FIELDS.TITLE')}
                        placeholder={t('PROJECTS.TASKS.FIELDS.TITLE_PLACEHOLDER')}
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                        required
                    />
                    <SVHTextEditor
                        text={description}
                        onChange={(text) => setDescription(text)}
                    />
                    <EDIColorInput
                        swatchesPerRow={8}
                        swatches={[
                            '#228be6',
                            '#e64980',
                            '#be4bdb',
                            '#7950f2',
                            '#12b886',
                            '#40c057',
                            '#fab005',
                            '#fd7e14',
                        ]}
                        label={t('COMMON.ATTRIBUTES.COLOR')}
                        placeholder={t('COMMON.ATTRIBUTES.COLOR_PLACEHOLDER')}
                        disallowInput
                        withEyeDropper={false}
                        withPicker={false}
                        value={color || ''}
                        onChange={(color) => setColor(color)}
                        leftSectionPointerEvents='none'
                    />
                    <SVHDateInput
                        label={t('PROJECTS.TASKS.FIELDS.DUE_DATE')}
                        placeholder={t('PROJECTS.TASKS.FIELDS.DUE_DATE_PLACEHOLDER')}
                        value={dueDate}
                        onChange={(date) => setDueDate(date)}
                        clearable
                    />
                    <EDISelect
                        label={t('PROJECTS.TASKS.FIELDS.OWNER')}
                        placeholder={t('PROJECTS.TASKS.FIELDS.OWNER_PLACEHOLDER')}
                        data={tenantMembers.sort((a, b) => a.firstName.localeCompare(b.firstName)).map((m) => ({
                            value: m._id,
                            label: m.firstName + ' ' + m.lastName,
                        }))}
                        value={owner}
                        onChange={(value) => setOwner(value)}
                    />
                    <CalendarMaterials
                        materials={materials}
                        onDownload={(link) => {
                            window.open(
                                `${
                                    import.meta.env.VITE_KUBERNETES_HOST
                                }/api/calendar/tenant/${currentTenant?._id}/event/${props
                                    .values?._id}/download/${encodeURIComponent(
                                    link
                                )}`,
                                '_blank'
                            );
                        }}
                        onDelete={handleDelete}
                    />
                    <SVHMultiDropzone
                        value={[]}
                        onSelected={setNewUploads}
                        onRemove={() => setNewUploads([])}
                    />
                </Tabs.Panel>
                <Tabs.Panel value="tasks" pt={10}>
                    {subtasks.map((subtask, index) => (
                        <Paper
                            withBorder
                            p="xs"
                            key={subtask._id + index}
                            style={{ borderRadius: 0 }}
                        >
                            <Group justify="space-between">
                                <Group gap="xs" wrap="nowrap">
                                    <Checkbox
                                        checked={subtask.done}
                                        onChange={(e) => {
                                            setSubtasks(
                                                subtasks.map((s) =>
                                                    s._id === subtask._id
                                                        ? {
                                                              ...s,
                                                              done: e.target
                                                                  .checked,
                                                          }
                                                        : s
                                                )
                                            );
                                        }}
                                    />
                                    <Text>{subtask.title}</Text>
                                </Group>
                                <Group gap="xs" wrap="nowrap">
                                    {subtask.dueDate && (
                                        <Badge
                                            color="red"
                                            variant="light"
                                            size="sm"
                                            radius="xs"
                                        >
                                            {new Date(
                                                subtask.dueDate
                                            ).toLocaleDateString()}
                                        </Badge>
                                    )}
                                    {subtask.owner &&
                                        tenantMembers.find(
                                            (m) => m._id === subtask.owner
                                        ) && (
                                            <Avatar size={24} color="blue">
                                                {getValidAvatarIdentifier(
                                                    tenantMembers.find(
                                                        (m) =>
                                                            m._id ===
                                                            subtask.owner
                                                    )?.firstName,
                                                    tenantMembers.find(
                                                        (m) =>
                                                            m._id ===
                                                            subtask.owner
                                                    )?.lastName
                                                )}
                                            </Avatar>
                                        )}
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={() => {
                                            setCurrentSubtaskIndex(index);
                                            setCurrentSubtask(subtask);
                                            setSubtaskModalVisible(true);
                                        }}
                                    >
                                        <IconEdit size={24} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() => {
                                            setSubtasks(
                                                subtasks.filter(
                                                    (_, sIndex) =>
                                                        sIndex !== index
                                                )
                                            );
                                        }}
                                    >
                                        <IconTrash size={24} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                    <Button
                        w="100%"
                        variant="subtle"
                        onClick={() => setSubtaskModalVisible(true)}
                        mt={subtasks.length === 0 ? 0 : 'xs'}
                    >
                        <IconPlus />
                    </Button>
                </Tabs.Panel>
                <Tabs.Panel value="connectors" pt={10}>
                    <ProjectConnectorModal
                        data={datas}
                        visible={connectorModalVisible}
                        onClose={() => setConnectorModalVisible(false)}
                        onSubmit={(data) => {
                            setConnectors([...connectors, data]);
                            setConnectorModalVisible(false);
                        }}
                    />
                    {connectors.map((connector, index) => (
                        <Paper
                            withBorder
                            p="xs"
                            key={connector.target + index}
                            style={{ borderRadius: 0 }}
                        >
                            <Group justify="space-between" wrap="nowrap">
                                <Text>
                                    {ProjectConnectorStrings[
                                        connector.origin as keyof typeof ProjectConnectorStrings
                                    ] + ': '}
                                    {connector.origin ===
                                        ProjectConnector.BUDGET &&
                                        connector.target &&
                                        datas.budgets.find(
                                            (b) => b._id === connector.target
                                        )?.title}
                                    {connector.origin ===
                                        ProjectConnector.WIKI &&
                                        connector.target &&
                                        datas.wikis
                                            .find(
                                                (w) =>
                                                    w._id ===
                                                    connector.target.split(
                                                        ':'
                                                    )[0]
                                            )
                                            ?.tableOfContents.find(
                                                (t: WikiToc) =>
                                                    t.sectionId ===
                                                    connector.target.split(
                                                        ':'
                                                    )[1]
                                            )?.title}
                                    {connector.origin ===
                                        ProjectConnector.EVENT &&
                                        connector.target &&
                                        datas.events.find(
                                            (e) => e._id === connector.target
                                        )?.title}
                                    {connector.origin ===
                                        ProjectConnector.SURVEY &&
                                        connector.target &&
                                        datas.surveys.find(
                                            (s) => s._id === connector.target
                                        )?.title}
                                </Text>
                                <Group gap="xs" wrap="nowrap">
                                    <ActionIcon
                                        variant="subtle"
                                        color="blue"
                                        onClick={() => {
                                            switch (connector.origin) {
                                                case ProjectConnector.BUDGET:
                                                    window.open(
                                                        `${
                                                            import.meta.env.VITE_KUBERNETES_HOST
                                                        }/sv/budgets/${connector.target}`,
                                                        '_blank'
                                                    );
                                                    break;
                                                case ProjectConnector.WIKI:
                                                    window.open(
                                                        `${
                                                            import.meta.env.VITE_KUBERNETES_HOST
                                                        }/sv/knowledge/wiki/${connector.target.split(":")[0]}`,
                                                        '_blank'
                                                    );
                                                    break;
                                                case ProjectConnector.EVENT:
                                                    window.open(
                                                        `${
                                                            import.meta.env.VITE_KUBERNETES_HOST
                                                        }/sv/events/${connector.target}`,
                                                        '_blank'
                                                    );
                                                    break;
                                                case ProjectConnector.SURVEY:
                                                    window.open(
                                                        `${
                                                            import.meta.env.VITE_KUBERNETES_HOST
                                                        }/sv/surveys/${connector.target}`,
                                                        '_blank'
                                                    );
                                                    break;
                                            }
                                        }}
                                    >
                                        <IconEye size={24} />
                                    </ActionIcon>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        onClick={() => {
                                            setConnectors(
                                                connectors.filter(
                                                    (c) =>
                                                        c.target !==
                                                        connector.target
                                                )
                                            );
                                        }}
                                    >
                                        <IconTrash size={24} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                    <Button
                        w="100%"
                        variant="subtle"
                        onClick={() => setConnectorModalVisible(true)}
                        mt={connectors.length === 0 ? 0 : 'xs'}
                    >
                        <IconPlus />
                    </Button>
                </Tabs.Panel>
            </Tabs>
        </EDIModal>
    );
};

export default ProjectTaskModal;
