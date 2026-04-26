import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { useEffect, useState } from 'react';
import { Budget, SAPI } from '@eduinteractive/uvc-api';

const useBudgets = () => {
    const { currentTenant } = useTenant();
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const budgetsQuery = useQuery({
        queryKey: ['budgets', currentTenant?._id],
        queryFn: () =>
            SAPI.TENANT.TENANT.getBudgets({ tenantId: currentTenant!._id, params: null }),
    });

    useEffect(() => {
        if (budgetsQuery.data) {
            setBudgets(budgetsQuery.data);
        }
    }, [budgetsQuery.data]);

    return budgets;
};

export default useBudgets;
