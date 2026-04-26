import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { useEffect, useState } from 'react';
import { Wiki, SAPI } from '@eduinteractive/uvc-api';

const useWikis = () => {
    const { currentTenant } = useTenant();
    const [wikis, setWikis] = useState<Wiki[]>([]);

    const wikisQuery = useQuery({
        queryKey: ['wikis', currentTenant?._id],
        queryFn: () => SAPI.KNOWLEDGE.TENANT.getWikis({ tenantId: currentTenant!._id, params: null }),
    });

    useEffect(() => {
        if (wikisQuery.data) {
            setWikis(wikisQuery.data);
        }
    }, [wikisQuery.data]);

    return wikis;
};

export default useWikis;
