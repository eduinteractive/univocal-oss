import { useEffect, useMemo, useState } from 'react';
import {
    DndContext,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    closestCenter,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Flex,
    Group,
    ScrollArea,
    Table,
    Text,
} from '@mantine/core';
import ProjectTaskColumn from './ProjectTaskColumn';
import ProjectTaskCard from './ProjectTaskCard';
import ProjectTaskModal, {
    ProjectTaskModalSubmitData,
} from './ProjectTaskModal';
import {
    ProjectTask,
    ProjectTaskColumn as IProjectTaskColumn,
    Project,
} from '@eduinteractive/uvc-api';
import { IconColumns, IconEye, IconList, IconTrash } from '@tabler/icons-react';
import useTenantMembers from '../../../../hooks/useTenantMembers';
import SVHSortTable from '../../../common/SVHSortTable';
import ProjectTaskViewModal from './ProjectTaskViewModal';
import { useTenant } from '../../../../context/TenantContext';
import { useAuth } from '../../../../context/AuthContext';
import { checkPermission } from '../../../../utils/Permission';
import WikiToCAddButton from '../knowledge/wiki/WikiToCAddButton';
import { useTranslation } from 'react-i18next';

// eslint-disable-next-line react-refresh/only-export-components
export enum ProjectTaskViewOptions {
    KANBAN = 'KANBAN',
    LIST = 'LIST',
}

interface ProjectTasksProps {
    data: Project;
    onProjectUpdate: (data: {
        columns?: {
            _id: string;
            title: string;
            tasks: string[];
        }[];
    }) => void;
    onTaskCreate: (colId: string, data: ProjectTaskModalSubmitData) => void;
    onTaskUpdate: (taskId: string, data: ProjectTaskModalSubmitData) => void;
    onTaskDelete: (taskId: string) => void;
}

const ProjectTasks = (props: ProjectTasksProps) => {
    const { t } = useTranslation();
    const tenantMembers = useTenantMembers();
    const { currentTenant } = useTenant();
    const { authData } = useAuth();

    const [columns, setColumns] = useState<IProjectTaskColumn[]>(
        props.data.columns
    );
    const [activeItem, setActiveItem] = useState<ProjectTask | null>(null);
    const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
    const [viewTaskModalVisible, setViewTaskModalVisible] = useState(false);
    const [taskModalData, setTaskModalData] = useState<ProjectTask | null>(
        null
    );
    const [taskModalColumnId, setTaskModalColumnId] = useState<string | null>(
        null
    );
    const [viewOption, setViewOption] = useState(ProjectTaskViewOptions.KANBAN);

    useEffect(() => {
        setColumns(props.data.columns);
    }, [props.data.columns]);

    const hasPermission = useMemo(
        () =>
            checkPermission(currentTenant!, 'project:edit') ||
            props.data.authorId === authData?._id,
        [currentTenant, props.data, authData]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const findColumnIndexOfItem = (
        itemId: string,
        cols: IProjectTaskColumn[]
    ): number => {
        return cols.findIndex((col) => col.tasks.some((t) => t._id === itemId));
    };

    const findColumnIndexById = (
        columnId: string,
        cols: IProjectTaskColumn[]
    ): number => {
        return cols.findIndex((col) => col._id === columnId);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeId = active.id as string;
        const colIndex = findColumnIndexOfItem(activeId, columns);

        if (colIndex >= 0) {
            const found = columns[colIndex].tasks.find(
                (t) => t._id === activeId
            );
            if (found) {
                setActiveItem(found);
            }
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const oldColIndex = findColumnIndexOfItem(activeId, columns);
        if (oldColIndex < 0) return;

        // Versuchen herauszufinden, zu welcher Spalte das "overId" gehört
        let newColIndex = findColumnIndexOfItem(overId, columns);
        if (newColIndex < 0) {
            // Vielleicht ist über einer leeren Spalte gedroppt (Spalte selbst hat dieselbe _id wie columnId)
            newColIndex = findColumnIndexById(overId, columns);
        }

        // Nur verschieben, wenn sich die Spalte tatsächlich ändert
        if (newColIndex >= 0 && newColIndex !== oldColIndex) {
            setColumns((prev) => {
                const newColumns = [...prev];
                const sourceTasks = [...newColumns[oldColIndex].tasks];
                const targetTasks = [...newColumns[newColIndex].tasks];

                // Aktiven Task aus alter Spalte entfernen
                const oldIndex = sourceTasks.findIndex(
                    (t) => t._id === activeId
                );
                if (oldIndex < 0) return prev;
                const [movedItem] = sourceTasks.splice(oldIndex, 1);

                // Schauen, ob wir ihn direkt vor/über ein existierendes Task einfügen können
                const overIndex = targetTasks.findIndex(
                    (t) => t._id === overId
                );
                if (overIndex >= 0) {
                    targetTasks.splice(overIndex, 0, movedItem);
                } else {
                    // Ansonsten ans Ende anhängen
                    targetTasks.push(movedItem);
                }

                newColumns[oldColIndex] = {
                    ...newColumns[oldColIndex],
                    tasks: sourceTasks,
                };
                newColumns[newColIndex] = {
                    ...newColumns[newColIndex],
                    tasks: targetTasks,
                };

                return newColumns;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        // Falls nichts "Over" ist, Abbruch
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const oldColIndex = findColumnIndexOfItem(activeId, columns);
        if (oldColIndex < 0) return;

        let newColIndex = findColumnIndexOfItem(overId, columns);
        if (newColIndex < 0) {
            newColIndex = findColumnIndexById(overId, columns);
        }

        // Wenn das "overId" nicht passt oder identisch mit alter Spalte ist
        if (newColIndex < 0) return;

        // Neue Spaltenstruktur bestimmen
        let newColumns: IProjectTaskColumn[] = [];

        // Falls wir in derselben Spalte sortieren
        if (oldColIndex === newColIndex) {
            newColumns = columns.map((col, index) => {
                if (index !== oldColIndex) return col;

                const tasks = arrayMove(
                    [...col.tasks],
                    col.tasks.findIndex((t) => t._id === activeId),
                    col.tasks.findIndex((t) => t._id === overId)
                );
                return { ...col, tasks };
            });
        } else {
            // Verschieben in eine andere Spalte
            newColumns = columns.map((col, index) => {
                // Quelle
                if (index === oldColIndex) {
                    return {
                        ...col,
                        tasks: col.tasks.filter((t) => t._id !== activeId),
                    };
                }
                // Ziel
                if (index === newColIndex) {
                    const overIndex = col.tasks.findIndex(
                        (t) => t._id === overId
                    );
                    const movedItem = columns[oldColIndex].tasks.find(
                        (t) => t._id === activeId
                    );
                    if (!movedItem) return col;

                    const newTasks = [...col.tasks];
                    if (overIndex >= 0) {
                        newTasks.splice(overIndex, 0, movedItem);
                    } else {
                        newTasks.push(movedItem);
                    }

                    return { ...col, tasks: newTasks };
                }
                return col;
            });
        }

        // State aktualisieren und danach gleich onProjectUpdate aufrufen
        setColumns(newColumns);
        props.onProjectUpdate({
            columns: newColumns.map((col) => ({
                _id: col._id,
                title: col.title,
                tasks: col.tasks.map((task) => task._id),
            })),
        });
    };

    const handleDragCancel = () => {
        setActiveItem(null);
        setColumns(props.data.columns);
    };

    return (
        <>
            <Group justify="space-between" mb="xs">
                <Button.Group>
                    <Button
                        size="sm"
                        color="dark"
                        variant="light"
                        onClick={() =>
                            setViewOption(ProjectTaskViewOptions.KANBAN)
                        }
                    >
                        <IconColumns size={24} />
                    </Button>
                    <Button
                        size="sm"
                        color="dark"
                        variant="light"
                        onClick={() =>
                            setViewOption(ProjectTaskViewOptions.LIST)
                        }
                    >
                        <IconList size={24} />
                    </Button>
                </Button.Group>
                {hasPermission && (
                    <Button
                        size="sm"
                        color="blue"
                        onClick={() => {
                            setEditTaskModalVisible(true);
                            setTaskModalColumnId(props.data.columns[0]._id);
                        }}
                        disabled={props.data.columns.length === 0}
                    >
                        {t('PROJECTS.TASKS.ADD_TASK')}
                    </Button>
                )}
            </Group>
            <ProjectTaskModal
                values={taskModalData || undefined}
                visible={editTaskModalVisible}
                onClose={() => {
                    setTaskModalColumnId(null);
                    setTaskModalData(null);
                    setEditTaskModalVisible(false);
                }}
                onSubmit={(data) => {
                    if (taskModalData) {
                        props.onTaskUpdate(taskModalData._id, data);
                    } else {
                        props.onTaskCreate(taskModalColumnId!, data);
                    }
                    setTaskModalColumnId(null);
                    setTaskModalData(null);
                    setEditTaskModalVisible(false);
                }}
            />
            {taskModalData && (
                <ProjectTaskViewModal
                    data={taskModalData}
                    hasPermission={hasPermission}
                    visible={viewTaskModalVisible}
                    onEdit={() => {
                        setEditTaskModalVisible(true);
                        setViewTaskModalVisible(false);
                    }}
                    onDelete={() => {
                        props.onTaskDelete(taskModalData._id);
                        setViewTaskModalVisible(false);
                        setTaskModalColumnId(null);
                        setTaskModalData(null);
                    }}
                    onClose={() => setViewTaskModalVisible(false)}
                />
            )}
            {viewOption === ProjectTaskViewOptions.KANBAN && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <ScrollArea scrollbarSize={0} type="scroll">
                        <Flex direction="row" gap="sm">
                            {columns.map((column) => {
                                const colItems = column.tasks.map((t) => t._id);

                                return (
                                    <ProjectTaskColumn
                                        key={column._id}
                                        data={column}
                                        hasPermission={hasPermission}
                                        onDelete={() => {
                                            props.onProjectUpdate({
                                                columns: columns
                                                    .filter(
                                                        (col) =>
                                                            col._id !==
                                                            column._id
                                                    )
                                                    .map((col) => ({
                                                        _id: col._id,
                                                        title: col.title,
                                                        tasks: col.tasks.map(
                                                            (t) => t._id
                                                        ),
                                                    })),
                                            });
                                        }}
                                        onUpdate={(data) => {
                                            props.onProjectUpdate({
                                                columns: columns.map((col) => {
                                                    if (
                                                        col._id === column._id
                                                    ) {
                                                        return {
                                                            ...col,
                                                            title: data.title,
                                                            tasks: col.tasks.map(
                                                                (t) => t._id
                                                            ),
                                                        };
                                                    }
                                                    return {
                                                        ...col,
                                                        tasks: col.tasks.map(
                                                            (t) => t._id
                                                        ),
                                                    };
                                                }),
                                            });
                                        }}
                                    >
                                        <SortableContext
                                            items={colItems}
                                            strategy={
                                                verticalListSortingStrategy
                                            }
                                            disabled={!hasPermission}
                                        >
                                            {column.tasks.map((task) => (
                                                <ProjectTaskCard
                                                    key={task._id}
                                                    data={task}
                                                    onEdit={(editTask) => {
                                                        setViewTaskModalVisible(
                                                            true
                                                        );
                                                        setTaskModalData(
                                                            editTask
                                                        );
                                                    }}
                                                />
                                            ))}
                                            {hasPermission && (
                                                /*<Button
                                                    variant="light"
                                                    color="dark"
                                                    size="md"
                                                    onClick={() => {
                                                        setTaskModalColumnId(
                                                            column._id
                                                        );
                                                        setEditTaskModalVisible(
                                                            true
                                                        );
                                                    }}
                                                >
                                                    +
                                                </Button>*/
                                                <WikiToCAddButton
                                                    onAdd={() => {
                                                        setTaskModalColumnId(
                                                            column._id
                                                        );
                                                        setEditTaskModalVisible(
                                                            true
                                                        );
                                                    }}
                                                />
                                            )}
                                        </SortableContext>
                                    </ProjectTaskColumn>
                                );
                            })}
                            {hasPermission && (
                                <Button
                                    variant="light"
                                    color="dark"
                                    size="md"
                                    w={300}
                                    onClick={() => {
                                        props.onProjectUpdate({
                                            columns: columns
                                                .map((col) => ({
                                                    _id: col._id,
                                                    title: col.title,
                                                    tasks: col.tasks.map(
                                                        (t) => t._id
                                                    ),
                                                }))
                                                .concat({
                                                    _id: '',
                                                    title: t('PROJECTS.TASKS.NEW_COLUMN'),
                                                    tasks: [],
                                                }),
                                        });
                                    }}
                                >
                                    {t('PROJECTS.TASKS.ADD')}
                                </Button>
                            )}
                        </Flex>
                    </ScrollArea>
                    <DragOverlay>
                        {activeItem && (
                            <ProjectTaskCard data={activeItem} withoutDnD />
                        )}
                    </DragOverlay>
                </DndContext>
            )}
            {viewOption === ProjectTaskViewOptions.LIST && (
                <SVHSortTable<ProjectTask>
                    data={columns.map((col) => col.tasks).flat()}
                    columns={[
                        { key: 'title', label: t('PROJECTS.TASKS.LIST.TASK') },
                        { key: 'dueDate', label: t('PROJECTS.TASKS.LIST.DUE_DATE') },
                        { key: 'owner', label: t('PROJECTS.TASKS.LIST.OWNER') },
                        { key: 'actions', label: t('PROJECTS.TASKS.LIST.ACTIONS'), sortable: false },
                    ]}
                    renderRow={(task: ProjectTask) => (
                        <Table.Tr key={task._id}>
                            <Table.Td w={300}>
                                <Group
                                    wrap="nowrap"
                                    gap={5}
                                    h="max-content"
                                    display="flex"
                                >
                                    <Box w={280}>
                                        <Text
                                            ta="left"
                                            size="sm"
                                            truncate="end"
                                            h="100%"
                                            style={{
                                                borderLeft: `2.5px solid ${task.color}`,
                                                paddingLeft: 5,
                                            }}
                                        >
                                            {task.title}
                                        </Text>
                                    </Box>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                {task.dueDate ? (
                                    new Date(task.dueDate).toLocaleDateString()
                                ) : (
                                    <Badge color="red" variant="light">
                                        {t('PROJECTS.TASKS.LIST.NO_DATE')}
                                    </Badge>
                                )}
                            </Table.Td>
                            <Table.Td>
                                {task.owner
                                    ? tenantMembers.find(
                                          (m) => m._id === task.owner
                                      )?.firstName +
                                      ' ' +
                                      tenantMembers.find(
                                          (m) => m._id === task.owner
                                      )?.lastName
                                    : t('PROJECTS.TASKS.LIST.NO_OWNER')}
                            </Table.Td>
                            <Table.Td miw={100}>
                                <Group gap="sm">
                                    <ActionIcon
                                        variant="subtle"
                                        onClick={() => {
                                            setTaskModalData(task);
                                            setViewTaskModalVisible(true);
                                        }}
                                    >
                                        <IconEye size={24} />
                                    </ActionIcon>
                                    {hasPermission && (
                                        <ActionIcon
                                            variant="subtle"
                                            onClick={() =>
                                                props.onTaskDelete(task._id)
                                            }
                                        >
                                            <IconTrash size={24} />
                                        </ActionIcon>
                                    )}
                                </Group>
                            </Table.Td>
                        </Table.Tr>
                    )}
                />
            )}
        </>
    );
};

export default ProjectTasks;
