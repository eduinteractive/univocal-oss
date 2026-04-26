import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/context/TenantContext';
import { useEffect, useState } from 'react';
import { getSurveys, SurveyMeta } from '@/api/Survey';

const useSurveys = () => {
    const { currentTenant } = useTenant();
    const [surveys, setSurveys] = useState<SurveyMeta[]>([]);

    const surveysQuery = useQuery({
        queryKey: ['surveys', currentTenant?._id, {}],
        queryFn: () =>
            getSurveys({ tenantId: currentTenant!._id, params: null }),
        enabled: !!currentTenant,
    });

    useEffect(() => {
        if (surveysQuery.data) {
            setSurveys(surveysQuery.data);
        }
    }, [surveysQuery.data]);

    return surveys;
};

export default useSurveys; 