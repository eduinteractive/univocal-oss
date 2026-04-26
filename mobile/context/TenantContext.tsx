import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { Groups } from "../api/Auth";
import { useStorageState } from "@/hooks/useStorageState";
import { getUserTenants, Tenant } from "@/api/Tenant";
import { useAuth } from "./AuthContext";
import { useQuery } from "@tanstack/react-query";

const TenantContext = createContext<{
	currentTenant: Groups | null;
    userTenants: Tenant[];
	setCurrentTenant: (tenantId: string) => void;
}>({
	currentTenant: null,
    userTenants: [],
	setCurrentTenant: () => {},
});

export const useTenant = () => {
    const value = useContext(TenantContext);
    if (process.env.NODE_ENV !== "production") {
        if (!value) {
            throw new Error("useTenant must be wrapped in a <TenantProvider />");
        }
    }
    return value;
}

export const TenantProvider = ({ children }: PropsWithChildren) => {
    const { authData } = useAuth();
    const [[_cLoading, currentTenantId], setCurrentTenantId] = useStorageState("currentTenantId");
    const [currentTenant, setCurrentTenant] = useState<Groups | null>(null);

    const userTenantQuery = useQuery({
		queryKey: ["userTenant", authData?.groups],
		queryFn: getUserTenants,
		enabled: !!authData?.groups,
	});

    const handleTenantChange = (id: string) => {
        const tenant = userTenantQuery.data?.find((group) => group._id === id);
        const authGroup = authData?.groups.find(
            (group) => group._id === tenant?._id
        );
        if (authGroup && tenant) {
            setCurrentTenant({ ...authGroup, tenant });
        }
        setCurrentTenantId(id);
    }

    useEffect(() => {
        if (userTenantQuery.data) {
            if (currentTenantId && authData?.groups.find((group) => group._id === currentTenantId)) {
                const tenant = userTenantQuery.data.find((group) => group._id === currentTenantId);
                const authGroup = authData?.groups.find(
                    (group) => group._id === tenant?._id
                );
                if (authGroup && tenant) {
                    setCurrentTenant({ ...authGroup, tenant });
                }
            } else {
                if (userTenantQuery.data.length > 0) {
                    const tenant = userTenantQuery.data[0];
                    const authGroup = authData?.groups.find(
                        (group) => group._id === tenant._id
                    );
                    if (authGroup) {
                        setCurrentTenant({ ...authGroup, tenant });
                    }
                } else {
                    setCurrentTenant(null);
                }
            }
        }
    }, [authData?.groups, userTenantQuery.data]);

    return (
        <TenantContext.Provider
            value={{
                currentTenant,
                setCurrentTenant: handleTenantChange,
                userTenants: userTenantQuery.data || [],
            }}
        >
            {children}
        </TenantContext.Provider>
    )
}