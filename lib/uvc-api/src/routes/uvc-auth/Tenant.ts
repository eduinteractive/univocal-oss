import { APIHandler } from "../base";
import { TenantUser } from "../uvc-tenant/Types";

interface updateUsersGroupRequest {
    groupId: string,
    body: {
        userId: string,
        permissionLevel: number,
    }
}

export const updateUsersGroup = async (req: updateUsersGroupRequest) => {
    const response = await APIHandler.put(`/auth/tenant/${req.groupId}/user/update`, req.body);
    return response.data as TenantUser;
}

interface deleteUsersGroupRequest {
    groupId: string,
    userId: string,
}

export const deleteUsersGroup = async (req: deleteUsersGroupRequest) => {
    const response = await APIHandler.delete(`/auth/tenant/${req.groupId}/user/remove/${req.userId}`);
    return response.data as TenantUser;
}

interface addUsersGroupRequest {
    groupId: string,
    body: {
        mail: string,
        permissionLevel: number,
    }
}

export const addUsersGroup = async (req: addUsersGroupRequest) => {
    const response = await APIHandler.post(`/auth/tenant/${req.groupId}/user/add`, req.body);
    return response.data as TenantUser;
}