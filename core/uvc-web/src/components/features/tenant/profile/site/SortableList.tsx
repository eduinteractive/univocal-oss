import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Box } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import { CSSProperties, ReactNode } from 'react';

interface SortableListProps<T> {
    items: T[];
    getId: (item: T) => string;
    onReorder: (items: T[]) => void;
    renderItem: (item: T, handle: ReactNode) => ReactNode;
    layout?: 'vertical' | 'grid';
    disabled?: boolean;
    gridStyle?: CSSProperties;
}

function SortableItem({
    id,
    disabled,
    children,
}: {
    id: string;
    disabled?: boolean;
    children: (handle: ReactNode) => ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
    const handle = disabled ? null : (
        <ActionIcon
            variant="subtle"
            color="gray"
            style={{ cursor: 'grab', touchAction: 'none' }}
            aria-label="Verschieben"
            {...attributes}
            {...listeners}
        >
            <IconGripVertical size={16} />
        </ActionIcon>
    );
    return (
        <Box
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.6 : 1,
                zIndex: isDragging ? 2 : undefined,
                position: 'relative',
            }}
        >
            {children(handle)}
        </Box>
    );
}

function SortableList<T>({
    items,
    getId,
    onReorder,
    renderItem,
    layout = 'vertical',
    disabled,
    gridStyle,
}: SortableListProps<T>) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );
    const ids = items.map(getId);

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        const from = ids.indexOf(String(active.id));
        const to = ids.indexOf(String(over.id));
        if (from < 0 || to < 0) return;
        onReorder(arrayMove(items, from, to));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={layout === 'vertical' ? [restrictToVerticalAxis, restrictToParentElement] : [restrictToParentElement]}
        >
            <SortableContext items={ids} strategy={layout === 'vertical' ? verticalListSortingStrategy : rectSortingStrategy}>
                <Box
                    style={
                        layout === 'grid'
                            ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, ...gridStyle }
                            : { display: 'flex', flexDirection: 'column', gap: 10 }
                    }
                >
                    {items.map((item) => (
                        <SortableItem key={getId(item)} id={getId(item)} disabled={disabled}>
                            {(handle) => renderItem(item, handle)}
                        </SortableItem>
                    ))}
                </Box>
            </SortableContext>
        </DndContext>
    );
}

export default SortableList;
