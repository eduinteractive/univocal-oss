import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Domain, SAPI } from '@eduinteractive/uvc-api';

const useDomains = () => {
    const [domains, setDomains] = useState<Domain[]>([]);

    const domainsQuery = useQuery({
        queryKey: ['domains'],
        queryFn: () => SAPI.TENANT.PUBLIC.getDomains(),
    });

    useEffect(() => {
        if (domainsQuery.data) {
            setDomains(domainsQuery.data);
        }
    }, [domainsQuery.data]);

    return domains;
};

export default useDomains;
