import APIHandler from "./APIHandler";
import { Tenant } from "./Tenant";

/**
 * Auth domain types: keep in sync with `lib/uvc-api/src/routes/uvc-auth/Types.ts`.
 * Mobile `Groups` uses `./Tenant` for optional populated `tenant`.
 */
export enum ActivationStatus {
	NOT_VERIFIED = "NOT_VERIFIED",
	ACTIVATED = "ACTIVATED",
	BANNED = "BANNED",
}

export enum PERMISSION_LEVEL {
	GUEST = 0,
	SV_HUB_MEMBER = 1,
	SV_MEMBER = 2,
	SSR_MEMBER = 3,
	SSR_BOARD = 4,
	SSR_ADMIN = 5,
	SV_HUB_MODERATION = 6,
	SV_HUB_ADMINISTRATION = 7,
}

export enum GROUP_PERMISSION_LEVEL {
	GUEST = 0,
	MEMBER = 1,
	MODERATOR = 2,
	ADMIN = 3,
}

/** Labels for selects and display (aligned with `GROUP_PERMISSION_LEVEL`). */
export const GROUP_PERMISSION_OPTIONS: { value: GROUP_PERMISSION_LEVEL; label: string }[] = [
	{ value: GROUP_PERMISSION_LEVEL.GUEST, label: "Gast" },
	{ value: GROUP_PERMISSION_LEVEL.MEMBER, label: "Mitglied" },
	{ value: GROUP_PERMISSION_LEVEL.MODERATOR, label: "Moderator*in" },
	{ value: GROUP_PERMISSION_LEVEL.ADMIN, label: "Administrator*in" },
];

export interface Groups {
	_id: string;
	permissionLevel: GROUP_PERMISSION_LEVEL;
	tenant?: Tenant;
}

export interface UserContact {
	first_name: string;
	last_name: string;
}

export type AuthProvider = "LOCAL" | "DFN_AAI";

export interface AuthData {
	_id: string;
	mail: string;
	permissionLevel: PERMISSION_LEVEL;
	groups: Groups[];
	domains: string[];
	dataProtectionAgreement: boolean;
	activationStatus: ActivationStatus;
	authProvider?: AuthProvider;
	/** Aus subject-id abgeleitet (Backend), kein IdP-Attribut */
	schacHomeOrganization?: string;
	lastSignDate: Date;
	registerDate: Date;
	contact: UserContact | string;
}

/** JSON from mobile login/check/refresh when tokens are included alongside `AuthData`. */
export type AuthDataWithTokens = AuthData & {
	authToken?: string;
	refreshToken?: string;
};

export const checkAuth = async () => {
	const response = await APIHandler.get("/auth/public/check");
	return response.data as AuthDataWithTokens;
};

export const refresh = async () => {
	const response = await APIHandler.get("/auth/public/refresh");
	return response.data as AuthDataWithTokens;
};

interface LoginRequest {
	body: {
		mail: string;
		password: string;
	};
}

export const login = async (req: LoginRequest) => {
	const response = await APIHandler.post("/auth/public/login", req.body);
	return response.data as AuthDataWithTokens;
};

interface ExchangeDfnCodeRequest {
	body: {
		code: string;
	};
}

export const exchangeDfnCode = async (req: ExchangeDfnCodeRequest) => {
	const response = await APIHandler.post("/auth/public/dfn/exchange", req.body);
	return response.data as AuthDataWithTokens;
};

interface RegisterRequest {
	body: {
		mail: string;
		password: string;
		contact: {
			first_name: string;
			last_name: string;
			phone?: string;
		};
	};
}

export const register = async (req: RegisterRequest) => {
	const response = await APIHandler.post("/auth/public/register", req.body);
	return response.data;
};

export const logout = async () => {
	const response = await APIHandler.post("/auth/public/logout");
	return response.data;
};

interface ResetPasswordRequest {
	body: {
		mail: string;
	};
}

export const resetPassword = async (req: ResetPasswordRequest) => {
	const response = await APIHandler.post("/auth/public/reset-password", req.body);
	return response.data;
};

interface ChangePasswordRequest {
	body: {
		oldpassword: string;
		newpassword: string;
	};
}

export const changePassword = async (req: ChangePasswordRequest) => {
	const response = await APIHandler.post("/auth/private/user/change-password", req.body);
	return response.data;
};

interface UpdateUserPushTokenRequest {
	body: {
		pushToken: string;
	};
}

export const updateUserPushToken = async (req: UpdateUserPushTokenRequest) => {
	const response = await APIHandler.post("/auth/private/user/push-token", req.body);
	return response.data;
};
