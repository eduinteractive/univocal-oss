import { useQuery } from '@tanstack/react-query';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SAPI } from '@eduinteractive/uvc-api';
import { useEffect, useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';
import SVHLoader from '../components/common/SVHLoader';
import { SidebarProvider } from '../layouts/SVHAppShell';

const InitTenant = () => {
    const { authData } = useAuth();
    const { setCurrentTenant } = useTenant();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    const groupQuery = useQuery({
        queryKey: ['usergroups', authData?.groups],
        queryFn: () => SAPI.TENANT.PRIVATE.getUserTenants(),
    });

    useEffect(() => {
        if (groupQuery.data) {
            if (groupQuery.data.length > 0) {
                const storedTenant = localStorage.getItem('currentTenant');
                if (storedTenant) {
                    const tenant = groupQuery.data.find(
                        (group) => group._id === storedTenant
                    );
                    const authGroup = authData?.groups.find(
                        (group) => group._id === tenant?._id
                    );
                    if (authGroup && tenant) {
                        setCurrentTenant({ ...authGroup, tenant });
                    }
                } else {
                    if (groupQuery.data.length > 0) {
                        const tenant = groupQuery.data[0];
                        const authGroup = authData?.groups.find(
                            (group) => group._id === tenant._id
                        );
                        console.log(tenant);
                        if (authGroup) {
                            setCurrentTenant({ ...authGroup, tenant });
                        }
                    }
                }
                if (location.pathname === '/') {
                    navigate('/sv/dashboard');
                }
            }
        }
        if (!groupQuery.isLoading) {
            setIsLoading(false);
        }
    }, [
        authData?.groups,
        authData?.groups.length,
        groupQuery.data,
        groupQuery.isLoading,
        location.pathname,
        navigate,
        setCurrentTenant,
    ]);

    if (isLoading) {
        return <SVHLoader />;
    }

    return (
        <SidebarProvider>
            <Outlet />
        </SidebarProvider>
    );
};

export default InitTenant;
