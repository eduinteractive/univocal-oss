import { Outlet } from "react-router-dom";
import { useTenant } from "../context/TenantContext";
import HTTP_403 from "../pages/error/HTTP_403";

const RequireTenant = () => {
    const { currentTenant } = useTenant();

    if (!currentTenant) {
        return <HTTP_403 />;
    }

    return (<Outlet />)
}

export default RequireTenant;