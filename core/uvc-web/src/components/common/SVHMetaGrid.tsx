import { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useNavigate } from 'react-router-dom';
import {
    ActionIcon,
    Card,
    Divider,
    Flex,
    Group,
    Image,
    SimpleGrid,
    Text,
    Title,
} from '@mantine/core';
import { EDIDeleteDialog } from '@eduinteractive/mantine-common';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import { checkPermission } from '../../utils/Permission';
import classes from './SVHMetaGrid.module.css';
import { getMemberRoleLabel } from '../../utils/Parser';
import LOGO from '../../assets/logo.png';
import { useTranslation } from 'react-i18next';

interface SVHMetaGridProps {
    data: {
        _id?: string;
        title: string;
        description?: string;
        content?: string;
        updatedAt?: Date;
        createdAt?: Date;
        image?: string;
        viewAccess?: number;
    }[];
    deleteModal?: {
        title?: string;
        description?: string;
    };
    imageEnabled?: boolean;
    prefixKey?: string;
    prefixFunc?: (val: string) => string;
    permissionPrefix: string;
    onDelete: (metaId: string) => void;
    onEdit: (meta: unknown) => void;
    onOpen?: (meta: unknown) => void;
}

const SVHMetaGrid = (props: SVHMetaGridProps) => {
    const { t } = useTranslation();
    const { currentTenant } = useTenant();
    const [objectToDelete, setObjectToDelete] = useState<string | null>(null);

    const navigate = useNavigate();

    const renderContent = (content?: string) => {
        if (!content) return '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        let text = '';
        doc.body.childNodes.forEach((node) => {
            text += node.textContent + '\n'; // Fügt nach jedem Node einen Zeilenumbruch hinzu
        });
        return text.trim() || '';
    };

    return (
        <SimpleGrid cols={{ base: 1, xs: 1, sm: 1, md: 3 }} spacing="md">
            <EDIDeleteDialog
                title={t('COMMON.DELETE_TITLE')}
                description={t('COMMON.DELETE_DESCRIPTION')}
                visible={!!objectToDelete}
                onSubmit={() => {
                    if (objectToDelete) {
                        props.onDelete(objectToDelete);
                        setObjectToDelete(null);
                    }
                }}
                onClose={() => setObjectToDelete(null)}
                type="CONFIRM"
            />
            {props.data.map((item) => (
                <Card
                    shadow="sm"
                    className={classes.card}
                    key={item._id}
                    onClick={() => {
                        props.onOpen
                            ? props.onOpen(item)
                            : navigate(`${item._id}`);
                    }}
                >
                    {props.imageEnabled && (
                        <Card.Section>
                            <Image
                                src={
                                    item.image
                                        ? `${
                                              import.meta.env
                                                  .VITE_KUBERNETES_HOST
                                          }/api/profile/image/${encodeURIComponent(
                                              item.image
                                          )}`
                                        : LOGO
                                }
                                style={{
                                    backgroundColor: item.image
                                        ? undefined
                                        : 'white',
                                    objectFit: item.image
                                        ? undefined
                                        : 'contain',
                                    overflow: item.image ? undefined : 'hidden',
                                }}
                                alt="Project"
                                width="100%"
                                height={150}
                                fit="cover"
                            />
                        </Card.Section>
                    )}
                    <Card.Section p="md" h={135}>
                        <Group justify="space-between" wrap="nowrap">
                            <Flex direction="column" w="100%">
                                {props.prefixKey && (
                                    <Title order={6} c="dimmed" lineClamp={1}>
                                        {props.prefixKey
                                            ? props.prefixFunc
                                                ? props.prefixFunc(
                                                      (item as never)[
                                                          props.prefixKey
                                                      ] as string
                                                  )
                                                : ((item as never)[
                                                      props.prefixKey
                                                  ] as string)
                                            : ''}
                                    </Title>
                                )}
                                <Title order={6} mt="0" lineClamp={1}>
                                    {item.title}
                                </Title>
                                <Text size="sm" lineClamp={3}>
                                    {renderContent(
                                        item.description || item.content || ''
                                    )}
                                </Text>
                                {!Number.isNaN(item.viewAccess) && (
                                    <Text
                                        c="dimmed"
                                        size="xs"
                                        ta="left"
                                        w="100%"
                                        mt="xs"
                                    >
                                        Sichtbarkeit:{' '}
                                        {
                                            getMemberRoleLabel(item.viewAccess)
                                        }
                                    </Text>
                                )}
                            </Flex>
                        </Group>
                    </Card.Section>
                    <Card.Section>
                        <Divider w="100%" />
                        <Group justify="space-between" p="sm">
                            <Text size="xs" c="dimmed">
                                Zuletzt aktualisiert am{' '}
                                {item.updatedAt
                                    ? new Date(
                                          item.updatedAt
                                      ).toLocaleDateString()
                                    : item.createdAt
                                      ? new Date(
                                            item.createdAt
                                        ).toLocaleDateString()
                                      : ''}
                            </Text>
                            <Group gap="xs">
                                {props.onOpen && (
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            props.onOpen
                                                ? props.onOpen(item)
                                                : navigate(`${item._id}`);
                                        }}
                                    >
                                        <IconEye size={24} />
                                    </ActionIcon>
                                )}

                                {checkPermission(
                                    currentTenant!,
                                    props.permissionPrefix + ':edit'
                                ) && (
                                    <ActionIcon
                                        variant="subtle"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            props.onEdit(item);
                                        }}
                                    >
                                        <IconEdit size={24} />
                                    </ActionIcon>
                                )}
                                {checkPermission(
                                    currentTenant!,
                                    props.permissionPrefix + ':delete'
                                ) && (
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setObjectToDelete(item._id || '');
                                        }}
                                    >
                                        <IconTrash size={24} />
                                    </ActionIcon>
                                )}
                            </Group>
                        </Group>
                    </Card.Section>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default SVHMetaGrid;
