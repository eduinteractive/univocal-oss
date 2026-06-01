import { APIHandler } from "../base";
import { AuthData } from "./Types";

export const checkAuth = async () => {
    const response = await APIHandler.get('/auth/public/check');
    return response.data as AuthData;
}

export const refresh = async () => {
    const response = await APIHandler.get('/auth/public/refresh');
    return response.data as AuthData;
}

interface LoginRequest {
    body: {
        mail: string;
        password: string;
    }
}

export const login = async (req: LoginRequest) => {
    const response = await APIHandler.post('/auth/public/login', req.body);
    return response.data;
}

interface RegisterRequest {
    body: {
        mail: string;
        password: string;
        contact: {
            first_name: string;
            last_name: string;
        }
    }
}

export const register = async (req: RegisterRequest) => {
    const response = await APIHandler.post('/auth/public/register', req.body);
    return response.data;
}

export const logout = async () => {
    const response = await APIHandler.post('/auth/public/logout');
    return response.data;
}

interface ResetPasswordRequest {
    body: {
        mail: string;
    }
}

export const resetPassword = async (req: ResetPasswordRequest) => {
    const response = await APIHandler.post('/auth/public/reset-password', req.body);
    return response.data;
}

interface ResetPasswordRepeatMailRequest {
    body: {
        mail: string;
    }
}

export const resetPasswordRepeatMail = async (req: ResetPasswordRepeatMailRequest) => {
    const response = await APIHandler.post('/auth/public/reset-password-repeat', req.body);
    return response.data;
}

interface ResetPasswordWithTokenRequest {
    token: string;
    body: {
        password: string;
    }
}

export const resetPasswordWithToken = async (req: ResetPasswordWithTokenRequest) => {
    const response = await APIHandler.post(`/auth/public/reset-password/${req.token}`, req.body);
    return response.data;
}

interface VerifyMailRequest {
    body: {
        token: string;
    }
}

export const verifyMail = async (req: VerifyMailRequest) => {
    const response = await APIHandler.post('/auth/public/verify', req.body);
    return response.data;
}

interface IsMailExistingRequest {
    body: {
        mail: string;
    }
}

export const isMailExisting = async (req: IsMailExistingRequest) => {
    const response = await APIHandler.post('/auth/public/is-mail-existing', req.body);
    return response.data;
}

export interface requestAccountDeletionRequest {
    body: {
        email: string;
        website?: string;
    };
}

export const requestAccountDeletion = async (req: requestAccountDeletionRequest) => {
    const response = await APIHandler.post('/auth/public/account-deletion', req.body);
    return response.data as { ok: true };
}