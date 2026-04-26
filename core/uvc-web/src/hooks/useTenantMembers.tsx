import { useQuery } from '@tanstack/react-query';
import { useTenant } from '../context/TenantContext';
import { TenantUser, SAPI } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';

const useTenantMembers = () => {
    const { currentTenant } = useTenant();
    const [member, setMember] = useState<TenantUser[]>([]);

    const tenantMemberQuery = useQuery({
        queryKey: ['tenant', currentTenant?._id],
        queryFn: () => SAPI.TENANT.TENANT.getTenant({ id: currentTenant?._id }),
    });

    useEffect(() => {
        if (tenantMemberQuery.data) {
            setMember(tenantMemberQuery.data.users);
        }
    }, [tenantMemberQuery.data]);

    return member;
};

export default useTenantMembers;
