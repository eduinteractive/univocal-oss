import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { getTenant, TenantUser } from '../api/Tenant';
import { useEffect, useState } from 'react';

const useTenantMembers = () => {
    const { currentTenant } = useTenant();
    const [member, setMember] = useState<TenantUser[]>([]);


    const tenantMemberQuery = useQuery({
        queryKey: ['tenant', currentTenant?._id],
        queryFn: () => getTenant({ id: currentTenant?._id }),
    });

    useEffect(() => {
        if (tenantMemberQuery.data) {
            setMember(tenantMemberQuery.data.users);
        }
    }, [tenantMemberQuery.data]);

    return member;
};

export default useTenantMembers;
