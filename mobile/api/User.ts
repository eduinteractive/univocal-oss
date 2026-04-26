import APIHandler from "./APIHandler";
import { ActivationStatus, Groups } from "./Auth";

export interface User {
    _id: string;
    mail: string;
    firstName: string;
    lastName: string;
    groups: Groups[];
    activationStatus: ActivationStatus;
    lastSignDate: Date;
    registerDate: Date;
}

export const getUsers = async () => {
    const response = await APIHandler.get('/auth/admin/user');
    return response.data as User[];
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