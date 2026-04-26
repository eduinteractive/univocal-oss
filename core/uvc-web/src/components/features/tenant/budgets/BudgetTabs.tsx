import {
    Tabs,
    Flex,
    Text,
    Title,
    Switch,
    Box,
    Button,
    Group,
    ActionIcon,
} from '@mantine/core';
import dayjs from 'dayjs';
import {
    Budget,
    BudgetPosition,
    BudgetPositionType,
} from '@eduinteractive/uvc-api';
import { IconDownload, IconEdit, IconFileDescription, IconSettings, IconTaxEuro } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { BudgetGroupsWithPosition } from './BudgetGroups';
import { CSVLink } from 'react-csv';
import { useTenant } from '../../../../context/TenantContext';
import { checkPermission } from '../../../../utils/Permission';
import { useAuth } from '../../../../context/AuthContext';
import SVHTabs from '../../../common/SVHTabs';
import { useTranslation } from 'react-i18next';

interface BudgetTabsProps {
    data?: Budget;
    contentTab: React.ReactNode;
    positions: BudgetPosition[];
    onEdit: () => void;
    onUpdate: (ist_active: boolean) => void;
}

const BudgetTabs = (props: BudgetTabsProps) => {
    const { t } = useTranslation();
    const { authData } = useAuth();
    const { currentTenant } = useTenant();
    const [csvData, setCsvData] = useState<
        {
            GroupTitle: string;
            GroupDescription?: string;
            SollAmount: string;
            IstAmount: string;
        }[]
    >([]);

    const hasPermission = useMemo(() => {
        return checkPermission(currentTenant!, 'budget:edit') || props.data?.authorId === authData?._id;
    }, [currentTenant, authData, props.data]);

    useEffect(() => {
        const incomeGroups: BudgetGroupsWithPosition[] = [];
        const expenseGroups: BudgetGroupsWithPosition[] = [];

        props.positions.forEach((position) => {
            if (position.type === BudgetPositionType.GROUP_INCOME) {
                incomeGroups.push({
                    group: position,
                    positions: props.positions.filter(
                        (p) => p.parent === position._id
                    ),
                });
            } else if (position.type === BudgetPositionType.GROUP_EXPENSE) {
                expenseGroups.push({
                    group: position,
                    positions: props.positions.filter(
                        (p) => p.parent === position._id
                    ),
                });
            }
        });

        const csvRows: {
            GroupTitle: string;
            GroupDescription?: string;
            SollAmount: string;
            IstAmount: string;
        }[] = [];

        csvRows.push({
            GroupTitle: t('BUDGET.INCOME'),
            SollAmount: incomeGroups
                .reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + position.soll_amount,
                            0
                        ),
                    0
                )
                .toFixed(2),
            IstAmount: incomeGroups
                .reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + (position.ist_amount || 0),
                            0
                        ),
                    0
                )
                .toFixed(2),
        });

        incomeGroups.forEach((group) => {
            const groupSoll = group.positions
                .reduce((sum, position) => sum + position.soll_amount, 0)
                .toFixed(2);
            const groupIst = group.positions
                .reduce((sum, position) => sum + (position.ist_amount || 0), 0)
                .toFixed(2);

            csvRows.push({
                GroupTitle: group.group.title,
                GroupDescription: group.group.description,
                SollAmount: groupSoll,
                IstAmount: groupIst,
            });

            group.positions.forEach((position) => {
                csvRows.push({
                    GroupTitle: position.title,
                    GroupDescription: position.description,
                    SollAmount: position.soll_amount.toFixed(2),
                    IstAmount: position.ist_amount?.toFixed(2) || '0',
                });
            });
        });

        csvRows.push({
            GroupTitle: t('BUDGET.EXPENSE'),
            SollAmount: expenseGroups
                .reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + position.soll_amount,
                            0
                        ),
                    0
                )
                .toFixed(2),
            IstAmount: expenseGroups
                .reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + (position.ist_amount || 0),
                            0
                        ),
                    0
                )
                .toFixed(2),
        });

        expenseGroups.forEach((group) => {
            const groupSoll = group.positions
                .reduce((sum, position) => sum + position.soll_amount, 0)
                .toFixed(2);
            const groupIst = group.positions
                .reduce((sum, position) => sum + (position.ist_amount || 0), 0)
                .toFixed(2);

            csvRows.push({
                GroupTitle: group.group.title,
                GroupDescription: group.group.description,
                SollAmount: groupSoll,
                IstAmount: groupIst,
            });

            group.positions.forEach((position) => {
                csvRows.push({
                    GroupTitle: position.title,
                    GroupDescription: position.description,
                    SollAmount: position.soll_amount.toFixed(2),
                    IstAmount: position.ist_amount?.toFixed(2) || '0',
                });
            });
        });

        csvRows.push({
            GroupTitle: t('BUDGET.TOTAL'),
            SollAmount: (
                incomeGroups.reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + position.soll_amount,
                            0
                        ),
                    0
                ) -
                expenseGroups.reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + position.soll_amount,
                            0
                        ),
                    0
                )
            ).toFixed(2),
            IstAmount: (
                incomeGroups.reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + (position.ist_amount || 0),
                            0
                        ),
                    0
                ) -
                expenseGroups.reduce(
                    (sum, group) =>
                        sum +
                        group.positions.reduce(
                            (sum, position) => sum + (position.ist_amount || 0),
                            0
                        ),
                    0
                )
            ).toFixed(2),
        });

        setCsvData(csvRows);
    }, [props.positions, t]);

    const headers = useMemo(
        () => [
            { label: t('BUDGET.GROUP_TITLE'), key: 'GroupTitle' },
            { label: t('COMMON.ATTRIBUTES.DESCRIPTION'), key: 'GroupType' },
            { label: t('BUDGET.ATTRIBUTES.SOLL_AMOUNT'), key: 'SollAmount' },
            { label: t('BUDGET.ATTRIBUTES.IST_AMOUNT'), key: 'IstAmount' },
        ],
        [t]
    );

    return (
        <SVHTabs defaultValue="content" title={props.data?.title}>
            <Tabs.List>
                <Tabs.Tab value="content" leftSection={<IconTaxEuro />}>{t('BUDGET.TAB_BUDGET')}</Tabs.Tab>
                <Tabs.Tab value="general" leftSection={<IconFileDescription />}>{t('BUDGET.TAB_DESCRIPTION')}</Tabs.Tab>
                <Tabs.Tab value="settings" leftSection={<IconSettings />}>{t('BUDGET.TAB_SETTINGS')}</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="content" p="md">
                {props.contentTab}
            </Tabs.Panel>
            <Tabs.Panel value="general" p="md">
                <Flex justify="space-between">
                    <Flex direction="column" gap={0}>
                        <Text c="dimmed" size="sm">
                            {props.data?.year}
                        </Text>
                        <Title order={3}>{props.data?.title}</Title>
                        <Text size="sm">{props.data?.description}</Text>
                    </Flex>
                    {hasPermission && (
                        <ActionIcon variant="subtle">
                            <IconEdit size={24} onClick={props.onEdit} />
                        </ActionIcon>
                    )}
                </Flex>
                <Flex align="end" justify="end" direction="column" mt="sm">
                    <Text size="sm" c="dimmed">
                        {t('COMMON.CREATED_AT')}:{' '}
                        {dayjs(props.data?.createdAt).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {t('COMMON.UPDATED_AT')}:{' '}
                        {dayjs(props.data?.updatedAt).format(
                            'DD.MM.YYYY HH:mm'
                        )}
                    </Text>
                </Flex>
            </Tabs.Panel>

            <Tabs.Panel value="settings" p="md">
                {hasPermission && (
                    <>
                        <Title order={6} c="dimmed" mb="xs">
                            {t('BUDGET.SETTINGS_TITLE')}
                        </Title>
                        <Group align="center" gap="xl" justify="center" mb="md">
                            <Flex justify="center" w={150}>
                                <Switch
                                    onLabel="An"
                                    offLabel="Aus"
                                    size="lg"
                                    checked={props.data?.ist_active}
                                    onChange={(e) =>
                                        props.onUpdate(e.target.checked)
                                    }
                                />
                            </Flex>
                            <Box style={{ flex: 1 }}>
                                <Text>{t('BUDGET.SETTING_IST')}</Text>
                                <Text size="xs" c="dimmed">
                                    {t('BUDGET.SETTING_IST_DESCRIPTION')}
                                </Text>
                            </Box>
                        </Group>
                    </>
                )}
                <Title order={6} c="dimmed" mb="xs">
                    {t('BUDGET.FUNCTIONS_TITLE')}
                </Title>
                <Group align="center" gap="xl" style={{ flexWrap: 'wrap' }}>
                    <Flex justify="center" w={150}>
                        <CSVLink
                            data={csvData}
                            headers={headers}
                            filename={'budget_data.csv'}
                            target="_blank"
                            separator=';'
                        >
                            <Button
                                variant="default"
                                leftSection={<IconDownload />}
                                size="sm"
                                style={{ width: '100%' }}
                            >
                                {t('BUDGET.FUNCTION_DOWNLOAD')}
                            </Button>
                        </CSVLink>
                    </Flex>
                    <Box style={{ flex: 1 }}>
                        <Text>Export</Text>
                        <Text size="xs" c="dimmed">
                            {t('BUDGET.FUNCTION_DOWNLOAD_DESCRIPTION')}
                        </Text>
                    </Box>
                </Group>
            </Tabs.Panel>
        </SVHTabs>
    );
};

export default BudgetTabs;
