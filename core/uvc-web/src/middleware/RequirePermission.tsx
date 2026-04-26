import { useQueryClient } from "@tanstack/react-query"
import { Outlet } from "react-router-dom";
import { AuthData, PERMISSION_LEVEL } from "@eduinteractive/uvc-api";
import HTTP_403 from "../pages/error/HTTP_403";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

interface RequirePermissionProps {
    permission_level: PERMISSION_LEVEL;
}

const RequirePermission = (props: RequirePermissionProps) => {
    const { authData, setAuthData } = useAuth();
    const queryClient = useQueryClient();

    const authQueryData = queryClient.getQueryData<AuthData>(['authData']);
    
    useEffect(() => {
        if (authQueryData) {
            setAuthData(authQueryData);
        }
    }, [authQueryData, setAuthData]);

    if (authData && authData?.permissionLevel >= props.permission_level) {
        return <Outlet />
    } else {
        return <HTTP_403 />;
    }
}

export default RequirePermission;