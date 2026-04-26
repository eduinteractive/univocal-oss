import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/context/TenantContext';
import { useEffect, useState } from 'react';
import { Budget, getBudgets } from '@/api/Budget';

const useBudgets = () => {
    const { currentTenant } = useTenant();
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const budgetsQuery = useQuery({
        queryKey: ['budgets', currentTenant?._id, {}],
        queryFn: () =>
            getBudgets({ tenantId: currentTenant!._id, params: null }),
        enabled: !!currentTenant,
    });

    useEffect(() => {
        if (budgetsQuery.data) {
            setBudgets(budgetsQuery.data);
        }
    }, [budgetsQuery.data]);

    return budgets;
};

export default useBudgets; 