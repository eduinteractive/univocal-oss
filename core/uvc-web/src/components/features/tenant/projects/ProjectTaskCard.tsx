import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, Badge, Box, Card, Flex, Group, Text } from '@mantine/core';
import { ProjectTask } from '@eduinteractive/uvc-api';
import useTenantMembers from '../../../../hooks/useTenantMembers';
import { getValidAvatarIdentifier } from '../../../../utils/BannedIdentifiers';

interface ProjectTaskCardProps {
    data: ProjectTask;
    withoutDnD?: boolean;
    onEdit?: (task: ProjectTask) => void;
}

const ProjectTaskCard = (props: ProjectTaskCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.data._id });
    const tenantMembers = useTenantMembers();

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition: transition || undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    if (!props.withoutDnD) {
        return (
            <Card
                ref={setNodeRef}
                style={{
                    ...style,
                    cursor: 'pointer',
                }}
                {...attributes}
                {...listeners}
                withBorder
                mb="md"
                px="xs"
                py="sm"
                className="svh_box_shadow_hover"
                h={110}
                onClick={() => props.onEdit && props.onEdit(props.data)}
            >
                <Group
                    gap="xs"
                    pl={0}
                    w="100%"
                    wrap="nowrap"
                    h="100%"
                    align="flex-start"
                >
                    <Box w={2.5} h="100%" bg={props.data.color || undefined} />
                    <Flex direction="column" flex={1} h="100%">
                        <Text mb="sm" pt={5} size="sm" lineClamp={2}>
                            {props.data.title}
                        </Text>
                        <Group justify="flex-end" align="flex-end" flex={1}>
                            <Group align="center">
                                {props.data.dueDate && (
                                    <Badge
                                        color="red"
                                        variant="light"
                                        size="sm"
                                        radius="xs"
                                    >
                                        {new Date(
                                            props.data.dueDate
                                        ).toLocaleDateString()}
                                    </Badge>
                                )}
                                {props.data.owner &&
                                    tenantMembers.find(
                                        (m) => m._id === props.data.owner
                                    ) && (
                                        <Avatar size={24} color="blue">
                                            {getValidAvatarIdentifier(
                                                tenantMembers.find(
                                                    (m) =>
                                                        m._id ===
                                                        props.data.owner
                                                )?.firstName,
                                                tenantMembers.find(
                                                    (m) =>
                                                        m._id ===
                                                        props.data.owner
                                                )?.lastName
                                            )}
                                        </Avatar>
                                    )}
                            </Group>
                        </Group>
                    </Flex>
                </Group>
            </Card>
        );
    } else {
        return (
            <Card withBorder mb="md" px="xs" py="sm" h={110}>
                <Group
                    gap="xs"
                    pl={0}
                    w="100%"
                    wrap="nowrap"
                    h="100%"
                    align="flex-start"
                >
                    <Box w={2.5} h="100%" bg={props.data.color || undefined} />
                    <Flex direction="column" flex={1} h="100%">
                        <Text mb="sm" pt={5} size="sm" lineClamp={2}>
                            {props.data.title}
                        </Text>
                        <Group justify="flex-end" align="flex-end" flex={1}>
                            <Group align="center">
                                {props.data.dueDate && (
                                    <Badge
                                        color="red"
                                        variant="light"
                                        size="sm"
                                        radius="xs"
                                    >
                                        {new Date(
                                            props.data.dueDate
                                        ).toLocaleDateString()}
                                    </Badge>
                                )}
                                {props.data.owner &&
                                    tenantMembers.find(
                                        (m) => m._id === props.data.owner
                                    ) && (
                                        <Avatar size={24} color="blue">
                                            {getValidAvatarIdentifier(
                                                tenantMembers.find(
                                                    (m) =>
                                                        m._id ===
                                                        props.data.owner
                                                )?.firstName,
                                                tenantMembers.find(
                                                    (m) =>
                                                        m._id ===
                                                        props.data.owner
                                                )?.lastName
                                            )}
                                        </Avatar>
                                    )}
                            </Group>
                        </Group>
                    </Flex>
                </Group>
            </Card>
        );
    }
};

export default ProjectTaskCard;
