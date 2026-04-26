import { useState } from 'react';
import { useTenant } from '../../../context/TenantContext';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    BudgetPosition,
    BudgetPositionType,
    SAPI,
} from '@eduinteractive/uvc-api';
import SVHPageWrapper from '../../../components/common/SVHPageWrapper';
import BudgetGroups from '../../../components/features/tenant/budgets/BudgetGroups';
import BudgetPositionModal from '../../../components/features/tenant/budgets/BudgetPositionModal';
import { NotificationHandler } from '@eduinteractive/mantine-common';
import BudgetTabs from '../../../components/features/tenant/budgets/BudgetTabs';
import BudgetModal from '../../../components/features/tenant/budgets/BudgetModal';
import { useTranslation } from 'react-i18next';

const Budget = () => {
    const { currentTenant } = useTenant();
    const { budgetId } = useParams();
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);
    const [budgetPositionModalVisible, setBudgetPositionModalVisible] =
        useState(false);
    const [currentBudgetPosition, setCurrentBudgetPosition] = useState<
        BudgetPosition | { type: BudgetPositionType } | null
    >(null);
    const { t } = useTranslation();

    const budgetQuery = useQuery({
        queryKey: ['budget', currentTenant?._id, budgetId],
        queryFn: () =>
            SAPI.TENANT.TENANT.getBudget({ tenantId: currentTenant!._id, budgetId: budgetId! }),
    });

    const updateBudgetMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.updateBudget,
        onSuccess: () => {
            budgetQuery.refetch();
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const createBudgetPositionMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.createBudgetPosition,
        onSuccess: () => {
            budgetQuery.refetch();
            setBudgetPositionModalVisible(false);
            setCurrentBudgetPosition(null);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.POSITIONS.SUCCESS.CREATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const updateBudgetPositionMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.updateBudgetPosition,
        onSuccess: () => {
            budgetQuery.refetch();
            setBudgetPositionModalVisible(false);
            setCurrentBudgetPosition(null);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.POSITIONS.SUCCESS.UPDATED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    const deleteBudgetPositionMutation = useMutation({
        mutationFn: SAPI.TENANT.TENANT.deleteBudgetPosition,
        onSuccess: () => {
            budgetQuery.refetch();
            setBudgetPositionModalVisible(false);
            setCurrentBudgetPosition(null);
            NotificationHandler.showSuccess(
                t('TENANT_PAGES.BUDGETS.POSITIONS.SUCCESS.DELETED')
            );
        },
        onError: NotificationHandler.showAxiosError,
    });

    if (!budgetQuery.data) {
        return null;
    }

    return (
        <SVHPageWrapper p={0}>
            <BudgetTabs
                positions={budgetQuery.data.positions || []}
                contentTab={
                    <BudgetGroups
                        ist_active={budgetQuery.data.budget.ist_active}
                        budget={budgetQuery.data.budget}
                        positions={budgetQuery.data.positions || []}
                        onAdd={(type, parent) => {
                            setCurrentBudgetPosition({ type, parent });
                            setBudgetPositionModalVisible(true);
                        }}
                        onEdit={(position) => {
                            setCurrentBudgetPosition(position);
                            setBudgetPositionModalVisible(true);
                        }}
                        onDelete={(positionId) => {
                            deleteBudgetPositionMutation.mutate({
                                tenantId: currentTenant!._id,
                                budgetId: budgetId!,
                                positionId: positionId,
                            });
                        }}
                    />
                }
                data={budgetQuery.data.budget}
                onEdit={() => setBudgetModalVisible(true)}
                onUpdate={(ist_active) => {
                    updateBudgetMutation.mutate({
                        tenantId: currentTenant!._id,
                        budgetId: budgetId!,
                        body: { ist_active },
                    });
                }}
            />
            <BudgetModal
                data={budgetQuery.data.budget}
                visible={budgetModalVisible}
                onClose={() => setBudgetModalVisible(false)}
                onSubmit={(body) => {
                    updateBudgetMutation.mutate({
                        tenantId: currentTenant!._id,
                        budgetId: budgetId!,
                        body,
                    });
                    setBudgetModalVisible(false);
                }}
            />
            <BudgetPositionModal
                ist_active={budgetQuery.data.budget.ist_active}
                data={currentBudgetPosition}
                visible={budgetPositionModalVisible}
                onClose={() => setBudgetPositionModalVisible(false)}
                onSubmit={(body) => {
                    if (
                        currentBudgetPosition &&
                        '_id' in currentBudgetPosition
                    ) {
                        updateBudgetPositionMutation.mutate({
                            tenantId: currentTenant!._id,
                            budgetId: budgetId!,
                            positionId: currentBudgetPosition._id,
                            body,
                        });
                    } else {
                        // Create
                        createBudgetPositionMutation.mutate({
                            tenantId: currentTenant!._id,
                            budgetId: budgetId!,
                            body,
                        });
                    }
                    setBudgetPositionModalVisible(false);
                    setCurrentBudgetPosition(null);
                }}
            />
        </SVHPageWrapper>
    );
};

export default Budget;
