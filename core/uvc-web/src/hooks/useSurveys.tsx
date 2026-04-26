import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { useEffect, useState } from 'react';
import { SurveyMeta, SAPI } from '@eduinteractive/uvc-api';

const useSurveys = () => {
    const { currentTenant } = useTenant();
    const [surveys, setSurveys] = useState<SurveyMeta[]>([]);

    const surveysQuery = useQuery({
        queryKey: ['surveys', currentTenant?._id],
        queryFn: () =>
            SAPI.SURVEY.TENANT.getSurveys({ tenantId: currentTenant!._id, params: null }),
    });

    useEffect(() => {
        if (surveysQuery.data) {
            setSurveys(surveysQuery.data);
        }
    }, [surveysQuery.data]);

    return surveys;
};

export default useSurveys;
