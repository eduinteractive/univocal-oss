import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/context/TenantContext';
import { useEffect, useState } from 'react';
import { getWikis, Wiki } from '@/api/Wiki';

const useWikis = () => {
    const { currentTenant } = useTenant();
    const [wikis, setWikis] = useState<Wiki[]>([]);

    const wikisQuery = useQuery({
        queryKey: ['wikis', currentTenant?._id, {}],
        queryFn: () => getWikis({ tenantId: currentTenant!._id, params: null }),
        enabled: !!currentTenant,
    });

    useEffect(() => {
        if (wikisQuery.data) {
            setWikis(wikisQuery.data);
        }
    }, [wikisQuery.data]);

    return wikis;
};

export default useWikis; 