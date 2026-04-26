/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import {
    ActionIcon,
    Button,
    Group,
    Select,
    Text,
    TextInput,
} from '@mantine/core';
import { IconSearch, IconSortAscending } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { checkPermission } from '../../utils/Permission';

export interface SVHFilterObject {
    text?: string;
    sort?: Record<string, any>;
}

export const SVHSortOptions = {
    UPDATED_ASC: { updatedAt: 1, label: 'Aktualisiert: Älteste' },
    UPDATED_DESC: { updatedAt: -1, label: 'Aktualisiert: Neueste' },
    CREATED_ASC: { createdAt: 1, label: 'Erstellt: Älteste' },
    CREATED_DESC: { createdAt: -1, label: 'Erstellt: Neueste' },
    TITLE_ASC: { title: 1, label: 'Titel: A-Z' },
    TITLE_DESC: { title: -1, label: 'Titel: Z-A' },
};

interface SVHFilterProps {
    actions?: React.ReactNode;
    children?: React.ReactNode;
    disableSort?: boolean;
    value?: {
        text?: string;
        sort?: Record<string, any>;
    };
    onAdd?: {
        func: () => void;
        text: string;
        permission: string;
    };
    onFilter?: (filter: SVHFilterObject) => void;
}

const SVHFilter = (props: SVHFilterProps) => {
    const { currentTenant } = useTenant();

    const [text, setText] = useState<string>(props.value?.text || '');
    const [sort, setSort] = useState<Record<string, any>>(
        SVHSortOptions.UPDATED_DESC
    );

    useEffect(() => {
        setText(props.value?.text || '');
        setSort(props.value?.sort || SVHSortOptions.UPDATED_DESC);
    }, [props.value]);

    return (
        <Group justify="space-between" mb="sm">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    props.onFilter && props.onFilter({ text, sort });
                }}
            >
                <Group gap="sm" align="center">
                    {!props.disableSort && (
                        <Select
                            leftSection={<IconSortAscending />}
                            value={
                                Object.values(SVHSortOptions).find(
                                    (option) => option.label === sort.label
                                )?.label
                            }
                            data={Object.values(SVHSortOptions).map(
                                (option) => ({
                                    value: option.label,
                                    label: option.label,
                                })
                            )}
                            onChange={(value) => {
                                const option = Object.values(
                                    SVHSortOptions
                                ).find((option) => option.label === value);
                                props.onFilter &&
                                    props.onFilter({ text, sort: option });
                            }}
                        />
                    )}
                    <TextInput
                        value={text}
                        placeholder="Suchen..."
                        onChange={(event) => setText(event.currentTarget.value)}
                        onKeyUp={(event) => {
                            if (event.key === 'Enter') {
                                props.onFilter &&
                                    props.onFilter({ text, sort });
                            }
                        }}
                        rightSection={
                            <ActionIcon variant="subtle" type="submit">
                                <IconSearch />
                            </ActionIcon>
                        }
                    />
                    {props.children}
                </Group>
            </form>

            <Group justify="right">
                {props.actions}
                {props.onAdd &&
                    checkPermission(
                        currentTenant!,
                        props.onAdd.permission.includes(':')
                            ? props.onAdd.permission
                            : `${props.onAdd.permission}:create`
                    ) && (
                        <Button onClick={props.onAdd.func}>
                            <Text size="sm">{props.onAdd.text}</Text>
                        </Button>
                    )}
            </Group>
        </Group>
    );
};

export default SVHFilter;
