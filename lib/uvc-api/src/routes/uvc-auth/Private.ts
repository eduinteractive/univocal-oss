import { APIHandler } from "../base";
import { User } from "./Types";

interface ChangePasswordRequest {
    body: {
        oldpassword: string;
        newpassword: string;
    }
}

export const changePassword = async (req: ChangePasswordRequest) => {
    const response = await APIHandler.post('/auth/private/user/change-password', req.body);
    return response.data;
}

export const getUserNameById = async (userId?: string) => {
    if (!userId) throw new Error('No userId provided');
    const response = await APIHandler.get(`/auth/private/user/${userId}`);
    return response.data as User;
}

export const getUsersInSameGroups = async () => {
    const response = await APIHandler.get('/auth/private/user');
    return response.data as Partial<User>[];
}

interface updateUserRequest {
    body: {
        phone?: string;
    }
}

export const updateUser = async ({ body }: updateUserRequest) => {
    const response = await APIHandler.put('/auth/private/user', body);
    return response.data as User;
}