import { Box, Text, Title } from '@mantine/core';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import { useTenant } from '../../../context/TenantContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    Budget,
    SAPI,
} from '@eduinteractive/uvc-api';
import BudgetModal from '../../../components/features/tenant/budgets/BudgetModal';
import { useState } from 'react';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import SVHMetaGrid from '../../../components/common/SVHMetaGrid';
import SVHFilter, {
    SVHFilterObject,
} from '../../../components/common/SVHFilter';
import BudgetsTabs from '../../../components/features/tenant/budgets/BudgetsTabs';
import BudgetsStatistics from '../../../components/features/tenant/budgets/BudgetsStatistics';
import { useTranslation } from 'react-i18next';

const Budgets = () => {
    const { currentTenant } = useTenant();
    const { t } = useTranslation();
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
    const [metadataFilter, setMetadataFilter] =
        useState<SVHFilterObject | null>(null);
    const [currentYear, setCurrentYear] = useState<number>(
        new Date().getFullYear()
    );

    const budgetsQuery = useQuery({
        queryKey: ['budgets', currentTenant?._id, metadataFilter],
        queryFn: () =>
            SAPI.TENANT.TENANT.getBudgets({
                tenantId: currentTenant!._id,
                params: metadataFilter,
            }),
    });

    const budgetsStatisticsQuery = useQuery({
        queryKey: ['budgetsStatistics', currentTenant?._id, currentYear],
        queryFn: () =>
            SAPI.TENANT.TENANT.getBudgetsStatistics({
                tenantId: currentTenant!._id,
                year: currentYear,
            }),
    });

    const createBudgetMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.createBudget,
        onSuccess: () => {
            budgetsQuery.refetch();
            setCurrentBudget(null);
            setBudgetModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateBudgetMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.updateBudget,
        onSuccess: () => {
            budgetsQuery.refetch();
            setCurrentBudget(null);
            setBudgetModalVisible(false);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteBudgetMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.deleteBudget,
        onSuccess: () => {
            budgetsQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.SUCCESS.DELETED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    return (
        <SVHPageWrapper p={0}>
            <Box p="md">
                <Title order={3} c="blue">
                    {t('TENANT_PAGES.BUDGETS.TITLE')}
                </Title>
                <Text size="sm" mb="sm">
                    {t('TENANT_PAGES.BUDGETS.DESCRIPTION')}
                </Text>
            </Box>
            <BudgetsTabs
                statisticsTab={
                    <BudgetsStatistics
                        statistics={budgetsStatisticsQuery.data || []}
                        currentYear={currentYear}
                        onYearChange={setCurrentYear}
                    />
                }
                budgetsTab={
                    <>
                        <SVHFilter
                            value={metadataFilter || undefined}
                            onFilter={(filter) => setMetadataFilter(filter)}
                            onAdd={{
                                func: () => setBudgetModalVisible(true),
                                text: t('TENANT_PAGES.BUDGETS.ADD'),
                                permission: 'budget',
                            }}
                        />
                        <BudgetModal
                            visible={budgetModalVisible}
                            data={currentBudget || undefined}
                            onClose={() => {
                                setBudgetModalVisible(false);
                                setCurrentBudget(null);
                            }}
                            onSubmit={(body) => {
                                if (currentBudget) {
                                    updateBudgetMutation.mutate({
                                        body,
                                        budgetId: currentBudget._id,
                                        tenantId: currentTenant!._id,
                                    });
                                } else {
                                    createBudgetMutation.mutate({
                                        tenantId: currentTenant!._id,
                                        body,
                                    });
                                }
                            }}
                        />
                        <SVHMetaGrid
                            prefixKey="year"
                            permissionPrefix="budget"
                            data={budgetsQuery.data || []}
                            onEdit={(budget) => {
                                setCurrentBudget(budget as Budget);
                                setBudgetModalVisible(true);
                            }}
                            onDelete={(budgetId) =>
                                deleteBudgetMutation.mutate({
                                    budgetId,
                                    tenantId: currentTenant!._id,
                                })
                            }
                        />
                    </>
                }
            />
        </SVHPageWrapper>
    );
};

export default Budgets;
